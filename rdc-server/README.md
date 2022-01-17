rdc-server
==========

#### Getting start with `rdc-server`, which is a simple server for issuing agora sdk token

1. Getting appId & certificate issued by agora, please read this [docs](https://docs.agora.io/en/Agora%20Platform/token#get-an-app-id)

2. Run simple redis server in docker, please install docker & docker-compose first.

   ```sh
   $ cd rdc-server
   $ docker-compose -f ./docker-compose.test.yml up -d
   ```

3. Copy .env.development.local.sample as .env.development.local
   ```sh
   $ cp .env.development.local.sample .env.development.local
   ```

4. Fill env variables in .env.development.local

5. Install dependencies
   ```sh
   $ yarn install
   ```
6. Happy hacking
   ```sh
   $ yarn start
   ```

