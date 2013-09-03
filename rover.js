var port = 8080;

var app = require('connect');
app.createServer()
  .use(app.logger('dev'))
  .use(app.static('public'))
  .use(function(req, res){
    router(req, res)
  })
.listen(port);

console.log('web server listening on port ' + port);

var url = require('url');

var router = function(req, res) {
  var url_parts = url.parse(req.url);
  switch (url_parts.pathname) {
    case '/date': date(req, res); break;
    case '/still': still(req, res); break;
    default: display_404(url_parts.pathname, req, res);
  }
}

function display_404(url, req, res) {
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.write('<H1>404 Not Found</H1>');
  res.end('The page you were looking for: ' + encodeURIComponent(url) + ' cannot be found');
}

var sys = require('sys'),
    exec = require('child_process').exec;

var date = function(req, res) {
  exec("date", function (error, stdout, stderr) {
    res.write("date is " + stdout)
  })
}
