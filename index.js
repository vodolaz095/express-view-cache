'use strict';
var curl = require('request'),
  url = require('url'),
  async = require('async'),
  crypto = require('crypto'),
  redis = require('redis');

/**
 * @module express-view-cache
 */


/**
 * @class EVC
 * @classdesc
 * This class accepts redis connection parameters as constructor, and builds Caching Middleware
 * by method { link EVC#cachingMiddleware }
 * @see EVC#cachingMiddleware
 */


function EVC(options) {
  var config = {},
    redisClient,
    o,
    cacheKey = crypto.createHash('md5').update('I_WANNA_TEA_AND_MEAT' + (Math.random() * Date.now())).digest('hex').toString();

  if (typeof options === 'string') {
    o = url.parse(options);
    if (o.protocol === 'redis:') {
      config.host = o.hostname || 'localhost';
      config.port = o.port || 6379;
      config.pass = o.auth ? o.auth.split(':')[1] : null;
      config.appPort = process.env.PORT || 3000;
    } else {
      throw new Error('ExpressViewCache - unable to parse ' + o + ' as redis connection string!');
    }
  } else {
    config = {
      'host': options.host || 'localhost',
      'port': options.port || 6379,
      'pass': options.pass,
      'client': options.client,
      'appPort': options.appPort || process.env.PORT || 3000
    };
  }

  redisClient = config.client || redis.createClient(config.port, config.host, {
    'auth_pass': config.pass,
    'return_buffers': true
  });

  /**
   * @method EVC#cachingMiddleware
   * @param {Number} [ttlInMilliSeconds=30000]
   * @return {function} function(req, res, next){...}
   */

  this.cachingMiddleware = function (ttlInMilliSeconds) {
    ttlInMilliSeconds = parseInt(ttlInMilliSeconds, 10) || 30000;

    return function (req, res, next) {
      if (req.method === 'GET' && req.headers.express_view_cache !== cacheKey) {
        var key = req.originalUrl,
          data = {};
        async.waterfall([
          function (cb) {
            async.parallel({
              'dataFound': function (clb) {
                redisClient.hgetall(key, clb);
              },
              'age': function (clb) {
                redisClient.ttl(key, clb);
              }
            }, function (error, obj) {
              if (error) {
                cb(error);
              } else {
                cb(null, obj.dataFound, obj.age);
              }
            });
          },
          function (dataFound, age, cb) {
            if (dataFound) {
              data.Expires = new Date(Date.now() + age).toUTCString();
              data['Last-Modified'] = new Date(dataFound.savedAt).toUTCString();
              data['Content-Type'] = dataFound.contentType;
              data.statusCode = dataFound.statusCode;
              data.content = dataFound.content;
              cb(null, true);
            } else {
              var headers = req.headers;
              headers.express_view_cache = cacheKey;
              curl({
                'method': 'GET',
                'headers': headers,
                'url': 'http://localhost:' + config.appPort + key
              }, function (error, response, body) {
                if (error) {
                  cb(error);
                } else {
                  data.Expires = new Date(Date.now() + ttlInMilliSeconds).toUTCString();
                  data['Last-Modified'] = new Date().toUTCString();
                  data['Content-Type'] = response.headers['content-type'];
                  data.statusCode = response.statusCode;
                  data.content = body;
                  cb(error, false);
                }
              });
            }
          },
          function (hit, cb) {
            if (hit) {
              cb(null);
            } else {
              async.series([
                function (clb) {
                  redisClient.hmset(key, {
                    'savedAt': new Date(),
                    'contentType': data['Content-Type'],
                    'statusCode': data.statusCode,
                    'content': data.content
                  }, clb);
                },
                function (clb) {
                  redisClient.expire(key, Math.floor(ttlInMilliSeconds / 1000), clb);
                }
              ], cb);
            }
          }
        ], function (error) {
          if (error) {
            next(error);
          } else {
            res.set('Expires', data.Expires);
            res.set('Last-Modified', data['Last-Modified']);
            res.set('Content-Type', data['Content-Type']);
            res.status(data.statusCode);
            res.send(data.content);
          }
        });
      } else {
        next();
      }
    };
  };
  return this;
}

module.exports = exports = function (config) {
  return new EVC(config);
};
