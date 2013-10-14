// rover server

/*jslint node: true, indent: 2, nomen: true */
"use strict";

var express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app);

app.configure(function () {
  app.set('port', 8088);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'super-duper-secret-secret' })); 
  app.use(express.static(__dirname + '/public'));
  app.use('/secure', ensureAuthenticated);
  app.use(app.router);
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, 'Internal server error!');
  });
});

function ensureAuthenticated(req, res, next) { 
  console.log("user=" + req.session.user); 
  if (req.session.user === undefined)
    res.redirect('/');
  else
    next(); 
};

app.configure('development', function () { 
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function () { 
  app.use(express.errorHandler()); 
});

require('../node-login/app/server/router')(app);

// socket IO event handler
var hb = require('./hb.js');
var sio = require('./sio.js');
sio.use(server, hb);
var proxy = require('./proxy.js');
proxy.use(http);

require('./router.js')(app, hb, proxy);

// custom Page not found error
app.get('*', function (req, res) { res.send('<H1>404 Not Found</H1>', 404); });

// start web server
server.listen(app.get('port'), function () {
  console.log('Web server listening on port %d in %s mode', server.address().port, app.settings.env);
});
