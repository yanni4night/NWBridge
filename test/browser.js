/**
 * Copyright (C) 2016 yanni4night.com
 * browser.js
 *
 * changelog
 * 2016-07-29[10:18:59]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';
import {ServerBridge} from './server';
import {NWBridge} from '../src/bridge';

window.HYBRID_INITIAL_DATA = {
    platform: 'android',
    version: '1.6.0',
    logid: 'NUSIDY(*GFD'
};

new ServerBridge('__js_bridge', 'scheme://');
new NWBridge('__js_bridge', 'JsBridge', 'scheme://', HYBRID_INITIAL_DATA);