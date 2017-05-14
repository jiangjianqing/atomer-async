var assert = require('assert');
var should = require('chai').should(); //注意：使用should()后会污染js中对象的原型对象
var expect = require('chai').expect;

//##注意：模块最终发布的是编译后的程序，为了避免因babel的Bug而导致编译后的程序与源程序功能有差异，单元测试需要改用编译后的代码(lib目录下)。
var promise = require('../../lib/promise'),
    fs = require('fs');

var promisify = promise.promisify,
    promisifyStream = promise.promisifyStream,
    Defered = promise.Deferred;
/**
 expect(foo).to.not.equal(null);
 expect(foo).to.not.be.null;
 should.exist(foo); // will pass for not null and not undefined
 should.not.equal(foo, null);
 **/

describe('promise test', () => {

    it('promisify correct test', done => {
        var readFile = promisify(fs.readFile,fs);
        var promise1 =  readFile(__dirname+"/../resources/file1",'utf8');
        promise1.then(function(data){
            expect(data).to.equal("file2");
            done();
        },function(err){
            should.not.exist(err);
        });
    });

    it('promisify fail test', done => {

        var readFile = promisify(fs.readFile,fs);
        var promise1 =  readFile(__dirname+"/../resources/notexistfile",'utf8');
        promise1.then(function(data){
            assert.fail();
        },function(err){
            should.exist(err);
            done();
        });

    });

});

describe('promisifyStream test', () => {
    it('promisifyStream correct test', done => {
        var input = fs.createReadStream(__dirname+"/../resources/file1",{encoding:'utf-8',highWaterMark:30});
        var promise2 = promisifyStream(input);
        promise2.then(function(data){
            should.exist(data);
            done();
        },function(err){
            assert.fail();
        },function(data){
            should.exist(data);
        });
    });

    it('promisifyStream fail test', done => {
        //var s = new Series();
        var input = fs.createReadStream(__dirname+"/../resources/filenotexist",{encoding:'utf-8',highWaterMark:30});
        var promise2 = promisifyStream(input);
        promise2.then(function(data){
            should.exist(data);
        },function(err){
            should.exist(err);
            done();
        },function(data){
            should.exist(data);
        });
    });

});

describe('deferedAll test', () => {

    it('deferedAll correct test', done => {
        var readFile = promisify(fs.readFile,fs);
        var promise1 =  readFile(__dirname+"/../resources/file1",'utf8');

        var input = fs.createReadStream(__dirname+"/../resources/file2",{encoding:'utf-8',highWaterMark:30});
        var promise2 = promisifyStream(input);

        var deferedAll = new Defered();
        deferedAll.all([promise1,promise2]).then(function(data1,data2){
            expect(data1).to.equal("file2");
            done();
        },function(error){
            console.log(error);
        });

    });

    it('deferedAll fail test', done => {

        var readFile = promisify(fs.readFile,fs);
        var promise1 =  readFile(__dirname+"/../resources/notexist_file1",'utf8');

        var input = fs.createReadStream(__dirname+"/../resources/notexist_file2",{encoding:'utf-8',highWaterMark:30});
        var promise2 = promisifyStream(input);

        var deferedAll = new Defered();
        deferedAll.all([promise1,promise2]).then(function(data1,data2){

        },function(error){
            should.exist(error);
            done();
        });


    });

});