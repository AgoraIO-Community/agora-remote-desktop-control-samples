const { resolve } = require('path');
const { defineConfig } = require('vite');
const commonjsExternals = require('vite-plugin-commonjs-externals').default;

module.exports = defineConfig({
  build: {
    rollupOptions: {
      output: {
        globals: { 'agora-rdc-core': 'AgoraRemoteDesktopControl' },
      },
      input: {
        landing: resolve(__dirname, 'landing.html'),
        controlled: resolve(__dirname, 'controlled.html'),
        host: resolve(__dirname, 'host.html'),
      },
    },
  },
  plugins: [commonjsExternals({ externals: ['agora-rdc-core', 'agora-rdc-webrtc-electron', 'agora-rtc-sdk-ng'] })],
  optimizeDeps: {
    exclude: ['agora-rdc-core', 'agora-rdc-webrtc-electron', 'agora-rtc-sdk-ng'],
  },
});
