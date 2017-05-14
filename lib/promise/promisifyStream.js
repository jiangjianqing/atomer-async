/**
 * Created by cz_jjq on 17-5-14.
 */

var Deferred = require("./deferred");
var isString = require("util").isString;

module.exports = function(stream){
    var deferred = new Deferred();

    var chunks = [];
    var data="";
    stream.on('data',function(chunk){
        if(isString(chunk)){
            data+=chunk;
        }else{
            chunks.push(chunk);
        }
        deferred.report(chunk);
    });

    stream.on('error',function(err){
        deferred.reject(err);
    });

    stream.on('end',function(){
        if(chunks.length>0){
            console.log("处理buffer");
            var buf = Buffer.concat(chunks);
            data =  buf.toString('utf8');
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};