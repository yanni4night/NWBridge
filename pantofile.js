/**
 * Copyright (C) 2016 yanni4night.com
 * pantofile.js
 *
 * changelog
 * 2016-07-28[09:27:40]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';
const dateFormat = require('dateformat');
const env = process.env.NODE_ENV;
const pkg = require('./package.json');

const now = new Date();
const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss Z');

const startYear = 2015;
const endYear = now.getFullYear()

module.exports = panto => {

    require('load-panto-transformers')(panto);

    panto.setOptions({
        output: 'dist'
    });

    const UGLIFY_OPTIONS = {
        isSkip: env !== 'production'
    };
    const REPLACE_OPTIONS = {
        replacements: [
            ['__VERSION__', "'" + pkg.version + "'"],
            ['__PKG__', JSON.stringify(pkg)]
        ]
    };

    const BANNER_OPTIONS = {
        banner:'/*! bridge.js ' + env + ' v' + pkg.version +
            ' Build ' + timestamp + ' | (C) 2015~' + endYear +
            ' yanni4night.com | github.com/yanni4night/NWBridge | MIT */\n'
    };

    const source = panto.$('{src,test}/*.js').tag('src js').read().replace(REPLACE_OPTIONS).babel({
        extend: __dirname + '/.babelrc'
    });

    source.browserify({
        entry: 'src/bridge.js',
        bundle: 'bridge.dist.js',
        process: {
            env: {
                NODE_ENV: env
            }
        }
    }).uglify(UGLIFY_OPTIONS).banner(BANNER_OPTIONS).write();

    source.browserify({
        entry: 'test/karma.js',
        bundle: 'karma.dist.js',
        process: {
            env: {
                NODE_ENV: env
            }
        }
    }).uglify(UGLIFY_OPTIONS).write();

    source.browserify({
        entry: 'test/browser.js',
        bundle: 'browser.dist.js',
        process: {
            env: {
                NODE_ENV: env
            }
        }
    }).uglify(UGLIFY_OPTIONS).write();
};