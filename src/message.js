/**
 * Copyright (C) 2015 yanni4night.com
 * message.js
 *
 * changelog
 * 2015-11-18[22:47:12]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {Api} from './api';
import {extend} from './extend';
import {Callback} from './callback';
import {Event} from './event';
import {Logger} from './logger';

const MESSAGE_TYPE = Message.MESSAGE_TYPE = {
    REQUEST: 'request',
    RESPONSE: 'response',
    HANDSHAKE: 'handshake'
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
extend(Message.prototype, {
    isHandShake: function () {
        return this.messageType === MESSAGE_TYPE.HANDSHAKE;
    },
    assemble: function () {
        return {
            messageType: this.messageType,
            cmd: this.cmd,
            method: this.method,
            inputData: this.inputData,
            outputData: this.outputData,
            callbackId: this.callbackId
        };
    },
    serialize: function () {
        return JSON.stringify(this.assemble());
    },
    isInvalid: function () {
        return (this.messageType !== MESSAGE_TYPE.REQUEST && this.messageType !== MESSAGE_TYPE.RESPONSE &&
                this.messageType !==
                MESSAGE_TYPE.HANDSHAKE) || (MESSAGE_TYPE.RESPONSE === this.messageType && !this.callbackId) ||
            (
                MESSAGE_TYPE.REQUEST == this.messageType && (!this.cmd || !this.method));
    },
    flow: function () {
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
                Logger.error('FLOW REQUEST:' + e.message);
            } finally {
                if (this.callbackId) {
                    respMsg = new ResponseMessage(extend(this.assemble(), {
                        outputData: {
                            errNo: success ? 0 : -1,
                            errMsg: success ? 'success' : 'failed',
                            data: ret || {}
                        }
                    }));
                }
            }
            break;
        case MESSAGE_TYPE.RESPONSE:
            var callback = Callback.findById(this.callbackId);

            try {
                callback.invoke(this.outputData);
            } catch (e) {
                console.error('FLOW RESPONSE:', e.message);
            }

            break;
        default:
            Logger.warn('UNKNOWN TYPE:' + this.messageType);
        }

        if (isHandShake) {
            return this.emit('handshake', respMsg);
        }

        if (respMsg) {
            this.emit('response', respMsg);
        }
        return this;
    }
});

Message.fromMetaString = function (metaString) {
    var metaData;
    // Ignore invalid
    try {
        metaData = JSON.parse(metaString);
    } catch (e) {
        metaData = {}
    }
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

    var timeoutBundler = setTimeout(() => {
        hasTimeout = true;
        callback.remove();
        self.emit('error', new Error('Timeout'));
    }, timeout);

    var callback = new Callback((err, data) => {
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
