/**
 * Copyright (C) 2016 tieba.baidu.com
 *  webpack.config.js
 *
 * changelog
 * 2016-03-11[15:06:43]:revised
 * 2016-04-01[11:33:37]:Banner/ESLint
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
const webpack = require('webpack');
const dateFormat = require('dateformat');

const env = process.env.NODE_ENV;

const isDev = env === 'development';

const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf-8'));

const now = new Date();
const timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss Z');

const startYear = 2015;
const endYear = now.getFullYear()

const config = {
    eslint: {
        configFile: '.eslintrc'
    },
    entry: {
        bridge: "./src/bridge.js",
        test: "./test/test.js",
        server: "./test/server.js"
    },
    output: {
        path: __dirname,
        filename: "[name].dist.js",
        libraryTarget: "umd"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel-loader', 'eslint-loader'],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: "'" + env + "'"
            },
            '__VERSION__': "'" + pkg.version + "'",
            '__PKG__': JSON.stringify(pkg)
        }),
        new webpack.BannerPlugin('/*! bridge.js ' + (isDev ? 'Development' : 'Release') + ' v' + pkg.version +
            ' Build ' + timestamp + ' | (C) 2015~' + endYear +
            ' yanni4night.com | github.com/yanni4night/NWBridge | MIT */\n', {
                raw: true,
                entryOnly: true
            })
    ]
};

if (!isDev) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compressor: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true,
            warnings: false
        }
    }));
}
module.exports = config;