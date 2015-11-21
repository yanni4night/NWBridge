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
import {Event} from './event';
import {extend} from './extend';

export function Queue() {
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
        return this;
    };

    this.empty = function() {
        return !!queue.length;
    };

    this.size = function() {
        return queue.length;
    };

    this.truncate = function(start, end) {
        queue.splice(start, end);
        return this;
    };

    this.serialize = function() {
        return JSON.stringify(queue);
    };

    this.clear = function() {
        queue = [];
        this.emit('clear');
        return this;
    };

    this.sortBy = function(key) {
        if (!key) {
            return this;
        }

        queue.sort(function (prev, next) {
            if (prev[key] > next[key]) {
                return -1;
            } else if (prev[key] < next[key]) {
                return 1
            } else return 0;
        });

        return this;
    };

    extend(this, new Event());
}

export function PriorityQueue(priorityKey) {
    var queue = new Queue();
    var _push = queue.push;

    queue.push = function() {
        return _push.apply(queue, arguments).sortBy(priorityKey);
    };

    return queue;
}