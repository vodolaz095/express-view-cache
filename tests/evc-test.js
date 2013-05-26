var vows = require('vows'),
    middleware = require('./../index.js'),
    assert = require('assert');

vows.describe('Middleware').
    addBatch({
        "General tests":{
            "topic":middleware,

            "It should be a function":function (topic) {
                assert.isFunction(topic);
            },

            "It should ignore not GET requests":function (topic) {
                var request = {'originalUrl':'/index','method':'POST'};
                var response = {
//                    'header':function (header) {
//                        console.log('Header set');
//                        assert.equal(header, 'Cache-Control', "public, max-age=60, must-revalidate");
//                    },
//                    'send':function(content){
//                        //console.log(content);
//                    }
                };

                var next=function(){
                    assert.ok(true,'Middleware is called!');
                };
                var f=topic();
                f(request,response,next);

            }

        }
    }).
//    addBatch({
//
//    }).
//    addBatch({}).
    export(module);
