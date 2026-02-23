# Scripts de Desarrollo - Documentación

## 🎯 Ejecutar desde VS Code/Cursor

**Recomendado:** Usa las Tasks de VS Code (ver `RUNBOOK.md`)

1. Presiona `Cmd+Shift+P` (macOS) o `Ctrl+Shift+P` (Windows/Linux)
2. Escribe: `Tasks: Run Task`
3. Selecciona la task que quieres ejecutar

**Tasks disponibles:**
- `Check Node Version` - Verifica Node.js v20
- `Dev Bootstrap` - Configura todo el entorno
- `Dev Server` - Inicia el server
- `Dev Frontend` - Inicia el frontend
- `Dev Collector` - Inicia el collector
- `Dev Smoke Test` - Prueba endpoint WhatsApp

---

## 📋 Scripts Disponibles (Terminal)

### `yarn dev:bootstrap`
**Archivo:** `scripts/dev_bootstrap.sh`

Configura todo el entorno de desarrollo automáticamente.

**Qué hace:**
1. ✅ Verifica Node.js v20 (sale con error si no es v20)
2. ✅ Instala dependencias con `yarn install` (idempotente - no borra yarn.lock)
3. ✅ Levanta Docker Compose (Postgres + n8n)
4. ✅ Espera a que Postgres esté healthy (timeout 60s)
5. ✅ Configura variables de entorno en `server/.env.development`
6. ✅ Ejecuta Prisma: `generate`, `migrate`, `seed` (idempotente)

**Uso:**
```bash
yarn dev:bootstrap
```

**Idempotente:** Puedes ejecutarlo múltiples veces sin problemas. Solo hace cambios si es necesario.

**Notas:**
- No inicia el server automáticamente (debes hacerlo con `yarn dev:server`)
- No borra `yarn.lock` (está versionado)
- Solo borra `node_modules` si hay problemas (no automáticamente)

---

### `yarn dev:smoketest`
**Archivo:** `scripts/dev_smoketest.sh`

Prueba el endpoint de WhatsApp inbound automáticamente.

**Qué hace:**
1. ✅ Verifica que el server esté corriendo
2. ✅ Obtiene o crea un Integration API Key para usuario premium
3. ✅ Ejecuta `curl` a `/api/integrations/whatsapp/inbound` con `X-Integration-Key`
4. ✅ Verifica respuesta HTTP 201
5. ✅ (Opcional) Consulta DB para confirmar que hay 1 row nueva en `whatsapp_messages`
6. ✅ Verifica que `raw` sea JSON (objeto)
7. ✅ Verifica que el mensaje esté asociado a un lead

**Uso:**
```bash
# Primero inicia el server:
yarn dev:server

# En otra terminal:
yarn dev:smoketest
```

**Salida esperada:**
```
✅ Test exitoso! Endpoint respondió 201 Created
✅ Mensaje encontrado en base de datos
✅ Campo 'raw' es JSON (objeto) - correcto
✅ Mensaje asociado a lead correctamente
```

**Idempotente:** Puedes ejecutarlo múltiples veces. Cada vez crea un nuevo mensaje de prueba.

**Nota sobre Integration Key:**
El script extrae automáticamente el Integration API Key del output de Node.js usando regex (`int_[a-zA-Z0-9]+`). Esto filtra los logs de Prisma que pueden aparecer en stdout cuando se ejecutan comandos de Node.js que usan Prisma. Si el script no puede extraer el key, mostrará el output completo para diagnóstico.

---

## 🔧 Características de los Scripts

### Idempotencia
Ambos scripts son **idempotentes**, es decir:
- Puedes ejecutarlos múltiples veces sin problemas
- Solo hacen cambios si es necesario
- No rompen si algo ya está configurado

### Manejo de Errores
- Mensajes de error claros y coloreados
- Instrucciones de qué hacer si algo falla
- Verificaciones antes de cada paso crítico

### Compatibilidad
- Funciona en macOS con zsh/bash
- Requiere Node.js v20 (verificado automáticamente)
- Requiere Docker y Docker Compose

---

## 🚀 Flujo de Trabajo Recomendado

### Primera vez (setup inicial):
```bash
# 1. Configurar Node.js 20
nvm use 20

# 2. Bootstrap (configura todo)
yarn dev:bootstrap

# 3. Iniciar server (en esta terminal o en otra)
yarn dev:server

# 4. Probar endpoint (en otra terminal)
yarn dev:smoketest
```

### Desarrollo diario:
```bash
# 1. Asegurar Node.js 20
nvm use 20

# 2. Iniciar server
yarn dev:server

# 3. (Opcional) Probar cambios
yarn dev:smoketest
```

### Si algo se rompe:
```bash
# Re-ejecutar bootstrap (idempotente)
yarn dev:bootstrap
```

---

## 📝 Variables de Entorno

Los scripts configuran automáticamente estas variables en `server/.env.development`:

- `DATABASE_URL` - Conexión a Postgres
- `JWT_SECRET` - Secret para JWT
- `SERVER_PORT` - Puerto del server (default: 3001)

Puedes sobrescribir con variables de entorno:
```bash
export SEED_ADMIN_EMAIL="tu@email.com"
export SEED_ADMIN_PASSWORD="tu-password"
yarn dev:bootstrap
```

---

## 🐛 Troubleshooting

### Error: "Node.js versión incorrecta" (exit code 3)
**Causa:** El script valida que Node.js sea v20.* usando regex. Si falla, muestra debug info con `which node` y `node -v`.

**Solución:**
```bash
nvm install 20
nvm use 20
# Verifica:
node -v  # Debe mostrar v20.x.x
```

### Error: "Postgres no está healthy"
**Solución:**
```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml restart postgres
```

### Error: "El server no está corriendo"
**Solución:**
```bash
# Inicia el server primero
yarn dev:server
```

### Error: "No se encontró usuario premium"
**Solución:**
```bash
# Re-ejecuta bootstrap para crear el usuario
yarn dev:bootstrap
```

### Error: "No se pudo extraer Integration API Key del output"
**Causa:** El script no pudo encontrar un token con formato `int_...` en el output de Node.js. Esto puede ocurrir si:
- Prisma imprime logs que contaminan el stdout
- El comando de Node.js falló antes de imprimir el key
- El formato del key cambió

**Solución:**
El script ahora usa regex para extraer solo el token (`int_[a-zA-Z0-9]+`), filtrando logs de Prisma. Si aún falla:
1. Revisa el output completo que el script muestra
2. Verifica que el usuario premium existe: `cd server && node -e "const {User}=require('./models/user');User.where().then(u=>console.log(u.filter(x=>x.plan==='premium')))"`
3. Crea el key manualmente usando Prisma Studio o el comando en `DEV_LOCAL.md`

---

## 📚 Documentación Relacionada

- `DEV_SETUP.md` - Guía completa de setup
- `DEV_LOCAL.md` - Guía de desarrollo y pruebas
- `STARTUP_GUIDE.md` - Guía de arranque rápido
- `README_CRM.md` - Guía rápida del módulo CRM

