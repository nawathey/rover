// Node.js main

/*jslint node: true, indent: 2, nomen: true*/ // no checked for initial or trailing underbars
"use strict";

/* Nodetime memory leak detector setup
require("nodetime").profile({
 accountKey: "c7c9be3c6eaea2ae79ba6f24c3868013c7910ad6",
 appName: "Rover Node.js Application"
});
*/

var url = require("url"),
  express = require("express"),
  http = require("http"),
  app = express(),
  server = http.createServer(app),
  adminUser = process.env.USER,
  util = require("util");

function ensureAuthenticated(req, res, next) {
  /*
  console.log("header=" + util.inspect(req.headers) +
    "\nsession=" + util.inspect(req.session) +
    "\nuser=" + util.inspect(req.session.user));
  */
  if (req.session.user === undefined) {
    console.log("rover.js: unauthenticated request to /secure/" + req.url + " is being redirected");
    res.redirect("/?pg=/secure" + url.parse(req.url).path);
  } else if (req.session.user.user !== adminUser) {
    res.redirect("/home");
  } else {
    next();
  }
}

app.configure(function () {
  app.set("port", 8088);
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: "super-duper-secret-secret" }));
  app.use(express.static(__dirname + "/public"));
  // we have to allow individual files to be served unauthenticated for browser to open video files directly
  app.use("/secure/log", express.static(__dirname + "/public/log"));
  // after this point the user must authenticate first, in order to be served
  app.use("/secure", ensureAuthenticated);
  app.use("/secure/log", express.directory(__dirname + "/public/log"));
  app.use(app.router);
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.send(500, "Internal server error!");
  });
});

app.configure("development", function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure("production", function () {
  app.use(express.errorHandler());
});

var proxy = require("./proxy.js");
proxy.use(http);
app.get("/secure/still", proxy.still);
app.get("/secure/stream", proxy.stream);

// Handyboard serial interface
var hb = require("./hb.js");
app.get("/secure/hb", function (req, res, hb) { // for debugging only
  res.send(hb.rover(url.parse(req.url, true).query.cmd));
});
var sio = require("./sio.js")(server, hb);
require("./monitorDriver.js")(sio);

// custom routers
require("../node-login/app/server/router")(app);
require("./router.js")(app);
require("./alarmRouter.js")(app, sio);
require("./monitorAlarm.js")();

// custom Page not found error
app.get("*", function (req, res) { res.send("<H1>404 Not Found</H1>", 404); });

// start web server
server.listen(app.get("port"), function () {
  console.log("Web server listening on port %d in %s mode", server.address().port, app.settings.env);
});

/*
var memwatch = require("memwatch");
var hd;
memwatch.on("leak", function (info) { console.log("mem leak" + JSON.stringify(info)); });
memwatch.on("stats", function (info) {
  console.log("mem stats: " + new Date() + ":" + JSON.stringify(info));
  if (hd !== undefined) { console.log("mem diff: " + JSON.stringify(hd.end())); }
  hd = new memwatch.HeapDiff();
});
*/
