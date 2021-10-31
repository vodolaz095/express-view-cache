'use strict';

/* global describe, it, before */

const should = require('should'); // eslint-disable-line
const express = require('express');
const request = require('request');
const http = require('http');
const EVC = require('./../');
const app = express();
const port = process.env.PORT || 3000;
const evc = EVC('redis://redis:someLongAuthPassword@localhost:6379');

app.set('port', port);
app.use('/cacheFor1sec', evc.cachingMiddleware(1000));
app.use('/cacheCustom', evc.customCachingMiddleware(function (req, cb){
  process.nextTick(function (){
    console.log('Key is %s %s', req.originalUrl, req.ip); // eslint-disable-line
    cb(null, req.ip, 1000);
  });
}));
app.all('*', function (request, response) {
  response.json({
    'dts': Date.now()
  });
});

function verifyResponse(response, cached){
  console.log(response.headers); // eslint-disable-line
  response.headers['content-type'].should.be.equal('application/json; charset=utf-8');
  if(cached){
    response.headers['expires'].should.be.a.Date;
    response.headers['last-modified'].should.be.a.Date;
  }
  response.headers['content-length'].should.be.equal('21');
  response.headers['x-powered-by'].should.be.equal('Express');
  response.statusCode.should.be.equal(200);
}

describe('EVC', function (){
  before(function (done) {
    http.createServer(app).listen(app.get('port'), function () {
      done();
    });
  });

  describe('EVC#cachingMiddleware', function () {
    it('is a function', function () {
      evc.cachingMiddleware.should.be.a.Function();
    });
    it('returns function', function () {
      evc.cachingMiddleware(1000).should.be.a.Function();
    });
  });

  describe('EVC#cachingMiddleware(1000) works', function () {
    it('for GET uncached page', function (done) {
      request({'method': 'GET', 'url': 'http://localhost:' + port + '/'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for POST uncached page', function (done) {
      request({'method': 'POST', 'url': 'http://localhost:' + port + '/'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for PUT uncached page', function (done) {
      request({'method': 'PUT', 'url': 'http://localhost:' + port + '/'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for DELETE uncached page', function (done) {
      request({'method': 'DELETE', 'url': 'http://localhost:' + port + '/'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for GET cached page', function (done) {
      request({'method': 'GET', 'url': 'http://localhost:' + port + '/cacheFor1sec'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response, true);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          setTimeout(function(){
            request({
              'method': 'GET',
              'url': 'http://localhost:' + port + '/cacheFor1sec'
            }, function (error, response, body) {
              if (error) {
                done(error);
              } else {
                verifyResponse(response, true);
                (Date.now() - (JSON.parse(body)).dts).should.be.above(800);
                done();
              }
            });
          }, 900);
        }
      });
    });
    it('for POST cached page', function (done) {
      request({'method': 'POST', 'url': 'http://localhost:' + port + '/cacheFor1sec'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for PUT cached page', function (done) {
      request({'method': 'PUT', 'url': 'http://localhost:' + port + '/cacheFor1sec'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
    it('for DELETE cached page', function (done) {
      request({
        'method': 'DELETE',
        'url': 'http://localhost:' + port + '/cacheFor1sec'
      }, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
  });

  describe('EVC#customCachingMiddleware works', function (){
    it('for GET cached page', function (done) {
      request({'method': 'GET', 'url': 'http://localhost:' + port + '/cacheCustom'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response, true);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          setTimeout(function(){
            request({
              'method': 'GET',
              'url': 'http://localhost:' + port + '/cacheCustom'
            }, function (error, response, body) {
              if (error) {
                done(error);
              } else {
                verifyResponse(response, true);
                (Date.now() - (JSON.parse(body)).dts).should.be.above(800);
                done();
              }
            });
          }, 900);
        }
      });
    });


    it('for POST cached page', function (done) {
      request({'method': 'POST', 'url': 'http://localhost:' + port + '/cacheCustom'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });

    it('for PUT cached page', function (done) {
      request({'method': 'PUT', 'url': 'http://localhost:' + port + '/cacheCustom'}, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });

    it('for DELETE cached page', function (done) {
      request({
        'method': 'DELETE',
        'url': 'http://localhost:' + port + '/cacheCustom'
      }, function (error, response, body) {
        if (error) {
          done(error);
        } else {
          verifyResponse(response);
          (Date.now() - (JSON.parse(body)).dts).should.be.below(1000);
          done();
        }
      });
    });
  });
});
