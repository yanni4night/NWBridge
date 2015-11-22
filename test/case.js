/**
 * Copyright (C) 2015 tieba.baidu.com
 * test.js
 *
 * changelog
 * 2015-11-20[12:56:17]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var assert = require('assert');
var PriorityQueue = require('../dist/queue').PriorityQueue;
var Queue = require('../dist/queue').Queue;
var Callback = require('../dist/callback').Callback;
var DomEvent = require('../dist/dom-event').DomEvent;
var Native = require('../dist/native').Native;
var Promise = require('../dist/promise').Promise;

var ready = new Promise(function (resolve, reject) {
    document.addEventListener('TiebaJsBridgeReady', function (evt) {
        resolve(evt.tiebaJsBridgeReady);
    }, false);
});

describe('Queue', function () {
    describe('#push()', function () {
        it('should throw Error if pushing overflow "limit"', function () {
            var queue = new Queue({
                limit: 1
            });
            assert.deepEqual(queue.push(1), queue);
            assert.throws(function () {
                queue.push(1);
            });
        });
    });
    describe('#empty()', function () {
        it('should return if empty of queue', function () {
            var queue = new Queue();
            queue.push(1);
            assert.ok(!queue.empty());
            queue.pop();
            assert.ok(queue.empty());
        });
    });

    describe('#size()', function () {
        it('should return length of queue', function () {
            var queue = new Queue();
            queue.push(1).push(2).push(3);
            assert.deepEqual(queue.size(), 3);
            queue.pop();
            assert.deepEqual(queue.size(), 2);
        });
    });

    describe('#truncate()', function () {
        it('should remove some elements of queue', function () {
            var queue = new Queue();
            queue.push(1).push(2).push(3);
            assert.deepEqual(queue.truncate(0, 2), queue);
            assert.deepEqual(queue.pop(), 3);
        });
    });

    describe('#serialize()', function () {
        it('should remove json string of queue', function () {
            var queue = new Queue();
            queue.push(1).push(2);
            var str = queue.serialize();
            assert.ok('string' === typeof str);
            var ret = JSON.parse(str);
            assert.deepEqual(ret[0], 1);
            assert.deepEqual(ret[1], 2);
        });
    });
    describe('#clear()', function () {
        it('should clear all elements of queue', function () {
            var queue = new Queue();
            queue.push(1).push(2)
            assert.deepEqual(queue.clear(), queue);
            assert.ok(queue.empty());
        });
    });
    describe('#sortBy()', function () {
        it('should sort queue', function () {
            var queue = new Queue();
            queue.push({
                age: 25
            }).push({
                age: 28
            });
            assert.deepEqual(queue.sortBy('age'), queue);
            assert.deepEqual(queue.pop().age, 28);
        });
    });
});

describe('PriorityQueue', function () {
    describe('#push()', function () {
        it('should get the highest priority element', function () {
            var queue = new PriorityQueue({
                priorityKey: 'priority'
            });
            queue.push({
                name: 'Peter',
                priority: 0
            }).push({
                name: 'Jim',
                priority: 1
            });
            assert.deepEqual(queue.pop().name, 'Jim');
        });
    });
});

describe('Callback', function () {
    describe('#findById()', function () {
        it('should get the callback by its id', function () {
            var callback = new Callback(function () {});
            assert.deepEqual(Callback.findById(callback.getId()), callback)
        });
    });

    describe('#invoke()', function () {
        it('should call function when invoke', function () {
            var callback = new Callback(function (err, ret) {
                if (err) {
                    throw err;
                }
                return ret;
            });
            assert.deepEqual(callback.invoke({
                errNo: 0,
                data: 0x0810
            }), 0x0810);

            assert.throws(function () {
                callback.invoke({
                    errNo: -1
                });
            });
        });
    });
});

describe('DomEvent', function () {
    describe('#trigger()', function () {
        it('should trigger event on document', function (done) {
            var evtName = '__test_evt_name';
            document.addEventListener(evtName, function () {
                done();
            }, false);
            DomEvent.trigger(evtName);
        });
    });
});

describe('Native', function () {
    describe('android', function () {
        it('should call window.prompt()', function (done) {
            var prompt = window.prompt;
            window.prompt = function (msgStr) {
                var data;
                assert.ok(/^tieba:\/\//i.test(msgStr));
                assert.doesNotThrow(function () {
                    data = JSON.parse(msgStr.replace(/^tieba:\/\//i, ''));
                });
                assert.ok(!!data);
                assert.deepEqual(data.name, 'Jim');
                window.prompt = prompt;
                done();
            };
            var native = new Native('android');
            native.send(JSON.stringify({
                name: 'Jim'
            }));

        });
    });
    describe('ios', function () {
        it('should add an iframe', function () {
            var native = new Native('ios');
            native.send();
            assert.ok(!!document.querySelector('iframe[src^="tieba://"]'));
        });
    });
});

describe('Promise', function () {
    describe('#then()', function () {
        it('should call first callback of "then" when resolved', function (done) {
            var promise = new Promise(function (resolve) {
                resolve();
            });
            promise.then(function () {
                done();
            });
        });
    });

    describe('#then()', function () {
        it('should call second callback of "then" when rejected', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject();
            });
            promise.then(function () {

            }, function () {
                done();
            });
        });
    });
    describe('#catch()', function () {
        it('should call "catch" when rejected', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject();
            });
            promise.catch(function () {
                done();
            });
        });
    });
    describe('#all()', function () {
        it('should call "then" when all resolved', function (done) {
            Promise.all([
                new Promise(function (resolve) {
                    resolve();
                }), new Promise(function (resolve) {
                    resolve();
                })
            ]).then(function () {
                done();
            });
        });
    });
});

describe('TiebaJsBridge', function () {
    describe('API', function () {
        this.timeout(5e3);
        it('#widgets.confirm()', function (done) {
            ready.then(function () {
                assert.ok('undefined' !== typeof TiebaJsBridge);
                assert.deepEqual(TiebaJsBridge.readyState, 'complete');
                TiebaJsBridge.widgets.confirm('yes?').then(function () {
                    done();
                }).catch(function () {
                    done();
                });
            }).catch(function (e) {
                console.error(e);
            });
        })
    });
});