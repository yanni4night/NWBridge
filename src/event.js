/**
 * Copyright (C) 2015 tieba.baidu.com
 * event.js
 *
 * changelog
 * 2015-11-19[14:06:08]:revised
 *
 * @author yinyong02@baidu.com
 * @version 1.0.0
 * @since 1.0.0
 */

export function Event() {

    var listeners = {};

    /**
     * Bind event,multiple events split by space supported.
     *
     * @param  {String} event
     * @param  {Function} func
     * @param  {Object} thisArg
     * @return {Event}      This event
     * @class Event
     * @since 1.0.0
     */
    this.on = function(event, func, thisArg) {
        var evtArr;

        evtArr = event.trim().split(/\s+/);

        evtArr.forEach(function(evt) {
            listeners[evt] = listeners[evt] || [];
            listeners[evt].push({
                type: evt,
                func: func,
                thisArg: thisArg
            });
        });

        return this;
    };

    /**
     * Remove event,multiple events split by space supported.
     *
     * Empty 'func' means remove all listeners named 'event'.
     *
     * @param  {String} event
     * @param  {Function} func
     * @return {Event}     This event
     * @class Event
     * @since 1.0.0
     */
    this.off = function(event, func) {
        var evtArr, objs;

        evtArr = event.trim().split(/\s+/);
        evtArr.forEach(function(evt) {
            if (!func) {
                delete listeners[evt];
                return this;
            } else {
                objs = listeners[evt];
                if (Array.isArray(objs)) {
                    listeners[evt] = objs.filter(function(obj) {
                        return obj.func !== func;
                    });
                }
            }
        });


        return this;
    };

    /**
     * Emit event(s),multiple events split by space supported.
     *
     * @param  {String} event
     * @param  {Object} data
     * @return {Event} This event
     * @class Event
     * @since 1.0.0
     */
    this.emit = function(event, data) {
        var evtArr, objs;

        evtArr = event.trim().split(/\s+/);

        evtArr.forEach(function(evt) {
            objs = listeners[evt];
            if (Array.isArray(objs)) {
                objs.forEach(function(obj) {
                    // add timestamp
                    obj.timestamp = +new Date();
                    obj.func.call(obj.thisArg || null, obj, data);
                });
            }
        });

        return this;
    };
};
