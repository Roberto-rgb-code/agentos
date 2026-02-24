const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const http = require('http');
const os = require('os');
const { promisify } = require('util');
const execAsync = promisify(exec);
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let splashWindow;

// Función para verificar si Docker está corriendo
async function checkDocker() {
  try {
    // Configurar PATH para macOS (Electron no siempre tiene acceso al PATH completo)
    const env = process.platform === 'darwin' 
      ? { 
          ...process.env, 
          PATH: process.env.PATH 
            ? `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`
            : '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin'
        }
      : process.env;
    
    // Intentar con timeout de 10 segundos
    await execAsync('docker info', { 
      env,
      timeout: 10000,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    return true;
  } catch (error) {
    console.error('Docker check failed:', error.message);
    // Intentar con ruta absoluta en macOS
    if (process.platform === 'darwin') {
      try {
        await execAsync('/usr/local/bin/docker info', { timeout: 10000 });
        return true;
      } catch (e) {
        // Intentar con la ruta de Docker Desktop
        try {
          await execAsync('/Applications/Docker.app/Contents/Resources/bin/docker info', { timeout: 10000 });
          return true;
        } catch (e2) {
          return false;
        }
      }
    }
    return false;
  }
}

// Función para verificar si los servicios están corriendo
async function checkServices() {
  try {
    // Configurar PATH para macOS
    const env = process.platform === 'darwin' 
      ? { 
          ...process.env, 
          PATH: process.env.PATH 
            ? `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`
            : '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin'
        }
      : process.env;
    
    const { stdout } = await execAsync('docker ps --filter "name=agentos" --format "{{.Names}}"', {
      env,
      timeout: 10000
    });
    const services = stdout.trim().split('\n').filter(Boolean);
    const requiredServices = ['agentos-postgres', 'agentos-server', 'agentos-frontend'];
    return requiredServices.every(service => services.includes(service));
  } catch (error) {
    console.error('Check services failed:', error.message);
    return false;
  }
}

// Función para obtener la ruta del proyecto
function getProjectRoot() {
  if (isDev) {
    return path.join(__dirname, '../');
  } else {
    // En producción, buscar el docker-compose en varios lugares posibles
    const homeDir = os.homedir();
    const desktopDir = path.join(homeDir, 'Desktop');
    const documentsDir = path.join(homeDir, 'Documents');
    
    const possiblePaths = [
      path.join(homeDir, 'agentos'), // ~/agentos
      path.join(desktopDir, 'agentos'), // ~/Desktop/agentos
      path.join(documentsDir, 'agentos'), // ~/Documents/agentos
      path.dirname(app.getPath('exe')), // Donde está la app instalada
      path.dirname(process.execPath), // Donde está el ejecutable
      process.cwd(), // Directorio actual de trabajo
    ];
    
    // Buscar el primer directorio que tenga docker-compose.dev.yml
    for (const possiblePath of possiblePaths) {
      try {
        const dockerComposePath = path.join(possiblePath, 'docker-compose.dev.yml');
        if (fs.existsSync(dockerComposePath)) {
          return possiblePath;
        }
      } catch (e) {
        // Continuar buscando
      }
    }
    
    // Si no se encuentra, usar ~/agentos (el usuario deberá clonar ahí)
    return path.join(homeDir, 'agentos');
  }
}

// Función para levantar servicios Docker
async function startDockerServices() {
  const projectRoot = getProjectRoot();
  const dockerComposePath = path.join(projectRoot, 'docker-compose.dev.yml');
  
  // Configurar PATH para macOS
  const env = process.platform === 'darwin' 
    ? { 
        ...process.env, 
        PATH: process.env.PATH 
          ? `${process.env.PATH}:/usr/local/bin:/opt/homebrew/bin`
          : '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin'
      }
    : process.env;
  
  return new Promise((resolve, reject) => {
    const dockerCompose = spawn('docker', ['compose', '-f', dockerComposePath, 'up', '-d'], {
      cwd: projectRoot,
      env: env,
      stdio: 'pipe'
    });

    let output = '';
    dockerCompose.stdout.on('data', (data) => {
      output += data.toString();
    });

    dockerCompose.stderr.on('data', (data) => {
      output += data.toString();
    });

    dockerCompose.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Docker compose failed with code ${code}: ${output}`));
      }
    });
  });
}

// Función para verificar que el frontend responda
function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Función para esperar a que los servicios estén listos
async function waitForServices(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServices()) {
      // Verificar que el frontend responda
      if (await checkFrontend()) {
        return true;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
  }
  return false;
}

// Crear ventana de splash (cargando)
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadURL(`data:text/html;charset=utf-8,
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-radius: 10px;
        }
        h1 { margin: 0 0 20px 0; font-size: 24px; }
        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status { margin-top: 20px; font-size: 14px; opacity: 0.9; }
      </style>
    </head>
    <body>
      <h1>Agentos</h1>
      <div class="spinner"></div>
      <div class="status" id="status">Iniciando servicios...</div>
    </body>
    </html>
  `);

  splashWindow.center();
  return splashWindow;
}

// Actualizar estado en splash
function updateSplashStatus(message) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.executeJavaScript(`
      document.getElementById('status').textContent = '${message}';
    `);
  }
}

function createWindow() {
  // Cerrar splash si existe
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
  }

  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Permitir iframes de localhost (n8n)
      preload: path.join(__dirname, 'preload.js'), // Inyectar script preload
    },
    icon: path.join(__dirname, '../frontend/public/favicon.png'),
    titleBarStyle: 'default',
    show: false, // No mostrar hasta que esté listo
  });

  // Inyectar variable de entorno antes de cargar
  mainWindow.webContents.on('did-finish-load', () => {
    // Inyectar script para configurar la API base
    mainWindow.webContents.executeJavaScript(`
      (function() {
        if (!window.__API_BASE_SET__) {
          window.__API_BASE_SET__ = true;
          // Configurar la API base para Electron
          if (typeof window !== 'undefined') {
            window.__ELECTRON_API_BASE__ = 'http://localhost:3001/api';
          }
        }
      })();
    `);
  });

  // Cargar la aplicación
  // Siempre cargar desde el frontend Dockerizado (localhost:3000)
  // ya que el frontend corre en un contenedor Docker
  mainWindow.loadURL('http://localhost:3000');
  
  // Abrir DevTools solo en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Enfocar la ventana
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (isDev) {
      console.error('Error loading:', errorCode, errorDescription, validatedURL);
    }
  });

  // Permitir iframes de localhost
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* http://127.0.0.1:*;"
      }
    });
  });
}

// Crear menú de aplicación
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' },
      ],
    },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' },
      ],
    },
  ];

  // En macOS, agregar menú de aplicación
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Acerca de' },
        { type: 'separator' },
        { role: 'services', label: 'Servicios' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar' },
        { role: 'hideOthers', label: 'Ocultar Otros' },
        { role: 'unhide', label: 'Mostrar Todo' },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Inicializar servicios y abrir ventana
async function initializeApp() {
  // Mostrar splash
  createSplashWindow();

  try {
    // 1. Verificar Docker
    updateSplashStatus('Verificando Docker...');
    const dockerRunning = await checkDocker();
    
    if (!dockerRunning) {
      await dialog.showMessageBox(splashWindow, {
        type: 'error',
        title: 'Docker no está corriendo',
        message: 'Docker Desktop no está corriendo',
        detail: 'Por favor, abre Docker Desktop y vuelve a intentar.',
        buttons: ['OK']
      });
      app.quit();
      return;
    }

    // 2. Verificar servicios
    updateSplashStatus('Verificando servicios...');
    const servicesRunning = await checkServices();

    if (!servicesRunning) {
      // 3. Levantar servicios
      updateSplashStatus('Iniciando servicios Docker...');
      await startDockerServices();
    }

    // 4. Esperar a que estén listos
    updateSplashStatus('Esperando servicios...');
    const servicesReady = await waitForServices();

    if (!servicesReady) {
      await dialog.showMessageBox(splashWindow, {
        type: 'warning',
        title: 'Servicios no disponibles',
        message: 'Los servicios no están respondiendo',
        detail: 'Puede que los servicios estén iniciando. Intenta de nuevo en unos momentos.',
        buttons: ['OK']
      });
    }

    // 5. Abrir ventana principal
    updateSplashStatus('Abriendo Agentos...');
    createWindow();
    createMenu();

  } catch (error) {
    console.error('Error inicializando app:', error);
    await dialog.showMessageBox(splashWindow, {
      type: 'error',
      title: 'Error',
      message: 'Error al iniciar Agentos',
      detail: error.message,
      buttons: ['OK']
    });
    app.quit();
  }
}

// Este método se ejecutará cuando Electron haya terminado de inicializarse
app.whenReady().then(() => {
  initializeApp();

  app.on('activate', () => {
    // En macOS, es común recrear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      initializeApp();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejar protocolo de la aplicación (opcional, para deep linking)
app.setAsDefaultProtocolClient('agentos');
