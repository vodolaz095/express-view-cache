'use strict';

const express = require('express');
const  morgan = require('morgan');
const  errorHandler = require('errorhandler');
const  request = require('request');
const  http = require('http');
const  EVC = require('./../');
const  app = express();
const  evc = EVC('redis://redis:someLongAuthPassword@localhost:6379');

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));

// simple caching middlewared
app.use('/cacheFor5sec', evc.cachingMiddleware(5000)); // every path with prefix /cacheFor5sec is cached for 5 seconds
app.use('/cacheFor3sec', evc.cachingMiddleware(3000)); // every path with prefix /cacheFor3sec is cached for 3 seconds

// every path with /cacheCustom will be cached with key based on users IP  and ttl 3 seconds
app.use('/cacheCustom', evc.customCachingMiddleware(function (req, cb){
  return process.nextTick(function (){
    cb(null, `${req.ip}`, 3000);
  });
}));

app.get('*', function (request, response) {
  response.json({
    'Page Created At': new Date().toLocaleTimeString()
  });
});
app.use(errorHandler());

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port %s', app.get('port')); // eslint-disable-line
  setInterval(function(){
    request('http://localhost:'+app.get('port')+'/', function(error, response, body){
      console.log('GET /',body);  // eslint-disable-line
    });
  }, 1000);
  setInterval(function(){
    request('http://localhost:'+app.get('port')+'/cacheFor3sec', function(error, response, body){
      console.log('GET /cacheFor3sec',body);  // eslint-disable-line
    });
  }, 1000);
  setInterval(function(){
    request('http://localhost:'+app.get('port')+'/cacheCustom', function(error, response, body){
      console.log('GET /cacheCustom',body);  // eslint-disable-line
    });
  }, 1000);
});

