# Runbook - Flujo de Desarrollo

## 🚀 Flujo Completo

### Primera vez (Setup inicial)

1. **Task: "Check Node Version"**
   - Verifica que Node.js esté instalado
   - ⚠️ Si no es v20, cambia con: `nvm use 20`

2. **Task: "Dev Bootstrap"**
   - Configura todo el entorno
   - Instala dependencias
   - Levanta Docker
   - Configura base de datos
   - Crea usuario premium

3. **Task: "Dev Server"**
   - Inicia el server en modo desarrollo
   - Busca en logs: `Primary server in HTTP mode listening on port 3001`

4. **Task: "Dev Smoke Test"** (en otra terminal o después de que el server esté corriendo)
   - Prueba el endpoint WhatsApp inbound
   - Verifica respuesta 201
   - Confirma inserts en DB

### Desarrollo diario

1. **Task: "Dev Server"**
   - Inicia el server

2. **Task: "Dev Frontend"** (opcional)
   - Inicia el frontend

3. **Task: "Dev Collector"** (opcional)
   - Inicia el collector

4. **Task: "Dev Smoke Test"** (cuando necesites probar)
   - Prueba el endpoint

## 📋 Tasks Disponibles

### Tasks Individuales

- **Check Node Version** - Verifica versión de Node.js
- **Dev Bootstrap** - Configura entorno completo (primera vez)
- **Dev Server** - Inicia el server
- **Dev Frontend** - Inicia el frontend
- **Dev Collector** - Inicia el collector
- **Dev Smoke Test** - Prueba endpoint WhatsApp inbound

### Task Compuesta

- **Dev All Services** - Inicia server, frontend y collector en paralelo

## 🎯 Cómo Ejecutar Tasks en VS Code/Cursor

### Método 1: Command Palette

1. Presiona `Cmd+Shift+P` (macOS) o `Ctrl+Shift+P` (Windows/Linux)
2. Escribe: `Tasks: Run Task`
3. Selecciona la task que quieres ejecutar

### Método 2: Terminal Menu

1. Ve a `Terminal` → `Run Task...`
2. Selecciona la task

### Método 3: Keyboard Shortcut

Puedes configurar shortcuts en `keybindings.json`:
```json
{
  "key": "cmd+shift+b",
  "command": "workbench.action.tasks.runTask",
  "args": "Dev Server"
}
```

## ⚠️ Requisitos Previos

### Node.js v20
Antes de ejecutar cualquier task, asegúrate de tener Node.js v20:

```bash
# Verificar versión
node -v

# Si no es v20:
nvm use 20
# O si no está instalado:
nvm install 20
nvm use 20
```

### Docker
Docker debe estar corriendo. El task "Dev Bootstrap" lo levanta automáticamente, pero puedes verificar:

```bash
docker compose -f docker-compose.dev.yml ps
```

## 🔄 Flujo Recomendado

### Setup Inicial (una vez)
```
1. Check Node Version
2. Dev Bootstrap
3. Dev Server
4. (En otra terminal) Dev Smoke Test
```

### Desarrollo Normal
```
1. Dev Server
2. (Opcional) Dev Frontend
3. (Opcional) Dev Collector
```

### Probar Cambios
```
1. Dev Smoke Test
```

## 📝 Notas

- **Dev Bootstrap** es idempotente: puedes ejecutarlo múltiples veces sin problemas
- **Dev Server** corre en background: puedes seguir trabajando mientras corre
- **Dev Smoke Test** requiere que el server esté corriendo
- Los scripts tienen permisos de ejecución (`chmod +x`) configurados

## 🐛 Troubleshooting

### Task falla: "Node.js versión incorrecta"
**Solución:**
```bash
nvm use 20
```

### Task falla: "Permission denied"
**Solución:**
Los scripts ya tienen permisos, pero si falla:
```bash
chmod +x scripts/*.sh
```

### Task falla: "Server no está corriendo"
**Solución:**
Ejecuta primero: **Task: "Dev Server"**

### Task falla: "Postgres no está healthy"
**Solución:**
Ejecuta primero: **Task: "Dev Bootstrap"** (levanta Docker)

