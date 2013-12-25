/*jslint node: true, indent: 2, nomen: true*/

module.exports = function (app) {
  "use strict";
  var jp = require("./jadeParam.js"),
    fs = require("fs");

  app.get("/logout", function (req, res) {
    res.clearCookie("user");
    res.clearCookie("pass");
    req.session.destroy(function (e) { res.redirect("/"); });
  });

  app.get("/secure/stillFile", function (req, res) {
    require("child_process").exec("raspistill -n -t 500 -o public/image.jpg",
      function (error, stdout, stderr) { res.writeHead(302, {"Location": "image.jpg"}); res.end(); });
  });

  app.get("/secure/motion", function (req, res) { res.render("motion", jp.getParam(req, "Motion Captured")); });
  app.get("/secure/live", function (req, res) { res.render("live", jp.getParam(req, "Live Camera")); });
  app.get("/secure/roverHome", function (req, res) { res.render("roverHome", jp.getParam(req, "Rover Home")); });
  app.get("/secure/drive", function (req, res) { res.render("drive", jp.getParam(req, "Rover Drive")); });

  app.get("/status", function (req, res) {
    require("child_process").exec("df -h /", function (error, stdout, stderr) {
      var p = jp.getParam(req, "Status");
      p.status = stdout;
      res.render("status", p);
    });
  });

  app.post("/secure/api/deleteLog", function (req, res) {
    var files = req.param("files"), i;
    console.log("request by " + req.session.user.user + " to delete files " + files);
    function cb(e) { if (e) { console.log("failed to delete (" + e + ")"); } }
    for (i = 0; i < files.length; i += 1) { fs.unlink(__dirname + "/public/log/" + files[i], cb); }
    res.end();
  });
};
