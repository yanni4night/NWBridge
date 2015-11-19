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

import Api from './api';
import extend from './extend';
import Callback from './callback';
import Event from './event';

var MESSAGE_TYPE = {
    REQUEST: 0x1,
    RESPONSE: 0x2,
    HANDSHAKE: 0x3
};

function Message(metaData) {
    extend(this, {
        messageType: MESSAGE_TYPE.REQUEST,
        cmd: '',
        method: '',
        callbackId: '',
        inputData: {},
        outputData: {
            errNo: 0,
            errMsg: '',
            data: {}
        }
    }, metaData, new Event());
}

Message.prototype.assemble = function() {
    return {
        messageType: this.messageType,
        cmd: this.cmd,
        method: this.method,
        inputData: this.inputData,
        outputData: this.outputData,
        callbackId: this.callbackId
    };
};

Message.prototype.serialize = function() {
    return JSON.stringify(this.assemble());
};

Message.prototype.flow = function() {
    var respMsg;
    switch (this.messageType) {
        case MESSAGE_TYPE.HANDSHAKE:
            respMsg = new ResponseMessage(extend(this.assemble(), {
                outputData: {
                    errNo: 0,
                    errMsg: 'success',
                    data: {
                        // TODO
                    }
                }
            }));
            this.emit('handshake', this);
            break;
        case MESSAGE_TYPE.REQUEST:
            var api = new Api(this.cmd, this.method, this.inputData);
            var ret;

            try {
                ret = api.invoke();
            } catch (e) {
                ret = null;
            } finally {
                respMsg = new ResponseMessage(extend(this.assemble(), {
                    outputData: {
                        errNo: ret ? 0 : -1,
                        errMsg: ret ? 'success' : 'failed',
                        data: ret
                    }
                }));
            }
            break;
        case MESSAGE_TYPE.RESPONSE:
            var callback = Callback.findById(this.callbackId);

            try {
                callback.invoke(this.outputData);
            } catch (e) {}

            // Should response have a callback?
            break;
        default:
            //TODO
            ;
    }

    if (respMsg) {
        this.emit('response', respMsg);
    }
    return this;
};

Message.fromMetaString = function(metaString) {
    var metaData = JSON.parse(metaString);
    return new Message(metaData);
};

function RequestMessage(metaData, timeout) {
    var self = this;

    var defaultTimeout = 3e3;

    timeout = (timeout | 0) || defaultTimeout;
    if (timeout < 500 || timeout > 1e4) {
        timeout = defaultTimeout;
    }

    var hasTimeout = false;

    var timeoutBundler = setTimeout(function() {
        hasTimeout = true;
        self.emit('error', new Error('Timeout'));
    }, timeout);

    var callback = new Callback(function(err, data) {
        clearTimeout(timeoutBundler);
        if (!hasTimeout) {
            if (err) {
                self.emit('error', err);
            } else {
                self.emit('data', data);
            }
        }

    });

    return new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.REQUEST,
        callbackId: callback.getId()
    }));
}

function ResponseMessage(metaData) {
    return new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.RESPONSE
    }));
}

export Message, RequestMessage, ResponseMessage