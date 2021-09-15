import { app, BrowserWindow } from 'electron';
// import { autoUpdater } from "electron-updater";
import logger from 'electron-log';
import ora from 'ora';

const __DEV__ = process.env.NODE_ENV === 'development';

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch(console.log);
};

const createWindow = async () => {
  logger.debug('__DEV__: ', __DEV__);
  let mainWindow: BrowserWindow | null = null;
  if (__DEV__) {
    const spinner = ora('Installing extensions.').start();
    // await installExtensions();
    spinner.succeed('Extensions installed!');
  }
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  if (__DEV__) {
    mainWindow.loadURL('http://localhost:3000');
  }
  if (!__DEV__) {
    mainWindow.loadFile('build/index.html');
  }
  if (__DEV__) {
    mainWindow.webContents.openDevTools();
  }
  if (!__DEV__) {
    logger.transports.file.level = 'info';
    // autoUpdater.logger = logger;
    // autoUpdater.checkForUpdatesAndNotify();
  }
};
app.whenReady().then(createWindow);
// app.disableHardwareAcceleration();
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
