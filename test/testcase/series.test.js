var assert = require('assert');
var should = require('chai').should(); //注意：使用should()后会污染js中对象的原型对象
var expect = require('chai').expect;

//##注意：模块最终发布的是编译后的程序，为了避免因babel的Bug而导致编译后的程序与源程序功能有差异，单元测试需要改用编译后的代码(lib目录下)。
//-----------导入区-----------------
var fs = require("fs");

var series = require("../../lib/series");
//----------------------------
/**
 expect(foo).to.not.equal(null);
 expect(foo).to.not.be.null;
 should.exist(foo); // will pass for not null and not undefined
 should.not.equal(foo, null);
 **/

describe('series test', () => {
    var tasks = [];
    beforeEach(function(){
        tasks = [
            function(file1Name){
                fs.readFile(__dirname+"/../resources/"+file1Name, "utf-8", this.done("file1"));
            },
            function(file2Name){
                fs.readFile(__dirname+"/../resources/"+file2Name, "utf-8", this.done("file2"));
            }
        ];
    });

    it('series correct test', done => {
        series(
            tasks,
            function(error,results){
                should.not.exist(error);
                console.log("successed!");
                console.log(results);
                done();
            }
        ).run("file1");

    });

    it('series fail test', done => {
        tasks.push(function(){
            var that = this;
            setTimeout(function(){
                var error = new Error("custom timeout error");
                var done = that.done("timeout");
                done(error);
            },100);
        });
        series(
            tasks,
            function(error,results){
                should.exist(error);
                //console.log("failed!");
                //console.log(error);
                done();
            }
        ).run("file1");
    });

});