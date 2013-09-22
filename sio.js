// socket IO event handler

/*jslint node: true, indent: 2, nomen: true */
"use strict";

exports.use = function (server, hb) {
  var io = require('socket.io').listen(server),
    statusInProgress = false;

  io.set('log level', 2); // 2=INFO, 3=DEBUG

  // flash LED if there are users logged in
  require('./monitor.js').use(io);

  io.sockets.on('connection', function (socket) {
    hb.onStatus(function (o) { socket.emit('status', o); });

    socket.on('keydown', function (dir) {
      if (!statusInProgress) {
        statusInProgress = true;
        setTimeout(function () { hb.rover('a'); statusInProgress = false; }, 1000);
      }
      switch (dir) {
      case 'up':
        hb.rover('f');
        break;
      case 'down':
        hb.rover('b');
        break;
      case 'left':
        hb.rover('l');
        break;
      case 'right':
        hb.rover('r');
        break;
      case 'panMid':
        hb.rover('pm');
        break;
      case 'panLeft':
        hb.rover('pl');
        break;
      case 'panRight':
        hb.rover('pr');
        break;
      case 'tiltUp':
        hb.rover('tl');
        break;
      case 'tiltDown':
        hb.rover('tr');
        break;
      }
    });

    socket.on('keyup', function (dir) {
    });
  });
};
