var vows = require('vows'),
    middleware = require('./../index.js'),
    assert = require('assert'),
    adapterMemory = require('./../lib/adapterMemory.js'),
    adapterMemJS = require('./../lib/adapterMemJS.js');

vows.describe('MemJS adapter cache').
    addBatch({"General test":{
        "topic":adapterMemJS,
        "It should have get and set methods":function (topic) {
            assert.isFunction(topic.get, 'adapterMemJS.get(key,cb) is not a function!');
            assert.isFunction(topic.set, 'adapterMemJS.set(key,value,cb,ttl) is not a function!');
        }
    }}).
    addBatch({"General test":{
        "topic":adapterMemory,
        "It should have get and set methods":function (topic) {
            assert.isFunction(topic.get, 'adapterMemory.get(key,cb) is not a function!');
            assert.isFunction(topic.set, 'adapterMemory.set(key,value,cb,ttl) is not a function!');
        }
    }}).
    addBatch({"Memory Cache testing set ":{
        topic:function () {
            adapterMemory.set('key1', 'key1value', this.callback, 1000);
        },
        "It should save value":function (err, result) {
            assert.isNull(err);
            assert.ok(result);
        }
    }}).
    addBatch({"Memory Cache testing get immediate":{
        topic:function () {
            adapterMemory.get('key1', this.callback);
        },
        "It should get value":function (err, result) {
            assert.isNull(err);
            assert.strictEqual(result, 'key1value');
        }
    }}).
    addBatch({"Memory Cache testing get after 2 seconds":{
        topic:function () {
            var t=this;
            setTimeout(function () {
                adapterMemory.get('key1', t.callback);
            }, 2000);
        },
        "It should get NO value":function (err, result) {
            assert.isNull(err);
            assert.isNull(result);
        }
    }}).export(module);