/*jslint node: true, indent: 2*/
"use strict";

exports.index = function (req, res) {
  res.render('index', { title: 'Raspberry Pi Rover' });
};

var sys = require('sys'),
  exec = require('child_process').exec;

exports.dt = function (req, res) {
  exec("date", function (error, stdout, stderr) { res.send("Now it's " + stdout); });
};

exports.stillFile = function (req, res) {
  exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
    res.writeHead(302, {'Location': 'image.jpg'});
    res.end();
  });
};

var url = require('url');
exports.rover = function (req, res, hb) {
  var url_parts = url.parse(req.url, true);
  res.send(hb.rover(url_parts.query.cmd));
};
