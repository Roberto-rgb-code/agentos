// Preload script para Electron
// Este script se ejecuta antes de que se cargue el contenido de la página

const { contextBridge } = require('electron');

// Exponer variables de entorno seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  apiBase: 'http://localhost:3001/api',
  isElectron: true,
});

