rdc-client-vue
==============

#### NOTICE: if you are always broken with `electron` & `electron-builder` installing, please try below commands:
```
$ npm set ELECTRON_MIRROR=http://npmmirror.com/mirrors/electron/
$ npm set ELECTRON_BUILDER_BINARIES_MIRROR=http://npmmirror.com/mirrors/electron-builder-binaries/
```

#### Getting start
1. Install dependencies
   ```sh
   $ yarn install
   ```
   
2. please modify API_HOST of [vue.config.js](vue.config.js) which is rdc-server running on.

3. Happy hacking
   ```sh
   $ yarn start
   ```