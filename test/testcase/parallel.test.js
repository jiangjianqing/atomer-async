var assert = require('assert');
var should = require('chai').should(); //注意：使用should()后会污染js中对象的原型对象
var expect = require('chai').expect;
var fs = require("fs");

var parallel = require("../../lib/parallel");

/**
 expect(foo).to.not.equal(null);
 expect(foo).to.not.be.null;
 should.exist(foo); // will pass for not null and not undefined
 should.not.equal(foo, null);
 **/

describe('parallel test', () => {

    it('parallel correct test', done => {
        //var s = new Series();
        var tasks = [
            function(){
                fs.readFile(__dirname+"/../resources/file1",this.done("file1"));
            },
            function(){
                fs.readFile(__dirname+"/../resources/file2",this.done("file2"));
            }
        ];

        parallel(tasks, function(error, results){
            should.equal(error, null);
            console.log(results);
            done();
        });

    });

    it.skip('parallel fail test', done => {

        done();


    });

});