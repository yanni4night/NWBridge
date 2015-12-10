/**
  * Copyright (C) 2015 yanni4night.com
  * browser.js
  *
  * changelog
  * 2015-12-10[13:04:00]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */

var ServerBridge = require('./mock').ServerBridge;

new window.NWBridge('__js_bridge', 'JsBridge', 'scheme://');
new ServerBridge('__js_bridge', 'scheme://').handshake();