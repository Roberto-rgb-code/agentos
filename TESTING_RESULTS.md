# Resultados de Pruebas End-to-End

## ✅ Completado Exitosamente

### 1. Docker Compose
```bash
$ docker compose -f docker-compose.dev.yml ps
NAME                       STATUS                    PORTS
anythingllm-postgres-dev   Up 11 seconds (healthy)   0.0.0.0:5432->5432/tcp
anythingllm-n8n-dev        Up 5 seconds              0.0.0.0:5678->5678/tcp
```
✅ **Postgres está healthy**

### 2. Variables de Entorno Configuradas
```bash
$ cat server/.env.development | grep -E "JWT_SECRET|SERVER_PORT|DATABASE_URL"
DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"
JWT_SECRET="dev-secret-key-change-in-production"
SERVER_PORT=3001
```
✅ **Variables críticas configuradas**

### 3. Prisma Migraciones
```bash
$ yarn prisma migrate dev --name init_crm
✅ Migration applied: 20260219223839_init_crm
✅ Prisma Client generated
```
✅ **Tablas creadas:**
- `leads`
- `lead_events`
- `whatsapp_messages`
- `integration_api_keys`

### 4. Seed - Usuario Premium
```bash
$ export SEED_ADMIN_EMAIL="admin@local"
$ export SEED_ADMIN_PASSWORD="admin123"
$ node prisma/seed.js
✅ Created admin premium user: admin@local
```
✅ **Usuario creado:**
- Email: `admin@local`
- ID: 1
- Plan: `premium`

### 5. Integration API Key
```bash
✅ Integration API Key created:
int_a74d5522532f4770bed3766c9c252c8b
```
✅ **API Key listo para usar**

## ❌ Problema Encontrado

### Server No Puede Iniciar

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'prototype')
    at Object.<anonymous> (/Users/mac/Desktop/granjas mac mini app desktop/anything-llm/server/node_modules/buffer-equal-constant-time/index.js:37:35)
```

**Causa:**
- Node.js v25.1.0 es incompatible con dependencias antiguas
- El paquete `buffer-equal-constant-time` (dependencia de `jsonwebtoken`) usa `SlowBuffer` que fue removido en Node.js 20+

**Solución:**
```bash
# Cambiar a Node.js 20 (recomendado)
nvm install 20
nvm use 20

# O Node.js 18 (mínimo requerido)
nvm install 18
nvm use 18

# Reinstalar dependencias
cd server
rm -rf node_modules yarn.lock
yarn install

# Intentar de nuevo
yarn dev:server
```

## 📋 Variables de Entorno Requeridas

### Críticas (sin estas el server NO inicia):
1. **JWT_SECRET** - Requerido para autenticación
2. **DATABASE_URL** - Requerido para conexión a DB

### Recomendadas:
- `SERVER_PORT=3001` (default: 3001)
- `NODE_ENV=development`
- `MULTI_USER_MODE=true` (para CRM)

## 🔧 Prueba Manual del Endpoint (cuando server esté corriendo)

Una vez que el server esté corriendo en Node.js 18/20:

```bash
# 1. Verificar que el server esté corriendo
curl http://localhost:3001/api/system/health

# 2. Probar endpoint WhatsApp inbound
INTEGRATION_KEY="int_a74d5522532f4770bed3766c9c252c8b"

curl -i -X POST http://localhost:3001/api/integrations/whatsapp/inbound \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d '{
    "from": "5219999999999",
    "messageId": "wamid.test123",
    "text": "Hola",
    "timestamp": "2026-02-19T00:00:00Z",
    "raw": {"source": "n8n"}
  }'
```

**Respuesta esperada:**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": {
    "id": "...",
    "wa_from": "5219999999999",
    "wa_message_id": "wamid.test123",
    "body": "Hola",
    "raw": {"source": "n8n"},
    "received_at": "2026-02-19T00:00:00.000Z"
  },
  "lead": {
    "id": "...",
    "name": "Lead 9999",
    "phone": "5219999999999",
    "source": "WHATSAPP",
    "status": "NEW"
  },
  "created": true
}
```

## 🔍 Verificación en DB

Después de la prueba exitosa, verificar en Prisma Studio:

```bash
cd server
yarn db:studio
```

**Verificar:**
1. Tabla `whatsapp_messages`:
   - Debe tener 1 registro
   - Campo `raw` debe ser JSON (no string)
   - Campo `lead_id` debe estar asociado

2. Tabla `leads`:
   - Debe tener 1 lead nuevo (si no existía)
   - `source` = "WHATSAPP"
   - `status` = "NEW"
   - `phone` = "5219999999999"

3. Tabla `integration_api_keys`:
   - Debe tener 1 key
   - `lastUsedAt` debe estar actualizado

## 📝 Resumen

| Componente | Estado | Notas |
|------------|--------|-------|
| Docker (Postgres + n8n) | ✅ | Healthy |
| Variables de entorno | ✅ | JWT_SECRET, DATABASE_URL configurados |
| Prisma migraciones | ✅ | Tablas creadas |
| Usuario premium | ✅ | admin@local creado |
| Integration API Key | ✅ | `int_a74d5522532f4770bed3766c9c252c8b` |
| Server iniciando | ❌ | Requiere Node.js 18/20 (actual: v25.1.0) |
| Endpoint WhatsApp | ⏸️ | Pendiente (server no iniciado) |

## 🚀 Próximos Pasos

1. **Cambiar a Node.js 20:**
   ```bash
   nvm install 20
   nvm use 20
   ```

2. **Reinstalar dependencias:**
   ```bash
   cd server
   rm -rf node_modules yarn.lock
   yarn install
   ```

3. **Iniciar server:**
   ```bash
   yarn dev:server
   # Debe mostrar: "Server listening on port 3001"
   ```

4. **Probar endpoint:**
   ```bash
   # Usar el curl de arriba con el Integration Key
   ```

5. **Verificar en DB:**
   ```bash
   yarn db:studio
   ```

