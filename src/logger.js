/**
 * Copyright (C) 2015 yanni4night.com
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

keys.forEach((key) => {
    Logger[key] = (...args) => {
        (console[key] || defaultLog).apply(console, args);
    };
});
