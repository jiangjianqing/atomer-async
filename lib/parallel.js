/**
 * Created by cz_jjq on 17-5-14.
 */


//将并行函数任务化，是要额外或提前考虑的重要事情

var createResultProxy = require("./create-result-proxy");

/**
 * 将多个异步函数task化，都执行完后将结果一次性返回
 * @param tasks 异步函数array，需要调用this.done来确定返回的名称
 * @param callback
 */
var fn  = function(tasks, callback){
    var proxy = createResultProxy(tasks.length, callback);
    tasks.forEach(function (task) {
       var bindFun = task.bind(proxy);
       bindFun(); //特别注意：多个并行函数间并不需要传递额外参数，所以直接调用即可
    });
};



module.exports = fn;