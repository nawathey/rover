// starts a monitoring loop to monitor alarm zone status

/*jslint node: true, indent: 2*/
"use strict";

// pulse output on PORTA bit 0
function blink(wire, val) {
  wire.writeBytes(process.env.MCP23017_OLATA, val, function (err) {
    if (err !== null) {
      console.log("error on write " + err);
    } else if (val === 1) {
      setTimeout(blink(0), 100);
    }
  });
}

try {

  var I2c = require("i2c"),
    wire = new I2c(process.env.MCP23017_CHIP,
              { device: "/dev/i2c-" + process.env.MCP23017_BUS, debug : false });

  module.exports = function () {
    console.log("start monitoring alarms");
    setInterval(function () {
      blink(wire, 1);
      wire.readBytes(process.env.MCP23017_OLATA, function (err) {
        if (err !== null) {
          console.log("error on read " + err);
        } else {
          global.zoneStatus = { data: "TODO: get wrie data" };
        }
      });
    }, 1000);
  };

} catch (e) {
  module.exports = function () {
    console.log("running without i2c module, monitoring disabled");
    global.zoneStatus = { error: "no i2c module, monitoring disabled" };
  };
}
