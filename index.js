'use strict';
const async = require('async');
const redis = require('redis');
const url = require('url');

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
  let config = {};
  let redisClient;
  let o;

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
    };
  }

  redisClient = config.client || redis.createClient(config.port, config.host, {
    'auth_pass': config.pass,
    'return_buffers': false
  });

  /**
   * @method EVC#cachingMiddleware
   * @param {Number} [ttlInMilliSeconds=30000]
   * @return {function} function(req, res, next){...}
   */

  this.cachingMiddleware = function (ttlInMilliSeconds) {
    ttlInMilliSeconds = parseInt(ttlInMilliSeconds, 10) || 30000;

    return function (req, res, next) {
      if (req.method === 'GET') { // only GET responses are cached
        let ended = false;
        const key = req.originalUrl;
        let data = {};
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
              res.set('Expires', new Date(Date.now() + age).toUTCString());
              res.set('Last-Modified', new Date(dataFound.savedAt).toUTCString());
              res.set('Content-Type', dataFound.contentType);
              res.status(dataFound.statusCode);
              res.end(dataFound.content);
              ended = true;
              return cb(null, true);
            }
            // generating data
            const buffer = [];
            const original = res.write;
            res.write = (...a) => {
              buffer.push(`${a[0]}`);
              original.apply(res, a);
            };
            const end = res.end;
            res.end = (...a) => {
              if (a[0]) {
                buffer.push(`${a[0]}`);
              }
              data.Expires = new Date(Date.now() + ttlInMilliSeconds).toUTCString();
              data['Last-Modified'] = new Date().toUTCString();
              data['Content-Type'] = res.getHeaders()['content-type'];
              data.statusCode = res.statusCode;
              data.content = buffer.join('');
              res.set('Expires', data.Expires);
              res.set('Last-Modified', new Date());
              end.apply(res, a);
              cb(null, false);
            };
            next();
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
                    'content': data.content,
                  }, clb);
                },
                function (clb) {
                  redisClient.expire(key, Math.floor(ttlInMilliSeconds / 1000), clb);
                }
              ], cb);
            }
          }
        ], function (error){
          if(error) {
            return next(error);
          }
          if(!ended) {
            next();
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
