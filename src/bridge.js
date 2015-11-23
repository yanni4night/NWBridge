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
const Bridge = function Bridge(nativeExport, webviewExport, scheme) {

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

    var domReadyTriggered = false;

    /**
     * Notify document that bridge is ready.
     *
     * This operation will be triggered only ONCE.
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    const domReady = function () {
        const evtData = {};

        if(domReadyTriggered) {
            return;
        }

        evtData[webviewExport.replace(/^([A-Z])/, function (n) {
            return n.toLowerCase();
        })] = window[webviewExport];
        DomEvent.trigger(webviewExport + 'Ready', evtData);
        domReadyTriggered = true;
    };
    /**
     * Send message from bridge to native.
     * 
     * @param  {Message} message
     * @version 1.0.0
     * @since 1.0.0
     */
    const upload = function (message) {
        messageQueueToNative.push(message);
    };
    // native -> webview
    messageQueueFromNative.on('push', function () {
        setTimeout(function () {
            // Make sure messgae flows in the right order as pushed
            var message = messageQueueFromNative.top();
            var shouldFlow = true;

            if (undefined === message || READY_STATE_ENUM.ERROR === readyState) {
                shouldFlow = false;
                // Handshake is always on the top;
            } else if (message.isHandShake()) {
                if (READY_STATE_ENUM.PENDING === readyState) {
                    shouldFlow = true;
                } else {
                    // Ignore duplicated handshakes
                    messageQueueFromNative.pop();
                    shouldFlow = false;
                }
            } else if (READY_STATE_ENUM.PENDING === readyState) {
                shouldFlow = true;
            }

            if (!shouldFlow || (undefined === (message = messageQueueFromNative.pop()))) {
                return;
            }
            message.on('handshake', function () {
                var newState;
                clearTimeout(handshakeTimeout);

                try {
                    radio = new Radio((message.inputData || {}).platform, scheme);
                    newState = READY_STATE_ENUM.COMPLETE;
                } catch (e) {
                    // Hey,native,you have only one chance,
                    // or I will never echo.
                    newState = READY_STATE_ENUM.ERROR;
                } finally {
                    self.changeState(newState);
                }
            }).on('response', function (evt, respMsg) {
                upload(respMsg);
            }).flow();
        });
    });

    // webview -> native
    messageQueueToNative.on('push', function () {
        setTimeout(function () {
            if (READY_STATE_ENUM.COMPLETE === readyState) {
                const message = messageQueueToNative.pop();

                if (message) {
                    // Release webview thread
                    radio.send(message);
                }
            }
        });
    });

    extend(this, new Event());

    this.on('statechange', function (evt, state) {
        if (state === READY_STATE_ENUM.COMPLETE) {
            extend(window[nativeExport], radio.extension);
            this.flush2Native();
            this.flush2Webview();
        }

        domReady();
    }, this);

    // Wait only few seconds for the handshake from native
    handshakeTimeout = setTimeout(function () {
        self.changeState(READY_STATE_ENUM.ERROR);
    }, 2e3);

    // Export to native
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
            const message = Message.fromMetaString(messageStr);
            if (!message.isInvalid()) {
                messageQueueFromNative.push(message);
            }
        }
    };

    var oldWvExport = window[webviewExport];
    // Export to webview
    window[webviewExport] = {
        readyState: readyState,
        /**
         * Register API for native.
         *
         * @todo test
         * @return {this}
         */
        register: function () {
            Api.register.apply(Api, arguments);
            return window[webviewExport];
        },
        widgets: {
            confirm: function (confirmMessage) {
                return new Promise(function (resolve, reject) {
                    const msg = new RequestMessage({
                        cmd: 'widgets',
                        method: 'confirm',
                        inputData: confirmMessage
                    }).on('data', function (evt) {
                        resolve(/^(yes|true|1|comfirmed)$/i.test(evt.data));
                    }).on('error', function (evt) {
                        reject(evt.data);
                    });

                    upload(msg);
                });
            }
        },
        http: {
            get: function (url, cookies) {
                return new Promise(function (resolve) {
                    const msg = new RequestMessage({
                        cmd: 'http',
                        method: 'get',
                        inputData: {
                            url: url,
                            cookies: cookies || {}
                        }
                    }).on('data', function (evt) {
                        resolve(evt.data);
                    }).on('error', function (evt) {
                        reject(evt.data);
                    });

                    upload(msg);
                });
            }
        }
    };


    /**
     * Similar to jQuery.noConflict
     *
     * @version 1.0.0
     * @since 1.0.0
     */
    window[webviewExport].noConflict = function () {
        if (undefined !== oldWvExport) {
            window[webviewExport] = oldWvExport;
        }
    };

    extend(Bridge.prototype, {
        /**
         * Change readyState.
         * 
         * @param  {number} state
         * @version 1.0.0
         * @since 1.0.0
         */
        changeState: function (state) {
            if(READY_STATE_ENUM.PENDING!==readyState){
                throw new Error('State error');
            }
            window[webviewExport].readyState = readyState = state;
            this.emit('statechange', state);
        },
        /**
         * flush2Native.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        flush2Native: function () {
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
        flush2Webview: function () {
            while (!messageQueueFromNative.empty()) {
                messageQueueFromNative.emit('push');
            }
        }
    });
}; // Bridge

// Construct
new Bridge('__tb_js_bridge', 'TiebaJsBridge', 'tieba://');
