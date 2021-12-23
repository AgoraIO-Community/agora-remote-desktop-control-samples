import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {

  config.externals = {
    'agora-rdc-core': 'commonjs2 agora-rdc-core',
    'agora-electron-sdk': 'commonjs2 agora-electron-sdk',
  };

  return config;
};