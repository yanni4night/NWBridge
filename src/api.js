/**
 * Copyright (C) 2015 yanni4night.com
 * api.js
 *
 * changelog
 * 2015-11-18[17:06:45]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {extend} from './extend';

const defaultApis = {
    location: {
        href: () => {
            return location.href;
        },
        host: () => {
            return location.host;
        },
        hostname: () => {
            return location.hostname;
        },
        pathname: () => {
            return location.pathname;
        },
        port: () => {
            return location.port;
        },
        origin: () => {
            return location.origin;
        },
        search: () => {
            return location.search;
        },
        hash: () => {
            return location.hash;
        },
        reload: function (newUrl) {
            return location.reload(newUrl);
        },
        assign: function (newUrl) {
            return location.assign(newUrl);
        },
        replace: function (newUrl) {
            return location.replace(newUrl);
        }
    },
    localStorage: {
        enabled: () => {
            if ('undefined' === typeof localStorage) {
                return false;
            }
            localStorage.setItem('__test', 1);
            return 1 === +localStorage.getItem('__test');
        },
        setItem: function (key, value) {
            localStorage.setItem(key, value);
        },
        getItem: function (key) {
            localStorage.getItem(key);
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
        }
    },
    cookie: {
        enabled: () => {
            return navigator.cookieEnabled;
        },
        setItem: () => {},
        getItem: () => {},
        removeItem: () => {}
    },
    navigator: {
        getUserAgent: () => {
            return navigator.userAgent;
        }
    }
};

const apis = {};

export function Api(channelId, cmd, method, data) {

    if (!apis[channelId]) {
        apis[channelId] = extend(true, {}, defaultApis);
    }

    this.exists = () => {
        return apis[channelId][cmd] && 'function' === typeof apis[channelId][cmd][method];
    };

    this.invoke = () => {
        if (!this.exists()) {
            console.log(apis);
            throw new Error(channelId + ':"' + cmd + '.' + method + '" does not exist');
        }
        var ret = apis[channelId][cmd][method](data);
        return ret;
    };

}

Api.register = function (channelId, cmd, method, func) {
    apis[channelId] = apis[channelId] || extend(true, {}, defaultApis);;
    apis[channelId][cmd] = apis[channelId][cmd] || {};
    if (apis[channelId][cmd][method]) {
        throw new Error('Duplicated "' + cmd + '.' + method + '"')
    }
    apis[channelId][cmd][method] = func;
};