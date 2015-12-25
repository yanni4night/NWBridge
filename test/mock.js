/**
 * Copyright (C) 2015 yanni4night.com
 * mock.js
 *
 * changelog
 * 2015-11-20[13:02:26]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

require('../dist/bridge');
var Message = require('../dist/message').Message;
var ResponseMessage = require('../dist/message').ResponseMessage;
var RequestMessage = require('../dist/message').RequestMessage;
var extend = require('../dist/extend').extend;
var XEvent = require('../dist/event').Event;


function ServerBridge(nativeExport, scheme) {

    var self = this;

    var CHANNEL_ID = 'server' + nativeExport;

    var supports = {
        shareCmd: {
            shareByHybrid: function (data) {
                return data;
            }
        }
    };

    var send = this.send = function (msgObj) {
        window[nativeExport].send(msgObj.serialize());
    };

    extend(this, new XEvent());

    var oldPrompt = window.prompt;

    window.prompt = function (messageStr) {
        if (messageStr.indexOf(scheme)) {
            return oldPrompt.apply(window, arguments);
        }

        var message = Message.fromMetaString(messageStr.replace(scheme, ''), CHANNEL_ID);

        if (message.messageType === Message.MESSAGE_TYPE.HANDSHAKE) {
            //if ('handshake' === message.cmd) {
            send(new RequestMessage(CHANNEL_ID, {
                cmd: 'kernel',
                method: 'notifyConnected'
            }));
            //} 
            return;
        }

        if (message.messageType === Message.MESSAGE_TYPE.RESPONSE) {
            self.emit('response', message);
            return;
        }

        if (supports[message.cmd] && supports[message.cmd][message.method]) {
            send(new ResponseMessage(CHANNEL_ID, extend(message.assemble(), {
                outputData: {
                    errNo: 0,
                    errMsg: 'success',
                    data: supports[message.cmd][message.method](message.inputData)
                }
            })));
        } else {
            send(new ResponseMessage(CHANNEL_ID, extend(message.assemble(), {
                outputData: {
                    errNo: -1,
                    errMsg: 'Not found',
                    data: null
                }
            })));
        }
    };

    var handShakeMessage = new Message(CHANNEL_ID, {
        messageType: Message.MESSAGE_TYPE.HANDSHAKE,
        //cmd: 'handshake',
        inputData: {
            platform: 'android',
            logid: 'HKJFHUIRW',
            version: '1.0.0',
            switch: 'true'
        },
        callbackId: 'mock_handshake_id'
    });

    this.handshake = function () {
        console.info(CHANNEL_ID, 'mock send handShakeMessage');
        send(handShakeMessage);
    };

    this.createRequestMessage = function (config) {
        return new RequestMessage(CHANNEL_ID, config);
    };
}

exports.ServerBridge = ServerBridge;