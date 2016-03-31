/**
 * Copyright (C) 2015 yanni4night.com
 * bridge.js
 *
 * changelog
 * 2015-11-18[16:16:12]:revised
 * 2016-02-29[13:56:58]:support duplicated handshake
 * 2016-02-29[13:56:58]:remove handshake initializing
 * 2016-03-09[15:10:35]:rename handshake to ping
 * 2016-03-14[17:30:47]:remove quese limit
 * 2016-03-31[12:32:01]:set hybridInitialData as a parameter
 *
 * @author yanni4night@gmail.com
 * @version 1.6.0
 * @since 1.0.0
 */
import {DomEvent}  from './dom-event';
import {extend}  from './extend';
import {Queue, PriorityQueue}  from './queue';
import {Message, RequestMessage}  from './message';
import {Radio}  from './radio';
import {Api}  from './api';
import {Promise}  from './promise';
import {Logger}  from './logger';
import {asap}  from './asap';

const READY_STATE_ENUM = {
    PENDING: 'pending',
    COMPLETE: 'complete',
    ERROR: 'error'
};
/**
 * The JSBridge class.
 * 
 * @param {string} nativeExport
 * @param {string} webviewExport
 * @param {string} scheme
 * @since 1.0.0
 * @version 1.0.0
 */
window.NWBridge = function (nativeExport, webviewExport, scheme, hybridInitialData = {}) {

    const VERSION = '1.6.0';

    const messageQueueFromNative = new PriorityQueue({
        priorityKey: 'priority'
    });

    const messageQueueToNative = new Queue();

    var radio;

    var bridgeReadyTriggered = false;

    // Record unix stamp when bridge created
    const timestamp = Date.now().toString(36).toUpperCase();

    // Indicate this bridge
    const channelId = `CHANNEL/${timestamp}/${nativeExport}`;

    var readyState = READY_STATE_ENUM.PENDING;

    const lcFirst = str => str.replace(/^([A-Z])/, n => n.toLowerCase());

    /**
     * Notify document that bridge is ready.
     *
     * This operation will be triggered only ONCE.
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    const bridgeReady = () => {
        const evtData = {};

        if (bridgeReadyTriggered) {
            return;
        }

        Logger.log(`Bridge ready[${channelId}]:${readyState}` );

        // Like "JsBridge" to "jsBridge"
        evtData[lcFirst(webviewExport)] = window[webviewExport];
        // Like "JsBridgeReady"
        DomEvent.trigger(`${webviewExport}Ready`, evtData);
        bridgeReadyTriggered = true;
    };

    /**
     * Send message from bridge to native.
     * 
     * @param  {Message} message
     * @version 1.0.0
     * @since 1.0.0
     */
    const upload = message => messageQueueToNative.push(message);

    // native -> webview
    messageQueueFromNative.on('push', (e, msg) => {
        Logger.log('PUSH TO QUEUE FROM NATIVE:' + msg.serialize());
        // Release native thread
        // This could be blocked sometimes
        asap(() => {
            // Pop all the messages
            while (1) {
                let message = messageQueueFromNative.pop();
                
                if (message) {
                    Logger.log('POP FROM QUEUE TO WEBVIEW:' + message.serialize());

                    message.on('response', (evt, respMsg) => upload(respMsg))
                        .on('error', (evt, err) => Logger.error(err.message))
                        .flow();
                } else {
                    break;
                }
            }
        });
    });

    // webview -> native
    messageQueueToNative.on('push', (e, msg) => {
            Logger.log('PUSH TO QUEUE FROM WEBVIEW:' + msg.serialize());
        while (1) {
            let message = messageQueueToNative.pop();

            if (message) {
                radio.send(message);
            } else {
                break;
            }
        }

        
    });

    // Export to native always
    window[nativeExport] = {
        /**
         * Native send string data to bridge.
         *
         * This function must exist immediately because
         * native talks to bridge first.
         * 
         * @param  {string} messageStr string data
         * @version 1.0.0
         * @since 1.0.0
         */
        send: (messageStr) => {
            Logger.log(`RECEIVE FROM NATIVE:${messageStr}`);
            const message = Message.fromMetaString(messageStr, channelId);
            if (!message.isInvalid()) {
                messageQueueFromNative.push(message);
            } else {
                Logger.warn(`INVALID FMT:${messageStr}`);
            }
            return messageStr || '[DEFAULT]';
        }
    };

    // Export to webview
    function export2Webview() {
        let webviewExportExtension;

        window[webviewExport] = {
            call: (cmdKey, methodKey, args, timeout) => {
                return new Promise((resolve, reject) => {
                    let msg = new RequestMessage(channelId, {
                        cmd: cmdKey,
                        method: methodKey,
                        inputData: extend(true, {}, args)
                    }, timeout).on('data', (evt, data) => {
                        resolve(data);
                    }).on('error', (evt, err) => {
                        reject(err);
                    });

                    upload(msg);
                });
            }
        };
        

        // What in webviewExport depends on state
        if (READY_STATE_ENUM.COMPLETE === readyState) {
            webviewExportExtension = {
                readyState: READY_STATE_ENUM.COMPLETE,
                /**
                 * Register API for native.
                 *
                 * @todo test
                 * @return {this}
                 */
                register: (...argus) => {
                    var args = Array.prototype.slice.call(argus);
                    args.unshift(channelId);
                    Api.register.apply(Api, args);
                    return window[webviewExport];
                },
                system: {
                    version: () => {
                        return Promise.resolve(hybridInitialData.version);
                    },
                    platform: () => {
                        return Promise.resolve(hybridInitialData.platform);
                    }
                }
            };
        } else {
            webviewExportExtension = {
                readyState: READY_STATE_ENUM.ERROR
            };
        }

        extend(window[webviewExport], webviewExportExtension);

        // Set version
        if (Object.defineProperty) {
            Object.defineProperty(window[webviewExport], 'version', {
                value: VERSION,
                writable: false,
                enumerable: false,
                configurable: false
            });
        } else {
            window[webviewExport].version = VERSION;
        }
    }

    try {
        radio = new Radio(hybridInitialData.platform, scheme);
        extend(window[nativeExport], radio.extension);
        readyState = READY_STATE_ENUM.COMPLETE;
    } catch (e) {
        readyState = READY_STATE_ENUM.ERROR;
    }

    export2Webview();
    bridgeReady();
}; // NWBridge