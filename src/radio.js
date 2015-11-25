/**
 * Copyright (C) 2015 yanni4night.com
 * radio.js
 *
 * changelog
 * 2015-11-22[18:36:38]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {Queue} from './queue';
import {Logger} from './logger';

function IOSRadio(scheme) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-10000px;display:none;height:0;width:0';
    iframe.src = scheme;
    document.documentElement.appendChild(iframe);

    const queue = new Queue();

    /**
     * Send primitive string message to native on iOS.
     * 
     * @param  {string} message
     * @version 1.0.0
     * @since 1.0.0
     */
    this.send = (message) => {
        Logger.log('RADIO send:' + message.serialize());
        queue.push(message.assemble());
        iframe.src = scheme + 'trigger-message-fetch';
    };

    this.extension = {
        fetch: () => {
            const ret = queue.serialize();
            queue.clear();
            Logger.log('FETCH:' + ret);
            return ret;
        }
    };

}

function AndroidRadio(scheme) {
    /**
     * Send primitive string message to native on Android.
     * 
     * @param  {string} message
     * @version 1.0.0
     * @since 1.0.0
     */
    this.send = (message) => {
        Logger.log('RADIO send:' + message.serialize());
        window.prompt(scheme + message.serialize());
    };
    this.extension = {};
}

/**
 * A radio that connects native.
 * 
 * @param {string} platform iOS/Android
 * @param {string} scheme   Protocol scheme
 */
export function Radio(platform, scheme) {
    switch (String(platform).toLowerCase()) {
    case 'ios':
        return new IOSRadio(scheme);
    case 'android':
        return new AndroidRadio(scheme);
    default:
        throw new Error(platform + ' not supported');
    }
}
