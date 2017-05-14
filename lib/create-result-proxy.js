/**
 * Created by cz_jjq on 17-5-14.
 */
var events = require("events");

module.exports = function(times, callback){
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
                    var rets = [].slice.call(arguments);
                    switch (rets.length){
                        case 0: //0个参数代表回调时没有任何实参
                            rets = null;
                            break;
                        case 1: //1个参数则将参数返回
                            rets = rets[0];
                            break;
                            //其他数量的参数都作为一个数组返回
                    }
                    emitter.emit("note", resultName, rets);
                };
            }else{
                retFn = function(error){ //正常的node回调函数，第一个参数为error
                    var rets = [].slice.call(arguments,1);
                    if (rets.length === 1){
                        rets = rets[0];
                    }
                    if(error){
                        error.resultName = resultName;
                        return emitter.emit("error", error);
                    }
                    emitter.emit("note", resultName, rets);
                };
            }
            return retFn;
        }
    };
};