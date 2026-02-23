# Guía de Desarrollo Local - CRM/Sales Module

Esta guía explica cómo configurar y probar el módulo CRM/Sales en AnythingLLM.

## Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Levantar Servicios](#levantar-servicios)
3. [Configurar Ollama Local](#configurar-ollama-local)
4. [Probar Endpoints](#probar-endpoints)
5. [Simular WhatsApp Inbound](#simular-whatsapp-inbound)
6. [Checklist de Pruebas](#checklist-de-pruebas)
7. [Definiciones de KPIs](#definiciones-de-kpis)

## Configuración Inicial

### 1. Levantar Docker Compose

```bash
# Desde la raíz del proyecto
docker compose -f docker-compose.dev.yml up -d

# Verificar que están corriendo
docker compose -f docker-compose.dev.yml ps
```

Deberías ver:
- `anythingllm-postgres-dev` en puerto 5432
- `anythingllm-n8n-dev` en puerto 5678

### 2. Configurar PostgreSQL en Prisma

Edita `server/prisma/schema.prisma` y asegúrate de que el datasource use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Configurar DATABASE_URL

En `server/.env.development`:

```env
DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"
```

### 4. Ejecutar Migraciones y Seed

```bash
# Desde la raíz
cd server
yarn db:generate
yarn db:migrate
yarn db:seed
cd ..
```

O desde la raíz:

```bash
yarn prisma:migrate
cd server && yarn db:seed && cd ..
```

**Nota sobre Seed:**
El seed script puede configurar usuarios premium automáticamente si defines variables de entorno:

```bash
# Opción A: Setear usuario existente a premium por email
export SEED_PREMIUM_EMAIL="tu-email@example.com"
cd server && yarn db:seed && cd ..

# Opción B: Crear usuario admin premium nuevo
export SEED_ADMIN_EMAIL="admin@example.com"
export SEED_ADMIN_PASSWORD="tu-password-seguro"
cd server && yarn db:seed && cd ..
```

### 5. Verificar Migraciones

```bash
cd server
npx prisma studio
```

Deberías ver las tablas:
- `leads`
- `lead_events`
- `whatsapp_messages`
- `integration_api_keys`

## Levantar Servicios

En **3 terminales separadas**:

### Terminal 1: Server
```bash
yarn dev:server
```
Debería iniciar en `http://localhost:3001`

### Terminal 2: Frontend
```bash
yarn dev:frontend
```
Debería iniciar en `http://localhost:5173` (o el puerto que Vite asigne)

### Terminal 3: Collector
```bash
yarn dev:collector
```

## Configurar Ollama Local

### Verificar Ollama

```bash
curl http://localhost:11434/api/tags
```

Deberías ver tus modelos listados.

### Configurar en server/.env.development

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_PATH=http://localhost:11434
EMBEDDING_ENGINE=ollama
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

## Probar Endpoints

### 1. Obtener Token de Autenticación

Primero, necesitas hacer login y obtener un token JWT. Puedes hacerlo desde el frontend o usando la API:

```bash
# Login (ajusta username/password según tu setup)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"tu-password"}'
```

Guarda el token del response.

### 2. Crear un Lead

```bash
TOKEN="tu-token-jwt"

curl -X POST http://localhost:3001/api/crm/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Juan Pérez",
    "phone": "+5219999999999",
    "email": "juan@example.com",
    "source": "MANUAL"
  }'
```

### 3. Listar Leads

```bash
curl -X GET "http://localhost:3001/api/crm/leads" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Obtener un Lead Específico

```bash
LEAD_ID="uuid-del-lead"

curl -X GET "http://localhost:3001/api/crm/leads/$LEAD_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Crear un Evento de Lead

```bash
curl -X POST "http://localhost:3001/api/crm/leads/$LEAD_ID/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "CONTACTED"
  }'
```

### 6. Obtener KPIs (Premium)

```bash
curl -X GET "http://localhost:3001/api/analytics/kpis?from=2026-01-01&to=2026-02-19" \
  -H "Authorization: Bearer $TOKEN"
```

**Nota:** Este endpoint requiere plan `premium`. Si recibes 403, necesitas actualizar el plan del usuario en la base de datos:

```sql
UPDATE users SET plan = 'premium' WHERE id = <user_id>;
```

## Simular WhatsApp Inbound

### Configurar Integration API Key

El endpoint de WhatsApp requiere un **Integration API Key** en el header `X-Integration-Key`. Este key debe ser creado por un usuario premium.

#### Opción 1: Crear API Key desde código (temporal para desarrollo)

```bash
cd server
node -e "
const { IntegrationApiKey } = require('./models/integrationApiKey');
const { User } = require('./models/user');

(async () => {
  const users = await User.where();
  const premiumUser = users.find(u => u.plan === 'premium') || users[0];
  if (!premiumUser) {
    console.log('No premium user found. Set a user to premium first.');
    process.exit(1);
  }
  const result = await IntegrationApiKey.create({
    userId: premiumUser.id,
    name: 'n8n WhatsApp Integration (Dev)',
    planRequired: 'premium'
  });
  if (result.error) {
    console.error('Error:', result.error);
  } else {
    console.log('Integration API Key created:');
    console.log(result.key.key);
  }
})();
"
```

#### Opción 2: Crear API Key manualmente en Prisma Studio

```bash
cd server
npx prisma studio
```

1. Ve a tabla `integration_api_keys`
2. Crea nuevo registro:
   - `key`: `int_` + UUID (ej: `int_abc123def456...`)
   - `name`: "n8n WhatsApp Integration"
   - `user_id`: ID de tu usuario premium
   - `plan_required`: `premium`
   - `active`: `true`

### Endpoint de Webhook

El endpoint está en: `POST /api/integrations/whatsapp/inbound`

**Requiere:**
- Header `X-Integration-Key` con un API key válido
- El usuario asociado al API key debe tener plan `premium`

### Simular con curl

```bash
# Reemplaza INTEGRATION_KEY con el key que obtuviste arriba
INTEGRATION_KEY="int_abc123def456..."

curl -X POST http://localhost:3001/api/integrations/whatsapp/inbound \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d '{
    "from": "5219999999999",
    "messageId": "wamid.test123",
    "text": "Hola, estoy interesado en sus productos",
    "timestamp": "2026-02-19T00:00:00Z",
    "raw": {
      "example": true,
      "source": "n8n"
    }
  }'
```

**Respuesta esperada:**
```json
{
  "message": { ... },
  "lead": { ... },
  "created": true
}
```

**Errores comunes:**
- `400 {error:"missing_integration_key"}` - Falta el header `X-Integration-Key`
- `401 {error:"invalid_integration_key"}` - Key inválido o inactivo
- `403 {error:"plan_required", required:"premium"}` - Usuario del key no tiene plan premium

**Nota:** En modo desarrollo, el servidor loguea la razón del rechazo en la consola para facilitar el debugging.

### Comportamiento Esperado

1. El mensaje se guarda en `whatsapp_messages`
2. Si existe un lead con ese teléfono, se asocia automáticamente
3. Si no existe y `autoCreateLead` está activo (por defecto), se crea un nuevo lead con:
   - `name`: "Lead {últimos 4 dígitos}"
   - `phone`: número normalizado
   - `source`: "WHATSAPP"
   - `status`: "NEW"

### Configurar n8n (Opcional)

1. Accede a n8n: `http://localhost:5678`
2. Login: `admin` / `admin`
3. Crea un workflow que:
   - Reciba webhook de Meta/WhatsApp
   - Envíe POST a `http://host.docker.internal:3001/api/integrations/whatsapp/inbound`
   - Pase el payload del webhook

## Checklist de Pruebas

### Setup Básico
- [ ] Docker Desktop corriendo (macOS)
- [ ] Postgres corriendo y healthy (`docker compose -f docker-compose.dev.yml ps`)
- [ ] n8n corriendo (`docker compose -f docker-compose.dev.yml ps`)
- [ ] DATABASE_URL configurado en `server/.env.development`
- [ ] Migraciones ejecutadas (`cd server && yarn db:migrate`)
- [ ] Seed ejecutado (`cd server && yarn db:seed`)
- [ ] Server corriendo en puerto 3001 (`yarn dev:server`)
- [ ] Frontend corriendo (`yarn dev:frontend`)
- [ ] Collector corriendo (`yarn dev:collector`)
- [ ] Ollama accesible (`curl http://localhost:11434/api/tags`)

### Funcionalidad CRM
- [ ] Crear lead desde UI
- [ ] Ver lista de leads
- [ ] Filtrar leads por status
- [ ] Buscar leads
- [ ] Ver detalle de lead
- [ ] Crear evento desde detalle (botones rápidos)
- [ ] Ver timeline de eventos

### Funcionalidad Analytics (Premium)
- [ ] Acceder a `/analytics` (debe mostrar lock si no es premium)
- [ ] Actualizar usuario a premium en DB
- [ ] Ver dashboard de KPIs
- [ ] Cambiar rango de fechas
- [ ] Verificar cálculos de KPIs

### Integración WhatsApp
- [ ] Usuario con plan premium configurado
- [ ] Integration API Key creado
- [ ] Simular inbound WhatsApp con curl (incluyendo header `X-Integration-Key`)
- [ ] Verificar respuesta 201 con message y lead
- [ ] Verificar que se crea mensaje en DB (`whatsapp_messages`)
- [ ] Verificar que se asocia a lead existente (si existe por teléfono)
- [ ] Verificar que se crea lead automático (si no existe)
- [ ] Ver mensajes en detalle de lead desde UI
- [ ] Probar sin API key (debe dar 401)
- [ ] Probar con API key de usuario basic (debe dar 403)

### Feature Flags (Planes)
- [ ] Usuario `basic` no puede acceder a `/analytics` (403 o lock UI)
- [ ] Usuario `basic` no puede usar endpoint `/api/integrations/whatsapp/inbound` (403)
- [ ] Usuario `premium` puede acceder a todo

## Definiciones de KPIs

### Leads Contactados
**Definición:** Número único de leads que han sido contactados en el rango de fechas.

**Cálculo:**
1. Contar leads únicos con eventos de tipo `CONTACTED` en el rango
2. También incluir leads con status `>= CONTACTED` (CONTACTED, QUALIFIED, CONVERTED) creados antes de la fecha `to`

**Fórmula:**
```
leadsContactados = unique(leads con evento CONTACTED) ∪ 
                   (leads con status >= CONTACTED creados <= to)
```

### Leads Calificados
**Definición:** Número único de leads que han sido calificados en el rango de fechas.

**Cálculo:**
- Contar leads únicos con eventos de tipo `QUALIFIED` en el rango

**Fórmula:**
```
leadsCalificados = unique(leads con evento QUALIFIED en rango)
```

### Tasa de Conversión
**Definición:** Porcentaje de leads contactados que se convirtieron.

**Cálculo:**
- Leads convertidos / Leads contactados × 100

**Fórmula:**
```
tasaConversion = (leadsConvertidos / leadsContactados) × 100
```

**Leads Convertidos:** Leads únicos con eventos de tipo:
- `CONVERTED`
- `PURCHASE`
- `REGISTRATION`

### RPR (Revenue per Recipient)
**Definición:** Ingresos promedio por lead contactado.

**Cálculo:**
- Revenue total / Recipients

**Fórmula:**
```
RPR = revenue / recipients
```

**Revenue:** Suma de `revenue` de eventos de tipo `PURCHASE` en el rango.

**Recipients:** Igual a `leadsContactados` (leads únicos contactados).

**Ejemplo:**
- 10 leads contactados
- 3 compras: $100, $200, $150
- Revenue = $450
- RPR = $450 / 10 = $45

## Solución de Problemas

### Error: "Docker credentials" en macOS

Ver sección completa en `DEV_SETUP.md` - Solución de problemas.

**Resumen rápido:**
1. Verifica Docker Desktop está corriendo
2. Reinicia Docker Desktop
3. Verifica con `docker ps`
4. Si persiste: `docker logout && docker login`

### Error: "Cannot connect to database"
- Verifica que Postgres esté corriendo: `docker compose -f docker-compose.dev.yml ps`
- Verifica que Postgres esté "healthy" (healthcheck)
- Verifica `DATABASE_URL` en `server/.env.development`
- Espera 10-20 segundos después de levantar Docker (Postgres tarda en inicializar)

### Error: "Plan check failed" o 403 en Analytics
- Ejecuta seed para setear premium:
  ```bash
  export SEED_PREMIUM_EMAIL="tu-email@example.com"
  cd server && yarn db:seed && cd ..
  ```
- O actualiza manualmente en Prisma Studio:
  ```bash
  cd server && npx prisma studio
  # Edita tabla users, cambia plan a "premium"
  ```

### Error: "WhatsApp endpoint returns 400/401/403"
**Códigos de error mejorados:**
- `400 {error:"missing_integration_key"}` - Falta header `X-Integration-Key`
- `401 {error:"invalid_integration_key"}` - Key inválido o inactivo
- `403 {error:"plan_required", required:"premium"}` - Usuario del key no tiene plan premium

**Solución:**
- Verifica que el header `X-Integration-Key` esté presente
- Verifica que el API key sea válido y activo
- Verifica que el usuario asociado al key tenga `plan = 'premium'`
- En modo desarrollo, revisa los logs del servidor para ver la razón exacta del rechazo

### Error: "dev_smoketest.sh no puede extraer Integration Key"
**Causa:** Prisma puede imprimir logs informativos (`prisma:info ...`) en stdout cuando se ejecutan comandos de Node.js, contaminando el output y haciendo que el script no pueda extraer el token.

**Solución:**
El script ahora usa regex (`grep -Eo 'int_[a-zA-Z0-9]+'`) para extraer solo el token, filtrando los logs de Prisma. Si aún falla:
1. Revisa el output completo que el script muestra
2. Verifica que existe un usuario premium
3. Crea el key manualmente usando Prisma Studio o el comando en la sección "Configurar Integration API Key"

### Error: "Prisma schema out of sync"
- Ejecuta: `cd server && yarn db:migrate`
- O: `cd server && npx prisma db push` (solo desarrollo, no recomendado)

### Error: "Ollama connection failed"
- Verifica que Ollama esté corriendo: `curl http://localhost:11434/api/tags`
- Verifica `OLLAMA_BASE_PATH` en `server/.env.development`

### Error: "TypeError: Cannot read properties of undefined (reading 'prototype')"
**Causa:** Node.js v25+ incompatible con dependencias antiguas

**Solución:**
```bash
# Cambia a Node.js 20 (recomendado)
nvm install 20
nvm use 20

# Reinstala dependencias
cd server
rm -rf node_modules yarn.lock
yarn install
```

### Error: "Cannot create JWT as JWT_SECRET is unset"
**Causa:** Falta `JWT_SECRET` en `server/.env.development`

**Solución:**
```bash
echo 'JWT_SECRET="dev-secret-key-change-in-production"' >> server/.env.development
```

## Flujo Completo de Prueba End-to-End

### 1. Setup Inicial

```bash
# 1. Levantar Docker
docker compose -f docker-compose.dev.yml up -d

# 2. Verificar servicios
docker compose -f docker-compose.dev.yml ps
# Debe mostrar postgres como "healthy"

# 3. Configurar y migrar DB
cd server
yarn db:generate
yarn db:migrate

# 4. Seed (setear usuario a premium)
export SEED_PREMIUM_EMAIL="admin@example.com"  # Tu email de usuario
yarn db:seed

# 5. Crear Integration API Key
node -e "
const { IntegrationApiKey } = require('./models/integrationApiKey');
const { User } = require('./models/user');
(async () => {
  const users = await User.where();
  const premiumUser = users.find(u => u.plan === 'premium');
  if (!premiumUser) {
    console.log('No premium user found');
    process.exit(1);
  }
  const result = await IntegrationApiKey.create({
    userId: premiumUser.id,
    name: 'n8n WhatsApp Integration',
    planRequired: 'premium'
  });
  console.log('Integration API Key:', result.key.key);
})();
"
# Copia el key que se imprime

cd ..
```

### 2. Levantar Servicios

```bash
# Terminal 1
yarn dev:server
# Anota el puerto (normalmente 3001)

# Terminal 2
yarn dev:frontend

# Terminal 3
yarn dev:collector
```

### 3. Probar Endpoints

```bash
# Obtener token de auth (desde frontend o API de login)
TOKEN="tu-jwt-token"

# CRM - Listar leads (debe dar 200 o 401 si no hay token)
curl -i http://localhost:3001/api/crm/leads \
  -H "Authorization: Bearer $TOKEN"

# CRM - Crear lead
curl -X POST http://localhost:3001/api/crm/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "phone": "+5219999999999",
    "email": "test@example.com",
    "source": "MANUAL"
  }'

# WhatsApp Inbound (con Integration Key)
INTEGRATION_KEY="int_abc123..."  # El key que obtuviste arriba

curl -X POST http://localhost:3001/api/integrations/whatsapp/inbound \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d '{
    "from": "5219999999999",
    "messageId": "wamid.test123",
    "text": "Hola, estoy interesado",
    "timestamp": "2026-02-19T00:00:00Z",
    "raw": {"source": "n8n"}
  }'

# Analytics KPIs (premium)
curl -X GET "http://localhost:3001/api/analytics/kpis?from=2026-01-01&to=2026-02-19" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Verificar en UI

1. Abre frontend (normalmente `http://localhost:5173`)
2. Login con tu usuario
3. Verifica que aparezca "CRM" en el sidebar
4. Crea un lead desde UI
5. Verifica Analytics (debe estar desbloqueado si eres premium)

## Próximos Pasos

1. **Configurar n8n con Meta/WhatsApp:** 
   - Crea workflow en n8n que reciba webhook de WhatsApp
   - Configura HTTP Request node apuntando a `http://host.docker.internal:3001/api/integrations/whatsapp/inbound`
   - Agrega header `X-Integration-Key` con tu Integration API Key

2. **Mejorar UI:** Agrega más visualizaciones y gráficos
3. **Exportar datos:** Agrega funcionalidad de exportación CSV/Excel
4. **Notificaciones:** Agrega alertas cuando llegan mensajes de WhatsApp
5. **Automatización:** Crea workflows automáticos basados en eventos de leads

## Notas de Desarrollo

- El módulo CRM usa PostgreSQL para persistencia
- El chat/RAG existente sigue usando SQLite (no se rompe)
- Los planes se almacenan en el campo `plan` de la tabla `users`
- Los feature flags se implementan con middleware `requirePlan`
- WhatsApp inbound requiere Integration API Key (no JWT auth)
- Integration API Keys están asociados a usuarios y verifican plan premium
- Los campos `meta` y `raw` usan tipo `Json` (jsonb en Postgres)

