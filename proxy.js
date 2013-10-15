// module called from rover.js to proxy the /stream request to mjpg-streamer

/*jslint node: true, indent: 2, nomen: true */
"use strict";

var http;

exports.use = function (o) { http = o; };

function getOption(action, req) {
  return {
    host:   'localhost',
    port:   8080,
    path:   '/?action=' + action,
    headers: req.headers
  };
}

function setNoCacheHeader(contentType, res) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Connection', 'close');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, private');
  res.setHeader('Expires', 0);
  res.setHeader('Max-Age', 0);
}

exports.still = function stream(req, res) {
  var creq = http.get(getOption('snapshot', req), function (cres) {
    setNoCacheHeader('image/jpeg', res);
    cres.on('data', function (chunk) { res.write(chunk); });
    cres.on('end', function () { res.end(); });
    cres.on('close', function () { res.writeHead(cres.statusCode); res.end(); });
  })
    .on('error', function (e) { console.log(e.message); res.writeHead(500); res.end(); });
};

exports.stream = function stream(req, res) {
  var creq = http.get(getOption('stream', req), function (cres) {
    setNoCacheHeader('multipart/x-mixed-replace;boundary="boundarydonotcross"', res);
    cres.on('data', function (chunk) { res.write(chunk); });
    cres.on('close', function () { res.writeHead(cres.statusCode); res.end(); });
  })
    .on('error', function (e) { console.log(e.message); res.writeHead(500); res.end(); });
};
