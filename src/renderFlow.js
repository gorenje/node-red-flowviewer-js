function renderFlow(flowId, flowdata, svgjQueryObj, renderOpts = {
    "arrows": false,
    "gridlines": true,
    "zoom": false,
    "images": true,
    "linklines": false,
    "dllink": false,
    "labels": true,
}) {
    var nodes = {};
    var subflows = {};
    var nodeIdsThatReceiveInput = {};
    var svgObj = undefined;

    svgObj = $(svgjQueryObj.find('.flowGridlines')[0]);

    if ( renderOpts["gridlines"] ) {
        for ( var idx = 0; idx < 250; idx++ ) {
            svgObj.append(getNode('line', {
                x1: 0,
                x2: 5000,
                y1: 20 * idx,
                y2: 20 * idx,
                class: 'grid-line'
            }));
        }

        for (var idx = 0; idx < 250; idx++) {
            svgObj.append(getNode('line', {
                x1: 20*idx,
                x2: 20*idx,
                y1: 0,
                y2: 5000,
                class: 'grid-line'
            }));
        }
    }
    
    /*  this is used to define which nodes get input decoration, this is not clear from the json data so
     *  we make a guessimate which nodes have inputs by the wiring within the flow 
     */
    flowdata.forEach(function (obj) {
        if (obj.type == "subflow") {
            /* prefix subflow since this is the type of the node that uses this subflow - makes lookup simpler */
            subflows["subflow:" + obj.id] = obj;
            for ( var idx = 0; idx < obj.in.length; idx++ ) {
                for ( var wdx = 0; wdx < obj.in[idx].wires.length; wdx++ ) {
                    nodeIdsThatReceiveInput[obj.in[idx].wires[wdx].id] = true
                }
            }
        }

        if ( obj.wires && obj.wires.length > 0 ) {
            obj.wires.forEach( function(aryWires){
                aryWires.forEach(function (ndeId) { nodeIdsThatReceiveInput[ndeId] = true })
            })
        };
    });

    var flowGroups = {};

    /*
     * Rendering nodes.
     */
    svgObj = $(svgjQueryObj.find('.flowNodes')[0]);

    var widthHeightByType = {
        "junction": {
            width: 10,
            height: 10
        },
        "link in": {
            width: 30,
            height: 30
        },
        "subflow": {
            width: 40,
            height: 40
        },
        "_default": {
            width: 100,
            height: 30
        }
    };
    widthHeightByType["link out"] = widthHeightByType["link in"];

    var subFlowInsOutsStatusNodes = {};

    /*
     * Important lesson: never assume that (x,y) means top-left corner ... in the case of the flows.json, (x,y) is the midpoint of the node.
     * For the sack of sanity, compute the top-left corner (x,y) and add it to the node. We also add the bounding-box so we have the width.
     */
    flowdata.forEach(function (obj) {
        if (obj.z == flowId || obj.id == flowId /* this is a subflow or tab */) {

            var dimensions = widthHeightByType[obj.type] || widthHeightByType["_default"];
            var clr = clrByType[obj.type] || clrByType["_default"];

            switch (obj.type) {

                case "tab":
                    /* tab is the flow container, nothing visual found here */
                    break;
                    
                case "ui_spacer":
                    /* is included in the flow but is a dashboard node, not flow node */
                    break;

                case "group":
                    /* groups are handled later since we need all bounding boxes for all nodes contained in a group */
                    flowGroups[obj.id] = obj;
                    break;

                case "subflow":
                    /* the type of the node that represents a subflow is subflow:XXXX while the subflow has type 'subflow'. So this occurs if
                       the flowId is that of a subflow. The obj.id == flowId and its type is 'subflow' and here we are.  
                     */
                    subFlowInsOutsStatusNodes[obj.id] = { ...obj };

                    /* input connectors */
                    for (var idx = 0; idx < subFlowInsOutsStatusNodes[obj.id].in.length; idx++ ) {
                        var inObj = subFlowInsOutsStatusNodes[obj.id].in[idx];
                        var grpId = "grp" + Math.random().toString().substring(2);
                        $(svgObj).append(getNode('g', { id: grpId, }));
                        var grpObj = $('#' + grpId);

                        $(grpObj).append(getNode('rect', {
                            ...clr,
                            ...dimensions,
                            rx: 8,
                            ry: 8,
                            x: -dimensions.width / 2,
                            y: -dimensions.height / 2,
                            "stroke-width": 1,
                        }));

                        $(grpObj).attr("transform", "translate(" + inObj.x + "," + inObj.y + ")");
                        inObj.bbox = document.getElementById(grpId).getBBox();
                        inObj.bbox.x = inObj.x - dimensions.width / 2
                        inObj.bbox.y = inObj.y - dimensions.height / 2

                        var transAndPath = {
                            transform: "translate(15,-5)",
                            d: "M 0.5,9.5 9.5,9.5 9.5,0.5 0.5,0.5 Z",
                        }

                        /* add output decoration after computing the bounding box - the decoration extends the bounding box */
                        $(grpObj).append(getNode('path', {
                            ...clr,
                            ...transAndPath,
                            class: "output-deco",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                        }));

                        var textElem = getNode('text', {
                            y: 0,
                            x: -2,
                            class: 'subflow-node-text-label'
                        });
                        textElem.textContent = "input";
                        $(grpObj).append(textElem);
                    }

                    /* output connectors */
                    for (var idx = 0; idx < subFlowInsOutsStatusNodes[obj.id].out.length; idx++) {
                        var outObj = subFlowInsOutsStatusNodes[obj.id].out[idx];
                        var grpId = "grp" + Math.random().toString().substring(2);
                        $(svgObj).append(getNode('g', { id: grpId, }));
                        var grpObj = $('#' + grpId);

                        $(grpObj).append(getNode('rect', {
                            ...clr,
                            ...dimensions,
                            rx: 8,
                            ry: 8,
                            x: -dimensions.width / 2,
                            y: -dimensions.height / 2,
                            "stroke-width": 1,
                        }));

                        $(grpObj).attr("transform", "translate(" + outObj.x + "," + outObj.y + ")");
                        outObj.bbox = document.getElementById(grpId).getBBox();
                        outObj.bbox.x = outObj.x - dimensions.width / 2
                        outObj.bbox.y = outObj.y - dimensions.height / 2

                        var transAndPath = {
                            transform: "translate(-25,-5)",
                            d: "M 0.5,9.5 9.5,9.5 9.5,0.5 0.5,0.5 Z",
                        }

                        /* add output decoration after computing the bounding box - the decoration extends the bounding box */
                        $(grpObj).append(getNode('path', {
                            ...clr,
                            ...transAndPath,
                            class: "input-deco",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                        }));

                        /* text that goes "output\n(idx+1)\n" i.e. two lines */
                        var textElem = getNode('text', {
                            y: -10,
                            x: 0,
                            class: 'subflow-node-text-label'
                        });
                        textElem.textContent = "output";
                        $(grpObj).append(textElem);

                        textElem = getNode('text', {
                            y: 8,
                            x: 0,
                            class: 'subflow-node-text-label-number'
                        });
                        textElem.textContent = ""+(idx+1);
                        $(grpObj).append(textElem);
                    }

                    /* status connectors */
                    if (subFlowInsOutsStatusNodes[obj.id].status) {
                        var outObj = subFlowInsOutsStatusNodes[obj.id].status;
                        var grpId = "grp" + Math.random().toString().substring(2);
                        $(svgObj).append(getNode('g', { id: grpId, }));
                        var grpObj = $('#' + grpId);

                        $(grpObj).append(getNode('rect', {
                            ...clr,
                            ...dimensions,
                            rx: 8,
                            ry: 8,
                            x: -dimensions.width / 2,
                            y: -dimensions.height / 2,
                            "stroke-width": 1,
                        }));

                        $(grpObj).attr("transform", "translate(" + outObj.x + "," + outObj.y + ")");
                        outObj.bbox = document.getElementById(grpId).getBBox();
                        outObj.bbox.x = outObj.x - dimensions.width / 2
                        outObj.bbox.y = outObj.y - dimensions.height / 2

                        var transAndPath = {
                            transform: "translate(-25,-5)",
                            d: "M 0.5,9.5 9.5,9.5 9.5,0.5 0.5,0.5 Z",
                        }

                        /* add output decoration after computing the bounding box - the decoration extends the bounding box */
                        $(grpObj).append(getNode('path', {
                            ...clr,
                            ...transAndPath,
                            class: "input-deco",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                        }));

                        var textElem = getNode('text', {
                            y: 0,
                            x: 2,
                            class: 'subflow-node-text-label'
                        });
                        textElem.textContent = "status";
                        $(grpObj).append(textElem);                        
                    }

                    break;

                case "junction":
                    var grpId = "grp" + Math.random().toString().substring(2);
                    $(svgObj).append(getNode('g', { id: grpId, }));
                    var grpObj = $('#' + grpId);

                    $(grpObj).append(getNode('rect', {
                        ...clr,
                        ...dimensions,
                        rx: 3,
                        ry: 3,
                        x: -5,
                        y: -5,
                        "stroke-width": 1,
                    }));

                    $(grpObj).attr("transform", "translate(" + obj.x + "," + obj.y + ")");

                    obj.bbox = document.getElementById(grpId).getBBox();
                    obj.bbox.x = obj.x;
                    obj.bbox.y = obj.y;
                    obj.bbox.width = 0;
                    obj.bbox.height = 0;

                    break;

                case "link in":
                case "link out":
                    var grpId = "grp" + Math.random().toString().substring(2);
                    $(svgObj).append(getNode('g', { id: grpId, }));
                    var grpObj = $('#' + grpId);

                    $(grpObj).prepend(getNode('rect', {
                        ...clr,
                        ...dimensions,
                        rx: 5,
                        ry: 5,
                        fill: obj.color || clr.fill,
                        "fill-opacity": 1,
                        "stroke-width": 2,
                        class: (" node-" + obj.id)
                    }));

                    $(grpObj).attr("transform", "translate(" + (obj.x - dimensions.width/2) + "," + (obj.y - dimensions.height/2) + ")");
                    if (obj.d) { 
                        $(grpObj).attr("class", "node-disabled")
                    };
                    obj.bbox = document.getElementById(grpId).getBBox();
                    obj.bbox.x = obj.x - dimensions.width / 2
                    obj.bbox.y = obj.y - dimensions.height / 2

                    /* add image to node */
                    if (renderOpts.images) {
                        $(grpObj).append(getNode('image', {
                            "href": imageNameToContent[imgByType[obj.type + obj.mode]],
                                x: (obj.type == "link in" ? 0 : (obj.mode == "return" ? 1 : 2)),
                                y: 0,
                                width: 30,
                                height: 30
                        }));
                    };

                    var transAndPath = {
                        transform: (obj.type == "link in" ? "translate(25,10)" : "translate(-4,10)"),
                        d: "M 0.5,9.5 9.5,9.5 9.5,0.5 0.5,0.5 Z",
                    }

                    if (renderOpts["arrows"] && (obj.type == "link out")) {
                        transAndPath = {
                            transform: (obj.type == "link in" ? "translate(27,10)" : "translate(-3,10)"),
                            d: "M 0,10 9,5 0,0 Z",
                        }
                    }

                    /* add output decoration after computing the bounding box - the decoration extends the bounding box */
                    $(grpObj).append(getNode('path', {
                        ...clr,
                        ...transAndPath,
                        class: (obj.type == "link in" ? "output-deco" : ("input-deco" + (renderOpts.arrows ? " input-arrows" : ""))),
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                    }));

                    break;

                default:
                    /* the type of the node that represents a subflow is subflow:XXXX while the subflow has type 'subflow' */
                    var grpTextId  = "grpTxt" + Math.random().toString().substring(2);
                    var lblFunct   = renderOpts.labels ? (labelByFunct[obj.type] || labelByFunct["_default"]) : emptyLabelFunct;
                    var subflowObj = subflows[obj.type] || {};
                    var textLabels = getLabelParts(lblFunct(obj, subflowObj, flowdata), "node-text-label");

                    var grpText = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                    grpText.setAttributeNS(null, "id", grpTextId);
                    grpText.setAttributeNS(null, "transform", "translate(38," + (textLabels.lines.length > 1 ? "18" : "16") + ")");

                    var ypos = 0;
                    textLabels.lines.forEach( function(lne){
                        var textElem = getNode('text', {
                            y: ypos,
                            class: 'node-text-label'
                        });                        
                        textElem.textContent = lne;
                        grpText.appendChild(textElem);
                        ypos += 20;
                    });

                    var grpId = "grp" + Math.random().toString().substring(2);
                    $(svgObj).append(getNode('g', { id: grpId, }));
                    var grpObj = $('#' + grpId);

                    $(grpObj).append(grpText);

                    var txtBBox    = document.getElementById(grpTextId).getBBox();
                    var txtWidth   = txtBBox.width + 45;
                    var txtHeight  = txtBBox.height + 16;
                    var rectWidth  = (dimensions.width > txtWidth ? dimensions.width : txtWidth);
                    var rectHeight = (dimensions.height > txtHeight ? dimensions.height : txtHeight);

                    if ( (obj.wires || []).length > 2 ) {  
                        /* if more than 2 outputs, the node "grows" but the node might already be bigger enough. The base
                            height of 30 supports two outputs, everything else requires growth in height. */
                        rectHeight = Math.max(rectHeight, 15 * obj.wires.length);

                        /* move the text block into the middle */
                        if ( rectHeight > txtHeight ) {
                            var offsetHeight = ( rectHeight - txtHeight) / 2;
                            grpText.setAttributeNS(null, "transform", "translate(38," + ( (textLabels.lines.length > 1 ? 18 : 16) + offsetHeight) + ")");
                        }
                    }
                    
                    $(grpObj).prepend(getNode('rect', {
                        ...clr,
                        rx: 5,
                        ry: 5,
                        fill: obj.color || subflowObj.color || clr.fill,
                        "fill-opacity": 1,
                        width: rectWidth,
                        height: rectHeight, 
                        "stroke-width": 2,
                        class: (" node-" + obj.id)
                    }));

                    $(grpObj).append(getNode('path', {
                        d: "M5 0 h25 v" + rectHeight+" h-25 a 5 5 0 0 1 -5 -5  v-"+(rectHeight-10)+" a 5 5 0 0 1 5 -5",
                        fill: "rgb(0,0,0)",
                        "fill-opacity": 0.1,
                        "stroke": "none"
                    }));
                    
                    $(grpObj).append(getNode('path', {
                        d: "M 29.5 0.5 l 0 " + (rectHeight-1),
                        fill: "none",
                        stroke: "rgb(0,0,0)",
                        "stroke-opacity": 0.1,
                        "stroke-width": "1px"
                    }));

                    $(grpObj).attr("transform", "translate(" + (obj.x - rectWidth/2) + "," + (obj.y - rectHeight/2)+ ")");
                    obj.bbox = document.getElementById(grpId).getBBox();
                    obj.bbox.x = obj.x - rectWidth / 2;
                    obj.bbox.y = obj.y - rectHeight / 2;

                    /* Add image - if requested - by type - some types have no image */
                    if ( renderOpts.images ) {
                        var imgBaseOpts = {
                            x: 1,
                            y: Math.max(rectHeight / 2 - 15, 1),
                            width: 30,
                            height: 30
                        };

                        if ( imgByType[obj.type] && imageNameToContent[imgByType[obj.type]] ) { 
                            $(grpObj).append(getNode('image', {
                                "href": imageNameToContent[imgByType[obj.type]],
                                ...imgBaseOpts
                            }));
                        } else {
                            if ( obj.type.startsWith("subflow:") ) {
                                var hrefContent = (subflowObj.icon && 
                                          imageNameToContent[subflowObj.icon]) || imageNameToContent["subflow.svg"];

                                $(grpObj).append(getNode('image', { "href": hrefContent, ...imgBaseOpts }));
                            }
                        }
                    };

                    /* add output decoration after computing the bounding box - the decoration extends the bounding box otherwise */
                    if ( (subflowObj.in && subflowObj.in.length > 0) || nodeIdsThatReceiveInput[obj.id] ) {
                        $(grpObj).append(getNode('path', {
                            ...clrByType["junction"],
                            transform: "translate(-3,"+((obj.bbox.height/2)-5)+")",
                            d: (renderOpts["arrows"] ? "M 0,10 9,5 0,0 Z" : "M -1,9.5 8,9.5 8,0.5 -1,0.5 Z"),
                            class: "input-deco" + (renderOpts.arrows ? " input-arrows" : ""),
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                        }));
                    }

                    var outDecoBaseAttrs = {
                        ...clrByType["junction"],
                        d: "M 0.5,9.5 9.5,9.5 9.5,0.5 0.5,0.5 Z", // *** this is the triangle --> "M 0,10 9,5 0,0 Z",
                        class: "output-deco",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                    };

                    var initFactor = (obj.wires.length == 1 ? ((obj.bbox.height / 2) - 5) : ((obj.wires.length % 2 == 0) ? 5 : 8));
                    for (var idx = 0; idx < obj.wires.length; idx++) {
                        $(grpObj).append(getNode('path', {
                            transform: "translate(" + (obj.bbox.width - 4) + "," + (initFactor + (13 * idx)) + ")",
                            ...outDecoBaseAttrs
                        }));
                    }

                    if (obj.d) {
                        $(grpObj).attr('class', 'node-disabled')
                    }

                    break;
            };
            /* since the obj is altered, from here on end, we will be using the altered version of the node */
            nodes[obj.id] = obj;
        }
    });

    /* 
     * Rendering groups.
     * 
     * since groups can contain other groups, we have to loop through this until all groups have
     * been placed
    */
    svgObj = $(svgjQueryObj.find('.flowGroups')[0]);

    var doneGroups = [];
    var todoGroups = [];
    var biscuitBreaker = 50; /* absolute maximum number of enclosure levels */

    for (var grpId in flowGroups) {
        todoGroups.push(grpId)
    }

    // There is also another way of doing this and that is to check for the 'g' attribute on a group
    // object. The 'g' attribute is set if the group is contained within another group and the 'g' is the
    // id of the other group - but moving up this chain, one gets to the very top group and knows which 
    // groups need to be drawn to have the size of the top level group. But that is the same as this
    // except all groups are drawn, i.e., if there are two groups within one group, going from the first
    // group up the tree won't give us the second group contained within the enclosing group.
    while (doneGroups.length != todoGroups.length && biscuitBreaker > 0) {
        biscuitBreaker -= 1;

        for (var grpId in flowGroups) {
            if (doneGroups.indexOf(grpId) > -1) { continue }

            var grpObj = flowGroups[grpId];

            /* create a very back-of-a-paper-napkin estimate of the height and width (laziness) 
             * Could use something like d3.js for doing this automagically, but limit the number
             * of dependencies for this code - ideally no jQuery either.
            ***/

            var width = 0, height = 0, oneWasMissing = false;

            grpObj.nodes.forEach(function (ndeId) {
                var bbox = (nodes[ndeId] || {}).bbox;
                if (bbox) {
                    width = Math.max(width, (bbox.x - grpObj.x) + bbox.width);
                    height = Math.max(height, (bbox.y - grpObj.y) + bbox.height);
                } else {
                    oneWasMissing = true;
                }
            });

            // Handle groups of groups of groups - i.e. if a group has been defined yet (i.e. has no
            // bounding box) then continue with the next group. Each group is only created if all its
            // nodes that it contains have been defined.
            if (oneWasMissing) { continue };

            var grpRectId = "grpRectId" + Math.random().toString().substring(2);
            var grpSvgObj = getNode('g', {
                id: grpRectId,
            });

            $(grpSvgObj).attr("transform", "translate(" + (grpObj.x - 5) + "," + (grpObj.y - 5) + ")");

            $(grpSvgObj).append(getNode('rect', {
                rx: 5,
                ry: 5,
                width: width + 20,
                height: height + 20,
                fill: "none",
                "fill-opacity": 0,
                "stroke-width": 2,
                stroke: "grey",
                class: "group-" + grpObj.id,
                ...grpObj.style,
            }));

            $(svgObj).prepend(grpSvgObj);

            var obj = nodes[grpId];
            obj.bbox = document.getElementById(grpRectId).getBBox();
            obj.bbox.x = grpObj.x;
            obj.bbox.y = grpObj.y;

            var labelGrp = getNode('g',{
            });
            $(grpSvgObj).append(labelGrp);

            /* this is taken from 
             * https://github.com/node-red/node-red/blob/7e9042e9f713eec981adeb8ff6af226a40efb5af/packages/node_modules/%40node-red/editor-client/src/js/ui/view.js#L5555 
            */
            if ( grpObj.style.label && grpObj.name) {
                var labelPos = grpObj.style["label-position"] || "nw";
                var labels = getLabelParts(grpObj.name, "group-text-label");

                var labelX = 0;
                var labelY = 0;
                var labelAnchor = "start";

                if (labelPos[0] === 'n') {
                    labelY = 0 + 15; // Allow for font-height
                } else {
                    labelY = obj.bbox.height - 5 - (labels.lines.length - 1) * 16;
                }
                if (labelPos[1] === 'w') {
                    labelX = 5;
                    labelAnchor = "start"
                } else if (labelPos[1] === 'e') {
                    labelX = obj.bbox.width - 5;
                    labelAnchor = "end"
                } else {
                    labelX = obj.bbox.width / 2;
                    labelAnchor = "middle"
                }

                $(labelGrp).attr("transform", "translate(" + labelX + "," + labelY + ")")
                    .attr("text-anchor", labelAnchor);
                if (labels) {
                    var ypos = 0;
                    labels.lines.forEach(function (name) {
                        var tspan = getNode("text", {
                            class: "group-text-label",
                            x: 0,
                            y: ypos,
                            fill: grpObj.style.color || 'grey',
                        });
                        tspan.textContent = name;
                        $(labelGrp).append( tspan );
                        ypos += 16;
                    });
                }
            }

            doneGroups.push(grpId);
        }
    }

    /*
     * Rendering the wires between nodes
     */
    svgObj = $(svgjQueryObj.find('.flowWires')[0]);

    var linkOutNodes = [];

    /* rendering subflow? then the subflow hash will be filled */
    var subFlowIds = Object.keys(subFlowInsOutsStatusNodes);
    for ( var idx = 0; idx < subFlowIds.length; idx++ ) {
        var sfObj = subFlowInsOutsStatusNodes[subFlowIds[idx]];
        
        for (var jdx = 0; jdx < sfObj.in.length; jdx++ ) {
            var inObj = sfObj.in[jdx];

            for ( var wdx = 0; wdx < inObj.wires.length; wdx++ ){
                var otherNode = nodes[inObj.wires[wdx].id];

                var startX = inObj.bbox.x + inObj.bbox.width;
                var startY = inObj.bbox.y + inObj.bbox.height / 2;
                var endX = otherNode.bbox.x;
                var endY = otherNode.bbox.y + otherNode.bbox.height / 2;

                $(svgObj).append(getNode('path', {
                    d: generateLinkPath(startX, startY, endX, endY, 1),
                    stroke: 'grey',
                    "stroke-width": 4,
                    "fill": 'transparent',
                    class: (otherNode.d ? "link-disabled" : "") + (" link-from-" + sfObj.id + "-to-" + otherNode.id)
                }));
            }
        }

        if (sfObj.status) { sfObj.out.push(sfObj.status) };
        for (var jdx = 0; jdx < sfObj.out.length; jdx++) {
            var outObj = sfObj.out[jdx];

            for (var wdx = 0; wdx < outObj.wires.length; wdx++) {
                var otherNode = nodes[outObj.wires[wdx].id];
                var initFactor = (otherNode.wires.length == 1 ? otherNode.bbox.height / 2 : ((otherNode.wires.length % 2 == 0) ? 10 : 13));

                var startX = otherNode.bbox.x + otherNode.bbox.width;
                var startY = otherNode.bbox.y + (initFactor + (13 * outObj.wires[wdx].port));
                var endX = outObj.bbox.x;
                var endY = outObj.bbox.y + outObj.bbox.height / 2;

                $(svgObj).append(getNode('path', {
                    d: generateLinkPath(startX, startY, endX, endY, 1),
                    stroke: 'grey',
                    "stroke-width": 4,
                    "fill": 'transparent',
                    class: (otherNode.d ? "link-disabled" : "") + (" link-from-" + sfObj.id + "-to-" + otherNode.id)
                }));
            }
        }

    }

    for (var ndeId in nodes) {
        var nde = nodes[ndeId];
        if ( nde.type == "link out") { linkOutNodes.push( nde ) }
        if ((nde.wires || []).length == 0 ) { continue }

        var initFactor = (nde.wires.length == 1 ? nde.bbox.height / 2 : ((nde.wires.length % 2 == 0) ? 10 : 13));
        var wireCnt = 0;
        nde.wires.forEach(function (wires) {
            wires.forEach(function (otherNodeId) {
                var otherNode = nodes[otherNodeId];

                if (otherNode) {
                    var startX = nde.bbox.x + nde.bbox.width;
                    var startY = nde.bbox.y + (initFactor + (13 * wireCnt));
                    var endX = otherNode.bbox.x;
                    var endY = otherNode.bbox.y + otherNode.bbox.height / 2;

                    $(svgObj).append(getNode('path', {
                        d: generateLinkPath(startX, startY, endX, endY, 1),
                        stroke: 'grey',
                        "stroke-width": 4,
                        "fill": 'transparent',
                        class: (otherNode.d || nde.d ? "link-disabled" : "") + (" link-from-" + nde.id + "-to-" + otherNode.id)
                    }));
                }
            });
            wireCnt++;
        });
    }

    /* draw the links between link nodes, i.e. link-in and link-out nodes */
    if ( renderOpts.linklines ) {
        linkOutNodes.forEach( function(nde) {
            nde.links.forEach( function(ndeId){
                var otherNode = nodes[ndeId];
                
                if ( otherNode ) { 
                    var startX = nde.bbox.x + nde.bbox.width;
                    var startY = nde.bbox.y + nde.bbox.height / 2;
                    var endX = otherNode.bbox.x;
                    var endY = otherNode.bbox.y + otherNode.bbox.height / 2;

                    $(svgObj).append(getNode('path', {
                        d: generateLinkPath(startX, startY, endX, endY, 1),
                        stroke: 'rgb(170, 170, 170)',
                        "stroke-width": 2,
                        "stroke-dasharray": "25,4",
                        "fill": 'transparent',
                        class: (otherNode.d || nde.d ? "link-disabled" : "") + (" link-from-" + nde.id + "-to-" + otherNode.id)
                    }));

                    $(svgObj).append(getNode('circle', {
                        cy: startY,
                        cx: startX + 6.5,
                        r: 5,
                        stroke: 'rgb(170, 170, 170)',
                        "stroke-width": 1,
                        stroke: 'rgb(170, 170, 170)',
                        "fill": 'rgb(238, 238, 238)',
                        class: (otherNode.d || nde.d ? "link-disabled" : "") + (" link-from-" + nde.id + "-to-" + otherNode.id)
                    }));

                    $(svgObj).append(getNode('circle', {
                        cy: endY,
                        cx: endX - 6.5,
                        r: 5,
                        stroke: 'rgb(170, 170, 170)',
                        "stroke-width": 1,
                        stroke: 'rgb(170, 170, 170)',
                        "fill": 'rgb(238, 238, 238)',
                        class: (otherNode.d || nde.d ? "link-disabled" : "") + (" link-from-" + nde.id + "-to-" + otherNode.id)
                    }));
                }
            });
        });
    }

    /* finally remove our changes to the objects in the flowData array */
    flowdata.forEach(function (obj) { delete obj.bbox; });
};
 
     