/**
 * Copyright (C) 2015 tieba.baidu.com
 * queue.js
 *
 * changelog
 * 2015-11-18[16:47:42]:revised
 *
 * @author yinyong02@baidu.com
 * @version 1.0.0
 * @since 1.0.0
 */
import {Event} from './event';
import {extend} from './extend';

export function Queue(config) {
    var queue = [];

    config = extend({
        limit: 0
    }, config);

    this.top = function() {
        return queue[0];
    };

    this.pop = function() {
        var ret = queue.shift();
        if (ret) {
            this.emit('pop', ret);
        }
        return ret;
    };

    this.push = function(element) {
        if (config.limit > 0 && this.size() >= config.limit) {
            throw new Error('Overflow');
        }

        if (element) {
            queue.push(element);
            this.emit('push', element);
        }
        return this;
    };

    this.empty = function() {
        return !queue.length;
    };

    this.size = function() {
        return queue.length;
    };

    this.truncate = function(start, length) {
        queue.splice(start, length);
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
        // MUST be stable
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

export function PriorityQueue(config) {
    var queue = new Queue(config = extend({
        priorityKey: 'priority'
    }, config));
    var _push = queue.push;

    queue.push = function() {
        return _push.apply(queue, arguments).sortBy(config.priorityKey);
    };

    return queue;
}
