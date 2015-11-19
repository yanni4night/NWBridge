/**
 * Copyright (C) 2015 tieba.baidu.com
 * queue.js
 *
 * changelog
 * 2015-11-18[16:47:42]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */
import Event from './event';
import extend from './extend';

function Queue() {
    var queue = [];
    this.pop = function() {
        var ret = queue.shift();
        if (ret) {
            this.emit('pop', ret);
        }
        return ret;
    };
    this.push = function(element) {
        if (element) {
            queue.push(element);
            this.emit('push', element);
        }
    };
    this.empty = function() {
        return !!queue.length;
    };
    this.size = function() {
        return queue.length;
    };
    this.truncate = function(start, end) {
        queue.splice(start, end);
    };
    this.serialize = function() {
        return JSON.stringify(queue);
    }
    this.clear = function() {
        queue = [];
        this.emit('clear');
    };

    extend(this, new Event());
}

export Queue