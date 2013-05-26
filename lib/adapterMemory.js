//A memory cache client for nodeJS
//It leaks memory and not scalable, DO NOT USE IN PRODUCTION!


//2 methods are utilized
//  .get(key,function(err,value){})
//  .set(key,value,function(err,resultOfSaving){},timeToLiveInMilliseconds)
var Storage = {};
exports.get = function (key, callback) {
    if (Storage[key]) {
        var now = new Date().getTime();
        if (Storage[key].expireAt > now) {
            callback(null, Storage[key].value);
        } else {
            delete Storage[key];
            Storage[key] = null;
            callback(null, null);
        }
    } else {
        callback(null, null);
    }
}
exports.set = function (key, value, callback, ttlInMs) {
    if (ttlInMs && /^\d+$/.test(ttlInMs)) {
        var expireAt = new Date().getTime() + ttlInMs;
    } else {
        var expireAt = new Date().getTime() + 60000;
    }
    Storage[key] = {'value':value, 'expireAt':expireAt};
    callback(null, true);
}



