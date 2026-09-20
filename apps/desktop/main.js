const { app, BrowserWindow, Tray, Menu, ipcMain, screen, session } = require('electron');
const path = require('path');

let win = null;
let tray = null;
let isQuiting = false;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111318',
      symbolColor: '#39FF88',
      height: 36
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.setMenu(null);

  // Intercepta retorno do OAuth do Spotify e recarrega Alura com o código PKCE
  const handleOAuthRedirect = (event, targetUrl) => {
    if (targetUrl.includes('code=') || targetUrl.includes('access_token=') || targetUrl.includes('error=')) {
      try {
        const urlObj = new URL(targetUrl);
        const search = urlObj.search ? urlObj.search.replace(/^\?/, '') : '';
        const hash = urlObj.hash ? urlObj.hash.replace(/^#/, '') : 'settings';
        
        event.preventDefault();
        win.loadFile(path.join(__dirname, 'ui/index.html'), {
          search: search,
          hash: hash.startsWith('/') ? hash : `/${hash}`
        });
      } catch (err) {
        console.error('Erro ao interceptar OAuth:', err);
      }
    }
  };

  win.webContents.on('will-redirect', handleOAuthRedirect);
  win.webContents.on('will-navigate', handleOAuthRedirect);

  win.loadFile(path.join(__dirname, 'ui/index.html'));

  win.on('close', function (event) {
    if (!isQuiting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });
  // Permissões automáticas de mídia (câmera, microfone, display)
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'mediaKeySystem', 'geolocation', 'notifications', 'fullscreen', 'display-capture'];
    callback(allowed.includes(permission));
  });
  win.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    const allowed = ['media', 'mediaKeySystem', 'fullscreen', 'display-capture'];
    return allowed.includes(permission);
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('Alura');

  // Habilita captura de tela e janelas para getDisplayMedia no Electron quando app está pronto
  const { desktopCapturer } = require('electron');
  if (session && session.defaultSession && session.defaultSession.setDisplayMediaRequestHandler) {
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
      desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
        if (sources && sources.length > 0) {
          callback({ video: sources[0], audio: 'loopback' });
        } else {
          callback({});
        }
      }).catch((err) => {
        console.error('[Electron] Erro no capturador de tela:', err);
        callback({});
      });
    });
  }

  // Handler para listar telas e janelas com thumbnail para o modal de compartilhamento
  ipcMain.handle('get-screen-sources', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true,
      });
      return sources.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail.toDataURL(),
        appIcon: s.appIcon ? s.appIcon.toDataURL() : null,
        display_id: s.display_id,
      }));
    } catch (err) {
      console.error('[Electron] Erro ao obter fontes de tela:', err);
      return [];
    }
  });

  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Alura', click: function () { win.show(); } },
    { type: 'separator' },
    { label: 'Encerrar Alura', click: function () { 
        isQuiting = true; 
        app.quit(); 
      } 
    }
  ]);
  tray.setToolTip('Alura');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (win) win.show();
  });
});

app.on('before-quit', function () {
  isQuiting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  } else {
    win.show();
  }
});

// ─── Janela nativa de chamada recebida ──────────────────────────────────────
let callWindow = null;

ipcMain.on('show-incoming-call', (event, data) => {
  if (callWindow && !callWindow.isDestroyed()) {
    callWindow.close();
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const w = 360;
  const h = 180;

  callWindow = new BrowserWindow({
    width: w,
    height: h,
    x: width - w - 20,
    y: height - h - 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-call.js')
    }
  });

  callWindow.loadFile(require('path').join(__dirname, 'incoming-call.html'));
  callWindow.setAlwaysOnTop(true, 'screen-saver');

  callWindow.webContents.once('did-finish-load', () => {
    callWindow.webContents.send('incoming-call-data', data);
    callWindow.showInactive();
  });

  callWindow.on('closed', () => { callWindow = null; });
});

ipcMain.on('call-action', (event, data) => {
  if (win && !win.isDestroyed()) {
    win.webContents.send('call-action-from-native', data);
    if (data.action === 'accept') {
      win.show();
      win.focus();
    }
  }
  if (callWindow && !callWindow.isDestroyed()) {
    callWindow.close();
  }
});

ipcMain.on('close-call-window', () => {
  if (callWindow && !callWindow.isDestroyed()) {
    callWindow.close();
  }
});

let notifications = [];

ipcMain.on('show-custom-notification', (event, data) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const notifWidth = 320;
  const notifHeight = 90;
  const padding = 16;
  const spacing = 8;
  
  const yPos = height - padding - notifHeight - (notifications.length * (notifHeight + spacing));
  
  const notifWin = new BrowserWindow({
    width: notifWidth,
    height: notifHeight,
    x: width - padding - notifWidth,
    y: yPos,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  notifWin.loadFile(path.join(__dirname, 'notification.html'));
  notifWin.setAlwaysOnTop(true, 'screen-saver');
  
  notifWin.webContents.once('did-finish-load', () => {
    notifWin.webContents.send('notification-data', data);
    notifWin.showInactive();
  });
  
  notifications.push(notifWin);

  ipcMain.once(`close-notification-${data.id}`, () => {
    if (!notifWin.isDestroyed()) {
      notifWin.close();
    }
  });

  ipcMain.once(`click-notification-${data.id}`, () => {
    if (!notifWin.isDestroyed()) {
      notifWin.close();
    }
    if (win) {
      win.show();
      win.focus();
      win.webContents.send('execute-notification-click', data.id);
    }
  });

  notifWin.on('closed', () => {
    notifications = notifications.filter(w => w !== notifWin);
  });

  setTimeout(() => {
    if (!notifWin.isDestroyed()) {
      notifWin.close();
    }
  }, 5000);
});
