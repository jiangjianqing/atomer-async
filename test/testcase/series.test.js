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

describe.skip('example test', () => {
    var tasks = [];
    beforeEach(function(){
        tasks = [
            function(){
                fs.readFile(__dirname+"/../resources/file1", "utf-8", this.done("file1"));
            },
            function(){
                fs.readFile(__dirname+"/../resources/file2", "utf-8", this.done("file2"));
            }
        ];
    });

    it('example correct test', done => {
        //var s = new Series();

        done();




    });

    it('example fail test', done => {

        done();


    });

});