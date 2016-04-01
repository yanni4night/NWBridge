/**
 * Copyright (C) 2015~2016 yanni4night.com
 * server.js
 *
 * changelog
 * 2015-11-20[13:02:26]:revised
 * 2016-03-17[13:18:43]:rename to server
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {Message} from '../src/message';
import {ResponseMessage} from '../src/message';
import {RequestMessage} from '../src/message';
import {extend} from '../src/extend';
import {Event as XEvent} from '../src/event';


export function ServerBridge(nativeExport, scheme) {

    const self = this;

    const CHANNEL_ID = 'server' + nativeExport + Date.now().toString(36).toUpperCase();

    const supports = {};

    const send = this.send = msgObj => window[nativeExport].send(msgObj.serialize());

    extend(this, new XEvent());

    const oldPrompt = window.prompt;

    window.prompt = messageStr => {
        if (messageStr.indexOf(scheme)) {
            return oldPrompt.call(window, messageStr);
        }

        const message = Message.fromMetaString(messageStr.replace(scheme, ''), CHANNEL_ID);

        if (message.messageType === Message.MESSAGE_TYPE.PING) {
            self.emit('ping', message);
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

    let pingMessage = new Message(CHANNEL_ID, {
        messageType: Message.MESSAGE_TYPE.PING,
        inputData: {
            platform: 'android',
            logid: 'HKJFHUIRW',
            version: '1.0.0'
        },
        callbackId: 'mock_ping_id'
    });

    this.ping = function () {
        send(pingMessage);
    };

    this.createRequestMessage = function (config) {
        return new RequestMessage(CHANNEL_ID, config);
    };

    this.register = function (cmd, method, func) {
        supports[cmd] = supports[cmd] || {};
        supports[cmd][method] = func;
    };
}

extend(ServerBridge, {
    Message: Message,
    ResponseMessage: ResponseMessage,
    RequestMessage: RequestMessage
});