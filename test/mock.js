/**
 * Copyright (C) 2015 tieba.baidu.com
 * mock.js
 *
 * changelog
 * 2015-11-20[13:02:26]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

require('./case');
require('../dist/bridge');
var Message = require('../dist/message').Message;
var ResponseMessage = require('../dist/message').ResponseMessage;
var extend = require('../dist/extend').extend;

var supports = {
    widget: {
        toast: function (data) {
            return data.toastMessage;
        }
    }
};

function send(msgObj) {
    window.__tb_js_bridge.send(JSON.stringify(msgObj.assemble()));
}

window.prompt = function (messageStr) {
    var message = Message.fromMetaString(messageStr.replace(/^tieba:\/\//i, ''));

    if (message.messageType !== Message.MESSAGE_TYPE.REQUEST) {
        return;
    }
    
    if (supports[message.cmd] && supports[message.cmd][message.method]) {
        send(new ResponseMessage(extend(message.assemble(), {
            outputData: {
                errNo: 0,
                errMsg: 'success',
                data: supports[message.cmd][message.method](message.inputData)
            }
        })));
    } else {
        send(new ResponseMessage(extend(message.assemble, {
            outputData: {
                errNo: -1,
                errMsg: 'Not found',
                data: null
            }
        })));
    }
};


var handShakeMessage = new Message({
    messageType: Message.MESSAGE_TYPE.HANDSHAKE,
    inputData: {
        platform: 'android'
    }
}).on('response', function () {});

send(handShakeMessage);
