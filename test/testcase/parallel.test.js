var assert = require('assert');
var should = require('chai').should(); //注意：使用should()后会污染js中对象的原型对象
var expect = require('chai').expect;

//-----------导入区-----------------
var fs = require("fs");

var parallel = require("../../lib/parallel");
//----------------------------

/**
 expect(foo).to.not.equal(null);
 expect(foo).to.not.be.null;
 should.exist(foo); // will pass for not null and not undefined
 should.not.equal(foo, null);
 **/

describe('parallel test', () => {
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

    it('parallel correct test', done => {

        parallel(tasks, function(error, results){
            should.equal(error, null);
            console.log(results);
            done();
        });

    });

    it('parallel fail test', done => {

        tasks.push(function(){
            fs.readFile(__dirname+"/../resources/notexistfile", "utf-8", this.done("notexistfile"));
        });

        parallel(tasks, function(error, results){
            should.exist(error);
            console.log(error);
            done();
        });

    });

    it('parallel correct test with alwaysSuccess', done => {
        tasks.push(function(){
            setTimeout(this.done("timeout",true),200);
        });
        parallel(tasks, function(error, results){
            should.equal(error, null);
            console.log(results);
            done();
        });

    });

});