/**
  * Copyright (C) 2015 yanni4night.com
  * logger.js
  *
  * changelog
  * 2015-11-24[17:48:30]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */
var keys = 'info,log,debug,warn,error'.split(',');

var defaultLog = console.log || (function() {});

var Logger = {};

keys.forEach(function(key) {
    Logger[key] = function () {
        var father = document.querySelector('#err');
        if(!father){
            father = document.createElement('ol');
            father.id = 'err';
            document.body.appendChild(father);
        }
        var p = document.createElement('li');
        p.className = key;
        p.innerHTML = '<font color=#666>[' + new Date().toISOString() + ']</font> ' + (arguments[0]);
        father.appendChild(p);
    };
});

exports.Logger = Logger;
