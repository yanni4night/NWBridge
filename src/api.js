/**
 * Copyright (C) 2015 tieba.baidu.com
 * api.js
 *
 * changelog
 * 2015-11-18[17:06:45]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var apis = {
    location: {
        href: function () {
            return location.href;
        },
        host: function () {
            return location.host;
        },
        hostname: function () {
            return location.hostname;
        },
        pathname: function () {
            return location.pathname;
        },
        port: function () {
            return location.port;
        },
        origin: function () {
            return location.origin;
        },
        search: function () {
            return location.search;
        },
        hash: function () {
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
        enabled: function () {
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
        enabled: function () {
            return navigator.cookieEnabled;
        },
        setItem: function () {},
        getItem: function () {},
        removeItem: function () {}
    },
    navigator: {
        getUserAgent: function () {
            return navigator.userAgent;
        }
    }
};

export function Api(cmd, method, data) {

    this.exists = function () {
        return apis[cmd] && 'function' === typeof apis[cmd][method];
    };

    this.invoke = function () {
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