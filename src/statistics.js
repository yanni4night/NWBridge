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

import {extend} from './extend';
import {Logger} from './logger';

export const Statistics = function (name) {
    const cache = [];
    var started = false;

    const URL = 'http://static.tieba.baidu.com/tb/img/track.gif?';

    this.name = name;

    const commonTrack = {
        /*jshint camelcase:false*/
        client_type: 'wap_smart', // Fixed
        /*jshint camelcase:true*/
        task: 'JsBridge', // IMPORTANT
        page: 'pb', // Any value
        locate: 'left', // Any value
        type: 'show' // Fixed
    };

    const send = function (log) {
        const param = [];
        var imgSrc;

        const finalLog = extend(true, commonTrack, log);

        for (let key in finalLog) {
            param.push(key + '=' + encodeURIComponent(finalLog[key]));
        }

        imgSrc = URL + param.join('&');

        Logger.log('[STATISTICS]' + imgSrc);
        new Image().src = imgSrc;
    };

    this.startup = function (id) {
        /*jshint camelcase:false*/
        commonTrack.app_log_id = id;
        /*jshint camelcase:true*/
        while (cache.length) {
            send(cache.shift());
        }
        started = true;
    };

    this.trace = function (log) {
        if (started) {
            send(log);
        } else {
            cache.push(log);
        }
    };
};