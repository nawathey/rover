// rover server

var express = require('express'),
    routes = require('./routes'),
    sio = require('socket.io'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = sio.listen(server);

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.bodyParser());
  //app.use(express.methodOverride());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
  app.use(express.errorHandler());
});

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

var url = require('url');
var hb = require('./hb.js');
var rover = function(req, res) {
  var url_parts = url.parse(req.url, true);
  res.send(hb.rover(url_parts.query.cmd));
};

function display404(err, req, res) {
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.write('<H1>404 Not Found</H1>');
  res.write('The page you were looking for: ' + encodeURIComponent(req.url) + ' cannot be found');
  res.end();
}

app.get('/', routes.index);
app.get('/date', date);
app.get('/still', still);
app.get('/stillFile', stillFile);
app.get('/rover', rover);
app.get('*', display404);

server.listen(8088);
console.log('Web server listening on port %d in %s mode', server.address().port, app.settings.env);

io.sockets.on('connection', function(socket) {
  socket.emit('status', hb.status()); 
  socket.on('keydown', function(dir) {
    switch(dir){
     case 'up': hb.rover('f'); break;
     case 'down': hb.rover('b'); break;
     case 'left': hb.rover('l'); break;
     case 'right': hb.rover('r'); break;
    }
  });

  socket.on('keyup', function(dir){ hb.rover('x'); });
});
