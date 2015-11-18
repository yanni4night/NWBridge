/**
 * Copyright (C) 2015 tieba.baidu.com
 * dom-event.js
 *
 * changelog
 * 2015-11-18[16:17:10]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

import extend from './extend';

var Event = {
    trigger: function (eventName, payload) {
        var readyEvent = document.createEvent('Events');
        readyEvent.initEvent(eventName);
        extend(readyEvent, payload);
        document.dispatchEvent(readyEvent);
    }
};

export default Event;