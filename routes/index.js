/*jslint node: true, indent: 2*/
"use strict";

exports.index = function (req, res) { res.render('index', { title: 'Raspberry Pi Rover' }); };
exports.control = function (req, res) { res.render('control', { title: 'Raspberry Pi Rover Control Panel' }); };

exports.rover = function (req, res, hb) { res.send(hb.rover(require('url').parse(req.url, true).query.cmd)); };

exports.dt = function (req, res) {
  require('child_process').exec("date", function (error, stdout, stderr) { res.send("Now it's " + stdout); });
};

exports.stillFile = function (req, res) {
  require('child_process').exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
    res.writeHead(302, {'Location': 'image.jpg'});
    res.end();
  });
};
