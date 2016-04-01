# NWBridge

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

# Author
 - <yanni4night@gmail.com>
