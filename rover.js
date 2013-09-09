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
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Internal server error!');
  });
  io.set('log level', 2);
});

app.configure('development', function() { app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); });
app.configure('production', function() { app.use(express.errorHandler()); });

app.get('/', routes.index);
app.get('/dt', dt);
app.get('/still', still);
app.get('/stillFile', stillFile);
app.get('/rover', rover);
app.get('*', function(req, res) { res.send('<H1>404 Not Found</H1>', 404); });

var sys = require('sys'),
    exec = require('child_process').exec;

function dt(req, res) { exec("date", function (error, stdout, stderr) { res.send("Now it's " + stdout) }) }

function stillFile(req, res) {
  exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
    res.writeHead(302, {'Location': 'image.jpg'});
    res.end();
  })
}
function still(req, res) {
  exec('raspistill -n -t 500 -o -', {maxBuffer:10000*1024}, function (error, stdout, stderr) {
    res.shouldKeepAilve = false;
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end(stdout);
  })
}

var url = require('url');
var hb = require('./hb.js');
function rover(req, res) {
  var url_parts = url.parse(req.url, true);
  res.send(hb.rover(url_parts.query.cmd));
};

server.listen(8088);
console.log('Web server listening on port %d in %s mode', server.address().port, app.settings.env);

io.sockets.on('connection', function(socket) {
  socket.emit('status', hb.status()); // send initial status
  socket.on('keydown', function(dir) {
    switch(dir){
     case 'up': hb.rover('f'); break;
     case 'down': hb.rover('b'); break;
     case 'left': hb.rover('l'); break;
     case 'right': hb.rover('r'); break;
    }
  });
  socket.on('keyup', function(dir){
    socket.emit('status', hb.status()); 
  });
});
