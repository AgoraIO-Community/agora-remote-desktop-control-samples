const { override, addWebpackExternals, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

const target = process.env.TARGET || 'production';

const API_HOSTS = {
  dev: 'http://10.103.2.105:3031', // please replace ip with your local network
  production: 'https://rdc-api.gz3.agoralab.co',
};

module.exports = override(
  addWebpackExternals({
    'agora-rdc-core': 'commonjs2 agora-rdc-core',
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
  }),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      API_HOST: JSON.stringify(API_HOSTS[target]),
    }),
  ),
);
