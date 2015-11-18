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
import Event from './dom-event';
import extend from './extend';
import Queue from './queue';
import {
    Message, RequestMessage
}
from './message';
import Native from './native';
import Api from './api';
import Callback from './callback';

var READY_STATE_ENUM = {
    PENDING: 'pending',
    COMPLETE: 'complete',
    ERROR: 'error'
};

var callbacks = {};

var messageQueueFromNative = new Queue();
var messageQueueToNative = new Queue();
var messageQueueFromWebview = new Queue();
var messageQueueToWebview = new Queue();

var readyState = READY_STATE_ENUM.PENDING;

var native = new Native('ios'); // TODO
/**
 * send data from bridge to native
 * @param  {Message} message [description]
 */
var upload = function (message) {
    native.send(message.serialize());
};

var dispatch = function () {
    var message = messageQueueFromNative.pop();

    if (!message) {
        return;
    }

    var newMessage = message.flow();
    if (newMessage) {
        upload(newMessage);
    }

};

var startup = function () {};

/**
 * Sending to bridge by native.
 * @param  {string} message
 */
var send = function (message /*string*/ ) {
    messageQueueFromNative.push(Message.fromMetaString(message));
    if (READY_STATE_ENUM.COMPLETE === readyState) {
        // Release native thread
        setTimeout(function () {
            dispatch();
        });
    }
};
/**
 * Fetching from bridge by native.
 * @return {string}
 */
var fetch = function () {
    return messageQueueToNative.serialize();
};

// new API
// 
//Api.register = function(){};


// export
extend(window, {
    '__tb_js_bridge': {
        send: send,
        fetch: fetch
    },
    'TbJsBridge': {
        readyState: readyState,
        widgets: {
            confirm: function () {
                return new Promise(function (resolve) {
                    var cb = new Callback(function (comfirmed) {
                        resolve(/^(yes|true|1|comfirmed)$/i.test(comfirmed))
                    });

                    upload(new RequestMessage({
                        cmd: 'widgets',
                        method: 'confirm',
                        callbackId: cb.getId()
                    }));
                });
            }
        },
        http: {
            get: function () {
                return new Promise(function (resolve) {
                    var cb = new Callback(function (data) {
                        resolve(/^(yes|true|1|comfirmed)$/i.test(comfirmed))
                    });

                    upload(new RequestMessage({
                        cmd: 'widgets',
                        method: 'confirm',
                        callbackId: cb.getId()
                    }));
                });
            }
        }
    }
});