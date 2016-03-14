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

var Logger = {};

keys.forEach(function(key) {
    var domId = 'js-bridge-log';
    Logger[key] = function () {
        var father = document.querySelector('#' + domId);
        if(!father){
            father = document.createElement('ol');
            father.id = domId;
            if(document.body){
                document.body.insertBefore(father, document.body.firstChild);
            }

            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '#js-bridge-log li {margin-top: 10px} #js-bridge-log .warn{color: #E27B44} #js-bridge-log .error{color: red} #js-bridge-log .log{color:green} #js-bridge-log .info{color: blue}';
            document.head.appendChild(style);
        }
        var p = document.createElement('li');
        p.className = key;
        p.innerHTML = '<font color=#666>[' + new Date().toISOString() + ']</font> ' + Array.prototype.join.call(arguments, '');
        father.appendChild(p);
    };
});

exports.Logger = Logger;
