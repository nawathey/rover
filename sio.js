// socket IO event handler
var sio = require('socket.io');

exports.start = function(server, hb) {
  var io = sio.listen(server);
  var statusInProgress = false; 
  io.sockets.on('connection', function(socket) {
    hb.statusCB = function (o) { socket.emit('status', o); }

    socket.on('keydown', function(dir) {
      if (! statusInProgress) {
        statusInProgress = true;
        setTimeout( function() { hb.rover('a'); statusInProgress = false; }, 1000);
      }
      switch(dir) {
        case 'up': hb.rover('f'); break;
        case 'down': hb.rover('b'); break;
        case 'left': hb.rover('l'); break;
        case 'right': hb.rover('r'); break;
        case 'panMid': hb.rover('pm'); break;
        case 'panLeft': hb.rover('pl'); break;
        case 'panRight': hb.rover('pr'); break;
        case 'tiltUp': hb.rover('tl'); break;
        case 'tiltDown': hb.rover('tr'); break;
      };
    });

    socket.on('keyup', function(dir) {
    });
  });
}
