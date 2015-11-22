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

var READY_STATE_ENUM = {
    PENDING: 'pending',
    COMPLETE: 'complete',
    ERROR: 'error'
};

var messageQueueFromNative = new PriorityQueue({
    priorityKey: 'priority'
});

var messageQueueToNative = new Queue({
    limit: 5
});

var readyState = READY_STATE_ENUM.PENDING;

var nativeInterface;

var handshakeTimeout;

function domReady() {
    DomEvent.trigger('TiebaJsBridgeReady', {
        tiebaJsBridge: TiebaJsBridge
    });
}

/**
 * send data from bridge to native
 * @param  {Message} message [description]
 */
function upload(message) {
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
                    // Receiving a handshake indicates ready
                    window.TiebaJsBridge.readyState = readyState = READY_STATE_ENUM.COMPLETE;

                    try {
                        nativeInterface = new Native((message.inputData || {}).platform);
                    } catch (e) {
                        window.TiebaJsBridge.readyState = readyState = READY_STATE_ENUM.ERROR;
                    }
                    // Notify ready
                    domReady();

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

handshakeTimeout = setTimeout(function() {
    window.TiebaJsBridge.readyState = readyState = READY_STATE_ENUM.ERROR;
    domReady();
}, 2e3);

// webview -> native
messageQueueToNative.on('push', function() {
    if (READY_STATE_ENUM.COMPLETE === readyState) {
        // Release webview thread
        setTimeout(function() {
            var msg = messageQueueToNative.pop();
            nativeInterface.send(msg.serialize() /*Just for Android*/ );
        });
    }
});

// export
extend(window, {
    '__tb_js_bridge': {
        send: function(messageStr) {
            // TODO[IMPORTANT]: Highest priority for handshake
            var message = Message.fromMetaString(messageStr);
            if (!message.isInvalid()) {
                messageQueueFromNative.push(message);
            }
        },
        fetch: function() {
            var ret = messageQueueToNative.serialize();
            messageQueueToNative.clear();
            return ret;
        }
    },
    'TiebaJsBridge': {
        readyState: readyState,
        register: function() {
            Api.register.apply(Api, arguments);
            return window.TiebaJsBridge;
        },
        widgets: {
            confirm: function(confirmMessage) {
                return new Promise(function(resolve, reject) {
                    var msg = new RequestMessage({
                        cmd: 'widgets',
                        method: 'confirm',
                        inputData: confirmMessage
                    }).on('data', function(evt) {
                        resolve(/^(yes|true|1|comfirmed)$/i.test(evt.data));
                    }).on('error', function(evt) {
                        reject(evt.data);
                    });

                    upload(msg);
                });
            }
        },
        http: {
            get: function(url, cookies) {
                return new Promise(function(resolve) {
                    var msg = new RequestMessage({
                        cmd: 'http',
                        method: 'get',
                        inputData: {
                            url: url,
                            cookies: cookies || {}
                        }
                    }).on('data', function(evt) {
                        resolve(evt.data);
                    }).on('error', function(evt) {
                        reject(evt.data);
                    });

                    upload(msg);
                });
            }
        }
    }
});