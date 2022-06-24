const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const PKG_PATH = path.resolve(__dirname, '../package.json');

const arch = process.env.npm_config_arch || process.arch;
const platform = process.env.npm_config_platform || process.platform;

pkg.agora_electron.platform = platform;

if (platform === 'win32') {
  pkg.agora_electron.arch = arch;
}

fs.writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', function (err) {
  if (err) throw err;
});
