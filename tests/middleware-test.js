var vows = require('vows'),
    middleware = require('./../index.js'),
    adapterMemory = require('./../lib/adapterMemory.js'),
    assert = require('assert');

vows.describe('Middleware tests').
    addBatch({
        "General tests":{
            "topic":{
                "middleware":middleware,
                "request1st":{'originalUrl':'/index.html', 'method':'GET'},
                "request2nd":{'originalUrl':'/index1.html', 'method':'GET'},
                "response1st":{
                    'header':function (header) {
                        console.log('Header set in response 1');
                        assert.equal(header, 'Cache-Control', "public, max-age=60, must-revalidate");
                    },
                    'send':function (content) {
                        assert.equal(content, 'index_html')

                    }
                },
                "response2nd":{
                    'header':function (header) {
                        console.log('Header set in response 2');
                        assert.equal(header, 'Cache-Control', "public, max-age=60, must-revalidate");
                    },
                    'send':function (content) {
                        //assert.equal(content, 'index_html')
                    }
                },
                "next1st":function () {
                    throw new Error('Next is called when cached! It is not right!')
                },
                "next2nd":function () {
                    console.log('Next2nd called!')
                }
            },
            "It should be a function":function (topic) {
                assert.isFunction(topic.middleware);
            },
            "It should cache GET requests":function (topic) {
                adapterMemory.set('/index.html', 'index_html', function (err, result) {
                    if (err) throw err;
                    assert.ok(result,'Saving result to cache returned not true!');
                    var f = topic.middleware;
                    f(topic.request1st, topic.response1st, topic.next1st);
                }, 1000);
            },
            "It should invalidate old requests":function (topic) {
                adapterMemory.set('/index1.html', 'index_html', function (err, result) {
                    if (err) throw err;
                    setTimeout(function () {
                        assert.ok(result,'Saving result to cache returned not true!');
                        var f = topic.middleware;
                        f(topic.request2nd, topic.response2nd, topic.next2nd);
                    }, 2000);
                }, 1000);
            },
            "It should ignore not GET requests":function(topic){
                var f = topic.middleware;
                f({'originalUrl':'/doSomething', 'method':'POST'}, topic.response2nd, topic.next2nd);
                f({'originalUrl':'/doSomething', 'method':'PUT'}, topic.response2nd, topic.next2nd);
                f({'originalUrl':'/doSomething', 'method':'DELETE'}, topic.response2nd, topic.next2nd);
                f({'originalUrl':'/doSomething', 'method':'OPTIONS'}, topic.response2nd, topic.next2nd);
            }
        }
    }).
    export(module);
