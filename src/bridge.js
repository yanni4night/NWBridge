/**
 * Copyright (C) 2015 yanni4night.com
 * bridge.js
 *
 * Workflow:
 *
 *                      |--Bridge--|
 *                    |--          --|
 *                   |-              -|
 *                   |                |                  
 * NBusiness      Native           Webview       WBusiness
 *     |             | ==handshake==> |             |
 *     |             | <==response==  |             |
 *     | <==notify== |                |             |
 *     |             | ==handback==>  |             |
 *     |             |                | ==notify==> |
 *     |             |                |             |
 *     | --------------bridge connected------------ |
 *
 * "WBusiness" but not "NBusiness" can request IMMEDIATELY
 * When notified the bridge is connected.
 * 
 * changelog
 * 2015-11-18[16:16:12]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import {DomEvent} from'./dom-event';
import {extend} from'./extend';
import {Queue, PriorityQueue} from'./queue';
import {Message, RequestMessage} from'./message';
import {Radio} from'./radio';
import {Api} from'./api';
import {Promise} from'./promise';
import {Logger} from'./logger';
import {asap} from'./asap';
import {IDL} from'./idl';
import {StateMachine} from'./fsm';
import {Statistics} from './statistics';

const READY_STATE_ENUM = {
    PENDING: 'pending',
    COMPLETE: 'complete',
    ERROR: 'error'
};

/**
 * The JSBridge class.
 * 
 * @param {string} nativeExport
 * @param {string} webviewExport
 * @param {string} scheme
 * @since 1.0.0
 * @version 1.0.0
 */
window.NWBridge = function (nativeExport, webviewExport, scheme) {

    const self = this;

    const messageQueueFromNative = new PriorityQueue({
        priorityKey: 'priority'
    });

    const messageQueueToNative = new Queue();

    const statistics = new Statistics(nativeExport);

    var radio;

    var fsm;

    var handshakeTimeout;

    var bridgeReadyTriggered = false;

    const HANDSHAKE_TIMEOUT = 1e3;//6e5;

    const QUEUE_LIMIT_TO_NATIVE = 5;

    const ERROR_NUMBER = {
        TIMEOUT: 0x1,
        ILLEGAL_HANDSHAKE: 0x2,
        HANDBACK_TIMEOUT: 0x3,
        HANDSHAKE_TIMEOUT: 0x4
    };

    // Indicate this bridge
    const channelId = 'channel:' + nativeExport;

    var system;

    if (window[nativeExport]) {
        throw new Error('"' + nativeExport + '" already in use');
    }

    Logger.debug('TIMEOUT:' + HANDSHAKE_TIMEOUT + 'ms');
    
    /**
     * Notify document that bridge is ready.
     *
     * This operation will be triggered only ONCE.
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    const bridgeReady = () => {
        const evtData = {};

        if (bridgeReadyTriggered) {
            return;
        }

        Logger.log('BRIDGEREADY:' + fsm.current);

        // Like "JsBridge" to "jsBridge"
        evtData[webviewExport.replace(/^([A-Z])/, function (n) {
            return n.toLowerCase();
        })] = window[webviewExport];
        // Like "JsBridgeReady"
        DomEvent.trigger(webviewExport + 'Ready', evtData);
        bridgeReadyTriggered = true;
    };

    /**
     * Send message from bridge to native.
     * 
     * @param  {Message} message
     * @version 1.0.0
     * @since 1.0.0
     */
    const upload = (message) => {
        messageQueueToNative.push(message);
    };

    /**
     * If can upload a message.
     * 
     * @return {boolean}
     * @version 1.0.0
     * @since 1.0.0
     */
    const canUpload = () => {
        return messageQueueToNative.size() < QUEUE_LIMIT_TO_NATIVE;
    };

    // native -> webview
    messageQueueFromNative.on('push', () => {
        // Release native thread
        asap(() => {
            // Make sure message flows in the right order as pushed
            var message = messageQueueFromNative.top();
            var shouldFlow = true;

            if (fsm.is(READY_STATE_ENUM.ERROR)) {
                shouldFlow = false;
                // Prevent from queue overflow
                messageQueueFromNative.pop();
                Logger.warn('NOT FLOW IN ERROR');
            } else if (undefined === message) {
                shouldFlow = false;
                // Handshake is always on the top;
            } else if (message.isHandShake()) {
                if (!fsm.is(READY_STATE_ENUM.PENDING)) {
                    // Ignore duplicated handshakes
                    messageQueueFromNative.pop();
                    shouldFlow = false;
                    Logger.warn('Duplicated handshake received');
                }
            }

            if (!shouldFlow || (undefined === (message = messageQueueFromNative.pop()))) {
                return;
            }

            message.on('handshake', (evt, respMsg) => {
                // Prevent duplicated handshake
                if (fsm.cannot('success') && fsm.cannot('fail')) {
                    radio.send(respMsg);
                    return;
                }
                if (!radio) {
                    radio = new Radio((message.inputData || {}).platform, scheme);
                    extend(window[nativeExport], radio.extension);
                    radio.send(respMsg);
                }
            }).on('response', function (evt, respMsg) {
                upload(respMsg);
            }).on('handback', function() {
                if (fsm.can('success')) {
                    fsm.success();
                }
            }).on('system', (evt, systemData) => {
                system = extend(true, {}, systemData);
                if ('true' === system.switch && system.logid) {
                    Logger.log('Statistics startup');
                    statistics.startup(system.logid);
                }
            }).on('error', (evt, err) => {
                if (message.isHandShake()){
                    statistics.trace(ERROR_NUMBER.ILLEGAL_HANDSHAKE, 'illegal handshake');
                }
                Logger.error(err.message);
            }).flow();
        });
    });

    // webview -> native
    messageQueueToNative.on('push', () => {
        if (fsm.is(READY_STATE_ENUM.COMPLETE)) {
            const message = messageQueueToNative.pop();

            if (message) {
                radio.send(message);
            }
        }
    });

    Api.register(channelId, 'kernel', 'notifyConnected', () => {
        clearTimeout(handshakeTimeout);
    });

    fsm = StateMachine.create({
        initial: READY_STATE_ENUM.PENDING,
        events: [{
            name: 'fail',
            from: READY_STATE_ENUM.PENDING,
            to: READY_STATE_ENUM.ERROR
        }, {
            name: 'success',
            from: READY_STATE_ENUM.PENDING,
            to: READY_STATE_ENUM.COMPLETE
        }],
        callbacks: {
            onafterfail: () => {
                export2Webview();
                // And notify business about this
                bridgeReady();
            },
            onaftersuccess: () => {
                export2Webview();
                // Bridge is ready,native receiving works immediately
                self.flush2Native();
                // Trigger bridge ready because we should
                // give business the time to add some listeners.
                bridgeReady();
                // Then push webview to handle the other data beyond handshake
                self.flush2Webview();
            }
        }
    });

    // Wait only few seconds for the handshake from native
    handshakeTimeout = setTimeout(() => {
        fsm.fail();
        Logger.error('TIMEOUT:' + HANDSHAKE_TIMEOUT);
        if (!!system) {
            statistics.trace(ERROR_NUMBER.HANDBACK_TIMEOUT, 'handback timeout');
        } else {
            statistics.trace(ERROR_NUMBER.HANDSHAKE_TIMEOUT, 'handshake timeout');
        }
    }, HANDSHAKE_TIMEOUT);

    // Export to native always
    window[nativeExport] = {
        /**
         * Native send string data to bridge.
         *
         * This function must exist immediately because
         * native talks to bridge first.
         * 
         * @param  {string} messageStr string data
         * @version 1.0.0
         * @since 1.0.0
         */
        send: function (messageStr) {
            Logger.log('RECEIVE FROM NATIVE:' + messageStr);
            const message = Message.fromMetaString(messageStr, channelId);
            if (!message.isInvalid()) {
                messageQueueFromNative.push(message);
            } else {
                Logger.warn('[INVALID]:' + messageStr);
            }
            return messageStr || '[DEFAULT]';
        }
    };

    var oldWvExport = window[webviewExport];

    // Export to webview
    function export2Webview() {
        // What in webviewExport depends on state
        if (fsm.is(READY_STATE_ENUM.COMPLETE)) {
            window[webviewExport] = {
                readyState: fsm.current,
                /**
                 * Register API for native.
                 *
                 * @todo test
                 * @return {this}
                 */
                register: () => {
                    Api.register.apply(Api, Array.prototype.slice.call(arguments).unshift(channelId));
                    return window[webviewExport];
                },
                system: {
                    version: () => {
                        return Promise.resolve(system.version);
                    },
                    platform: () => {
                        return Promise.resolve(system.platform);
                    }
                }
            };

            for (let cmdKey in IDL) {
                let cmd = IDL[cmdKey];
                for (let methodKey in cmd) {
                    let method = cmd[methodKey];
                    let args = method.arguments.split(',');
                    (window[webviewExport][cmdKey] || (window[webviewExport][cmdKey] = {}))[methodKey] = function () {
                        const inputData = {};
                        const fargs = Array.prototype.slice.call(arguments);
                        const timeout = fargs[fargs.length - 1];

                        args.forEach((arg, idx) => {
                            inputData[arg] = fargs[idx];
                        });

                        return new Promise((resolve, reject) => {

                            if (!canUpload()) {
                                reject(new Error('Too often'));
                            } else {
                                let msg = new RequestMessage(channelId, {
                                    cmd: cmdKey,
                                    method: methodKey,
                                    inputData: inputData
                                }, timeout).on('data', (evt, data) => {
                                    resolve(data);
                                }).on('error', (evt, err) => {
                                    reject(err);
                                });

                                upload(msg);
                            }
                           
                        });
                    };
                }
            }
        } else {
            window[webviewExport] = {
                readyState: fsm.current
            };
        }

        /**
         * Similar to jQuery.noConflict
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        window[webviewExport].noConflict = () => {
            if (undefined !== oldWvExport) {
                window[webviewExport] = oldWvExport;
            }
        };
    }

    extend(this, {
        /**
         * Flush messages in queue to native.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        flush2Native: () => {
            // DO NOT use infinite loop
            var size = messageQueueToNative.size();
            while (size) {
                // Make sure do pop in each emit
                messageQueueToNative.emit('push');
                size -= 1;
            }
        },
        /**
         * Flush messages in queue to webview
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        flush2Webview: () => {
            // DO NOT use infinite loop
            var size = messageQueueFromNative.size();
            while (size) {
                // Make sure do pop in each emit
                messageQueueFromNative.emit('push');
                size -= 1;
            }
        }
    });
}; // NWBridge