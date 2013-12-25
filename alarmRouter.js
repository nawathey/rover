/*jslint node: true, indent: 2*/

module.exports = function (app, sio) {
  "use strict";

  var url = require("url"),
    jp = require("./jadeParam.js"),
    model = require("./model.js");

  global.api = require("./api.js");   // making API global so we can use it directly

  model.use();

  app.get("/secure/home", function (req, res) {
    var pg = url.parse(req.url, true).query.pg || "Home",
      p = jp.getParam(req, "Alarm Zones " + pg);
    p.layoutGrid = model.layoutGrid(pg);
    res.render("alarm", p);
  });
  app.get("/secure/update", function (req, res) { res.render("update", { "title" : "Update Status" }); });

  global.api.use(model, sio);
  app.get("/api/status/get", global.api.getCurrentStatus);
  app.get("/api/status/update", global.api.updateStatus);
  app.post("/api/status/update", global.api.postStatus);

  app.get("/secure/zoneStatus", function (req, res) {
    res.write(JSON.stringify(global.zoneStatus));
    res.end();
  });
};
