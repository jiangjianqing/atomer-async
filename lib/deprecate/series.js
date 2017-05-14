/**
 * Created by cz_jjq on 17-5-6.
 */
var events = require("events");
var util = require("util");
//var EventEmitter = events.EventEmitter;

function Series(){
    this._config = {};
    this._emitter = new events.EventEmitter();
    //events.EventEmitter.call(this);


    var args = Array.prototype.slice.call(arguments);
    var firstArg = args.shift();

    if(util.isArray(firstArg)){
        this.init(firstArg);
    }
}

Series.prototype.init = function(funcs){
    var that = this;
    this._queue = funcs;
    var _emitter = this._emitter;

    _emitter.on("error", function (error) {
        var callback = that._config["error"];
        if(util.isFunction(callback)){
            callback(error);
        }

        _emitter.emit("final");
    });

    _emitter.on("final", function () {
        var callback = that._config["final"];
        if(util.isFunction(callback)){
            callback.apply(null,arguments);
        }
    });

    _emitter.on("next", function(args){
        var func = that._getNextFun();
        if(func){

            var callback = function () {
                var cb_args = [].slice.call(arguments);
                var error;
                if(cb_args.length>0){
                    error = cb_args.shift();
                }
                if(error){
                    _emitter.emit("error",error);
                }else{

                    //todo:将arguments传入下一个queue
                    _emitter.emit("next",cb_args);
                }

            };

            args.unshift(callback);
            //20170508  将emitter作为this传递，可以方便callback中用emit("error",error)的方式触发错误，这是从request中学到的
            func.apply(_emitter, args);
        }else{
            _emitter.emit("final");
        }
    });

    return this;
};

//util.inherits(Series, events.EventEmitter);

Series.prototype.fail = Series.prototype.catch = function(callback){
    this._config["error"] = callback;
    return this;
};

/**
 * 无论序列是否全部执行，都会执行
 * @param callback
 */
Series.prototype.fin = function (callback) {
    this._config["final"] = callback;
    return this;
};

Series.prototype._getNextFun = function(){
    if(this._queue.length>0) {
        return this._queue.shift();
    }else{
        return null;
    }
};

/**
 * run可以附加初始化参数
 */
Series.prototype.run = function(){
    var args = [].slice.call(arguments);
    this._emitter.emit("next",args);
};

module.exports = Series;

