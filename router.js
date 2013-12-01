/*jslint node: true, indent: 2, nomen: true*/

module.exports = function (app) {
  "use strict";
  
  app.get("/logout", function (req, res) {
    res.clearCookie("user");
    res.clearCookie("pass");
    req.session.destroy(function (e) { res.redirect("/"); });
  });

  app.get("/status", function (req, res) {
    require("child_process").exec("df -h /", function (error, stdout, stderr) {
      res.render("status", { title: "Rover - Status", status : stdout });
    });
  });

  app.get("/secure/stillFile", function (req, res) {
    require("child_process").exec("raspistill -n -t 500 -o public/image.jpg",
      function (error, stdout, stderr) { res.writeHead(302, {"Location": "image.jpg"}); res.end(); });
  });

  function getJadeParam(req, title) {
    var p = require("./idPwd-mine.json");
    p.title = title;
    p.user = req.session.user.name;
    p.headers = req.headers;
    //console.log("headers = " + JSON.stringify(req.headers) + ", param = " + JSON.stringify(p));
    return p;
  }
  app.get("/secure/home", function (req, res) { res.render("roverHome", getJadeParam(req, "Rover Home")); });
  app.get("/secure/drive", function (req, res) { res.render("drive", getJadeParam(req, "Rover Drive")); });
  app.get("/secure/motion", function (req, res) { res.render("motion", getJadeParam(req, "Motion Captured")); });
  app.get("/secure/live", function (req, res) { res.render("live", getJadeParam(req, "Live Camera")); });

  var fs = require("fs");
  app.post("/secure/api/deleteLog", function (req, res) {
    var files = req.param("files"), i;
    console.log("request by " + req.session.user.user + " to delete files " + files);
    function cb(e) { if (e) { console.log("failed to delete (" + e + ")"); } }
    for (i = 0; i < files.length; i += 1) { fs.unlink(__dirname + "/public/log/" + files[i], cb); }
    res.end();
  });
};
