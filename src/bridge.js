/**
 * Copyright (C) 2015 tieba.baidu.com
 * bridge.js
 *
 * changelog
 * 2015-11-18[16:16:12]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */
import {DomEvent} from './dom-event';
import {extend} from './extend';
import {Queue, PriorityQueue} from './queue';
import {Message, RequestMessage} from './message';
import {Native} from './native';
import {Api} from './api';
import {Callback} from './callback';
import {Promise} from './promise';

const READY_STATE_ENUM = {
    PENDING: 'pending',
    COMPLETE: 'complete',
    ERROR: 'error'
};

const Bridge = function Bridge(nativeExport, webviewExport, scheme) {

    const self = this;

    const messageQueueFromNative = new PriorityQueue({
        priorityKey: 'priority'
    });

    const messageQueueToNative = new Queue({
        limit: 5
    });

    var readyState = READY_STATE_ENUM.PENDING;

    var native;

    var handshakeTimeout;

    const domReady = function () {
            var evtData = {};
            evtData[webviewExport.replace(/^([A-Z])/, function (n) {
                return n.toLowerCase();
            })] = window.TiebaJsBridge;
            DomEvent.trigger(webviewExport + 'Ready', evtData);
        }
        /**
         * send data from bridge to native
         * @param  {Message} message [description]
         */
    const upload = function (message) {
            messageQueueToNative.push(message);
        }
        // native -> webview
    messageQueueFromNative.on('push', function () {
        var message;

        if (READY_STATE_ENUM.PENDING === readyState) {
            // "pop" MUST be out of "setTimeout"
            message = messageQueueFromNative.pop();
            if (message) {
                // Release native thread
                setTimeout(function () {
                    message.on('handshake', function () {
                        clearTimeout(handshakeTimeout);

                        try {
                            native = new Native((message.inputData || {}).platform, scheme);

                            self.changeState(READY_STATE_ENUM.COMPLETE);
                        } catch (e) {
                            self.changeState(READY_STATE_ENUM.ERROR);
                        } finally {
                            domReady();
                        }

                    }).on('response', function (evt, respMsg) {
                        upload(respMsg);
                    }).flow();
                });
            }
        } else if (READY_STATE_ENUM.COMPLETE === readyState) {
            // "pop" MUST be out of "setTimeout"
            message = messageQueueFromNative.pop();
            if (message) {
                // Release native thread
                setTimeout(function () {
                    message.on('response', function (evt, respMsg) {
                        upload(respMsg);
                    }).flow();
                });
            }
        }
    });

    handshakeTimeout = setTimeout(function () {
        self.changeState(READY_STATE_ENUM.COMPLETE);
        domReady();
    }, 2e3);

    // webview -> native
    messageQueueToNative.on('push', function () {
        if (READY_STATE_ENUM.COMPLETE === readyState) {
            // Release webview thread
            setTimeout(function () {
                var msg = messageQueueToNative.pop();
                native.send(msg.serialize() /*Just for Android*/ );
            });
        }
    });


    // Export to native
    window[nativeExport] = {
        send: function (messageStr) {
            var message = Message.fromMetaString(messageStr);
            if (!message.isInvalid()) {
                messageQueueFromNative.push(message);
            }
        },
        fetch: function () {
            var ret = messageQueueToNative.serialize();
            messageQueueToNative.clear();
            return ret;
        }
    };

    // Export to webview
    window[webviewExport] = {
        readyState: readyState,
        register: function () {
            Api.register.apply(Api, arguments);
            return window.TiebaJsBridge;
        },
        widgets: {
            confirm: function (confirmMessage) {
                return new Promise(function (resolve, reject) {
                    var msg = new RequestMessage({
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
                    var msg = new RequestMessage({
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

    extend(Bridge.prototype, {
        changeState: function (state) {
            window[webviewExport].readyState = readyState = state;
        }
    });
}; // Bridge

// Construct
new Bridge('__tb_js_bridge', 'TiebaJsBridge', 'tieba://');