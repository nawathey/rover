// socket IO event handler

/*jslint node: true, indent: 2*/
"use strict";

module.exports = function (server, hb) {
  var sio = require("socket.io").listen(server),
    statusInProgress = false;

  sio.set("log level", 2); // 2=INFO, 3=DEBUG

  sio.sockets.on("connection", function (socket) {
    try {
      hb.onStatus(function (o) { socket.emit("status", o); });
    } catch (e) {
      console.log("Handyboard not functioning.");
      return;
    }

    socket.on("keydown", function (dir) {
      if (!statusInProgress) {
        statusInProgress = true;
        setTimeout(function () { hb.rover("a"); statusInProgress = false; }, 1000);
      }
      switch (dir) {
      case "up":
        hb.rover("f");
        break;
      case "down":
        hb.rover("b");
        break;
      case "left":
        hb.rover("l");
        break;
      case "right":
        hb.rover("r");
        break;
      case "panMid":
        hb.rover("pm");
        break;
      case "panLeft":
        hb.rover("pl");
        break;
      case "panRight":
        hb.rover("pr");
        break;
      case "tiltUp":
        hb.rover("tl");
        break;
      case "tiltDown":
        hb.rover("tr");
        break;
      }
    });

    socket.on("keyup", function (dir) {
    });
  });

  return sio;
};
