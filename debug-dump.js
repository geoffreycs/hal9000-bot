"use strict";
var fs = require('fs');
self.onmessage = function () {
    var data;
    var trimmed;
    var outbound = {};
    try {
        data = String(fs.readFileSync('./happenings.log', 'utf8'));
        trimmed = "```" + data.slice(-1994) + "```";
        outbound.d = trimmed;
    } catch (e) {
        outbound.e = e;
    }
    postMessage(outbound);
}