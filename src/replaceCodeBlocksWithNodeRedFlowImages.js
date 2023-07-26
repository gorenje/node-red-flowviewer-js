function createGroupWithClass(cls) {
    var grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
    grp.setAttribute("class", cls);
    return grp;
}

function renderSvgWithOptions(elem, flowId, flowdata, opts) {
    var divId = "svgCont" + Math.random().toString().substring(2);
    var jsonContent = undefined;

    /* if we're going to offer a download link, then copy the content before replacing it */
    if (opts.dllink) { jsonContent = JSON.parse(elem.innerHTML) }

    $($(elem).parent()).replaceWith($("<div></div>").attr('id', divId).attr(
        'style', 'width: 92% ; height: 500px ; left: 4%; overflow: scroll; display: inline-block; position: relative;'
    ).attr('class', 'svg-container').attr('class', 'svg-container-noderedjson'));

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "5000");
    svg.setAttribute("height", "5000");
    svg.setAttribute("viewBox", "0 0 5000 5000");
    svg.setAttribute("style", "cursor: crosshair;");
    svg.setAttribute("version", "1.1");

    document.getElementById(divId).appendChild(svg);

    $('#' + divId + " svg").append(createGroupWithClass("flowGridlines"));
    $('#' + divId + " svg").append(createGroupWithClass("containerGroup"));
    $('#' + divId + " svg g.containerGroup").append(createGroupWithClass("flowGroups"));
    $('#' + divId + " svg g.containerGroup").append(createGroupWithClass("flowWires"));
    $('#' + divId + " svg g.containerGroup").append(createGroupWithClass("flowNodes"));

    renderFlow(flowId, flowdata, $('#' + divId + " svg"), opts);

    /* resize the svg so that the flow image is front and centre */
    var boundingBox = $('#' + divId + " svg").find('.containerGroup')[0].getBBox();
    var svgElem = $("#" + divId + " svg")[0];

    var svgLocation = {
        x: boundingBox.x,
        y: boundingBox.y 
    }

    svgElem.setAttribute("viewBox", "" +
        svgLocation.x + " " +
        svgLocation.y + " " +
        boundingBox.width + " " +
        boundingBox.height 
    );

    var divElem = $('#' + divId)[0];   
    svgElem.style.width = Math.max( $(divElem).width(), (boundingBox.width + 20) ) + "px";
    svgElem.style.height = (boundingBox.height + 20) + "px";

    /* shrink div container to the size of the svg if the svg is smaller than the container */
    if ($(divElem).height() > (boundingBox.height + 20)) {
        $(divElem).css("height", (boundingBox.height + 30) + "px")
    }

    svgLocation.scaleFactorW = Math.min(1, $(divElem).width() / (boundingBox.width + 10));
    svgLocation.scaleFactorH = Math.min(1, $(divElem).height() / (boundingBox.height + 10));

    if (opts["zoom"]) {
        defineZoomOnFlow($('#' + divId + " svg")[0], $('#' + divId)[0], svgLocation)
    } else {
        var svgImage = $('#' + divId + " svg")[0];

        svgElem.setAttribute("viewBox", "" +
            svgLocation.x + " " +
            svgLocation.y + " " +
            (svgImage.clientWidth * (1 / svgLocation.scaleFactorW)) + " " +
            (svgImage.clientHeight * (1 / svgLocation.scaleFactorH))
        );
    }

    if (opts.dllink) {

        $('#' + divId).after($("<a>Download Flow</a>").attr(
            'href', "data:application/json," + encodeURIComponent(JSON.stringify(jsonContent))
        ).attr("download", "flow.json").attr('class','flow-download-link'));

        $('#' + divId).after($("<span> | </span>").attr('class', 'flow-download-link'));

        var elem = $('#' + divId).after($("<a>Copy Flow to Clipboard</a>").attr('href', "#").attr(
            'id', divId +'-copy-to-clipboard'
        ).attr('class', 'flow-copy-to-clipboard-link')); 

        var contents = JSON.stringify(jsonContent);
        $('#' + divId + "-copy-to-clipboard").on('click', function(e) { 
            e.preventDefault();
            copyTextToClipboard(contents, function() { alert('copied')});
        });

        $('#' + divId).after($("<br/>"));
    }
};

function renderElemsWithOptions(elems, opts) {
    for (var idx = 0; idx < elems.length; idx++) {
        try {
            var flowdata = JSON.parse(elems[idx].innerHTML);
        } catch (e) {
            console.log(e);
            $($(elems[idx]).parent()).replaceWith($("<span class='flow-render-error'>ERROR: Failed to parse Json</span>"));
            continue;
        }

        var flowId = undefined;
        var subflowIds = []; /* all nodes that have z value which is a subflow node, is part of the subflow not the main flow */

        flowdata.forEach(function (nde) {
            if (nde.type == "subflow") subflowIds.push(nde.id);
        });

        flowdata.forEach(function (nde) {
            if (flowId) return;

            if (nde.type != "subflow" && subflowIds.indexOf(nde.z) < 0) { flowId = nde.z }
        });
        if (!flowId && subflowIds.length > 0) { flowId = subflowIds[0] }

        if (!flowId) {
            $($(elems[idx]).parent()).replaceWith($("<span class='flow-render-error'>ERROR: Failed to obtain flow id</span>"));
            continue;
        }

        renderSvgWithOptions(elems[idx], flowId, flowdata, opts)
    }
};

// Options are named with the affect they have on the default: default noderedjson is as close to
// the editor window as we can get however these options modify this:
//    with-arrows replaces rectangles on the input lines
//    no-gridlines turns off the gridlines in the background
//    ...
// hence 'no' gridlines since gridlines are on by default, arrows are off by default hence 'with'.
function parseLanguageOptions(optsStr) {
    // optsStr is assumed to be everything after the 'language-noderedjson-' prefix
    var rVal = {
        "arrows":    optsStr.indexOf("with-arrows") > -1,
        "gridlines": !(optsStr.indexOf("no-gridlines") > -1),
        "zoom":      optsStr.indexOf("with-zoom") > -1,
        "images":    !(optsStr.indexOf("no-images") > -1),
        "labels":    !(optsStr.indexOf("no-labels") > -1),
        "linklines": optsStr.indexOf("with-linklines") > -1,
        "dllink":    optsStr.indexOf("with-download-link") > -1,
    };

    // with-XXXX overrides previous no-XXXX setting
    rVal.gridlines = (optsStr.indexOf("with-gridlines") > -1) || rVal.gridlines;
    rVal.images    = (optsStr.indexOf("with-images") > -1) || rVal.images;
    rVal.labels    = (optsStr.indexOf("with-labels") > -1) || rVal.labels;

    return rVal;
}

function replaceCodeBlocksWithNodeRedFlowImages() {
    /* these are the default settings */
    renderElemsWithOptions($('code.language-noderedjson'), {
        "arrows":    false,
        "gridlines": true,
        "zoom":      false,
        "images":    true,
        "linklines": false,
        "dllink":    false,
        "labels":    true,
    });

    $("code[class*='language-noderedjson-']").each(function (idx, elem) {
        renderElemsWithOptions([elem], parseLanguageOptions(elem.attributes["class"].value.substring(21)))
    });
};

