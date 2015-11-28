/**
 * Copyright (C) 2015 yanni4night.com
 * queue.js
 *
 * changelog
 * 2015-11-18[16:47:42]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
import {Event} from './event';
import {extend} from './extend';

export function Queue(config) {
    var queue = [];

    config = extend({
        limit: 0,
        priorityKey: null
    }, config);

    this.top = () => {
        return queue[0];
    };

    this.pop = function () {
        var ret = queue.shift();
        if (ret) {
            this.emit('pop', ret);
        }
        return ret;
    };

    this.push = function (element) {
        if (config.limit > 0 && this.size() >= config.limit) {
            throw new Error('Overflow');
        }

        if (element) {
            let key = config.priorityKey;
            queue[queue.length] = element;

            // Sort if necessary
            if (key && this.size() > 1 && queue[queue.length - 1][key] > queue[queue.length -
                    2][key]) {
                sort();
            }

            this.emit('push', element);
        }
        return this;
    };

    this.empty = () => {
        return !queue.length;
    };

    this.size = () => {
        return queue.length;
    };

    this.serialize = () => {
        return JSON.stringify(queue);
    };

    this.clear = function () {
        queue = [];
        this.emit('clear');
        return this;
    };

    function sort() {
        var key = config.priorityKey;
        if (!key) {
            return this;
        }
        // MUST be stable
        queue.sort((prev, next) => {
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
    config = extend({
        priorityKey: 'priority'
    }, config);

    if ('string' !== typeof config.priorityKey) {
        throw new Error('priorityKey is required');
    }

    var queue = new Queue(config);

    return queue;
}