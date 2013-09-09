var http;

exports.use = function (o) { http = o; }

exports.stream = function stream(req, res) {
  var boundary = "boundarydonotcross";

  var options = {
    // host to forward to
    host:   '192.168.1.35',
    // port to forward to
    port:   8080,
    // path to forward to
    path:   '/?action=stream',
    // headers to send
    headers: req.headers
  };

  var creq = http.request(options, function(cres) {
    res.setHeader('Content-Type', 'multipart/x-mixed-replace;boundary="' + boundary + '"');
    res.setHeader('Connection', 'close');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, private');
    res.setHeader('Expires', 0);
    res.setHeader('Max-Age', 0);

    // wait for data
    cres.on('data', function(chunk){
      res.write(chunk);
    });

    cres.on('close', function(){
      // closed, let's end client request as well 
      //res.writeHead(cres.statusCode);
      res.end();
    });

  }).on('error', function(e) {
    // we got an error, return 500 error to client and log error
    console.log(e.message);
    //res.writeHead(500);
    res.end();
  });

  creq.end();

};
