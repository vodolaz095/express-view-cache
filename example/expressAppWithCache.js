var express = require('express'),
  morgan = require('morgan'),
  errorHandler = require('errorhandler'),
  request = require('request'),
  http = require('http'),
  EVC = require('./../'),
  app = express(),
  evc = EVC('redis://redis:someLongAuthPassword@localhost:6379');

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
//app.use(evc.cachingMiddleware(1000));
app.use('/cacheFor5sec', evc.cachingMiddleware(5000));
app.use('/cacheFor3sec', evc.cachingMiddleware(3000));
app.get('*', function (request, response) {
  response.json({
    'Page Created At': new Date().toLocaleTimeString()
  });
});
app.use(errorHandler());

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));

  setInterval(function(){
    request('http://localhost:'+app.get('port')+'/', function(error, response, body){
      console.log('GET /',body);
    })
  }, 1000);

  setInterval(function(){
    request('http://localhost:'+app.get('port')+'/cacheFor3sec', function(error, response, body){
      console.log('GET /cacheFor3sec',body);
    })
  }, 1000);

});

