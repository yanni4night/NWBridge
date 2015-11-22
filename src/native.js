/**
 * Copyright (C) 2015 tieba.baidu.com
 * native.js
 *
 * changelog
 * 2015-11-18[16:20:53]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

function IOSBridge(scheme) {
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;left:-10000px;display:none;height:0;width:0';
    iframe.src = 'about:blank';
    document.documentElement.appendChild(iframe);

    this.send = function () {
        iframe.src = scheme + 'trigger-message-fetch';
    };
}

function AndroidBridge(scheme) {

    this.send = function (msg) {
        window.prompt(scheme + msg);
    };
}

export function Native(platform, scheme) {
    switch (String(platform).toLowerCase()) {
    case 'ios':
        return new IOSBridge(scheme);
    case 'android':
        return new AndroidBridge(scheme);
    default:
        throw new Error(platform + ' not supported');
    }
}