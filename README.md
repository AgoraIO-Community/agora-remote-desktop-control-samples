Agora Remote Desktop Control Samples
===================================

> if you want to try this samples directly, please download samples from [here](https://github.com/AgoraIO-Community/agora-remote-desktop-control-samples/releases)
### Prerequisites

1. Getting appId & certificate issued by agora, please read this [docs](https://docs.agora.io/en/Agora%20Platform/token#get-an-app-id)

2. Please make sure [Node.js 10+](https://nodejs.org/) has been installed.

### Quick Start


#### NOTICE: if you are always broken with `electron` & `electron-builder` installing, please try below commands:
```
$ npm set ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
$ npm set ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
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

#### Getting start with `primary`, which is our `HOST` end sample.
1. cd to directory
   ```sh
   $ cd primary
   ```

2. Install dependencies
   ```sh
   $ yarn install
   ```
3. please modify ip address of [config-overrides.js](primary/config-overrides.js) which is rdc-server running on.

4. Happy hacking
   ```sh
   $ yarn start
   ```

#### Getting start with `secondary`, which is our `CONTROLLED` end sample.
1. cd to directory
   ```sh
   $ cd secondary
   ```
   
2. Install dependencies
   ```sh
   $ yarn install
   ```

3. please modify ip address of [config-overrides.js](secondary/config-overrides.js) which is rdc-server running on.

4. Happy hacking
   ```sh
   $ yarn start
   ```
### `uid` definition agreement:

Since the end users taking dual-process to publish dual video streams at the same time, in order to facilitate the management of the video streams, here is an agreement on the uid (user's id):

1. `uid` is 32-bit unsigned integer.
2. `uid` must be following below agreement: 
    | StreamType | RoleType   | uid        |
    |------------|------------|------------|
    | 3          | 2          | ...        |
3. StreamType enum definition:
   ```typescript
   /**
    * RDC video stream type
    */
   export enum RDCStreamType {
     /**
      * Camera stream
      */
     CAMERA = 1,
     /**
      * Screen stream, for future using
      */
     SCREEN = 2,
     /**
      * Full screen stream
      */
     FULL_SCREEN = 3,
   }
   ```
4. RoleType enum definition:
   ```typescript
   /**
    * RDC Role type
    */
   export enum RDCRoleType {
     /**
      * Host end
      */
     HOST = 1,
     /**
      * Controlled end
      */
     CONTROLLED = 2,
   }
   ```

#### For example:

uid: 3212880:

1. highest digit `3` standing for `StreamType` is `FULL_SCREEN` stream.
2. secondary highest digit `2` standing for `RoleType` is `CONTROLLED`.
3. reset of digits are uid defined by our customers.
