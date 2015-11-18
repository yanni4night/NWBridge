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

export function Queue() {
    var queue = [];
    this.pop = function () {
        return queue.shift();
    };
    this.push = function (element) {
        queue.push(element);
    };
    this.empty = function () {
        return !!queue.length;
    };
    this.size = function () {
        return queue.length;
    };
    this.truncate = function (start, end) {
        queue.splice(start, end);
    };
    this.serialize = function () {
        return JSON.stringify(queue);
    }
};