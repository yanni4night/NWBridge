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

var apis = {
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

export function Api(cmd, method, data) {

    this.exists = () => {
        return apis[cmd] && 'function' === typeof apis[cmd][method];
    };

    this.invoke = () => {
        if (!this.exists()) {
            throw new Error('"' + cmd + '.' + method + '" does not exist');
        }
        var ret = apis[cmd][method](data);
        return ret;
    };

}

Api.register = function (cmd, method, func) {
    apis[cmd] = apis[cmd] || {};
    if (apis[cmd][method]) {
        throw new Error('Duplicated "' + cmd + '.' + method + '"')
    }
    apis[cmd][method] = func;
};
