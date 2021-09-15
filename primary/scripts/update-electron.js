const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const PKG_PATH = path.resolve(__dirname, '../package.json');

const ELECTRON_VERSION = process.env.ELECTRON_VERSION ?? '7.1.2';

pkg.devDependencies['electron'] = ELECTRON_VERSION;
pkg.agora_electron.electron_version = ELECTRON_VERSION;

fs.writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', function (err) {
  if (err) throw err;
});
