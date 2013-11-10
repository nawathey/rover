// starts a monitoring loop
// flash LED if there are users connected

/*jslint node: true, indent: 2, nomen: true */
"use strict";

try {
  var g17 = require("gpio").export(17, {
    direction: "out",
    interval: 200,
  });
  exports.use = function (io) {
    setInterval(function () {
      var n = Object.keys(io.sockets.manager.connected).length;
  //      console.log("monitor: " + n);
      if (n > 0) {
        g17.set();
        setTimeout(function () { g17.reset(); }, 10);
      }
    }, 1000);
  };
} catch (e) {
  exports.use = function (io) {
    console.log("running without gpio module, monitoring disabled");
  };
}
