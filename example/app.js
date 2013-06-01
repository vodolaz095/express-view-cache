var express = require('express'),
    http = require('http'),
    path = require('path'),
    cachingMiddleware = require('./../');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));

    app.use(cachingMiddleware(1000,{'type':'application/json'}));
    app.use('/cacheFor5sec',cachingMiddleware(5000,{'type':'application/json'}));
    app.use('/cacheFor3sec',cachingMiddleware(3000,{'type':'application/json'}));

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