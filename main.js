const { app } = require('electron')
const { BrowserWindow } = require('electron')
require('@electron/remote/main').initialize()
function createWindow() {
  let win = new BrowserWindow({
    width: 510,
    height: 510,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    titleBarStyle: "hidden",
    icon: './ommmlogo.png',
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true, },
  })
  require('@electron/remote/main').enable(win.webContents)
  win.loadFile('index.html')
  win.on('closed', function () {
    win = null
  })

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
