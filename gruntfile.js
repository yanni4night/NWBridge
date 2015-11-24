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
module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var doDist = 'dist' === grunt.option('pub');
    var now = new Date();
    var timestamp = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-') + ' ' + [now.getHours(), now.getMinutes(),
        now.getSeconds()
    ].join(':');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        versionPrefix: doDist ? 'Released' : 'Development',
        timestamp: timestamp,
        clean: {
            all: ['dist', 'bridge.dist{/.min}.js']
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
        browserify: {
            dist: {
                src: ['dist/bridge.js'],
                dest: 'bridge.dist.js'
            },
            test: {
                src: ['test/test.js'],
                dest: 'test.dist.js'
            }
        },
        uglify: {
            options: {
                maxLineLen: 5000,
                ASCIIOnly: true,
                screwIE8: true,
                beautify: !doDist,
                banner: '/*! bridge.js <%=versionPrefix%> v<%=pkg.version%> Build <%=timestamp%> | (c) 2015 tieba.baidu.com | Author <%=pkg.author%> | MIT */\n'
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

    grunt.registerTask('default', ['clean', 'babel:es2015', 'browserify', 'uglify']);
};