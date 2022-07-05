rdc-client-angular
==================

#### NOTICE: if you are always broken with `electron` & `electron-builder` installing, please try below commands:
```
$ npm set ELECTRON_MIRROR=http://npmmirror.com/mirrors/electron/
$ npm set ELECTRON_CUSTOM_DIR="{{ version }}"
$ npm set ELECTRON_BUILDER_BINARIES_MIRROR=http://npmmirror.com/mirrors/electron-builder-binaries/
```

#### Getting start
1. Install dependencies
   ```sh
   $ yarn install
   ```

2. please modify apiHost of [environment.ts](src/environment/environment.ts) which is rdc-server running on.
