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
    }, metaData)
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

Message.prototype.toResponse = function () {
    this.messageType = MESSAGE_TYPE.RESPONSE;
    return this;
};

Message.prototype.toRequest = function () {
    this.messageType = MESSAGE_TYPE.REQUEST;
    return this;
};

Message.prototype.serialize = function () {
    return JSON.stringify(this.assemble());
};

Message.prototype.flow = function () {
    switch (this.messageType) {
    case MESSAGE_TYPE.HANDSHAKE:
        return new Message({
            messageType: MESSAGE_TYPE.HANDSHAKE,
            callbackId: this.callbackId,
            cmd: this.cmd,
            method: this.method,
            inputData: this.inputData,
            outputData: {
                errNo: 0,
                errMsg: 'success',
                data: {
                    //DOTO
                }
            }
        });
        break;
    case MESSAGE_TYPE.REQUEST:
        var api = new Api(this.cmd, this.method, this.inputData);
        var ret;

        try {
            ret = api.invoke();
        } catch (e) {
            ret = null;
        } finally {
            return new Message({
                messageType: MESSAGE_TYPE.RESPONSE,
                callbackId: this.callbackId,
                cmd: this.cmd,
                method: this.method,
                inputData: this.inputData,
                outputData: {
                    errNo: 0,
                    errMsg: ret ? 'success' : 'failed',
                    data: ret
                }
            });
        }
        break;
    case MESSAGE_TYPE.RESPONSE:
        var callback = Callback.findById(this.callbackId);
        try {
            callback.invoke(this.outputData.data);
        } catch (e) {}
        break;
    default:
        //TODO
        ;
    }
};

Message.fromMetaString = function (metaString) {
    var metaData = JSON.parse(metaString);
    return new Message(metaData);
};

function RequestMessage(metaData) {
    return new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.REQUEST
    }));
}

function ResponseMessage(metaData) {
    return new Message(extend(metaData, {
        messageType: MESSAGE_TYPE.RESPONSE
    }));
}

export Message, RequestMessage, ResponseMessage;