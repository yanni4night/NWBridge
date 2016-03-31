/**
 * Copyright (C) 2016 tieba.baidu.com
 *  webpack.config.js
 *
 * changelog
 * 2016-03-11[15:06:43]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
var webpack = require('webpack');

var env = process.env.NODE_ENV;

var config = {
    entry: {
        bridge: "./src/bridge.js",
        test: "./test/case.js",
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
            loaders: ['babel-loader'],
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: "'" + env + "'"
            }
        })
    ]
};

if ('development' !== env) {
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