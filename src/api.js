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
import {Logger} from './logger';

const defaultApis = {
    location: {
        href: () => location.href,
        host: () => location.host,
        hostname: () => location.hostname,
        pathname: () => location.pathname,
        port: () => location.port,
        origin: () => location.origin,
        search: () => location.search,
        hash: () => location.hash,
        reload: () => location.reload(),
        assign: newUrl => location.assign(newUrl),
        replace: newUrl => location.replace(newUrl)
    },
    localStorage: {
        enabled: () => {
            if ('undefined' === typeof localStorage) {
                return false;
            }
            try {
                let key = '__test_jsbridge__' + Date.now();
                localStorage.setItem(key, 1);
                return 1 === +localStorage.getItem(key);
            } catch (e) {
                return false;
            }
        },
        setItem: (key, value) => localStorage.setItem(key, value),
        getItem: key => localStorage.getItem(key),
        removeItem: (key) => localStorage.removeItem(key)
    },
    cookie: {
        enabled: () => navigator.cookieEnabled,
        setItem: () => {},
        getItem: () => {},
        removeItem: () => {}
    },
    navigator: {
        getUserAgent: () => navigator.userAgent
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

    this.invoke = cb => {
        var ret;
        if (!this.exists()) {
            throw new Error(channelId + ':"' + cmd + '.' + method + '" does not exist');
        }

        if (cb) {
            apis[channelId][cmd][method](cb, data);
            return null;
        }
        
        ret = apis[channelId][cmd][method](data);

        return ret;
    };

    this.isAsync = function () {
        if(!this.exists()){
            return false;
        } else {
            let func = apis[channelId][cmd][method];
            return !!func.__async;
        }
    };

}

Api.register = function (channelId, cmd, method, func, async) {
    var newApi = func;

    apis[channelId] = apis[channelId] || extend(true, {}, defaultApis);
    apis[channelId][cmd] = apis[channelId][cmd] || {};
    
    if (apis[channelId][cmd][method]) {
        throw new Error('Duplicated "' + cmd + '.' + method + '"');
    }
    
    if ('boolean' !== typeof async) {
        async = false;
    }

    newApi.__async = async;
    apis[channelId][cmd][method] = newApi;
    Logger.log(`APIS AFTER REGISTER[${channelId}]:` + JSON.stringify(apis));
};