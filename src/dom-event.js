/**
 * Copyright (C) 2015~2016 yanni4night.com
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

export const DomEvent = {
    /**
     * Trigger an event on window.document.
     * 
     * @param  {string} evtName    Event name
     * @param  {mixin} evtPayload  Event payload
     * @version 1.0.0
     * @since 1.0.0
     */
    trigger: (evtName, evtPayload) => {
        const evt = document.createEvent('Events');
        evt.initEvent(evtName);
        extend(evt, evtPayload);
        document.dispatchEvent(evt);
    }
};
