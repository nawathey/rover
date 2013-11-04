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
      res.render('status', { title: 'Rover - Status', status : "the time is " + stdout });
    });
  });

  app.get('/secure/stillFile', function (req, res) {
    require('child_process').exec('raspistill -n -t 500 -o public/image.jpg',
      function (error, stdout, stderr) { res.writeHead(302, {'Location': 'image.jpg'}); res.end(); });
  });

  function getJadeParam(req, title) {
    var p = require('./idPwd-mine.json');
    p.title = title;
    p.user = req.session.user.name;
    return p;
  }
  app.get('/secure/home', function (req, res) { res.render('roverHome', getJadeParam(req, 'Rover Home')); });
  app.get('/secure/drive', function (req, res) { res.render('drive', getJadeParam(req, 'Rover Drive')); });
  app.get('/secure/motion', function (req, res) { res.render('motion', getJadeParam(req, 'Motion Camera')); });

  var fs = require('fs');
  app.post('/secure/api/deleteLog', function (req, res) {
    var files = req.param("files");
    console.log('request by ' + req.session.user.user + ' to delete files ' + files);
    for (var i = 0; i < files.length; i++) {
      fs.unlink( __dirname + '/public/log/' + files[i], function (e) {
        if (e) { console.log('failed to delete (' + e + ')'); }
      });
    }
    res.end();
  });
};
