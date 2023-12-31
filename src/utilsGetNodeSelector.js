function getNode(n, v) {
    var elm = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v) { elm.setAttributeNS(null, p, v[p]); }
    return elm;
}

function fillFlowSelector(selectedFlowId, flowdata) {
    var sltObj = $('#flowSelector');

    flowdata.forEach(function (obj) {
        if (obj.type == "tab" || obj.type == "subflow") {
            sltObj.append($('<option></option>').val(obj.id).html(
                (obj.type == "subflow" ? " [SF] " : "") + (obj.label || obj.name)
            ));
        }
    });

    sltObj.find('[value="' + selectedFlowId + '"]').attr('selected', 'selected');
}

function onChangeFlowSelectorNew(e) {
    e.preventDefault();

    var svgjQueryObj = $($('#svgelem')[0]);

    ["flowNodes", "flowGroups", "flowWires", "flowGridlines"].forEach(function (cls) {
        $(svgjQueryObj.find('.' + cls)[0]).html("");
    });

    $('#flowLinkToOriginal').attr('href', "https://demo.openmindmap.org/omm/#flow/" + $('#flowSelector').val());

    renderFlow($('#flowSelector').val(), flowData, svgjQueryObj, { 
        gridlines: true, 
        images: true, 
        linklines: true 
    });
}

function highlightLink(fromNodeId, toNodeId) {
    $('.link-from-' + fromNodeId + "-to-" + toNodeId).addClass('link-highlight');
    $('.node-' + fromNodeId).addClass( "node-highlight");
    $('.node-' + toNodeId).addClass("node-highlight");
}

function rmHighlightLink(fromNodeId, toNodeId) {
    $('.link-from-' + fromNodeId + "-to-" + toNodeId).removeClass('link-highlight')
    $('.node-' + fromNodeId).removeClass("node-highlight");
    $('.node-' + toNodeId).removeClass("node-highlight");
}

function rmAllLinkHighlights() {
    $('.link-highlight').removeClass('link-highlight');
    $('.node-highlight').removeClass('node-highlight');
    $('.group-highlight').removeClass("group-highlight");
}

function linkOnlyHighlight(fromNodeId, toNodeId) {
    $('.link-from-' + fromNodeId + "-to-" + toNodeId).addClass('link-highlight')
}

function nodeOnlyHighlight(nodes) {
    nodes.forEach( function( ndeId) {
        $('.node-' + ndeId).addClass("node-highlight");
   });
}

function groupOnlyHighlight(nodes) {
    nodes.forEach(function (ndeId) {
        $('.group-' + ndeId).addClass("group-highlight");
    });
}
