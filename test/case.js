/**
 * Copyright (C) 2015 yanni4night.com
 * test.js
 *
 * changelog
 * 2015-11-20[12:56:17]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

var assert = require('assert');
var PriorityQueue = require('../dist/queue').PriorityQueue;
var Queue = require('../dist/queue').Queue;
var Callback = require('../dist/callback').Callback;
var DomEvent = require('../dist/dom-event').DomEvent;
var Radio = require('../dist/radio').Radio;
var Promise = require('../dist/promise').Promise;
var Event = require('../dist/event').Event;
var Message = require('../dist/message').Message;

var ready = new Promise(function (resolve, reject) {
    document.addEventListener('JsBridgeReady', function (evt) {
        resolve(evt.jsBridge);
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
            var channelId = '__t_0120';
            var callback = new Callback(channelId, function () {});
            assert.deepEqual(Callback.findById(callback.getId(), channelId), callback)
        });
    });

    describe('#invoke()', function () {
        it('should call function when invoke', function () {
            var channelId = '__t_0121';
            var callback = new Callback(channelId, function (err, ret) {
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

describe('Radio', function () {
    describe('android', function () {
        it('should call window.prompt()', function (done) {
            var prompt = window.prompt;
            window.prompt = function (msgStr) {
                var data;
                assert.ok(/^http:\/\//i.test(msgStr));
                assert.doesNotThrow(function () {
                    data = JSON.parse(msgStr.replace(/^http:\/\//i, ''));
                });
                assert.ok(!!data);
                assert.deepEqual(data.cmd, 'Jim');
                window.prompt = prompt;
                done();
            };
            var radio = new Radio('android', 'http://');
            radio.send(new Message('__t__t_203', {
                cmd: 'Jim'
            }));

        });
    });
    describe('ios', function () {
        it('should add an iframe', function () {
            var receivedStr;
            var received;
            var radio = new Radio('ios', 'http://');
            radio.send(new Message('__t_t_23857', {
                cmd: 'Jim'
            }));
            assert.ok(!!document.querySelector('iframe[src^="http://"]'));
            assert.deepEqual(typeof (receivedStr = radio.extension.fetch()), 'string');
            assert.doesNotThrow(function () {
                received = JSON.parse(receivedStr);
            });
            assert.ok(Array.isArray(received) && received.length);
            assert.deepEqual(received[0].cmd, 'Jim');
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
});

describe('Event', function () {
    describe('#on()#emit()', function () {
        it('should call listener if "emit" after "on"', function (done) {
            var evt = new Event();
            evt.on('test', function (evt, data) {
                assert.ok(!!data);
                assert.deepEqual(data.name, 'Peter');
                done();
            });
            evt.emit('test', {
                name: 'Peter'
            })
        });
    });
    describe('#off', function () {
        it('should remove listener when "off"', function () {
            var evt = new Event();
            var foo = 0;

            var callOne = function () {
                foo = 1;
            };

            var callTwo = function () {
                foo = 2;
            };

            var callThree = function () {
                foo = 3;
            };

            evt.on('test', callOne);
            evt.off('test', callOne);
            evt.emit('test');
            assert.deepEqual(foo, 0);

            evt.on('test', callTwo);
            evt.on('test', callThree);
            evt.off('test');
            assert.deepEqual(foo, 0);
        });
    });;
});

describe('Message', function () {
    describe('#construct', function () {
        it('should inject variables from metaData', function () {
            var channelId = '__t_2011';
            var msg = new Message(channelId, {
                cmd: 'foo',
                method: 'say'
            });
            assert.deepEqual(msg.cmd, 'foo');
            assert.deepEqual(msg.method, 'say');
        });
        it('should has a priority', function () {
            var channelId = '__t_2011_0';
            assert.deepEqual(new Message(channelId).priority, 0);
        });

        it('should be an event', function () {
            var channelId = '__t_2011_1';
            var msg = new Message(channelId);
            assert.ok('function' === typeof msg.on);
            assert.ok('function' === typeof msg.off);
            assert.ok('function' === typeof msg.emit);
        });

        it('should has a default messageType', function () {
            var channelId = '__t_2011_3';
            assert.deepEqual(new Message(channelId).messageType, Message.MESSAGE_TYPE.REQUEST);
        });
    });
    describe('#assemble()', function () {
        it('should return plain object', function () {
            var channelId = '__t_2012';
            var keys = 'messageType,cmd,method,inputData,outputData,callbackId'.split(',');
            var msg = new Message(channelId).assemble();
            assert.ok(!keys.some(function (key) {
                return !(key in msg);
            }));
        });
    });

    describe('#serialize()', function () {
        it('should return json string', function () {
            var channelId = '__t_2013';
            var keys = 'messageType,cmd,method,inputData,callbackId'.split(',');
            var msg = new Message(channelId, {
                cmd: 1,
                method: 2,
                inputData: {
                    name: 'Jim'
                },
                callbackId: 0
            }).serialize();
            assert.deepEqual(typeof msg, 'string');
            assert.doesNotThrow(function () {
                msg = JSON.parse(msg);
            });
            assert.ok(!keys.some(function (key) {
                return !(key in msg);
            }));
        });
    });
});

describe('JsBridge', function () {
    describe('API', function () {
        this.timeout(5e3);
        it('#testCmd.doTest()', function (done) {
            ready.then(function () {
                assert.ok('undefined' !== typeof JsBridge);
                assert.deepEqual(JsBridge.readyState, 'complete');
                JsBridge.testCmd.doTest('Hello World').then(function () {
                    done();
                }).catch(function () {
                    done();
                });
            }).catch(function (e) {
                console.error(e);
            });
        });
    });
});

describe('NWBridge', function () {
    describe('timeout', function () {
        this.timeout(1500);
        it('should timeout if no handshake received', function (done) {
            document.addEventListener('TjsBridgeReady', function (e) {
                assert.ok(!!e.tjsBridge);
                assert.deepEqual(e.tjsBridge.readyState, 'error');
                done();
            }, false);
            new NWBridge('__t_2015_bridge_' + Math.random(), 'TjsBridge', 'matin://');
        });
    });

});