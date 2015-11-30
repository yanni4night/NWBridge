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


function ServerBridge(nativeExport, scheme) {

    var CHANNEL_ID = 'server' + nativeExport;

    var supports = {
        testCmd: {
            doTest: function (data) {
                return data.testArg;
            }
        }
    };

    function send(msgObj) {
        window[nativeExport].send(msgObj.serialize());
    }
    var oldPrompt = window.prompt;
    window.prompt = function (messageStr) {
        if (messageStr.indexOf(scheme)) {
            return oldPrompt.apply(window, arguments);
        }

        var message = Message.fromMetaString(messageStr.replace(scheme, ''), CHANNEL_ID);

        if (message.messageType === Message.MESSAGE_TYPE.RESPONSE) {
            if ('handshake' === message.cmd) {
                send(new RequestMessage(CHANNEL_ID, {
                    cmd: 'kernel',
                    method: 'notifyConnected'
                }));
            }
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
        cmd: 'handshake',
        inputData: {
            platform: 'android'
        }
    }).on('response', function () {});

    this.handshake = function () {
        console.info(CHANNEL_ID, 'mock send handShakeMessage');
        send(handShakeMessage);
    };
}

exports.ServerBridge = ServerBridge;
