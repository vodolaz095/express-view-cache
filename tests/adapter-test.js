var vows = require('vows'),
    assert = require('assert'),
    adapterMemory = require('./../lib/adapterMemory.js'),
    adapterMemJS = require('./../lib/adapterMemJS.js'),
    adapterRedis = require('./../lib/adapterRedis.js');

vows.describe('Cache Adapters tests')
    .addBatch({"General test for Binary Memcached": {
        "topic": adapterMemJS,
        "It should have get and set methods": function (topic) {
            assert.isFunction(topic.get, 'adapterMemJS.get(key,cb) is not a function!');
            assert.isFunction(topic.set, 'adapterMemJS.set(key,value,cb,ttl) is not a function!');
        }
    }}).

// it do not works with travis-ci.org memcache instance, because  it do not use binary protocol!
// https://github.com/alevy/memjs#installation

    /*/
     addBatch({"Memcached testing set ":{
     topic:function () {
     adapterMemJS.set('key1', 'key1value', this.callback, 1000);
     },
     "It should save value":function (err, result) {
     assert.isNull(err);
     assert.ok(result);
     }
     }}).

     addBatch({"Memcached testing get immediate":{
     topic:function () {
     adapterMemJS.get('key1', this.callback);
     },
     "It should get value":function (err, result) {
     assert.isNull(err);
     assert.strictEqual(result, 'key1value');
     }
     }}).

     addBatch({"Memcached testing get after 2 seconds":{
     topic:function () {
     var t=this;
     setTimeout(function () {
     adapterMemJS.get('key1', t.callback);
     }, 2000);
     },
     "It should get NO value":function (err, result) {
     assert.isNull(err);
     assert.isNull(result);
     }
     }}).
     //*/

    //Memory adapter

    addBatch({"General test for adapterMemory": {
        "topic": adapterMemory,
        "It should have get and set methods": function (topic) {
            assert.isFunction(topic.get, 'adapterMemory.get(key,cb) is not a function!');
            assert.isFunction(topic.set, 'adapterMemory.set(key,value,cb,ttl) is not a function!');
        }
    }})
    .addBatch({"Memory Cache testing set ": {
        topic: function () {
            adapterMemory.set('key1', 'key1value', this.callback, 1000);
        },
        "It should save value": function (err, result) {
            assert.isNull(err);
            assert.ok(result);
        }
    }})
    .addBatch({"Memory Cache testing get immediate": {
        topic: function () {
            adapterMemory.get('key1', this.callback);
        },
        "It should get value": function (err, result) {
            assert.isNull(err);
            assert.strictEqual(result, 'key1value');
        }
    }})
    .addBatch({"Memory Cache testing get after 2 seconds": {
        topic: function () {
            var t = this;
            setTimeout(function () {
                adapterMemory.get('key1', t.callback);
            }, 2000);
        },
        "It should get NO value": function (err, result) {
            assert.isNull(err);
            assert.isNull(result);
        }
    }})
// Redis adaprer
    .addBatch({"General test for adapterRedis": {
        "topic": adapterRedis,
        "It should have get and set methods": function (topic) {
            assert.isFunction(topic.get, 'adapterMemory.get(key,cb) is not a function!');
            assert.isFunction(topic.set, 'adapterMemory.set(key,value,cb,ttl) is not a function!');
        }
    }})
    .addBatch({"Redis Cache testing set ": {
        topic: function () {
            adapterRedis.set('key1', 'key1value', this.callback, 1000);
        },
        "It should save value": function (err, result) {
            assert.isNull(err);
            assert.ok(result);
        }
    }})
    .addBatch({"Redis Cache testing get immediate": {
        topic: function () {
            adapterRedis.get('key1', this.callback);
        },
        "It should get value": function (err, result) {
            assert.isNull(err);
            assert.strictEqual(result, 'key1value');
        }
    }})
    .addBatch({"Redis Cache testing get after 2 seconds": {
        topic: function () {
            var t = this;
            setTimeout(function () {
                adapterRedis.get('key1', t.callback);
            }, 2000);
        },
        "It should get NO value": function (err, result) {
            assert.isNull(err);
            assert.isNull(result);
        }
    }})
    .export(module);