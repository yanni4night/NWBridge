/**
 * Copyright (C) 2015 yanni4night.com
 * statistics.js
 *
 * changelog
 * 2015-12-01[18:10:56]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

export const Statistics = function (name) {
    const cache = [];
    var started = false;
    var logid;

    const send = function () {

    };

    this.startup = function (id) {
        logid = id;
        while (cache.length) {
            send(cache.shift());
        }
    };

    this.trace = function (log) {
        if (started) {
            send(log);
        } else {
            cache.push(log);
        }
    };
};