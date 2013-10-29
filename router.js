/*jslint node: true, indent: 2*/
"use strict";

module.exports = function (app) {
  app.get('/logout', function (req, res) {
    res.clearCookie('user');
    res.clearCookie('pass');
    req.session.destroy(function (e) { res.redirect('/'); });
  });

  app.get('/status', function (req, res) {
    require('child_process').exec("date", function (error, stdout, stderr) {
      res.render('status', {
        title: 'Rover - Status',
        user: (req.session.user === undefined) ? '' : req.session.user.name,
        status : "The time is " + stdout
      });
    });
  });

  function getParam(req, title) {
    var p = require('./mjpgIdPwd.json');
    p.title = title;
    p.user = req.session.user.name;
    return p;
  }

  app.get('/secure/rover', function (req, res) {
    res.render('rover', getParam(req, 'Raspberry Pi Rover'));
  });

  app.get('/secure/drive', function (req, res) {
    res.render('drive', getParam(req, 'Rover - Drive'));
  });

  app.get('/secure/stillFile', function (req, res) {
    require('child_process').exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
      res.writeHead(302, {'Location': 'image.jpg'});
      res.end();
    });
  });
};
