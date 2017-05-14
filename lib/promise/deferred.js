/**
 * Created by cz_jjq on 16-11-7.
 */
var EventEmitter = require('events'),
    util = require('util');

var isFunction = function(fn){
    return typeof fn === 'function';
};

function Promise (){
    EventEmitter.call(this);
}

util.inherits(Promise,EventEmitter);

Promise.prototype.then = function(fulfilledCallback,errorCallback,progressCallback){
    if(fulfilledCallback) {
        if(isFunction(fulfilledCallback)){
            this.on('success',fulfilledCallback);
        }
        else{
            throw new Error('Promise.then only accept Function params');
        }
    }


    if (progressCallback){
        if(isFunction(progressCallback)){
            this.on('progress',progressCallback);
        }else {
            throw new Error('Promise.then only accept Function params');
        }
    }

    if(errorCallback){
        if(isFunction(errorCallback)){
            this.on('error',errorCallback);
        }else{
            throw new Error('Promise.then only accept Function params');
        }
    }


    return this;
};

function Deferred (){
    this.state = 'unfulfilled';
    this.promise = new Promise();
}

Deferred.prototype.resolve = function(){
    this.state = 'fulfilled';
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift('success');
    this.promise.emit.apply(this.promise,args);
};

Deferred.prototype.reject = function(){
    this.state = 'failed';
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift('error');
    this.promise.emit.apply(this.promise,args);
};

Deferred.prototype.report = function(){
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift('progress');
    this.promise.emit.apply(this.promise,args);
};

/**
 * 所有的promise都成功才算成功
 * @param promises
 * @returns {Promise}
 */
Deferred.prototype.all = function(promises){
    var hasError = false;
    var result = [];
    var self = this;
    var count = 0;  //记录成功执行的次数
    Array.prototype.forEach.call(promises,function(promise,idx){
        promise.then(function(){
            count++;
            if(hasError){
                return;
            }

            var args = Array.prototype.slice.call(arguments,0);
            if(args.length === 1){
                result[idx] = args[0];
            }else{
                result[idx] = args;
            }

            if(count === promises.length){
                self.resolve.apply(self,result);
            }
        },function(error){
            if(hasError){
                return;
            }
            hasError = true;
            self.reject(error);
        });
    });
    return this.promise;
};

module.exports = Deferred;