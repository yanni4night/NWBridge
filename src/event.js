/**
 * Copyright (C) 2015 tieba.baidu.com
 * event.js
 *
 * changelog
 * 2015-11-19[14:06:08]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var EventEmitter = function() {

    var listeners = {};

    /**
     * Bind event,multiple events split by space supported.
     *
     * @param  {String} event
     * @param  {Function} func
     * @param  {Object} thisArg
     * @return {EventEmitter}      This event emitter
     * @class EventEmitter
     * @since 0.0.8
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
     * @return {EventEmitter}     This event emitter
     * @class EventEmitter
     * @since 0.0.8
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
     * @return {EventEmitter} This event emitter
     * @class EventEmitter
     * @since 0.0.8
     */
    this.emit = function(event, data) {
        var evtArr, objs;

        evtArr = event.trim().split(/\s+/);

        evtArr.forEach(function(evt) {
            objs = listeners[evt];
            if (Array.isArray(objs)) {
                objs.forEach(function(obj) {
                    //add timestamp
                    obj.timestamp = +new Date();
                    obj.func.call(obj.thisArg || null, obj, data);
                });
            }
        });

        return this;
    };
};

export EventEmitter;