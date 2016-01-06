/**
 * Copyright (C) 2015 yanni4night.com
 * gruntfile.js
 *
 * changelog
 * 2015-11-19[18:55:28]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

var dateFormat = require('dateformat');

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var doDist = 'dist' === grunt.option('pub');
    var now = new Date();
    var timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss Z');

    var startYear = 2015;
    var endYear = '';
    if (startYear < now.getFullYear()) {
        endYear = '-' + now.getFullYear();
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        versionPrefix: doDist ? 'Released' : 'Development',
        timestamp: timestamp,
        endYear: endYear,
        clean: {
            all: ['dist', '*.dist.*']
        },
        babel: {
            options: {
                comments: false,
                presets: ['babel-preset-es2015']
            },
            es2015: {
                expand: true,
                cwd: 'src',
                src: ['*.js'],
                dest: 'dist'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['src/*.js', '!src/promise.js', '!src/fsm.js', '!src/extend.js'],
            test: ['test/*.js']
        },
        browserify: {
            dist: {
                src: ['dist/bridge.js'],
                dest: 'bridge.dist.js'
            },
            test: {
                src: ['test/test.js'],
                dest: 'test.dist.js'
            },
            browser: {
                src: ['test/browser.js'],
                dest: 'browser.dist.js'
            }
        },
        copy: {
            logger: {
                files: {
                    'dist/logger.js': 'test/logger.js'
                }
            }
        },
        uglify: {
            options: {
                maxLineLen: 5000,
                ASCIIOnly: true,
                beautify: !doDist,
                mangle: doDist,
                banner: '/*! bridge.js <%=versionPrefix%> v<%=pkg.version%> Build <%=timestamp%> | (C) 2015<%=endYear%> yanni4night.com | github.com/yanni4night/NWBridge | MIT */\n'
            },
            dist: {
                files: {
                    'bridge.dist.min.js': 'bridge.dist.js'
                }
            }
        },
        watch: {
            all: {
                files: ['src/*.js', 'test/*.js'],
                tasks: ['default']
            }
        }
    });
    var tasks = ['clean', 'jshint', 'babel:es2015'].concat(doDist ? [] : ['copy']).concat(['browserify', 'uglify']);
    grunt.registerTask('default', tasks);
};