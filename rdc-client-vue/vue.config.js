const webpack = require('webpack');

const API_HOST = 'https://rdc-api.gz3.agoralab.co';

module.exports = {
  outputDir: 'build',
  publicPath: './',
  devServer: {
    port: 3000,
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(false)
    config.externals({
      'agora-rdc-core': 'commonjs2 agora-rdc-core',
      'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
    });
  },
  configureWebpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        API_HOST: JSON.stringify(API_HOST),
      }),
    );
  },
};
