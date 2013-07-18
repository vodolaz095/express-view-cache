var redis = require('redis'),
    url = require('url');


if(process.env.redisUrl){
    var redisParameters = url.parse(process.env.redisUrl);
    if(redisParameters){
    var config = {
        port:((redisParameters.port)?(redisParameters.port):6379),
        host:((redisParameters.hostname)?(redisParameters.hostname):'localhost'),
        password:((redisParameters.auth)?(redisParameters.auth.split(":")[1]):null)
    };
    } else {
        throw new Error('Unable to parse as URL enviroment variable of redisUrl '+process.env.redisUrl);
    }
} else {
    var config = {
        port:6379,
        host:'localhost',
        password:null
    };
}

var client=redis.createClient(config.port,config.host);
if(config.password){
    client.auth(config.password,function(err){
        if(err) throw err;
    });
}


exports.set = function (key, value, callback, ttlInMs) {
    client.set('expess-view-cache-'+key,value,function(err){
        if(err){
            callback(err);
        } else {
            var ttlInSecond=Math.floor((ttlInMs/1000));
            // i know of
            // http://redis.io/commands/pexpireat
            // http://redis.io/commands/set
            //but i ASUME that user can have older versions of redis, not the 2.6.12!
            client.expire('expess-view-cache-'+key,ttlInSecond,function(err,setted){
                callback(err,true)
            });
        }
    })
}

exports.get = function (key, callback) {
    client.get('expess-view-cache-'+key,callback);
}