/**
 * Copyright (C) 2015 yanni4night.com
 * gruntfile.js
 *
 * changelog
 * 2015-11-19[18:55:28]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        clean: {
            all: ['dist', 'bridge.dist{/.min}.js']
        },
        babel: {
            options: {
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
            all: {
                src: ['dist/bridge.js'],
                dest: 'bridge.dist.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'bridge.dist.min.js': 'bridge.dist.js'
                }
            }
        }
    });

    grunt.registerTask('default', ['clean', 'babel:es2015', 'browserify', 'uglify']);
};