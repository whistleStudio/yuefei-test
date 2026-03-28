import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// const WebSocket = require('ws')
import { playLiveStream } from './core/ffmpegWork'
import { contactQt } from './core/pyqtWork'
import dbManager from './db/DatabaseManager'
import { session } from 'electron'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.openDevTools({ mode: 'detach' })
}

// 创建视频播放窗口
// function createLiveWindow(): void {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     show: false,
//     autoHideMenuBar: true,
//     alwaysOnTop: true,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   mainWindow.on('ready-to-show', () => {
//     mainWindow.show()
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/src/windows/live/live.html`)
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/src/windows/live/live.html'))
//   }
// }

let pyqtProcess: ReturnType<typeof contactQt> | null = null
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  dbManager.init()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 开启直播(腾讯测试) // ffplay -fflags nobuffer -flags low_delay -framedrop -analyzeduration 0 rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid
  ipcMain.on('openLive', () => {
    console.log('openLive')
    // createLiveWindow()
    playLiveStream('rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid')
  })

  // 开启无人机控制
  ipcMain.on('startControl', (_, planeId) => {
    console.log('startControl')
    !pyqtProcess && (pyqtProcess = contactQt(planeId))
  })

  // 获取数据库设备信息
  ipcMain.handle('get-devices', () => {
    return dbManager.getAllDevices();
  });
  // 向数据库新增设备
  ipcMain.handle('add-device', (_, sn: string, name: string) => {
    return dbManager.addDevice(sn, name);
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  // 1. 允许跨域
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*']
      }
    })
  })
  
  // 2. 解决 HTTPS 资源在 file:// 下被阻止的问题
  app.commandLine.appendSwitch('disable-site-isolation-trials')
  app.commandLine.appendSwitch('ignore-certificate-errors') // 开发时忽略证书错误
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    // 关闭PyQt进程
    pyqtProcess?.stdin.write("__EXIT__\n")
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
