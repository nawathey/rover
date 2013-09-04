// serial interface to Handy Board

var serialPort = require('serialport').SerialPort;
var sp = new serialPort('/dev/ttyUSB0', { baudrate: 9600 });

sp.on('data', function(data) {
  console.log('serial data:' + data.toString());
});

sp.on('error', function(err) {
  console.log('serial error:' + err);
});

sp.on('open', function(err) {
  console.log('serial port opened');
  sp.write('a');
});

exports.rover = function(cmd) {
  var rc;
  if (typeof cmd == "undefined" || cmd == null)  
    rc = 'No command specified. Try /rover?cmd=a';
  else {
    sp.write(cmd);
    rc = 'Command "' + cmd + '" sent to serial port';
  }
  return rc;
}

