// starts a monitoring loop to monitor i2c sensor values

/*jslint node: true, indent: 2*/
"use strict";

var zs = require("./zoneStatus.js");

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

function readPorts(wire) {
  wire.readBytes(process.env.MCP23017_GPIOA, 2, function (err, res) {
    if (err !== null) {
      console.log("error on readBytes: " + JSON.stringify(err));
    } else {
      zs.processReading(res);
    }
  });
  blink(wire, 1);
}

function readRandom() {
  var a = Math.floor(Math.random() * 256),
    b = Math.floor(Math.random() * 256);
  zs.processReading([a, b]);
}

try {

  var I2c = require("i2c"),
    opt = { device: "/dev/i2c-" + process.env.MCP23017_BUS, debug : false },
    wire = new I2c(process.env.MCP23017_CHIP, opt);

  module.exports = function () {
    console.log("start monitoring alarms with option: " + JSON.stringify(opt));
    setInterval(function () { readPorts(wire); }, 500);
  };

} catch (e) {
  module.exports = function () {
    console.log("i2c module setup error: " + JSON.stringify(e) + ", monitoring disabled");
    setInterval(readRandom, 10000);
  };
}
