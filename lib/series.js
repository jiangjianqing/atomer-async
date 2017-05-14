/**
 * Created by cz_jjq on 17-5-14.
 */
var events = require("events");

var createSeriesProxy = function(emitter){
    var results = {};
    return {
        "done" : function(resultName){
            return function(error){
                var args = [].slice.call(arguments, 1);
                switch(args.length){
                    case 1:
                        results[resultName] = args[0];
                        break;
                    default:
                        results[resultName] = args;
                }
                if(error){
                    emitter.emit("error",error);
                }else{
                    emitter.emit("next",args);
                }
            };
        },
        "getResults" : function(){
            return results;
        }
    };
};

var fn = function(tasks, callback){

    var stack = tasks.map(function(task){
        return function(){ //被封装的函数，绑定到了proxy上
            var args = [].slice.call(arguments);
            task.apply(this, args);
        };
    });

    var emitter = new events.EventEmitter();

    var proxy = createSeriesProxy(emitter);

    emitter.on("error",function(error){
        callback(error);
    });
    emitter.on("done", function(){
        callback(null,proxy.getResults());
    });

    emitter.on("next", function(args){
        if (stack.length === 0){
            return emitter.emit("done");
        }
        var task = stack.shift();
        //var that = args.shift();//that第一个参数指的是当前的proxy
        //task也可以用bind绑定到that上;
        //task = task.bind(that);,只是传递参数比较麻烦，所以这里不适用
        task.apply(proxy,args);
    });

    return {
        run : function(){
            var args = [].slice.call(arguments);
            emitter.emit("next",args);
        }
    };
};

module.exports = fn;