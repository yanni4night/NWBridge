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
        task: 'Hybrid', // IMPORTANT
        page: 'pb', // Any value
        locate: '成功率', // Any value
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
        commonTrack.obj_param1 = id;
        /*jshint camelcase:true*/
        while (cache.length) {
            send(cache.shift());
        }
        started = true;
    };

    this.trace = function (no, desc) {
         /*jshint camelcase:false*/
        if (started) {
            send({
                obj_param2: no,
                obj_param3: desc
            });
        } else {
            cache.push({
                obj_param2: no,
                obj_param3: desc
            });
        }
         /*jshint camelcase:true*/
    };
};