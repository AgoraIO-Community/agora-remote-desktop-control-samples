import { app, BrowserWindow } from 'electron';
import registerHandlers from 'agora-rdc-webrtc-electron/lib/electron/registerHandlers';

registerHandlers();

const __DEV__ = process.env.NODE_ENV === 'development';

const createWindow = async () => {
  let mainWindow: BrowserWindow | null = null;
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  if (__DEV__) {
    mainWindow.loadURL('http://localhost:3000/landing.html');
  }
  if (!__DEV__) {
    mainWindow.loadFile('build/landing.html');
  }
  if (__DEV__) {
    mainWindow.webContents.openDevTools();
  }
};
app.whenReady().then(createWindow);
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
