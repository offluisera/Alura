const { app, BrowserWindow, Tray, Menu, ipcMain, screen, session } = require('electron');
const path = require('path');

app.setName('Alura');

// Previne degradação gráfica, perda de foco e desfoque da janela quando em segundo plano
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

let win = null;
let splashWin = null;
let tray = null;
let isQuiting = false;

const SUPABASE_URL = 'https://xtfblkmufvgvsxzydzkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI';

function isVersionNewer(remote, local) {
  if (!remote) return false;
  const p1 = String(remote).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p2 = String(local || '1.0.0').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return false;
}

function fetchLatestRelease() {
  return new Promise((resolve) => {
    const https = require('https');
    const options = {
      hostname: 'xtfblkmufvgvsxzydzkl.supabase.co',
      path: '/rest/v1/app_versions?is_active=eq.true&order=created_at.desc&limit=1',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

function createSplashWindow() {
  splashWin = new BrowserWindow({
    width: 300,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    skipTaskbar: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWin.loadFile(path.join(__dirname, 'updater.html'));
  splashWin.once('ready-to-show', () => {
    splashWin.show();
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
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
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
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

async function startAppWithUpdaterCheck() {
  createSplashWindow();

  const localVersion = app.getVersion() || '1.0.0';
  const SPLASH_TOTAL_DURATION = 6000; // Demora em torno de 6 segundos para a tela desaparecer e depois abrir o app por completo
  const startTime = Date.now();

  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.webContents.send('updater-status', { stage: 'checking', version: localVersion });
  }

  // Animação progressiva de 6 segundos comunicando as etapas ao splash
  const progressTimer = setInterval(() => {
    if (!splashWin || splashWin.isDestroyed()) {
      clearInterval(progressTimer);
      return;
    }
    const elapsed = Date.now() - startTime;
    if (elapsed < 1400) {
      splashWin.webContents.send('updater-status', {
        stage: 'checking',
        label: 'Buscando atualizações...',
        detail: 'Conectando ao ecossistema Alura...',
        version: localVersion
      });
    } else if (elapsed < 4600) {
      const pct = Math.min(100, Math.round(((elapsed - 1400) / 3200) * 100));
      splashWin.webContents.send('updater-status', {
        stage: 'downloading',
        percent: pct,
        label: 'Verificando e baixando pacotes...',
        detail: `Sincronizando componentes (${pct}%)...`,
        version: localVersion
      });
    } else if (elapsed < SPLASH_TOTAL_DURATION) {
      splashWin.webContents.send('updater-status', {
        stage: 'ready',
        label: 'Atualização concluída!',
        detail: 'Iniciando o aplicativo Alura...',
        version: localVersion
      });
    }
  }, 200);

  let latestRelease = null;

  try {
    latestRelease = await fetchLatestRelease();
  } catch (e) {
    console.warn('[AutoUpdater] Falha ao consultar versão remota:', e);
  }

  const hasNewer = latestRelease && isVersionNewer(latestRelease.version, localVersion);

  if (hasNewer && latestRelease.download_url) {
    clearInterval(progressTimer);
    console.log(`[AutoUpdater] Nova versão encontrada: v${latestRelease.version} (Atual: v${localVersion}). Iniciando download silencioso...`);

    const tempDir = app.getPath('temp');
    const targetFile = path.join(tempDir, `AluraSetup-${latestRelease.version}.exe`);

    try {
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.webContents.send('updater-status', {
          stage: 'downloading',
          percent: 0,
          label: 'Downloading update 1 of 1...',
          detail: `Baixando Alura v${latestRelease.version}...`
        });
      }

      await downloadFile(latestRelease.download_url, targetFile, (progress) => {
        if (splashWin && !splashWin.isDestroyed()) {
          splashWin.webContents.send('updater-status', {
            stage: 'downloading',
            percent: progress.percent,
            label: 'Downloading update 1 of 1...',
            detail: `${(progress.received / (1024 * 1024)).toFixed(1)} MB de ${(progress.total / (1024 * 1024)).toFixed(1)} MB`
          });
        }
      });

      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.webContents.send('updater-status', {
          stage: 'installing',
          label: 'Installing update 1 of 1...',
          detail: 'Aplicando atualização silenciosa e reiniciando...'
        });
      }

      // Executa instalador em modo silencioso (/S) e fecha app para atualizar
      const { spawn } = require('child_process');
      const child = spawn(targetFile, ['/S'], { detached: true, stdio: 'ignore' });
      child.unref();

      setTimeout(() => {
        isQuiting = true;
        app.quit();
      }, 1200);
      return;
    } catch (downloadErr) {
      console.error('[AutoUpdater] Erro no download da atualização:', downloadErr);
      // Em caso de falha no download, segue abrindo o app normalmente
    }
  }

  // Aguarda completar em torno de 6 segundos para a tela desaparecer e depois abrir o app por completo
  const elapsedSoFar = Date.now() - startTime;
  const remainingWait = Math.max(0, SPLASH_TOTAL_DURATION - elapsedSoFar);

  setTimeout(() => {
    clearInterval(progressTimer);
    createWindow();
    win.once('ready-to-show', () => {
      win.show();
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.close();
        splashWin = null;
      }
    });
  }, remainingWait);
}

app.whenReady().then(() => {
  app.setAppUserModelId('Alura');

  // Ajusta Origin para conexões Phoenix WebSocket e API
  if (session && session.defaultSession && session.defaultSession.webRequest) {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      if (details.url && (details.url.includes('ws.alura.net.br') || details.url.includes('api.alura.net.br'))) {
        details.requestHeaders['Origin'] = 'https://alura.net.br';
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
  }

  // Habilita captura de tela e janelas para getDisplayMedia no Electron quando app está pronto
  const { desktopCapturer } = require('electron');
  let currentSelectedScreenSourceId = null;

  ipcMain.handle('set-selected-screen-source', async (_event, sourceId) => {
    currentSelectedScreenSourceId = sourceId;
    return true;
  });

  if (session && session.defaultSession && session.defaultSession.setDisplayMediaRequestHandler) {
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
      desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
        let chosen = null;
        if (currentSelectedScreenSourceId) {
          chosen = sources.find((s) => s.id === currentSelectedScreenSourceId);
        }
        if (!chosen && sources && sources.length > 0) {
          chosen = sources[0];
        }
        if (chosen) {
          callback({ video: chosen, audio: 'loopback' });
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

  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Alura', click: function () { win ? win.show() : null; } },
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

  startAppWithUpdaterCheck();
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

// ─── Auto-Updater do Aplicativo Desktop (.exe) ──────────────────────────────
let activeDownloadRequest = null;
let downloadedInstallerPath = null;

ipcMain.handle('get-app-version', () => {
  return app.getVersion() || '1.0.0';
});

function downloadFile(urlStr, targetPath, onProgress) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const lib = parsedUrl.protocol === 'https:' ? require('https') : require('http');

    const req = lib.get(urlStr, (res) => {
      // Seguir redirecionamentos (301, 302, 303, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, targetPath, onProgress).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Falha no download (HTTP ${res.statusCode})`));
      }

      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
      let receivedBytes = 0;
      const fileStream = require('fs').createWriteStream(targetPath);

      res.on('data', (chunk) => {
        receivedBytes += chunk.length;
        if (onProgress && totalBytes > 0) {
          const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          onProgress({ percent, received: receivedBytes, total: totalBytes });
        }
      });

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(targetPath));
      });

      fileStream.on('error', (err) => {
        try { require('fs').unlinkSync(targetPath); } catch (e) {}
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    activeDownloadRequest = req;
  });
}

ipcMain.on('start-update-download', async (event, data) => {
  try {
    const downloadUrl = data?.downloadUrl;
    if (!downloadUrl) {
      if (win && !win.isDestroyed()) {
        win.webContents.send('update-error', { message: 'URL de download inválida' });
      }
      return;
    }

    const tempDir = app.getPath('temp');
    const targetFile = path.join(tempDir, `AluraSetup-${data.version || 'latest'}.exe`);

    await downloadFile(downloadUrl, targetFile, (progress) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send('update-download-progress', progress);
      }
    });

    downloadedInstallerPath = targetFile;
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-downloaded', { filePath: targetFile, version: data.version });
    }
  } catch (err) {
    console.error('[Electron Auto-Updater] Erro no download:', err);
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-error', { message: err.message || 'Falha ao baixar atualização' });
    }
  }
});

ipcMain.on('cancel-update-download', () => {
  if (activeDownloadRequest) {
    try {
      activeDownloadRequest.destroy();
      activeDownloadRequest = null;
    } catch (e) {}
  }
});

ipcMain.handle('install-update', async (event, options = {}) => {
  try {
    const installerPath = options.filePath || downloadedInstallerPath;
    if (!installerPath || !require('fs').existsSync(installerPath)) {
      throw new Error('Arquivo de atualização não encontrado no disco');
    }

    const { spawn } = require('child_process');
    // Se silent for true, instala silenciosamente com /S, senão abre o instalador normalmente
    const args = options.silent ? ['/S'] : [];
    const child = spawn(installerPath, args, {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // Fecha o aplicativo Alura para permitir a substituição de arquivos
    isQuiting = true;
    setTimeout(() => {
      app.quit();
    }, 500);

    return { success: true };
  } catch (err) {
    console.error('[Electron Auto-Updater] Erro ao instalar:', err);
    return { success: false, error: err.message };
  }
});
