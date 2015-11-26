/**
 * Copyright (C) 2015 yanni4night.com
 * event.js
 *
 * changelog
 * 2015-11-19[14:06:08]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

export function Event() {

    var listeners = {};

    /**
     * Bind event,multiple events split by space supported.
     *
     * @param  {string} event
     * @param  {function} func
     * @param  {mixin} thisArg
     * @return {this}
     * @since 1.0.0
     * @version 1.0.0
     */
    this.on = function(event, func, thisArg) {
        var evtArr;

        evtArr = event.trim().split(/\s+/);

        evtArr.forEach((evt) => {
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
     * @param  {string} event
     * @param  {function} func
     * @return {this}
     * @since 1.0.0
     * @version 1.0.0
     */
    this.off = (event, func) => {
        var evtArr, objs;

        evtArr = event.trim().split(/\s+/);
        evtArr.forEach((evt) => {
            if (!func) {
                delete listeners[evt];
                return this;
            } else {
                objs = listeners[evt];
                if (Array.isArray(objs)) {
                    listeners[evt] = objs.filter((obj) => {
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
     * @param  {string} event
     * @param  {mixin} data
     * @return {this}
     * @since 1.0.0
     * @version 1.0.0
     */
    this.emit = (event, data) => {
        var evtArr, objs;

        evtArr = event.trim().split(/\s+/);

        evtArr.forEach((evt) => {
            objs = listeners[evt];
            if (Array.isArray(objs)) {
                objs.forEach((obj) => {
                    // add timestamp
                    obj.timestamp = Date.now();
                    obj.func.call(obj.thisArg || null, obj, data);
                });
            }
        });

        return this;
    };
};
