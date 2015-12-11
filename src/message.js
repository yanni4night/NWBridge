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
/*global Message, RequestMessage, ResponseMessage*/

import {Api} from './api';
import {extend} from './extend';
import {Callback} from './callback';
import {Event} from './event';
import {Logger} from './logger';
import {Radio} from './radio';

const MESSAGE_TYPE = Message.MESSAGE_TYPE = {
    REQUEST: 'request',
    RESPONSE: 'response',
    HANDSHAKE: 'handshake'
};

/**
 * Custom message class
 * @param {object} metaData
 * @version 1.0.0
 * @since 1.0.0
 */
export function Message(channelId, metaData) {
    extend(this, {
        messageType: MESSAGE_TYPE.REQUEST,
        cmd: undefined,
        method: undefined,
        callbackId: undefined,
        inputData: undefined,
        outputData: undefined
    }, {
        channelId: channelId,
        priority: 0
    }, metaData, new Event());

    if (this.isHandShake()) {
        this.priority += 2;
    } else if (this.isHandBack()) {
        this.priority += 1;
    }
}

extend(Message.prototype, {

    /**
     * Return if it's a handshake.
     * 
     * @return {Boolean}
     * @version 1.0.0
     * @since 1.0.0
     */
    isHandShake: function () {
        return this.messageType === MESSAGE_TYPE.HANDSHAKE;
    },

    /**
     * Return if it's a handback message.
     * 
     * @return {Boolean}
     * @version 1.0.0
     * @since 1.0.0
     */
    isHandBack: function () {
        return 'kernel' === this.cmd && 'notifyConnected' === this.method;
    },

    /**
     * Assemble meta data into a plain object.
     * 
     * @return {object}
     * @version 1.0.0
     * @since 1.0.0
     */
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

    /**
     * Return the string type of it's meta data.
     * 
     * @return {string}
     * @version 1.0.0
     * @since 1.0.0
     */
    serialize: function () {
        return JSON.stringify(this.assemble());
    },

    /**
     * If it's an invalid message.
     * 
     * @return {Boolean}
     * @version 1.0.0
     * @since 1.0.0
     */
    isInvalid: function () {
        return (this.messageType !== MESSAGE_TYPE.REQUEST && this.messageType !== MESSAGE_TYPE.RESPONSE &&
                this.messageType !==
                MESSAGE_TYPE.HANDSHAKE) || (MESSAGE_TYPE.RESPONSE === this.messageType && !this.callbackId) ||
            (
                MESSAGE_TYPE.REQUEST === this.messageType && (!this.cmd || !this.method));
    },

    /**
     * Flow this message.
     * 
     * @return {this}
     * @version 1.0.0
     * @since 1.0.0
     */
    flow: function () {
        var respMsg;
        var isHandShake = false;
        var err;

        switch (this.messageType) {
        case MESSAGE_TYPE.HANDSHAKE:
            // notify logid first
            if (this.inputData) {
                this.emit('system', this.inputData);
            }

            if (!this.inputData) {
                err = new Error('No inputData in handshake');
            }
            /*else if (!this.inputData.logid) {
                           err = new Error('No logid in handshake');
                       }*/
            else if (!this.inputData.version) {
                err = new Error('No version in handshake');
            } else if (!this.inputData.platform) {
                err = new Error('No platform in handshake');
            } else if (!Radio.isSupported(this.inputData.platform)) {
                err = new Error('"' + this.inputData.platform + '" not supported');
            } else if (this.callbackId) {
                respMsg = new ResponseMessage(this.channelId, extend(this.assemble(), {
                    outputData: {
                        errNo: '0',
                        errMsg: 'success',
                        data: {
                            cookieEnabled: new Api(this.channelId, 'cookie', 'enabled').invoke(),
                            url: new Api(this.channelId, 'location', 'href').invoke(),
                            localStorageEnabled: new Api(this.channelId, 'localStorage',
                                'enabled').invoke(),
                            ua: new Api(this.channelId, 'navigator', 'getUserAgent').invoke()
                        }
                    }
                }));
                isHandShake = true;
            }

            break;
        case MESSAGE_TYPE.REQUEST:
            var api = new Api(this.channelId, this.cmd, this.method, this.inputData);
            var ret;
            var success = false;

            if (api.isGone()) {
                respMsg = new ResponseMessage(this.channelId, this.assemble(), {
                    outputData: {
                        errNo: '0',
                        errMsg: 'success',
                        data: {}
                    }
                });

                this.emit('response', respMsg);

                try {
                    api.invoke();
                } catch (e) {}

                return this;
            }
            
            try {
                ret = api.invoke();
                success = true;
            } catch (e) {
                err = e;
                Logger.error('FLOW REQUEST:' + e.message);
            }


            if (this.callbackId) {
                respMsg = new ResponseMessage(this.channelId, this.assemble(), {
                    outputData: {
                        errNo: success ? '0' : '1',
                        errMsg: success ? 'success' : 'failed',
                        data: ret || {}
                    }
                });
            }

            break;
        case MESSAGE_TYPE.RESPONSE:
            var callback = Callback.findById(this.callbackId, this.channelId);

            if (!callback) {
                Logger.error(this.channelId + ':' + this.callbackId + ' not found');
                break;
            }

            try {
                callback.invoke(this.outputData);
            } catch (e) {
                err = e;
                Logger.error('FLOW RESPONSE:' + e.message);
            }

            break;
        default:
            Logger.warn('UNKNOWN TYPE:' + this.messageType);
        }

        if (isHandShake) {
            this.emit('handshake', respMsg);
        } else if (respMsg) {
            this.emit('response', respMsg);
        } else if (err) {
            this.emit('error', err);
        }

        if (this.isHandBack()) {
            this.emit('handback', this);
        }

        return this;
    }
});

/**
 * Parse a message from a string.
 * 
 * @param  {string} metaString
 * @return {Message}
 * @version 1.0.0
 * @since 1.0.0
 */
Message.fromMetaString = function (metaString, channelId) {
    var metaData;
    // Ignore invalid
    try {
        metaData = JSON.parse(metaString);
    } catch (e) {
        metaData = {};
    }
    return new Message(channelId, metaData);
};

/**
 * Request Message.
 * 
 * @param {object} metaData
 * @param {number} timeout
 * @version 1.0.0
 * @since 1.0.0
 */
export function RequestMessage(channelId, metaData, timeout) {
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

    var callback = new Callback(channelId, (err, data) => {
        clearTimeout(timeoutBundler);
        if (!hasTimeout) {
            if (err) {
                self.emit('error', err);
            } else {
                self.emit('data', data);
            }
        }

    });

    return (self = new Message(channelId, extend(metaData, {
        messageType: MESSAGE_TYPE.REQUEST,
        callbackId: callback.getId()
    })));
}

/**
 * Response message.
 * 
 * @param {object} metaData
 * @version 1.0.0
 * @since 1.0.0
 */
export function ResponseMessage(channelId, metaData) {
    return new Message(channelId, extend(metaData, {
        messageType: MESSAGE_TYPE.RESPONSE
    }));
}