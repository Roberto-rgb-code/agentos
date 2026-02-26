# 📦 Compilar App de Escritorio - Otra Mac

Esta guía explica cómo compilar la aplicación Electron para que se pueda abrir desde el escritorio sin necesidad de ejecutar comandos.

## 🎯 Objetivo

Crear una aplicación `.app` de macOS que puedas abrir haciendo doble clic desde el escritorio, sin necesidad de ejecutar comandos en la terminal.

---

## ⚠️ Problema Actual

Si al abrir la aplicación ves una ventana de Electron con información de versión (como en la captura), significa que:

1. **No tienes las dependencias instaladas** en la carpeta `electron`
2. **O estás ejecutando Electron directamente** sin pasar por el flujo de inicialización

---

## ✅ Solución: Compilar la Aplicación

### Paso 1: Verificar que Docker esté corriendo

```bash
docker ps
```

Si no está corriendo, abre Docker Desktop.

### Paso 2: Navegar al directorio del proyecto

```bash
cd "/ruta/a/agentos"  # Ajusta la ruta según tu caso
```

### Paso 3: Instalar dependencias de Electron (si no están instaladas)

```bash
cd electron
npm install
cd ..
```

### Paso 4: Construir el frontend

```bash
cd frontend
yarn build
cd ..
```

**Importante:** Después del build, renombra `_index.html` a `index.html`:

```bash
cd frontend/dist
mv _index.html index.html
cd ../..
```

### Paso 5: Compilar la aplicación para macOS

```bash
cd electron
npm run build:mac
cd ..
```

Esto puede tardar varios minutos la primera vez.

### Paso 6: Encontrar la aplicación compilada

La aplicación estará en:

```
electron/dist/Agentos-1.0.0.dmg          # macOS Intel
electron/dist/Agentos-1.0.0-arm64.dmg    # macOS M1/M2/M3
```

O directamente como `.app` en:

```
electron/dist/mac/Agentos.app
```

### Paso 7: Instalar la aplicación

**Opción A: Desde el DMG**

1. Abre el archivo `.dmg` que se generó
2. Arrastra **Agentos** a la carpeta **Aplicaciones**
3. Abre la aplicación desde Aplicaciones

**Opción B: Usar el .app directamente**

1. Copia `electron/dist/mac/Agentos.app` a tu carpeta **Aplicaciones**
2. O mantenlo en el escritorio y haz doble clic

### Paso 8: Configurar permisos (si es necesario)

Si macOS te dice que la aplicación no se puede abrir:

1. Ve a **Preferencias del Sistema** → **Seguridad y Privacidad**
2. Haz clic en **"Abrir de todas formas"** junto al mensaje de advertencia
3. O ejecuta:

```bash
xattr -cr /Applications/Agentos.app
```

---

## 🚀 Alternativa: Script de Inicio Rápido

Si prefieres no compilar, puedes crear un script que se ejecute desde el escritorio:

### Crear el script

```bash
cd "/ruta/a/agentos"
nano ~/Desktop/Iniciar\ Agentos.command
```

Pega este contenido:

```bash
#!/bin/bash
cd "/ruta/a/agentos"  # Ajusta la ruta
cd electron
npm run dev
```

Guarda y cierra (Ctrl+X, luego Y, luego Enter).

### Hacer el script ejecutable

```bash
chmod +x ~/Desktop/Iniciar\ Agentos.command
```

Ahora puedes hacer doble clic en el script desde el escritorio para iniciar la aplicación.

---

## 🔄 Actualizar la Aplicación Compilada

Si haces cambios y quieres actualizar la aplicación:

1. **Hacer pull de los cambios:**
   ```bash
   git pull origin master
   ```

2. **Reinstalar dependencias (si hay cambios en package.json):**
   ```bash
   cd electron
   npm install
   cd ..
   ```

3. **Reconstruir el frontend:**
   ```bash
   cd frontend
   yarn build
   cd frontend/dist
   mv _index.html index.html
   cd ../..
   ```

4. **Recompilar la aplicación:**
   ```bash
   cd electron
   npm run build:mac
   cd ..
   ```

5. **Reemplazar la aplicación antigua:**
   - Elimina la aplicación antigua de Aplicaciones
   - Copia la nueva aplicación compilada

---

## ❓ Solución de Problemas

### Error: "Cannot find module"

**Solución:** Instala las dependencias:

```bash
cd electron
npm install
cd ..
```

### Error: "docker command not found"

**Solución:** Asegúrate de que Docker Desktop esté corriendo y que `docker` esté en tu PATH.

### La aplicación se abre pero muestra una pantalla en blanco

**Solución:** Verifica que los servicios Docker estén corriendo:

```bash
docker compose -f docker-compose.dev.yml ps
```

Si no están corriendo:

```bash
docker compose -f docker-compose.dev.yml up -d
```

### La aplicación no encuentra docker-compose.dev.yml

**Solución:** La aplicación busca el archivo en varios lugares. Asegúrate de que el proyecto esté en uno de estos:

- `~/agentos`
- `~/Desktop/agentos`
- `~/Documents/agentos`

O ajusta la ruta en `electron/main.js` en la función `getProjectRoot()`.

---

## 📝 Notas Importantes

1. **Primera compilación:** Puede tardar 10-15 minutos porque descarga todas las dependencias
2. **Tamaño:** La aplicación compilada puede ocupar ~200-300 MB
3. **Actualizaciones:** Cada vez que hagas cambios significativos, necesitarás recompilar
4. **Docker:** La aplicación compilada aún requiere Docker Desktop corriendo

---

## ✅ Verificación Final

Después de compilar e instalar:

1. Abre la aplicación desde Aplicaciones o el escritorio
2. Deberías ver la ventana de splash "Iniciando servicios..."
3. Luego debería abrirse la aplicación con la interfaz de Agentos
4. Si todo funciona, puedes iniciar sesión con `admin` / `admin123`

---

## 🎉 ¡Listo!

Ahora tienes una aplicación que puedes abrir desde el escritorio sin necesidad de ejecutar comandos en la terminal.

