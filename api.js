/*jslint node: true, indent: 2*/ // no checked for initial or trailing underbars
"use strict";

var
  url = require("url"),
  dataModel,
  io;

exports.use = function (d, i) { dataModel = d; io = i; };

exports.directUpdate = function (newStatus) {
  var x = dataModel.updateNewStatus(newStatus);
  io.sockets.emit("update", { "update" : newStatus, "all" : dataModel.currentStatus() });
  return x;
};

function doUpdate(res, newStatus) {
  res.json(exports.directUpdate(newStatus));
}

exports.updateStatus = function (req, res) {
  var newStatus = {},
    query = url.parse(req.url, true).query;
  newStatus.name = query.name;
  newStatus.appid = query.appid;
  newStatus.updown = query.updown;
  newStatus.comment = query.comment;
  doUpdate(res, newStatus);
};

exports.postStatus = function (req, res) {
  var newStatus = {};
  newStatus.name = req.body.name;
  newStatus.appid = req.body.appid;
  newStatus.updown = req.body.updown;
  newStatus.comment = req.body.comment;
  doUpdate(res, newStatus);
};

exports.getCurrentStatus = function (req, res) { res.json(dataModel.currentStatus()); };
