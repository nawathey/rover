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

var httpPort = 8088;
var app = require('connect');
app.createServer()
  .use(app.logger('dev'))
  .use(app.static('public'))
  .use(function(req, res){
    router(req, res)
  })
.listen(httpPort);
console.log('web server listening on TCP port ' + httpPort);

var url = require('url');

var router = function(req, res) {
  var url_parts = url.parse(req.url);
  switch (url_parts.pathname) {
    case '/date': date(req, res); break;
    case '/still': still(req, res); break;
    case '/stillFile': stillFile(req, res); break;
    case '/rover': rover(req, res); break;
    default: display_404(url_parts.pathname, req, res);
  }
}

function display_404(url, req, res) {
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.write('<H1>404 Not Found</H1>');
  res.write('The page you were looking for: ' + encodeURIComponent(url) + ' cannot be found');
  res.end();
}

var sys = require('sys'),
    exec = require('child_process').exec;

var date = function(req, res) {
  exec("date", function (error, stdout, stderr) {
    res.write("date is " + stdout)
    res.end();
  })
}

var stillFile = function(req, res) {
  exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
    res.writeHead(302, {'Location': 'image.jpg'});
    res.end();
  })
}

var still = function(req, res) {
  exec('raspistill -n -t 500 -o -', {maxBuffer:10000*1024}, function (error, stdout, stderr) {
    res.shouldKeepAilve - false;
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end(stdout);
  })
}

var rover = function(req, res) {
  var url_parts = url.parse(req.url, true);
  console.log('rover command ' + JSON.stringify(url_parts));
  var cmd = url_parts.query.cmd;
  var rc;
  if (typeof cmd == "undefined" || cmd == null)  
    rc = 'No command specified. Try /rover?cmd=a';
  else {
    sp.write(url_parts.query.cmd);
    rc = 'Command "' + cmd + '" sent to serial port';
  }
  res.end(rc);
}

