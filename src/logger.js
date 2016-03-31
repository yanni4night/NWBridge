/**
 * Copyright (C) 2015~2016 yanni4night.com
 * logger.js
 *
 * changelog
 * 2015-11-23[19:08:38]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

const keys = 'info,log,debug,warn,error'.split(',');

const defaultLog = console.log || (() => {});

export const Logger = {};

const domId = 'js-bridge-log';

keys.forEach(key => {
    if ('development' === process.env.NODE_ENV) {
        Logger[key] = (...args) => {
            let father = document.querySelector('#' + domId);
            if (!father) {
                father = document.createElement('ol');
                father.id = domId;
                if (document.body) {
                    document.body.insertBefore(father, document.body.firstChild);
                }

                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML =
                    '#js-bridge-log li {margin-top: 10px} #js-bridge-log .warn{color: #E27B44} #js-bridge-log .error{color: red} #js-bridge-log .log{color:green} #js-bridge-log .info{color: blue}';
                document.head.appendChild(style);
            }
            let p = document.createElement('li');
            p.className = key;
            p.innerHTML = '<font color=#666>[' + new Date().toISOString() + ']</font> ' + Array.prototype.join
                .call(
                    args, '');
            father.appendChild(p);
        };
    } else {
        Logger[key] = (...args) => {
            (console[key] || defaultLog).apply(console, args);
        };
    }
});