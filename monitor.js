// starts a monitoring loop
// flash LED if there are users connected

var gpio = require("gpio");
var g17 = gpio.export(17, { 
  direction: 'out', 
  interval: 200,
});

exports.start = function(io) {
  setInterval(function() { 
      var n = Object.keys(io.sockets.manager.connected).length; 
//      console.log('monitor: ' + n);
      if (n > 0) {
	g17.set();
	setTimeout(function() { g17.reset(); }, 20);
      }
    }, 10000);
}
