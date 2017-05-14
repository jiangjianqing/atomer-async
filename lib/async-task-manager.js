/**
 * Created by ztxs on 16-11-1.
 */

const util = require('util'),
    EventEmitter = require('events');

const CHECK_NEXT_TASK = 'check_next_task_from_list_1i301923';

var taskUtil = {
    check_deps : function(task, tasks){
        var deps_result_ary = [];
        if (!task.deps || task.deps.length===0){
            return deps_result_ary;
        }

        var tmp_deps = task.deps.slice();
        var taskName;
        var task;
        var doneCount=0;

        for(var i=0;i<tmp_deps.length;i++){
            taskName = tmp_deps[i];
            task = tasks[taskName];
            if(!task){//如果该task还没有添加，则下次再判断
                continue;
            }
            if (this.isTaskDoneState(task)){
                doneCount++;
                deps_result_ary.push(task.result);
            }else{
                return false;
            }
        }
        if(doneCount === tmp_deps.length){
            return deps_result_ary;
        }

        return false;
    },
    setTaskState : function(task,state){
        task.state = state;
    },

    setTaskExecutingState : function(task){
        this.setTaskState(task,{'executing':true});
    },

    setTaskFailState : function(task){
        this.setTaskState(task,{'fail':true});
    },

    setTaskDoneState : function(task){
        this.setTaskState(task,{'done':true});
    },

    setTaskInitState : function(task){
        this.setTaskState(task,{'init':true});
    },

    isTaskInitState: function (task) {
        return !!task.state.init;
    },

    isTaskFailState: function (task) {
        return !!task.state.fail;
    },

    isTaskDoneState: function (task) {
        return !!task.state.done;
    }
};

var isDebug=true;
var debugLog = function (){
    if (isDebug){
        try{
            console.log.apply(null,arguments);
        }catch(ex){
            //这里表示在输出时出现错误
        }

    }
};


/**
 * Async Task :
 * {
 *  taskName:'task1',
 *  deps:['task2',task3],
 *  callback:function(){...}
 * }
 *
 *
 * @constructor
 */
function AsyncTaskManager(isStarted){
    EventEmitter.call(this);
    this.init(isStarted);
}

util.inherits(AsyncTaskManager,EventEmitter);

AsyncTaskManager.prototype.init = function(isStarted){
    var self = this;

    this.clearState();
    this.tasks = {};
    this.errorCallback = function(){};
    this.on('error', function(){
        self.isRuning = false;
        debugLog('task 序列出现 error，后续任务将会停止运行');
        if (this.errorCallback ){
            this.errorCallback.apply(this.errorCallbackThisArg,arguments);
        }
    });

    this.on(CHECK_NEXT_TASK, function(){
        debugLog('----------------开始task检测循环--------------');
        var taskName,task;
        if(self.isRuning === false){
            debugLog("收到CHECK_NEXT_TASK，但isRuning===false,一般为有task fail的情况");
            return;
        }
        var doneCount = 0;
        for (taskName in self.tasks){

            task = this.tasks[taskName];
            if(!taskUtil.isTaskInitState(task)){
                if(taskUtil.isTaskDoneState(task)){
                    doneCount++;
                }
                continue;
            }


            var info = "发现未执行任务："+taskName;

            var deps_check_result = taskUtil.check_deps(task,self.tasks);
            if (Array.isArray(deps_check_result)){
                taskUtil.setTaskExecutingState(task);
                info += '(可以执行)';
                var args = [ task ].concat(deps_check_result);
                task.callback.apply(task.thisArg,args);
            }else{
                info += '(不符合依赖条件 ['+task.deps+'] )';
            }
            debugLog(info);

        }
        if (doneCount > 0 && doneCount === Object.keys(self.tasks).length)
        {
            if(self.allDoneCallback){
                self.allDoneCallback.call(self.allDoneCallbackThisArg,self.tasks);
            }
            debugLog('所有任务执行完成');
        }

        debugLog('----------->>>>>>>>task检测循环结束！<<<<<<<<<-------');
    });

    var _globalParam = null; //演示下 访问器属性的使用
    Object.defineProperty(this,'globalParam',{
        get : function(){
            return _globalParam;
        },
        set : function(value){
            _globalParam = value;
        }
    });

    if(isStarted){
        this.isRuning = true;
    }
};

/**
 * clearState用于清理所有运行状态，将AsyncTaskManager恢复到初始状态，此时需要emit(CHECK_NEXT_TASK)来触发任务的检查和运行
 * 如果不希望用start来启动，可以使用clearState和setTaskParam的方式来
 * @param isRuning
 */
AsyncTaskManager.prototype.clearState = function(isRuning){
    this.isRuning = false;
    var taskName,task;
    for (taskName in this.tasks){
        task = this.tasks[taskName];
        task['readyToRun'] = false;
        delete task['result'];
        delete task['error'];
        taskUtil.setTaskInitState(task);
    }
    this.isRuning = !!isRuning;
};

AsyncTaskManager.prototype.setErrorHandler = function(callback,thisArg){
    this.errorCallback = callback;
    this.errorCallbackThisArg = thisArg ? thisArg : null;
};

AsyncTaskManager.prototype.setAllDoneHandler = function (callback, thisArg){
    this.allDoneCallback = callback;
    this.allDoneCallbackThisArg = thisArg;
};

AsyncTaskManager.prototype.setTaskParam = function(taskName,param,thisArg,readyToRun){
    var task = this.tasks[taskName];
    if (!task){
        throw new Error('目标taskName不存在！taskName = '+taskName);
    }

    if (!param){
        throw new Error('param参数必须设置！taskName = '+taskName);
    }

    readyToRun = true;//readyToRun === false? readyToRun : param !== undefined;

    task.param = param;
    task['thisArg'] = thisArg;
    task['readyToRun'] = readyToRun;
    taskUtil.setTaskInitState(task);
    this.checkNextTask();//设置任务参数后就开始触发检查
    if(!this.isRuning){
        debugLog("警告: 调用setTaskParam时，AsyncTaskManager.isRuning == false , 该标志需要在emit(CHECK_NEXT_TASK)前设置为true")
    }
};

AsyncTaskManager.prototype.addAsyncTask = function(taskName,deps,callback,doneCallback,param,thisArg,readyToRun){
    var self = this;
    //thisArg = thisArg?thisArg : null;
    if (!util.isFunction(doneCallback)){ //doneCalllback不是必须项
        param = doneCallback;
        thisArg = param;
        readyToRun = thisArg;
        doneCallback = undefined;
    };
    readyToRun = readyToRun === false ? readyToRun : util.isObject(param);
    var task = {
        'taskName' : taskName,
        'deps' : deps,
        'callback' : callback,
        'doneCallback': doneCallback,
        'readyToRun' : readyToRun,
        'thisArg' : thisArg
    };

    //读取task.param时都会将globalParam先进行合并
    var _param = param;
    Object.defineProperty(task,'param',{
        get : function(){
            return Object.assign({},self.globalParam || {},_param || {});
        },
        set : function(newValue){
            _param = newValue;
        }
    });

    taskUtil.setTaskInitState(task);

    this.on(taskName,function(){
        var task = arguments[0];
        var ret = null;
        if(task.doneCallback){ // 如果有完成后的 回调，则表示：user maybe manipulate the result explicitly
            var tmp_ret = task.doneCallback.apply(task.thisArg ? task.thisArg : null,arguments);
            if(tmp_ret !== undefined){
                ret = tmp_ret;
            }

        }else{
            ret = [].slice.call(arguments,1);
            debugLog('任务：[ '+taskName+' ]用户没有处理返回值，使用默认保存逻辑,其保存结果为：');

            if(ret.length === 1 ){ //如果 操作返回值数量为1,则将该结果保存，否则按数组形式保存
                ret = ret[0];
            }
            debugLog(ret);
        }

        task.result = ret;
        task.readyToRun = false;
        if(!taskUtil.isTaskFailState(task)){
            taskUtil.setTaskDoneState(task);
        }
        this.checkNextTask();//触发下一次任务检查
    });

    var done = function(){
        var args = [].slice.call(arguments,0);

        var hasError;
        //参数数量>1的情况下，如果第一个参数==null，就认为没有发生错误，可以将其移除,否则就需要转入errorHandler
        if(args.length>1 ){
            if(args[0] === null){
                args.shift();
            }else{
                hasError = true;
            }

        }
        if (hasError){
            task.error = args[0]; //该变量用来暂存错误但应该永不上
        }
        args.unshift(task);
        args.unshift(hasError? 'error' : taskName);
        self.emit.apply(self,args);
    };

    var fail = function(){
        taskUtil.setTaskFailState(task);
        var args = [].slice.call(arguments,0);
        args.unshift(task);
        args.unshift('error');
        self.emit.apply(self,args);
    };

    task['done'] = done;
    task['fail'] = fail;

    this.tasks[taskName] = task;

    if (param !== undefined && readyToRun){   //只有在explicitly设置了param  & readyToRun参数后才会立即开始检查任务
        this.checkNextTask();
    }

    return  task;
};


/**
 * 启动task的两个方法：
 * 1、restart
 * 2、调用clearState(true) ，然后setTaskParam
 */
AsyncTaskManager.prototype.restart = function(){
    if(this.isRuning){
        console.warn("AsyncTaskManager.isRuning flag already eq true!!!");
        //throw new Error("AsyncTaskManager is runing already！");
    }
    this.clearState();
    this.isRuning = true;
    //invoke start时，不再主动启动任务检查机制，而是交由setTaskParam完成
    this.checkNextTask();
};

AsyncTaskManager.prototype.checkNextTask = function(){
    if(!this.isRuning){
        throw new Error("调用checkNextTask前必须确保AsyncTaskManager.isRuning = true");
    }
    this.emit(CHECK_NEXT_TASK);
};

AsyncTaskManager.prototype.finishAllTasks = function(task){
    debugLog('task流被提前结束'+task ? ',结束者为： '+task.taskName : ',结束者未知');
    this.clearState();
};

/**
 * check all deps are valid,if not ,throw an error ;
 */
AsyncTaskManager.prototype.checkAllDeps = function () {
    //考虑性能，没有使用process.nextTick
    var self = this;

    var iterateDeps = function(tasks,callback){ //返回false 代表不符合依赖判断
        var i,j;
        var taskName;
        var task;
        var taskNames = Object.keys(tasks);
        var tmp_ret = true;

        for(i=0;i<taskNames.length;i++){
            taskName = taskNames[i];
            task = tasks[taskName];
            if (!task.deps || task.deps.length === 0){
                continue;
            }else{

                var check_dep_func = function(dep){  //偏函数
                    return callback(dep,taskNames);
                };


                var error_hint = "";


                if (!task.deps.length){
                    tmp_ret = check_dep_func(task.deps);
                    error_hint = ' [ invalid dep = ' + task.deps +' ] ';
                }else{
                    if (task.deps.indexOf(taskName) > -1){ //error cae 1：depend on self
                        console.log("error !! depends on itself");
                        tmp_ret = false;
                        error_hint += ' task cannot depend on it`s self!';
                        break;
                    }else{
                        for(j=0;j<task.deps.length;j++){  //error case 2: invalid taskName dep
                            var dep = task.deps[j];
                            tmp_ret = check_dep_func(dep);
                            error_hint = ' [ invalid dep = ' + dep +' ]';
                            if(!tmp_ret){
                                break;
                            }

                        }
                    }
                }


            }
        }

        if(!tmp_ret){
            throw new Error('task.deps is incorrect,please check it! deps = ' + task.deps.toString() + ' '+ error_hint);
        }

        return true;
    };

    var checkInvalidDeps = function(){
        var ret = iterateDeps(self.tasks,function(dep,taskNames){
            return [].indexOf.call(taskNames,dep) >= 0;
        });

        return ret;
    };

    setImmediate(checkInvalidDeps);

};


module.exports = AsyncTaskManager;