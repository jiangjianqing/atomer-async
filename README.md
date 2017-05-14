[![Build Status](https://travis-ci.org/jiangjianqing/atomer-async.svg?branch=master)](https://travis-ci.org/jiangjianqing/atomer-async)


#parallel
用法:
parallel(tasks,callback);

tasks是一个函数数组，其中函数的意义是task,这个task函数绑定在ResultProxy上.
使用this.done("resultName",[alwaysSuccess])返回一个回调注入函数;


#series
用法:
series(tasks,callback).run([param]);
task函数的参数为上一个调用的返回值,与上一个函数的回调返回密切相关.

```ecmascript 6
//task函数的定义例子：

function task(file1Name){
    fs.readFile(__dirname+"/../resources/"+file1Name, "utf-8", this.done("file1"));
}
```
