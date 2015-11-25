/**
 * Copyright (C) 2015 tieba.baidu.com
 * bridge.js
 *
 * changelog
 * 2015-11-18[16:16:12]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import {DomEvent} from './dom-event';
import {extend} from './extend';
import {Queue, PriorityQueue} from './queue';
import {Message, RequestMessage} from './message';
import {Radio} from './radio';
import {Api} from './api';
import {Event} from './event';
import {Callback} from './callback';
import {Promise} from './promise';
import {Logger} from './logger';
import {rawAsap as asap} from './asap';
import {IDL} from './idl';

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
export function Bridge(nativeExport, webviewExport, scheme) {

    const self = this;

    const messageQueueFromNative = new PriorityQueue({
        priorityKey: 'priority'
    });

    const messageQueueToNative = new Queue({
        limit: 5
    });

    var readyState = READY_STATE_ENUM.PENDING;

    var radio;

    var handshakeTimeout;

    var bridgeReadyTriggered = false;

    const HANDSHAKE_TIMEOUT = 6e4;

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

        Logger.log('BRIDGEREADY:' + readyState);

        evtData[webviewExport.replace(/^([A-Z])/, function (n) {
            return n.toLowerCase();
        })] = window[webviewExport];
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
    // native -> webview
    messageQueueFromNative.on('push', () => {
        // Release native thread
        asap(() => {
            // Make sure message flows in the right order as pushed
            var message = messageQueueFromNative.top();
            var shouldFlow = true;

            if (READY_STATE_ENUM.ERROR === readyState) {
                shouldFlow = false;
                // Prevent from queue overflow
                messageQueueFromNative.pop();
                Logger.warn('NOT FLOW IN ERROR');
            } else if (undefined === message) {
                shouldFlow = false;
                // Handshake is always on the top;
            } else if (message.isHandShake()) {
                if (READY_STATE_ENUM.PENDING !== readyState) {
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
                var newState;
                clearTimeout(handshakeTimeout);
                
                Logger.log('RECEIVE A HANDSHAKE:' + message.serialize());
                
                try {
                    radio = new Radio((message.inputData || {}).platform, scheme);
                    extend(window[nativeExport], radio.extension);
                    newState = READY_STATE_ENUM.COMPLETE;
                    radio.send(respMsg);// send to radio immediately,not upload
                } catch (e) {
                    // Hey,native,you have only one chance,
                    // I will never echo if you missed.
                    newState = READY_STATE_ENUM.ERROR;
                    Logger.error(e.message);
                } finally {
                    self.changeState(newState);
                }
            }).on('response', function (evt, respMsg) {
                upload(respMsg);
            }).flow();
        });
    });

    // webview -> native
    messageQueueToNative.on('push', () => {
        // Release webview thread
        asap(() => {
            if (READY_STATE_ENUM.COMPLETE === readyState) {
                const message = messageQueueToNative.pop();

                if (message) {
                    radio.send(message);
                }
            }
        });
    });

    extend(this, new Event());

    this.on('statechange', function (evt, state) {
        // Export first because we trigger "bridgeReady" right now
        export2Webview();

        if (state === READY_STATE_ENUM.COMPLETE) {
            // Bridge is ready,native receiving works immediately
            this.flush2Native();
            // Trigger bridge ready because we should
            // give business the time to add some listeners.
            bridgeReady();
            // Then push webview to handle the other data beyond handshake
            this.flush2Webview();
        } else if (state === READY_STATE_ENUM.ERROR) {
            // When error,just notify business about this
            bridgeReady();
        }
    }, this);

    // Wait only few seconds for the handshake from native
    handshakeTimeout = setTimeout(() => {
        self.changeState(READY_STATE_ENUM.ERROR);
        Logger.error('TIMEOUT:' + HANDSHAKE_TIMEOUT);
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
            const message = Message.fromMetaString(messageStr);
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
        if (READY_STATE_ENUM.COMPLETE == readyState) {
            window[webviewExport] = {
                readyState: readyState,
                /**
                 * Register API for native.
                 *
                 * @todo test
                 * @return {this}
                 */
                register: () => {
                    Api.register.apply(Api, arguments);
                    return window[webviewExport];
                }
            };

            for (let cmdKey in IDL) {
                let cmd = IDL[cmdKey];
                for (let methodKey in cmd) {
                    let method = cmd[methodKey];
                    let args = method.arguments.split(',');
                    (window[webviewExport][cmdKey] || (window[webviewExport][cmdKey] = {}))[methodKey] = () => {
                        const inputData = {};
                        const timeout = arguments[arguments.length - 1];

                        args.forEach((arg, idx) => {
                            inputData[arg] = arguments[idx];
                        });

                        return new Promise((resolve, reject) => {
                            const msg = new RequestMessage({
                                cmd: cmdKey,
                                method: methodKey,
                                inputData: inputData
                            }, timeout).on('data', (evt) => {
                                resolve(evt.data);
                            }).on('error', (evt) => {
                                reject(evt.data);
                            });

                            upload(msg);
                        });
                    };
                }
            }
        } else {
            window[webviewExport] = {
                readyState: readyState
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
         * Change readyState.
         * 
         * @param  {number} state
         * @version 1.0.0
         * @since 1.0.0
         */
        changeState: function (state) {
            if (READY_STATE_ENUM.PENDING !== readyState) {
                throw new Error('State error');
            }
            this.emit('statechange', readyState = state);
        },
        /**
         * flush2Native.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        flush2Native: () => {
            while (!messageQueueToNative.empty()) {
                messageQueueToNative.emit('push');
            }
        },
        /**
         * flush2Webview
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        flush2Webview: () => {
            while (!messageQueueFromNative.empty()) {
                messageQueueFromNative.emit('push');
            }
        }
    });
}; // Bridge

if (!window.__tb_js_bridge) {
    // Construct
    new Bridge('__tb_js_bridge', 'TiebaJsBridge', 'ctieba://');
}