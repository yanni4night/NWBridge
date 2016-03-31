/**
 * Copyright (C) 2015~2016 yanni4night.com
 * gruntfile.js
 *
 * changelog
 * 2015-11-19[18:55:28]:revised
 * 2016-03-31[12:47:18]:eslint instead of jshint
 *
 * @author yanni4night@gmail.com
 * @version 1.0.1
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
        eslint: {
            options: {
                configFile: '.eslintrc'
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
                src: ['test/case.js'],
                dest: 'test.dist.js'
            },
            server: {
                src: ['test/server.js'],
                dest: 'server.dist.js'
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
                quote_style: 1,
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
    var tasks = ['clean', 'eslint', 'babel:es2015'].concat(doDist ? [] : ['copy']).concat(['browserify', 'uglify']);
    grunt.registerTask('default', tasks);
};