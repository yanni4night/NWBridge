# NWBridge

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url] [![Build with Panto][build-image]][build-url]

JavaScript "bridge" for connecting Native and Webview on iOS/Android.

# Build

    $ make

# Test

    $ karma start

# Usage

    new NWBridge(nativeExport, webviewExport, scheme, hybridInitData);

Example:

```js
var hybridInitData = {
    platform: 'android',// or 'ios'
    version: '7.4.0' // semver
};

new NWBridge('__js_bridge__', 'JsBridge', 'schema://', hybridInitData);
```

Then, _two_ global object will be created: `window.JsBridge` and `window.__js_bridge__`。

See [documentation](http://yanni4night.github.io/NWBridge/) for more details.

# Build

Built with [panto](http://pantojs.xyz/), just dog-fooding.

# Author
 - <yanni4night@gmail.com>

[npm-url]: https://npmjs.org/package/nwbridge
[downloads-image]: http://img.shields.io/npm/dm/nwbridge.svg
[npm-image]: http://img.shields.io/npm/v/nwbridge.svg
[travis-url]: https://travis-ci.org/yanni4night/NWBridge?branch=master
[travis-image]: https://travis-ci.org/yanni4night/NWBridge.svg?branch=master
[david-dm-url]:https://david-dm.org/yanni4night/nwbridge
[david-dm-image]:https://david-dm.org/yanni4night/nwbridge.svg
[david-dm-dev-url]:https://david-dm.org/yanni4night/nwbridge#type=dev
[david-dm-dev-image]:https://david-dm.org/yanni4night/nwbridge/dev-status.svg
[build-image]:https://img.shields.io/badge/build%20with-panto-yellowgreen.svg
[build-url]:http://pantojs.xyz/
