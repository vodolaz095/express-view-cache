var express = require('express'),
    http = require('http'),
    path = require('path'),
    cachingMiddleware = require('./../');


var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(cachingMiddleware(5000,{'type':'application/json'}));

//other middlewares
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

    app.use(express.errorHandler());

//static pages
    app.get('*', function(request,response){
        response.json({
            'Page Created At':new Date().toLocaleTimeString()
        });
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});