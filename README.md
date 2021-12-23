Agora Remote Desktop Control Samples
===================================

![build workflow](https://github.com/AgoraIO-Community/agora-remote-desktop-control-samples/actions/workflows/build.yml/badge.svg)


> if you want to try this samples directly, please download samples from [here](https://github.com/AgoraIO-Community/agora-remote-desktop-control-samples/releases)
### Prerequisites

1. Getting appId & certificate issued by agora, please read this [docs](https://docs.agora.io/en/Agora%20Platform/token#get-an-app-id)

2. Please make sure [Node.js 10+](https://nodejs.org/) has been installed.

### Quick Start


#### NOTICE: if you are always broken with `electron` & `electron-builder` installing, please try below commands:
```
$ npm set ELECTRON_MIRROR=http://npmmirror.com/mirrors/electron/
$ npm set ELECTRON_BUILDER_BINARIES_MIRROR=http://npmmirror.com/mirrors/electron-builder-binaries/
```

#### Clone our samples:

```
$ git clone git@github.com:AgoraIO-Community/agora-remote-desktop-control-samples.git
```

#### Getting start with `rdc-server`, which is a simple server for issuing agora sdk token

1. Run simple redis server in docker, please install docker & docker-compose first.

   ```sh
   $ cd rdc-server
   $ docker-compose -f ./docker-compose.test.yml up -d
   ```

2. Copy .env.development.local.sample as .env.development.local
   ```sh
   $ cp .env.development.local.sample .env.development.local
   ```

3. Fill env variables in .env.development.local

4. Install dependencies
   ```sh
   $ yarn install
   ```
5. Happy hacking
   ```sh
   $ yarn start
   ```

#### Getting start with `rdc-client`
1. cd to directory
   ```sh
   $ cd rdc-client
   ```

2. Install dependencies
   ```sh
   $ yarn install
   ```
3. please modify ip address of [config-overrides.js](rdc-client/config-overrides.js) which is rdc-server running on.

4. Happy hacking
   ```sh
   $ yarn start
   ```

#### Build `rdc-client` artifact

1. modifying `testing` property in `API_HOSTS` of [config-overrides.js](rdc-client/config-overrides.js), which is rdc-server deployed host.
2. settle down environment variables, cause our CI is needed dynamically updating ELECTRON_VERSION & BUILD_NUMBER. Or you can remove `artifactName` property in `build` of [package.json](rdc-client/package.json) to skip this step. 
   ```sh
   $ export ELECTRON_VERSION=7.1.2
   $ export BUILD_NUMBER=0
   ```
3. build artifact
   ```sh
   $ yarn build:testing
   ```