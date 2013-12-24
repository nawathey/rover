// serial interface to Handy Board

/*jslint node: true, indent: 2, nomen: true */
"use strict";

(function () {
  var SerialPort, sp, buf = "", statusCB;

  global.roverConnected = false;
  try {
    SerialPort = require("serialport").SerialPort;
  } catch (e) {
    console.log("serialport module not found, rover interface disabled.");
    return;
  }
  sp = new SerialPort("/dev/ttyUSB0", { baudrate: 9600 });

  function getBatteryLevel() {
    var x = buf.lastIndexOf("["),
      y = buf.lastIndexOf("]"),
      lvl = "n/a"; // Math.round(Math.random() *255);
    if (x !== -1 && y !== -1 && x < y) {
      lvl =  buf.slice(x + 1, y);
      console.log("hb: got battery level '" + buf + "' -> " + lvl);
      buf = "";
      if (statusCB !== undefined) {
        statusCB({ "battery" : lvl });
      }
    }
  }

  sp.on("data", function (data) {
    console.log("hb: got serial data:" + data.toString());
    buf = buf + data;
    getBatteryLevel();
  });

  sp.on("error", function (err) {
    console.log("hb: serial port error, no rover: " + JSON.stringify(err));
  });

  sp.on("open", function (err) {
    global.roverConnected = true;
    console.log("hb: serial port opened");
    sp.write("a");
  });

  exports.rover = function (cmd) {
    console.log("hb: rover command " + cmd);
    var rc;
    if (cmd === undefined || cmd === null) {
      rc = "No command specified. Try /rover?cmd=a";
    } else {
      sp.write(cmd);
      rc = "Command '" + cmd + "' sent to serial port";
    }
    return rc;
  };

  exports.onStatus = function (f) { statusCB = f; };
}());
