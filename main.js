const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 500,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: true, // Allow resizing per user request
    minWidth: 500,
    minHeight: 480,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools({ mode: 'detach' });

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
