var mindMapNodeLabelFunct = (obj,subflowObj,flowdata) => {
    return (obj.name || obj.label || obj.info || obj.text || "").replace(/(.{40,60})([ \n\t])/g, "$1\\n$2") + 
             (obj.sumPass ? " ⭄" : "") + 
             (obj.sumPassPrio && parseInt(obj.sumPassPrio) != 0 ? " (" + obj.sumPassPrio + ")" : "");
};

var defaultLabelFunct = (obj, subflowObj, flowdata) => {
    return (obj.name || obj.label || obj.info || obj.text || subflowObj.name || obj.type)
};

var emptyLabelFunct = (obj, subflowObj, flowdata) => {
    return ""
};

var blogPageInfoLabel = (obj, subflowObj, flowdata) => {
    if ( obj.name ) { return obj.name }

    var lbl = undefined;
    flowdata.forEach( function(nde){
        if ( lbl ) return;

        if ( nde.type == "link in" && nde.name.startsWith("[blog] ") && (nde.wires[0] || []).indexOf(obj.id) > -1 ) {
            lbl = nde.name.substring(7)
        }
    });

    return lbl || obj.type;
};

var linkCallLabelFunct = (obj, subflowObj, flowdata) => {
    if ( !obj.links || obj.links.length == 0 ) { return obj.name ||  obj.type }

    var lbl = undefined;

    flowdata.forEach(function (nde) {
        if (lbl) return;

        if (nde.id == obj.links[0]) {
            lbl = (labelByFunct[nde.type] || defaultLabelFunct)(nde,subflowObj,flowdata);
        }
    });

    /* remember: link calls can reference nodes outside of the current flow, to solve that: given them names */
    return obj.name || lbl || obj.type;
};

var catchLabelFunct = (obj, subflowObj, flowdata) => {
    var sublabel = "";
    
    if ( obj.uncaught ) { sublabel = ": uncaught" }
    if ( obj.scope ) { sublabel = ": " + obj.scope.length }
    if ( !obj.scope && !obj.uncaught ) { sublabel = ": all" }

    return obj.name || (obj.type + sublabel)
};

var labelByFunct = {
    "base64":        undefined,
    "batch":         undefined,
    "catch":         catchLabelFunct,
    "change":        undefined,
    "comment":       undefined,
    "csv":           undefined,
    "debug":         undefined,
    "exec":          undefined,
    "file":          (obj, _sub, _flow) => { return (obj.name || obj.filename || obj.type) },
    "file in":       (obj, _sub, _flow) => { return (obj.name || obj.filename || obj.type) },
    "function":      undefined,
    "html":          undefined,
    "http response": (obj, _sub, _flow) => { return ( obj.name || ("http" + (obj.statusCode ? " (" + obj.statusCode +")" : ""))) },
    "http in":       (obj, _sub, _flow) => { return ( obj.name || ("[" + obj.method + "] " + obj.url)) },
    "http request":  undefined,
    "inject":        undefined,
    "join":          undefined,
    "json":          undefined,
    "junction":      undefined,
    "link in":       undefined,
    "link out":      undefined,
    "link call":     linkCallLabelFunct,
    "markdown":      undefined,
    "postgresql":    undefined,
    "range":         undefined,
    "sort":          undefined,
    "split":         undefined,
    "switch":        undefined,
    ui_button:       undefined,
    ui_list:         undefined,
    ui_svg_graphics: undefined,
    ui_template:     undefined,
    ui_toast:        undefined,
    ui_upload:       undefined,
    "yaml":          undefined,
    "xml":           undefined,

    /* private nodes for this instane */
    'BlogPages':    undefined,
    'BlogDetails':  undefined,
    'BlogPageInfo': blogPageInfoLabel,
    'PubMedium':    undefined,

    "Topic": mindMapNodeLabelFunct,
    "Observation": mindMapNodeLabelFunct,
    "Question": mindMapNodeLabelFunct,
    "Thought": mindMapNodeLabelFunct,
    "Idea": mindMapNodeLabelFunct,
    "Analogy": mindMapNodeLabelFunct,
    "Aphorism": mindMapNodeLabelFunct,
    "Poesie": mindMapNodeLabelFunct,
    "Humour": mindMapNodeLabelFunct,
    "Treasure": mindMapNodeLabelFunct,
    "Consequence": mindMapNodeLabelFunct,
    "Advantage": mindMapNodeLabelFunct,
    "Disadvantage": mindMapNodeLabelFunct,
    "Text": mindMapNodeLabelFunct,
    "Blog-Post": mindMapNodeLabelFunct,
    "Comment": mindMapNodeLabelFunct,
    "Codebase": mindMapNodeLabelFunct,
    "Sketch": mindMapNodeLabelFunct,
    "Inspiration": mindMapNodeLabelFunct,
    "Quote": mindMapNodeLabelFunct,
    "Definition": mindMapNodeLabelFunct,
    "Book": mindMapNodeLabelFunct,
    "Author": mindMapNodeLabelFunct,

    'nnb-input-node': undefined,
    'nnb-layer-node': (obj,_sub,_flow) => { return (obj.name || (obj.actfunct + ": " + obj.bias + ", " + obj.threshold))},
    'nnb-output-node': undefined,
    'nnb-backprop': undefined,
    'nnb-trainer': undefined,

    'Seeker': undefined,
    'Sink': undefined,
    'Screenshot': undefined,
    'Orphans': undefined,
    'IsMobile': undefined,
    'Navigator': undefined,
    'DrawSVG': undefined,
    'GetFlows': undefined,
    
    "FlowHubPull": (obj, _sub, _flow) => { return (obj.name || obj.flowname || obj.type) },
    "FlowHubPush": (obj, _sub, _flow) => { return (obj.name || obj.flowname || obj.type) },

    "JsonSchemaValidatorWithDocu": (obj, _sub, _flow) => { return (obj.name || obj.schematitle || obj.type) },

    "_default": defaultLabelFunct,
};