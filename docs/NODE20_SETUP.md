# Configuración Node.js 20 - Resumen

## ✅ Cambios Aplicados

1. **`.nvmrc`** - Creado con `20`
2. **`package.json` (root)** - `engines: { "node": ">=20 <21", "yarn": ">=1.22" }`
3. **`server/package.json`** - `engines: { "node": ">=20 <21", "yarn": ">=1.22" }`
4. **`DEV_SETUP.md`** - Agregado Paso 0 con instrucciones nvm
5. **`scripts/setup-node.sh`** - Script helper creado

## 🚀 Comandos para Ejecutar en tu Terminal

**IMPORTANTE:** Ejecuta estos comandos en tu terminal (fuera de Cursor), ya que nvm requiere un shell interactivo.

```bash
# 1. Verificar versión actual
node -v

# 2. Si estás en 25.x, cambiar a Node 20:
nvm install 20
nvm use 20

# 3. Verificar cambio
node -v
# Debe mostrar: v20.x.x

# 4. Ir al proyecto
cd "/Users/mac/Desktop/granjas mac mini app desktop/anything-llm"

# 5. Instalar dependencias (NO borrar yarn.lock)
yarn install

# 6. Si hay problemas, limpiar solo node_modules:
cd server && rm -rf node_modules && yarn install && cd ..
cd frontend && rm -rf node_modules && yarn install && cd ..
cd collector && rm -rf node_modules && yarn install && cd ..

# 7. Levantar Docker
docker compose -f docker-compose.dev.yml up -d

# 8. Configurar DB
cd server
export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"
yarn db:generate
yarn db:migrate
export SEED_ADMIN_EMAIL="admin@local"
export SEED_ADMIN_PASSWORD="admin123"
yarn db:seed

# 9. Iniciar server
cd ..
yarn dev:server
```

## 📋 Logs Esperados

Cuando el server inicie correctamente, busca esta línea:

```
Primary server in HTTP mode listening on port 3001
```

Si ves esta línea, el server está corriendo y puedes probar el endpoint.

## 🧪 Probar Endpoint

```bash
INTEGRATION_KEY="int_a74d5522532f4770bed3766c9c252c8b"

curl -i -X POST http://localhost:3001/api/integrations/whatsapp/inbound \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d '{"from":"5219999999999","messageId":"wamid.test123","text":"Hola","timestamp":"2026-02-19T00:00:00Z","raw":{"source":"n8n"}}'
```

## 📝 Notas sobre yarn.lock

- `server/yarn.lock` está **versionado** - NO lo borres
- Solo borra `node_modules` si hay problemas de dependencias
- El monorepo usa yarn workspaces, cada subdirectorio tiene su propio `yarn.lock`

