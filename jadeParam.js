/*jslint node: true, indent: 2*/
"use strict";

var p = require("./idPwd-mine.json");

exports.getParam = function (req, title) {
  p.title = title;
  p.user = req.session.user.name;
  p.headers = req.headers;
  //console.log("headers = " + JSON.stringify(req.headers) + ", param = " + JSON.stringify(p));
  return p;
}
