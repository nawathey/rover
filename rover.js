// rover server

/*jslint node: true, indent: 2, nomen: true */
"use strict";

var express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app);

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.bodyParser());
  //app.use(express.methodOverride());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Internal server error!');
  });
});

app.configure('development', function () { app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); });
app.configure('production', function () { app.use(express.errorHandler()); });

var proxy = require('./proxy.js');
proxy.use(http);

var routes = require('./routes');
app.get('/', routes.index);
app.get('/rover', routes.rover);
app.get('/dt', routes.dt);
app.get('/still', routes.still);
app.get('/stillFile', routes.stillFile);
app.get('/stream', proxy.stream);
app.get('*', function (req, res) { res.send('<H1>404 Not Found</H1>', 404); });

// socket IO event handler
var hb = require('./hb.js');
var sio = require('./sio.js');
sio.use(server, hb);

// start web server
server.listen(8088);
console.log('Web server listening on port %d in %s mode', server.address().port, app.settings.env);
