/**
 * Copyright (C) 2015 tieba.baidu.com
 * test.js
 *
 * changelog
 * 2015-11-20[12:56:17]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var assert = require('assert');

var ready = new Promise(function (resolve, reject) {
    document.addEventListener('TiebaJsBridgeReady', function (evt) {
        resolve(evt.tiebaJsBridgeReady);
    }, false);
});

describe('TiebaJsBridge', function () {
    describe('widgets', function () {
        this.timeout(5e3);
        it('#confirm', function (done) {
            ready.then(function () {
                assert.ok('undefined' !== typeof TiebaJsBridge);
                assert.deepEqual(TiebaJsBridge.readyState, 'complete');
                TiebaJsBridge.widgets.confirm('yes?').then(function () {
                    done();
                }).catch(function(){
                    done();
                });
            }).catch(function(e){
                console.error(e);
            });
        })
    });
});