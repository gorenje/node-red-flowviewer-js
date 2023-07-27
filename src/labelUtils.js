function convertHtmlEntities(text) {
    var entityMap = {
        'amp': '&',
        'lt': '<',
        'gt': '>',
        'quot': '"',
        '#39': "'",
        '#x2F': '/',
        '#x60': '`',
        '#x3D': '=',
    };

    return text.replace(/[&]([^;]+);/g, function(e,m) {
        return entityMap[m] || e;
    });
}

/* 
 * Taken from http://demo.openmindmap.org/omm/red/red.js?v=3.0.2 
 * 
 * All Original Rights Apply.
*/

function convertLineBreakCharacter(str) {
    var result = [];
    var lines = str.split(/\\n /);
    if (lines.length > 1) {
        var i = 0;
        for (i = 0; i < lines.length - 1; i++) {
            if (/\\$/.test(lines[i])) {
                result.push(lines[i] + "\\n " + lines[i + 1])
                i++;
            } else {
                result.push(lines[i])
            }
        }
        if (i === lines.length - 1) {
            result.push(lines[lines.length - 1]);
        }
    } else {
        result = lines;
    }
    result = result.map(function (l) { return convertHtmlEntities(l.replace(/\\\\n /g, "\\n ").trim()) })
    return result;
}

function getLabelParts(str, className) {
    var lines = convertLineBreakCharacter(str);
    var width = 0;
    for (var i = 0; i < lines.length; i++) {
        var calculateTextW = calculateTextDimensions(lines[i], className)[0];
        if (width < calculateTextW) {
            width = calculateTextW;
        }
    }
    return {
        lines: lines,
        width: width
    }
}

var textDimensionPlaceholder = {};
var textDimensionCache = {};

function calculateTextDimensions(str, className) {
    var cacheKey = "!" + str;
    if (!textDimensionPlaceholder[className]) {
        textDimensionPlaceholder[className] = document.createElement("span");
        textDimensionPlaceholder[className].className = className;
        textDimensionPlaceholder[className].style.position = "absolute";
        textDimensionPlaceholder[className].style.top = "-1000px";
        document.getElementsByTagName("body")[0].appendChild(textDimensionPlaceholder[className]);
        textDimensionCache[className] = {};
    } else {
        if (textDimensionCache[className][cacheKey]) {
            return textDimensionCache[className][cacheKey]
        }
    }
    textDimensionPlaceholder[className].textContent = (str || "");
    var w = textDimensionPlaceholder[className].offsetWidth;
    var h = textDimensionPlaceholder[className].offsetHeight;
    textDimensionCache[className][cacheKey] = [w, h];
    return textDimensionCache[className][cacheKey];
}