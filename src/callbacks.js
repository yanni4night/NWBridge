/**
 * Copyright (C) 2015 tieba.baidu.com
 * callbacks.js
 *
 * changelog
 * 2015-11-18[23:56:57]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var callbacks = {};

var index = 0;

function Callback(func) {
    var id = 'cb_' + (++index) + '_' + (Math.random() * 1e7 | 0);

    this.getId = function () {
        return id;
    };

    this.invoke = function(){
        func.apply(null,arguments);
        delete callbacks[id];
    };

    callbacks[id] = this;
};

Callback.findById = function(id){
    return callbacks[id];
};


export Callback;