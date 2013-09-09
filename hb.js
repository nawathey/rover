// serial interface to Handy Board

var serialPort = require('serialport').SerialPort;
var sp = new serialPort('/dev/ttyUSB0', { baudrate: 9600 });

var buf = '';
sp.on('data', function(data) {
  console.log('hb: serial data:' + data.toString());
  buf = buf + data;
  getBatteryLevel();
});

sp.on('error', function(err) {
  console.log('hb: serial error:' + err);
});

sp.on('open', function(err) {
  console.log('hb: serial port opened');
  sp.write('a');
});

exports.rover = function(cmd) {
  console.log('hb: rover command ' + cmd);
  var rc;
  if (typeof cmd == "undefined" || cmd == null)  
    rc = 'No command specified. Try /rover?cmd=a';
  else {
    sp.write(cmd);
    rc = 'Command "' + cmd + '" sent to serial port';
  }
  return rc;
}

function getBatteryLevel() {
  var x = buf.lastIndexOf('[');
  var y = buf.lastIndexOf(']');
  var lvl = "n/a"; // Math.round(Math.random() *255); 
  if (x != -1 && y != -1 && x < y) {
    lvl =  buf.slice(x+1, y);
    console.log('hb: get battery level "' + buf + '" -> ' + lvl);
    buf = '';
    if (typeof exports.statusCB != 'undefined')
      exports.statusCB({ 'battery' : lvl });
  }
}

exports.statusCB;
