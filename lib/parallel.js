/**
 * Created by cz_jjq on 17-5-14.
 */
var events = require("events");

//将并行函数任务化，是要额外或提前考虑的重要事情

var createResultProxy = function(times, callback){
    var hasError = false;
    var results = {};
    var emitter = new events.EventEmitter();

    emitter.on("note", function(resultName, result){
        if (hasError){
            return;
        }
        results[resultName] = result;
        --times;
        if (times ===0 ){
            callback(null, results);
        }
    });

    emitter.on("error", function(error){
        if(!hasError){
            hasError = true;
            callback(error);
        }
    });

    return {
        //alwaysSuccess代表是不带error的回调函数，永远返回有效数据
        done : function (resultName, alwaysSuccess) {
            var retFn;
            if (alwaysSuccess){
                retFn = function(){
                    var ret = [].slice.call(arguments);
                    switch (ret.length){
                        case 0: //0个参数代表回调时没有任何实参
                            ret = null;
                            break;
                        case 1: //1个参数则将参数返回
                            ret = ret[0];
                            break;
                        //其他数量的参数都作为一个数组返回
                    }
                    emitter.emit("note", resultName, ret);
                };
            }else{
                retFn = function(error){ //正常的node回调函数，第一个参数为error
                    var ret = [].slice.call(arguments,1);
                    if (ret.length === 1){
                        ret = ret[0];
                    }
                    if(error){
                        error.resultName = resultName;
                        return emitter.emit("error", error);
                    }
                    emitter.emit("note", resultName, ret);
                };
            }
            return retFn;
        }
    };
};

/**
 * 将多个异步函数task化，都执行完后将结果一次性返回
 * @param tasks 异步函数array，需要调用this.done来确定返回的名称
 * @param callback
 */
var fn  = function(tasks, callback){
    var proxy = createResultProxy(tasks.length, callback);
    tasks.forEach(function (task) {
       var bindFun = task.bind(proxy);//bind的用法，其实bind还可以附加更多默认参数，非常有用
       bindFun(); //特别注意：多个并行函数间并不需要传递额外参数，所以直接调用即可
    });
};



module.exports = fn;