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
        done : function (resultName) {
            return function(error){
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
    };
};