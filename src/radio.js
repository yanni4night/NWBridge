/**
 * Copyright (C) 2015 tieba.baidu.com
 * radio.js
 *
 * changelog
 * 2015-11-22[18:36:38]:revised
 *
 * @author yinyong02@baidu.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {Queue} from './queue';

function IOSRadio(scheme) {
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-10000px;display:none;height:0;width:0';
    iframe.src = 'about:blank';
    document.documentElement.appendChild(iframe);

    const queue = new Queue();

    this.send = function (message) {
        queue.push(message);
        iframe.src = scheme + 'trigger-message-fetch';
    };

    this.extension = {
        fetch: function () {
            const ret = queue.serialize();
            queue.clear();
            return ret;
        }
    };

}

function AndroidRadio(scheme) {

    this.send = function (message) {
        window.prompt(scheme + message.serialize());
    };
    this.extension = {};
}

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
