// rover server

var hb = require('./hb.js');

var httpPort = 8088;
var express = require('express');
var app = express();

console.log('web server listening on TCP port ' + httpPort);

var url = require('url');

//app.use(express.bodyParser());
//app.use(express.methodOverride());
app.use(express.logger('dev'));
app.use(express.static('public'));
app.use(app.router);
app.use(function(err, req, res, next){
  console.err(err.stack);
  res.send(500, 'Internal server error');
});


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
    res.end("date is " + stdout)
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
  res.send(hb.rover(url_parts.query.cmd));
};

app.get('/date', date);
app.get('/still', still);
app.get('/stillFile', stillFile);
app.get('/rover', rover);

app.listen(8088);
