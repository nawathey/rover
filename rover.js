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
  io.set('log level', 2); // 2=INFO, 3=DEBUG
});

app.configure('development', function() { app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); });
app.configure('production', function() { app.use(express.errorHandler()); });

var proxy = require('./proxy.js');
proxy.use(http);

app.get('/', routes.index);
app.get('/dt', dt);
app.get('/still', still);
app.get('/stillFile', stillFile);
app.get('/stream', proxy.stream);
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

try { 
  require.resolve('gpio');
  var mon = require('./monitor.js');
  mon.start(io);
} catch(e) {
  console.log('running without gpio module, monitoring disabled');
}
