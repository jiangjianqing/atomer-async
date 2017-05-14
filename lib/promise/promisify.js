/**
 * Created by cz_jjq on 17-5-14.
 */

var Deferred = require("./deferred");
var isObject = require("util").isObject;

module.exports = function(fn,thisArg){
    var deferred = new Deferred();
    var callback = function(){
        var args = Array.prototype.slice.call(arguments,0);
        if(args.length>1){//两个以上变量，认为第一个是error
            if(args[0]){
                deferred.reject.apply(deferred,args);
            }else{
                args.shift();
                deferred.resolve.apply(deferred,args);
            }
        }else{//如果只返回一个值，则认为失败
            if (args[0] instanceof Error || isObject(args[0])){
                deferred.reject.apply(deferred,args);
            }else{
                deferred.resolve.apply(deferred,args);
            }
        }
    };

    return function(){
        var args = Array.prototype.slice.call(arguments,0);
        args.push(callback);
        fn.apply(thisArg?thisArg:null,args);
        return deferred.promise;
    };

};