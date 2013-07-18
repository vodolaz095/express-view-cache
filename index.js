var adapterMemory = require('./lib/adapterMemory.js'),
    adapterMemJS = require('./lib/adapterMemJS.js'),
    adapterRedis = require('./lib/adapterRedis.js');

// Caching middleware for Express framework
// details are here https://github.com/vodolaz095/express-view-cache


module.exports=function(invalidateTimeInMilliseconds,parameters){
    if(invalidateTimeInMilliseconds && /^\d+$/.test(invalidateTimeInMilliseconds)){
        //it is ok
    } else {
        invalidateTimeInMilliseconds=60*1000; //1 minute
    }
    if (parameters && parameters.driver) {
        switch (parameters.driver) {
            case 'memjs':
                cache = adapterMemJS;
                break;
            case 'redis':
                cache = adapterRedis;
                break;
            default :
                cache = adapterMemory;
        }
    } else {
        cache = adapterMemory;
    }

    return function(request,response,next){
        if(parameters && parameters.type){
            response.type(parameters.type);
        }
        if (request.method == 'GET') {
            cache.get(request.originalUrl,function(err,value){
                if(value){
                    console.log('FRONT_CACHE HIT: GET '+request.originalUrl);
                    response.header('Cache-Control', "public, max-age="+Math.floor(invalidateTimeInMilliseconds/1000)+", must-revalidate");
                    response.send(value);
                    return true;
                } else {
                    //http://stackoverflow.com/questions/13690335/node-js-express-simple-middleware-to-output-first-few-characters-of-response?rq=1
                    var end = response.end;
                    response.end = function(chunk, encoding){
                        response.end = end;
                        response.on('finish',function(){
                            cache.set(request.originalUrl,chunk,function(err,result){
                                if(err) throw err;
                                if(result){
                                    console.log('FRONT_CACHE SAVED: GET '+request.originalUrl);
                                } else {
                                    console.log('FRONT_CACHE ERROR SAVING: GET '+request.originalUrl)
                                }
                            },invalidateTimeInMilliseconds);
                        });
                        response.header('Cache-Control', "public, max-age="+Math.floor(invalidateTimeInMilliseconds/1000)+", must-revalidate");
                        response.end(chunk, encoding);
                    };
                    return next();
                }
            });
        } else {
            return next();
        }
    }
}
