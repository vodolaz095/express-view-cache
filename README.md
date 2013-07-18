express-view-cache
==================

Unobtrusive solution to express framework - cache response content, without database requests and page rendering.

Why do we need this plugin and how do it works?
==================

Let's consider we have a NodeJS application with code like this:

    app.get('/getPopularPosts',function(req,res){
        req.model.posts.getPopular(function(err,posts){
            if(err) throw err;
            res.render('posts',{"posts":posts});
        });
    });

The method `getPopular` of `posts` requires a call to database and executed slowly. Also rendeding the template of posts
requires some time. So, maybe we need to cache all this? Ideally, when visitor gets the page with url  `/getPopularPosts`
we have to give him info right from cache, without requests to database, parsing data recieved, rendering page and other things
we need to do to give him this page. The most expressJS way to do it is to make a separate middleware, that is runned before
router middleware, and returns page from cache (if it is present in cache) or pass data to other middlewares, but this caching
middleware adds a listener to response, which SAVES rendered response to cache. And for future use, the response is taken from CACHE!

It can use memory storage or (via module [memjs](https://npmjs.org/package/memjs))
Memcache server or [memcachier.com](https://memcachier.com/) solution  as backend.
Right now it is tested in production on heroku hosting.  Feedback is welcome!


Example
==================
There is a complete example of NodeJS + ExpressJS application which responds with current time.

    var express = require('express'),
        http = require('http'),
        path = require('path'),
        cachingMiddleware = require('express-view-cache');

    var app = express();

    app.configure(function () {
        app.set('port', process.env.PORT || 3000);
        app.use(express.logger('dev'));

        //set up caching BEFORE router middleware - because next() is not fired when we got rendered page from cache
        app.use(cachingMiddleware(1000,{'type':'application/json'}));
        app.use('/cacheFor5sec',cachingMiddleware(5000,{'type':'application/json'}));
        app.use('/cacheFor3sec',cachingMiddleware(3000,{'type':'application/json'}));

        //set up router middleware for application
        app.use(app.router);

        app.use(express.errorHandler());

        app.get('*', function(request,response){
            response.json({
                'Page Created At':new Date().toLocaleTimeString()
            });
        });
    });

    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });


Options
==================

    app.use(cachingMiddleware(1000,{ //invalidation time, informations is stored in cache for 1000 milliseconds
        'type':'application/json', //type of returned content
        'driver':'memjs'//can be `memjs`,`redis`,`memory`
    }));

The variable of `driver`  can be ommited, and the middleware will use build in memory storage.
Be advised - the memory storage IS NOT INTENTED TO BE PRODUCTION READY! It is memleaky and not shared in cluster.
If the variable of `driver` equals `memjs`, the [memjs](https://npmjs.org/package/memjs) module is used for managed memcache.
It works from the box if you ran you app at heroku hosting with [Memcachier](https://addons.heroku.com/memcachier) addon installed.
Also it works with locally installed Memcached instances - see [https://devcenter.heroku.com/articles/memcachier#node-js](https://devcenter.heroku.com/articles/memcachier#node-js)
for details.
If you want to use your private `Memcache` instance, you can set the process inviroment variables like this

    export MEMCACHIER_SERVERS="localhost:11211"
    export MEMCACHIER_USERNAME=""
    export MEMCACHIER_PASSWORD=""
And set the memcache protocol to binary, i.e. run the memcached like this

    $ memcached -v -B binary

If you want to use `Redis` instance, you can set the `driver` to `redis`. If your redis server have not the default
settings (localhost:6379 withour password), you can set redis parameters by setting enviroment variable of `redisUrl`
like this:

    export redisUrl="redis://username:veryLongAndHardPasswordBecauseRedisHashes50kPasswordsEverySecond@somehost:6378"

The parameter of `type` is for setting response type for returned content  -
see [http://expressjs.com/api.html#res.type](http://expressjs.com/api.html#res.type) for details.


Tests
==================

Install vows and test as usual

    $ npm install vows
    $ npm test

[![Build Status](https://travis-ci.org/vodolaz095/express-view-cache.png)](https://travis-ci.org/vodolaz095/express-view-cache)

Credits
==================

  - [Ostroumov Anatolij](https://github.com/vodolaz095)

License
==================

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2013 Ostroumov Anatolij [http://teksi.ru/resume/](http://teksi.ru/resume/)



