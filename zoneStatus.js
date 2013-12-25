// process sensor zone updates

/*jslint node: true, indent: 2*/
"use strict";

var fs = require("fs"),
  fn = "data/zoneMap.json",
  dt,
  zoneMap;

try {
  /*jslint stupid: true */ // suppress unexpected Sync method
  dt = fs.readFileSync(fn);
  /*jslint stupid: true */ // suppress unexpected Sync method
  zoneMap = JSON.parse(dt);
} catch (e) {
  console.log("  error - reading zone map file " + fn + ": " + JSON.stringify(e));
  zoneMap = {};
}

function processUpdate(name, st, portValue, bit) {
  var newStatus = {};
  newStatus.name = name;
  newStatus.appid = "mcp23017";
  newStatus.updown = st;
  newStatus.comment = "bit " + bit + " of " + portValue;
  global.api.directUpdate(newStatus);
}

/*jslint bitwise: true*/
function valueToStatus(val, bit, norm) {
  var v = (val & (1 << bit)) !== 0 ? 1 : 0;
  console.log("val=" + val + ",bit=" + bit + ",norm=" + norm + "=" + v);
  return ((norm === v) ? "up" : "down");
}
/*jslint bitwise: false*/

exports.processReading = function (portValues) {
  var p, i, v, st;
  console.log("procesReading: " + portValues);
  for (p = 0; p < portValues.length; p += 1) {
    for (i = 0; i < 8; i += 1) {
      v = zoneMap[p][i];
      //console.log("zoneMap " + p + "," + i + ":" + JSON.stringify(v));
      if (v && v.name) {
        st = valueToStatus(portValues[p], i, v.normal || 1);
        if (v.stat !== st) {
          v.stat = st;
          processUpdate(v.name, st, portValues[p], i);
        }
      }
    }
  }
}
