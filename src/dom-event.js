/**
 * Copyright (C) 2015 tieba.baidu.com
 * dom-event.js
 *
 * changelog
 * 2015-11-18[16:17:10]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

import {extend} from './extend';

export var DomEvent = {
    trigger: function (evtName, evtPayload) {
        var evt = document.createEvent('Events');
        evt.initEvent(evtName);
        extend(evt, evtPayload);
        document.dispatchEvent(evt);
    }
};
