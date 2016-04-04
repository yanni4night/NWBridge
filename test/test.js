/**
 * Copyright (C) 2015~2016 yanni4night.com
 * test.js
 *
 * changelog
 * 2015-11-20[12:56:17]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import assert from 'assert';
import {PriorityQueue} from '../src/queue';
import {Queue} from '../src/queue';
import {Callback} from '../src/callback';
import {DomEvent} from '../src/dom-event';
import {Radio} from '../src/radio';
import {Promise as XPromise} from '../src/promise';
import {Event as XEvent} from '../src/event';
import {Message} from '../src/message';

const pkg = __PKG__;
//JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

const HYBRID_INITIAL_DATA = {
    platform: 'android',
    version: '1.0.0',
    logid: 'log-' + Date.now()
};

const ServerBridge = window.ServerBridge;

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
            queue.push(1).push(2);
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
            assert.deepEqual(Callback.findById(callback.getId(), channelId), callback);
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
            var promise = new XPromise(function (resolve) {
                resolve();
            });
            promise.then(function () {
                done();
            });
        });
    });

    describe('#then()', function () {
        it('should call second callback of "then" when rejected', function (done) {
            var promise = new XPromise(function (resolve, reject) {
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
            var promise = new XPromise(function (resolve, reject) {
                reject();
            });
            promise.catch(function () {
                done();
            });
        });
    });

    describe('#resolve()', function () {
        it('should return true if resolve', function (done) {
            XPromise.resolve(56).then(function (val) {
                assert.deepEqual(val, 56);
                done();
            });
        });
    });
});

describe('Event', function () {
    describe('#on()#emit()', function () {
        it('should call listener if "emit" after "on"', function (done) {
            var evt = new XEvent();
            evt.on('test', function (evt, data) {
                assert.ok(!!data);
                assert.deepEqual(data.name, 'Peter');
                done();
            });
            evt.emit('test', {
                name: 'Peter'
            });
        });
    });
    describe('#off', function () {
        it('should remove listener when "off"', function () {
            var evt = new XEvent();
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
    });
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

describe('Api', function () {
    describe('#sync', function () {
        this.timeout(1e3);
        it('should response when sync', function (done) {
            var serverBridge;
            serverBridge = new ServerBridge('__js_0108p09h_sync_bridge', 'kk0sscheme://');
            serverBridge.on('response', function (evt, message) {
                if ('mark' === message.cmd && 'tell' === message.method) {
                    assert.deepEqual(28, message.outputData.data.age);
                    done();
                }
            });

            document.addEventListener('KK0sjsBridgeReady', function () {
                window.KK0sjsBridge.register('mark', 'tell', function (data) {
                    return {
                        age: data.age
                    };
                }, false);
                serverBridge.send(serverBridge.createRequestMessage({
                    cmd: 'mark',
                    method: 'tell',
                    inputData: {
                        age: 28
                    },
                    callbackId: Math.random()
                }));
            }, false);
            new window.NWBridge('__js_0108p09h_sync_bridge', 'KK0sjsBridge', 'kk0sscheme://', HYBRID_INITIAL_DATA);
            serverBridge.ping();
        });
    });
    describe('#catch sync crash', function () {
        this.timeout(1e3);
        it('should response when sync crash', function (done) {
            var serverBridge;

            serverBridge = new ServerBridge('__js_0108p09h_sync_crash_bridge', 'kkcrascheme://');
            serverBridge.on('response', function (evt, message) {
                if ('mark' === message.cmd && 'tell' === message.method) {
                    done();
                }
            });

            document.addEventListener('KKcrajsBridgeReady', function () {
                window.KKcrajsBridge.register('mark', 'tell', function () {
                    throw new Error('FATAL');
                }, false);
                serverBridge.send(serverBridge.createRequestMessage({
                    cmd: 'mark',
                    method: 'tell',
                    inputData: {
                        age: 28
                    },
                    callbackId: Math.random()
                }));
            }, false);
            new window.NWBridge('__js_0108p09h_sync_crash_bridge', 'KKcrajsBridge',
                'kkcrascheme://', HYBRID_INITIAL_DATA);
            serverBridge.ping();
        });
    });
    describe('#async', function () {
        this.timeout(2e3);
        it('should response even async', function (done) {
            var serverBridge;

            serverBridge = new ServerBridge('__js_0108p09h_bridge', 'kk0scheme://');
            serverBridge.on('response', function (evt, message) {
                if ('mark' === message.cmd && 'tell' === message.method) {
                    assert.deepEqual(28, message.outputData.data.age);
                    done();
                }
            });

            document.addEventListener('KK0jsBridgeReady', function () {
                window.KK0jsBridge.register('mark', 'tell', function (cb, data) {
                    cb({
                        age: data.age
                    });
                }, true);
                serverBridge.send(serverBridge.createRequestMessage({
                    cmd: 'mark',
                    method: 'tell',
                    inputData: {
                        age: 28
                    },
                    callbackId: Math.random()
                }));
            }, false);
            new window.NWBridge('__js_0108p09h_bridge', 'KK0jsBridge', 'kk0scheme://', HYBRID_INITIAL_DATA);
            serverBridge.ping();
        });
    });
    describe('#async crash', function () {
        this.timeout(2e3);
        it('should response even async crash', function (done) {
            var serverBridge;
            serverBridge = new ServerBridge('__js_0108p09h1_bridge', 'kk01scheme://');
            serverBridge.on('response', function (evt, message) {
                if ('mark' === message.cmd && 'tell' === message.method) {
                    done();
                }
            });

            document.addEventListener('KK01jsBridgeReady', function () {
                window.KK01jsBridge.register('mark', 'tell', function () {
                    throw new Error('FATAL');
                }, true);
                serverBridge.send(serverBridge.createRequestMessage({
                    cmd: 'mark',
                    method: 'tell',
                    inputData: {
                        age: 28
                    },
                    callbackId: Math.random()
                }));
            }, false);
            new window.NWBridge('__js_0108p09h1_bridge', 'KK01jsBridge', 'kk01scheme://', HYBRID_INITIAL_DATA);
            serverBridge.ping();
        });
    });
});

describe('NWBridge', function () {

    describe('version', function () {
        it('should get version ', function () {
            document.addEventListener('KKjsBridgeReady', function () {
                assert.deepEqual(pkg.version, window.KKjsBridge.version);
                var old = window.KKjsBridge.version;
                assert.throws(()=>{
                    window.KKjsBridge.version = 'x.x.x';
                });
            }, false);

            new window.NWBridge('__js_0108p09_bridge', 'KKjsBridge', 'kkscheme://', HYBRID_INITIAL_DATA);

            var serverBridge = new ServerBridge('__js_0108p09_bridge', 'kkscheme://');
            serverBridge.ping();
        });
    });

    describe('cache before ping', function () {
        this.timeout(5e3);
        it('can cache messages before ping', function (done) {

            new window.NWBridge('__js_098_bridge', 'PjsBridge', 'pscheme://', HYBRID_INITIAL_DATA);

            var serverBridge = new ServerBridge('__js_098_bridge', 'pscheme://');

            XPromise.all([
                new XPromise(function (resolve) {
                    serverBridge.on('response', function (evt, message) {
                        if ('location' === message.cmd && 'href' ===
                            message.method) {
                            resolve();
                        }
                    });
                }),
                new XPromise(function (resolve) {
                    serverBridge.on('response', function (evt, message) {
                        if ('location' === message.cmd && 'hash' ===
                            message.method) {
                            resolve();
                        }
                    });
                })

            ]).then(function () {
                done();
            });

            serverBridge.send(serverBridge.createRequestMessage({
                cmd: 'location',
                method: 'href'
            }));

            serverBridge.send(serverBridge.createRequestMessage({
                cmd: 'location',
                method: 'hash'
            }));

            serverBridge.ping();

        });
    });

    describe('#duplicated ping', function () {
        it('should handle duplicated ping', function (done) {
            var fired = false;
            new window.NWBridge('__js_09x12x530_bridge', 'C12530jsBridge',
                '12530scheme://', HYBRID_INITIAL_DATA);
            var serverBridge = new ServerBridge('__js_09x12x530_bridge',
                '12530scheme://');
            serverBridge.on('ping', function () {
                if (!fired) {
                    fired = true;
                    serverBridge.ping();
                } else {
                    done();
                }
            }).ping();
        });
    });

    describe('#register()', function () {
        it('should get data from webview', function (done) {

            document.addEventListener('C12jsBridgeReady', function (evt) {
                var bridge = evt.c12jsBridge;
                bridge.register('tank', 'do', function (data) {
                    return data;
                });
            });

            new window.NWBridge('__js_09x1230_bridge', 'C12jsBridge', '12scheme://', HYBRID_INITIAL_DATA);

            var serverBridge = new ServerBridge('__js_09x1230_bridge', '12scheme://');

            serverBridge.ping();

            serverBridge.on('response', function (evt, respMsg) {
                if (respMsg.cmd === 'tank' && 'do' === respMsg.method) {
                    assert.deepEqual(respMsg.outputData.data.hello, 'world');
                    done();
                }
            });

            serverBridge.send(new Message('__t_2&01uh7', {
                messageType: Message.MESSAGE_TYPE.REQUEST,
                cmd: 'tank',
                method: 'do',
                inputData: {
                    hello: 'world'
                },
                callbackId: '__DSFI'
            }));
        });
    });

    describe('#system.version()', function () {
        it('version got', function (done) {
            document.addEventListener('CjsBridgeReady', function (evt) {
                assert.deepEqual(evt.cjsBridge.readyState, 'complete');
                assert.deepEqual(typeof CjsBridge, 'object');

                window.CjsBridge.system.version().then(function (version) {
                    assert.deepEqual(version, '1.0.0');
                    return window.CjsBridge.system.platform();
                    // done();
                }, function (e) {
                    console.error(e);
                }).then(function (platform) {
                    assert.deepEqual(platform, 'android');
                    done();
                });

            }, false);

            new window.NWBridge('__js_09x02_bridge', 'CjsBridge', 'cscheme://', HYBRID_INITIAL_DATA);

            var serverBridge = new ServerBridge('__js_09x02_bridge', 'cscheme://');
            serverBridge.send(new Message('__t_201uh7', {
                messageType: Message.MESSAGE_TYPE.PING,
                cmd: 'ping',
                inputData: {
                    version: '1.0.0',
                    platform: 'android',
                    logid: 'sH*(G',
                    switch: 'true'
                },
                callbackId: '__DSFI'
            }));
        });
    });
});