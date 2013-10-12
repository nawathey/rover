/*jslint node: true, indent: 2*/
"use strict";

module.exports = function (app, hb, proxy) {
  app.get('/logout', function (req, res) { 
    res.clearCookie('user');
    res.clearCookie('pass');
    req.session.destroy(function (e) { res.redirect('/'); });
  });

  app.get('/status', function (req, res) {
    require('child_process').exec("date", function (error, stdout, stderr) { 
      res.send("Now it's " + stdout); 
    });
  });

  app.get('/secure/rover', function (req, res) { 
    res.render('rover', { title: 'Raspberry Pi Rover' }); 
  });

  app.get('/secure/control', function (req, res) { 
    res.render('control', { title: 'Raspberry Pi Rover Control Panel' }); 
  });

  app.get('/secure/stillFile', function (req, res) {
    require('child_process').exec('raspistill -n -t 500 -o public/image.jpg', function (error, stdout, stderr) {
      res.writeHead(302, {'Location': 'image.jpg'});
      res.end();
    });
  });

  app.get('/secure/hb', function (req, res, hb) { 
    res.send(hb.rover(require('url').parse(req.url, true).query.cmd)); 
  });

  app.get('/secure/still', proxy.still);

  app.get('/secure/stream', proxy.stream);
};
