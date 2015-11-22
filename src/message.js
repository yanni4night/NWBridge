/**
 * Copyright (C) 2015 tieba.baidu.com
 * message.js
 *
 * changelog
 * 2015-11-18[22:47:12]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

import {Api} from './api';
import {extend} from './extend';
import {Callback} from './callback';
import {Event} from './event';

const MESSAGE_TYPE = Message.MESSAGE_TYPE = {
    REQUEST: 0x1,
    RESPONSE: 0x2,
    HANDSHAKE: 0x3
};

export function Message(metaData) {
    extend(this, {
        messageType: MESSAGE_TYPE.REQUEST,
        cmd: undefined,
        method: undefined,
        callbackId: undefined,
        inputData: undefined,
        outputData: undefined
    }, {
        priority: 0
    }, metaData, new Event());

    if (MESSAGE_TYPE.HANDSHAKE === this.messageType) {
        ++this.priority;
    }
}

Message.prototype.assemble = function () {
    return {
        messageType: this.messageType,
        cmd: this.cmd,
        method: this.method,
        inputData: this.inputData,
        outputData: this.outputData,
        callbackId: this.callbackId
    };
};

Message.prototype.serialize = function () {
    return JSON.stringify(this.assemble());
};

Message.prototype.isInvalid = function () {
    return (this.messageType !== MESSAGE_TYPE.REQUEST && this.messageType !== MESSAGE_TYPE.RESPONSE && this.messageType !==
        MESSAGE_TYPE.HANDSHAKE) || (MESSAGE_TYPE.RESPONSE === this.messageType && !this.callbackId) || (
        MESSAGE_TYPE.REQUEST == this.messageType && (!this.cmd || this.method));
};

Message.prototype.flow = function () {
    var respMsg;
    var isHandShake = false;

    switch (this.messageType) {
    case MESSAGE_TYPE.HANDSHAKE:
        respMsg = new ResponseMessage(extend(this.assemble(), {
            outputData: {
                errNo: 0,
                errMsg: 'success',
                data: {
                    cookieEnabled: new Api('cookie', 'enabled').invoke(),
                    url: new Api('location', 'href').invoke(),
                    localStorageEnabled: new Api('localStorage', 'enabled').invoke(),
                    ua: new Api('navigator', 'getUserAgent').invoke()
                }
            }
        }));
        isHandShake = true;
        break;
    case MESSAGE_TYPE.REQUEST:
        var api = new Api(this.cmd, this.method, this.inputData);
        var ret;
        var success = false;

        try {
            ret = api.invoke();
            success = true;
        } catch (e) {
            // TODO:log
        } finally {
            respMsg = new ResponseMessage(extend(this.assemble(), {
                outputData: {
                    errNo: success ? 0 : -1,
                    errMsg: success ? 'success' : 'failed',
                    data: ret || {}
                }
            }));
        }
        break;
    case MESSAGE_TYPE.RESPONSE:
        var callback = Callback.findById(this.callbackId);

        try {
            callback.invoke(this.outputData);
        } catch (e) {
            console.log('FINDCALL', e);
        }

        // Should response have a callback?
        break;
    default:
        //TODO
        ;
    }

    if (isHandShake) {
        this.emit('handshake', this);
    }

    if (respMsg) {
        this.emit('response', respMsg);
    }
    return this;
};

Message.fromMetaString = function (metaString) {
    var metaData = JSON.parse(metaString);
    return new Message(metaData);
};

export function RequestMessage(metaData, timeout) {
    var self;

    var defaultTimeout = 3e3;

    timeout = (timeout | 0) || defaultTimeout;
    if (timeout < 500 || timeout > 1e4) {
        timeout = defaultTimeout;
    }

    var hasTimeout = false;

    var timeoutBundler = setTimeout(function () {
        hasTimeout = true;
        self.emit('error', new Error('Timeout'));
    }, timeout);

    var callback = new Callback(function (err, data) {
        clearTimeout(timeoutBundler);
        if (!hasTimeout) {
            if (err) {
                self.emit('error', err);
            } else {
                self.emit('data', data);
            }
        }

    });

    return (self = new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.REQUEST,
        callbackId: callback.getId()
    })));
}

export function ResponseMessage(metaData) {
    return new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.RESPONSE
    }));
}