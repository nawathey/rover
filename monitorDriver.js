// starts a monitoring loop to flash LED if users are driving Handyboard

/*jslint node: true, indent: 2*/
"use strict";

try {
  var g17 = require("gpio").export(17, {
    direction: "out",
    interval: 200,
  });
  g17.reset();
  module.exports = function (io) {
    setInterval(function () {
      var n = Object.keys(io.sockets.manager.connected).length;
      if (n > 0) {
        g17.set();
        setTimeout(function () { g17.reset(); }, 10);
      }
    }, 1000);
  };
} catch (e) {
  g17 = null;
  console.log("gpio setup error: " + JSON.stringify(e) + ", monitor of handyboard disabled");
  module.exports = function (io) {};
}
