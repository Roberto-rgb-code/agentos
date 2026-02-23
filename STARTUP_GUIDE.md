# Guía de Arranque - Node.js 20

## 🚀 Inicio Rápido (Recomendado)

### Opción A: Usar Tasks de VS Code/Cursor (Más Fácil)

1. **Task: "Check Node Version"**
   - Verifica Node.js v20
   - Si no es v20, ejecuta: `nvm use 20`

2. **Task: "Dev Bootstrap"**
   - Configura todo automáticamente

3. **Task: "Dev Server"**
   - Inicia el server

4. **Task: "Dev Smoke Test"** (cuando el server esté corriendo)
   - Prueba el endpoint

**Cómo ejecutar tasks:**
- Presiona `Cmd+Shift+P` (macOS) o `Ctrl+Shift+P` (Windows/Linux)
- Escribe: `Tasks: Run Task`
- Selecciona la task

Ver `RUNBOOK.md` para más detalles.

---

### Opción B: Terminal (Manual)

### Paso 1: Configurar Node.js 20

```bash
# Cambiar a Node.js 20
nvm use 20

# Si no está instalado:
nvm install 20
nvm use 20

# Verificar
node -v
# Debe mostrar: v20.x.x
```

### Paso 2: Bootstrap Automático

```bash
# Desde la raíz del proyecto
yarn dev:bootstrap
```

Este comando automáticamente:
- ✅ Verifica Node.js v20
- ✅ Instala dependencias (sin borrar yarn.lock)
- ✅ Levanta Docker Compose (Postgres + n8n)
- ✅ Espera a que Postgres esté healthy
- ✅ Configura variables de entorno
- ✅ Ejecuta Prisma: generate, migrate, seed

### Paso 3: Iniciar Server

```bash
# En esta terminal o en otra:
yarn dev:server
```

### Paso 4: Probar Endpoint (Opcional)

```bash
# En otra terminal (cuando el server esté corriendo):
yarn dev:smoketest
```

Este comando:
- ✅ Verifica que el server esté corriendo
- ✅ Obtiene/crea Integration API Key
- ✅ Prueba el endpoint WhatsApp inbound
- ✅ Verifica respuesta 201
- ✅ (Opcional) Consulta DB para confirmar inserts

---

## 📋 Flujo Manual (Si prefieres hacerlo paso a paso)

### 1. Configurar Node.js 20

```bash
# Verificar versión actual
node -v

# Si estás en 25.x, instalar y usar Node 20:
nvm install 20
nvm use 20

# Verificar
node -v
# Debe mostrar: v20.x.x
```

### 2. Instalar Dependencias

```bash
cd /ruta/a/anything-llm

# Instalar dependencias (NO borrar yarn.lock - está versionado)
yarn install

# Si hay problemas, limpiar solo node_modules:
cd server && rm -rf node_modules && yarn install && cd ..
cd frontend && rm -rf node_modules && yarn install && cd ..
cd collector && rm -rf node_modules && yarn install && cd ..
```

### 3. Levantar Docker

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
# Verificar que postgres esté "healthy"
```

### 4. Configurar y Migrar DB

```bash
cd server

# Asegurar que DATABASE_URL esté en .env.development
echo 'DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"' >> .env.development
echo 'JWT_SECRET="dev-secret-key-change-in-production"' >> .env.development
echo 'SERVER_PORT=3001' >> .env.development

# Generar Prisma Client y migrar
export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"
yarn db:generate
yarn db:migrate

# Seed (crear usuario premium)
export SEED_ADMIN_EMAIL="admin@local"
export SEED_ADMIN_PASSWORD="admin123"
yarn db:seed
```

### 5. Iniciar Server

```bash
# Desde la raíz del proyecto
yarn dev:server
```

## Logs Esperados al Iniciar Correctamente

Cuando el server inicia correctamente, deberías ver algo como:

```
[nodemon] 2.0.22
[nodemon] starting `node --trace-warnings index.js`
prisma:info Starting a postgresql pool with 21 connections.
Primary server in HTTP mode listening on port 3001
```

**Línea clave:** `Primary server in HTTP mode listening on port 3001`

Si ves esta línea, el server está corriendo correctamente. El puerto puede variar según `SERVER_PORT` en `.env.development` (default: 3001).

## 🧪 Smoke Test

Una vez que el server esté corriendo, puedes probar el endpoint automáticamente:

```bash
# En otra terminal
yarn dev:smoketest
```

Este script:
1. Verifica que el server esté corriendo
2. Obtiene o crea un Integration API Key
3. Prueba el endpoint `/api/integrations/whatsapp/inbound`
4. Verifica respuesta 201
5. (Opcional) Consulta la DB para confirmar que se insertó el mensaje

**Salida esperada:**
```
✅ Test exitoso! Endpoint respondió 201 Created
✅ Mensaje encontrado en base de datos
✅ Campo 'raw' es JSON (objeto) - correcto
```

**Si ves errores:**
- `TypeError: Cannot read properties of undefined` → Node.js versión incorrecta (debe ser 20)
- `Cannot create JWT as JWT_SECRET is unset` → Falta JWT_SECRET en .env.development
- `Can't reach database server` → Postgres no está corriendo o DATABASE_URL incorrecto

## Probar Endpoint WhatsApp

Una vez que el server esté corriendo:

```bash
INTEGRATION_KEY="int_a74d5522532f4770bed3766c9c252c8b"

curl -i -X POST http://localhost:3001/api/integrations/whatsapp/inbound \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d '{"from":"5219999999999","messageId":"wamid.test123","text":"Hola","timestamp":"2026-02-19T00:00:00Z","raw":{"source":"n8n"}}'
```

**Respuesta esperada:**
```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": { ... },
  "lead": { ... },
  "created": true
}
```

## Verificar en DB

```bash
cd server
yarn db:studio
```

Verificar:
- `whatsapp_messages` - 1 registro con `raw` como JSON
- `leads` - Lead creado con `source: "WHATSAPP"`
- `integration_api_keys` - `lastUsedAt` actualizado

