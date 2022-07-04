const webpack = require('webpack');

const target = process.env.TARGET || 'production';

const API_HOSTS = {
  dev: 'http://10.103.2.105:3031', // please replace ip with your local network
  production: 'https://rdc-api.gz3.agoralab.co',
};

module.exports = {
  outputDir: 'build',
  publicPath: './',
  devServer: {
    port: 3000,
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
    config.externals({
      'agora-rdc-core': 'commonjs2 agora-rdc-core',
      'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
    });
  },
  configureWebpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        API_HOST: JSON.stringify(API_HOSTS[target]),
      }),
    );
  },
};
