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
   * @method EVC#customCachingMiddleware
   * @param {function} extractKeyName(req, function extractKeyNameCallback(error, key, ttl){...}){...}
   * @return {function} function(req, res, next){...}
   */
  this.customCachingMiddleware = function (extractKeyName) {
    return function (req, res, next) {
      if (req.method === 'GET') { // only GET responses are cached
        let ended = false;
        let data = {};
        let ttl;
        let needle;
        async.waterfall([
          function (cb){
            extractKeyName(req, function (error, k, t){
              if(error) {
                return cb(error);
              }
              ttl = t;
              cb(null, k);
            });
          },
          function (key,cb) {
            async.parallel({
              'dataFound': function (clb) {
                redisClient.hgetall(key, clb);
              },
              'age': function (clb) {
                needle = key;
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
              data.Expires = new Date(Date.now() + ttl).toUTCString();
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
                  redisClient.hmset(needle, {
                    'savedAt': new Date(),
                    'contentType': data['Content-Type'],
                    'statusCode': data.statusCode,
                    'content': data.content,
                  }, clb);
                },
                function (clb) {
                  redisClient.expire(needle, Math.floor(ttl / 1000), clb);
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

  /**
   * @method EVC#cachingMiddleware
   * @param {Number} [ttlInMilliSeconds=30000]
   * @return {function} function(req, res, next){...}
   */
  this.cachingMiddleware = function (ttlInMilliSeconds) {
    const ttl = parseInt(ttlInMilliSeconds, 10) || 30000;
    if(!ttl) {
      throw new Error(`error parsing ${ttlInMilliSeconds} as positive integer`);
    }
    return this.customCachingMiddleware(function (req, cb){
      return cb(null, req.originalUrl, ttl);
    });
  };
  return this;
}

module.exports = exports = function (config) {
  return new EVC(config);
};
