//A memcache client for node using the binary protocol and SASL authentication
//https://npmjs.org/package/memjs

//2 methods are utilized
//  .get(key,function(err,value){})
//  .set(key,value,function(err,resultOfSaving){},timeToLiveInMilliseconds)

//Works from the box on heroku hosting
//https://devcenter.heroku.com/articles/memcachier#nodejs
module.exports=require('memjs').Client.create();

