// starts a monitoring loop to monitor alarm zone status

/*jslint node: true, indent: 2*/
"use strict";

// pulse output on PORTA bit 0
function blink(wire, val) {
  wire.writeBytes(process.env.MCP23017_OLATA, val, function (err) {
    if (err !== null) {
      console.log("error on write to i2c: " + err);
    } else if (val === 1) {
      setTimeout(blink(wire, 0), 100);
    }
  });
}

try {

  var I2c = require("i2c"),
    opt = { device: "/dev/i2c-" + process.env.MCP23017_BUS, debug : false },
    wire = new I2c(process.env.MCP23017_CHIP, opt);

  module.exports = function () {
    console.log("start monitoring alarms with option: " + JSON.stringify(opt));
    setInterval(function () {
      blink(wire, 1);
      wire.readBytes(process.env.MCP23017_GPIOA, 2, function (err, res) {
        if (err !== null) {
          console.log("error on readBytes: " + JSON.stringify(err));
        } else {
          global.zoneStatus = { date: Date.now(), porta: res[0], portb: res[1] };
          console.log("readBytes: " + JSON.stringify(global.zoneStatus));
        }
      });
    }, 1000);
  };

} catch (e) {
  module.exports = function () {
    console.log("i2c module setup error: " + JSON.stringify(e) + ", monitoring disabled");
    global.zoneStatus = { error: "no i2c module, monitoring disabled" };
  };
}
