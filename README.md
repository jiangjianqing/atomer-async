#parallel
用法:
parallel(tasks,callback);

tasks是一个函数数组，其中函数的意义是task,这个task函数绑定在ResultProxy上.
使用this.done("resultName",[alwaysSuccess])返回一个回调注入函数;