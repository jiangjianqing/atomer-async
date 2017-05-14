var assert = require('assert');
var should = require('chai').should(); //注意：使用should()后会污染js中对象的原型对象
var expect = require('chai').expect;

var Series = require("../../../lib/deprecate/series");



describe('series [deprecate] test', () => {

    it('series right test', done => {
        var s = new Series();

        s.init([
            function(callback){
                callback(null,1+1);
            },
            function(callback, arg1){
                callback(null, arg1 + 1);
            },
            function(callback, arg1){
                expect(arg1).to.equal(3);
                done();
            }
        ]);

        s.fail(function(error){
            should.exist(error);
        });

        s.run();

        /**
         expect(foo).to.not.equal(null);
         expect(foo).to.not.be.null;
         should.exist(foo); // will pass for not null and not undefined
         should.not.equal(foo, null);
         **/


    });

    it('series fail test', done => {
        var s = new Series();

        s.init([
            function(callback){
                callback(null,1+1);
            },
            function(callback, arg1){
                callback(new Error("触发错误"), arg1 + 1);
            },
            function(callback, arg1){
                callback(null, arg1 + 10);
            }
        ]);

        s.fail(function(error){
            should.exist(error);

        });

        s.fin(function(){
            done();
        });

        s.run();

        /**
         expect(foo).to.not.equal(null);
         expect(foo).to.not.be.null;
         should.exist(foo); // will pass for not null and not undefined
         should.not.equal(foo, null);
         **/


    });

});