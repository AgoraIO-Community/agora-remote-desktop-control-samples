import { app, BrowserWindow } from 'electron';
import logger from 'electron-log';
import registerHandlers from 'agora-rdc-webrtc-electron/lib/electron/registerHandlers';
import childProcess from 'child_process';

const killZombies = () => {
  if (process.platform == 'darwin') {
    childProcess.exec('killall VideoSource', (error) => console.log(error));
  }
  if (process.platform == 'win32') {
    childProcess.exec('taskkill /F /IM VideoSource.exe', (error) => console.log(error));
  }
};

registerHandlers();

const __DEV__ = process.env.NODE_ENV === 'development';

const createWindow = async () => {
  logger.debug('__DEV__: ', __DEV__);
  let mainWindow: BrowserWindow | null = null;
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
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
  }
};
app.whenReady().then(createWindow);
app.allowRendererProcessReuse = false;
app.on('window-all-closed', () => {
  killZombies()
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
