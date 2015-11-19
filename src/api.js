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
    location: {},
    localStorage: {},
    navigator: {
        getUserAgent: function() {
            return navigator.userAgent;
        }
    }
};

export function Api(cmd, method, data) {

    this.exists = function() {
        return apis[cmd] && 'function' === typeof apis[cmd][method];
    };

    this.invoke = function() {
        if (!this.exists()) {
            throw new Error('"' + cmd + '.' + method + '" does not exist');
        }
        var ret = apis[cmd][method](data);
        return ret;
    };

}

Api.register = function(cmd, method, func) {
    apis[cmd] = apis[cmd] || {};
    if (apis[cmd][method]) {
        throw new Error('Duplicated "' + cmd + '.' + method + '"')
    }
    apis[cmd][method] = func;
};