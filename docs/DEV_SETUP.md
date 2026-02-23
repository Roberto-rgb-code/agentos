# Guía de Desarrollo - AnythingLLM con CRM/Sales

Esta guía te llevará paso a paso desde clonar el repositorio hasta tener el entorno de desarrollo funcionando.

## Prerrequisitos

- **nvm** (Node Version Manager) - Para instalar en macOS:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  # Reinicia tu terminal o ejecuta:
  source ~/.zshrc  # o ~/.bash_profile según tu shell
  ```
- Yarn >= 1.22
- Git
- Docker y Docker Compose (para Postgres y n8n)
- Ollama corriendo localmente en `http://localhost:11434`

## Paso 0: Configurar Node.js 20

El proyecto requiere Node.js 20.x. El archivo `.nvmrc` en la raíz especifica la versión.

### Opción A: Usar script helper (recomendado)

```bash
# Desde la raíz del proyecto
./scripts/setup-node.sh
```

### Opción B: Manualmente con nvm

```bash
# Si tienes nvm instalado:
nvm use

# Si nvm dice que la versión no está instalada:
nvm install

# Verificar versión:
node --version
# Debe mostrar: v20.x.x
```

### Si nvm no está instalado (macOS)

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal o ejecutar:
source ~/.zshrc  # o ~/.bash_profile según tu shell

# Luego:
nvm install 20
nvm use 20
```

⚠️ **IMPORTANTE:** Si estás usando Node.js v25+, debes cambiar a Node.js 20:
```bash
nvm install 20
nvm use 20
```

## Paso 1: Clonar y preparar el repositorio

```bash
# Clonar el repositorio
git clone https://github.com/Mintplex-Labs/anything-llm.git
cd anything-llm

# Checkout a un release estable (v1.11.0)
git checkout v1.11.0

# Crear rama de trabajo
git checkout -b feature/crm-sales
```

## Paso 2: Habilitar Corepack (si es necesario)

```bash
corepack enable
```

## Paso 3: Instalación de dependencias

```bash
# Ejecutar setup (instala dependencias y crea archivos .env)
yarn setup
```

Este comando:
- Instala dependencias en `server/`, `frontend/`, y `collector/`
- Copia archivos `.env.example` a `.env` (o `.env.development` para server)
- Ejecuta `prisma:generate` y `prisma:migrate`

## Paso 4: Configurar variables de entorno

### 4.1 Server (`server/.env.development`)

**Variables REQUERIDAS (mínimo para que el server inicie):**

```env
# REQUERIDO: JWT Secret (crítico para autenticación)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# REQUERIDO: Database URL (PostgreSQL para CRM)
DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"

# OPCIONAL pero recomendado:
SERVER_PORT=3001
NODE_ENV=development
```

**Configuración completa recomendada para desarrollo con Ollama local:**

```env
# Server
SERVER_PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database (PostgreSQL para CRM)
DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"

# Multi-user mode (requerido para CRM)
MULTI_USER_MODE=true

# LLM Provider - Ollama local
LLM_PROVIDER=ollama
OLLAMA_BASE_PATH=http://localhost:11434
EMBEDDING_ENGINE=ollama
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Vector Database (puede ser local)
VECTOR_DB=qdrant
QDRANT_ENDPOINT=http://localhost:6333

# Opcional: Telemetry
DISABLE_TELEMETRY=true
```

**⚠️ Si el server no inicia, verifica:**
1. `JWT_SECRET` está definido (sin esto el server crashea)
2. `DATABASE_URL` apunta a Postgres correcto
3. Node.js versión es 18.x o 20.x (no 25+)

### 4.2 Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_SERVER_URL=http://localhost:3001
```

### 4.3 Collector (`collector/.env`)

```env
COLLECTOR_API_KEY=your-collector-api-key
SERVER_ENDPOINT=http://localhost:3001
```

## Paso 5: Levantar servicios Docker (Postgres + n8n)

En una terminal separada:

```bash
# Levantar Postgres y n8n
docker compose -f docker-compose.dev.yml up -d

# Verificar que están corriendo
docker compose -f docker-compose.dev.yml ps
```

Espera a que Postgres esté listo (puede tomar 10-20 segundos).

## Paso 6: Ejecutar migraciones de Prisma

```bash
# Desde la raíz del proyecto
cd server
npx prisma migrate dev --name add_crm_tables
cd ..
```

O desde la raíz:

```bash
yarn prisma:migrate
```

## Paso 7: Levantar servicios de desarrollo

Necesitas **3 terminales separadas**:

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
Debería iniciar en el puerto configurado en `collector/.env`

## Paso 8: Verificación

### 8.1 Verificar Server
- Abre `http://localhost:3001/api/system/health` (si existe) o cualquier endpoint
- Deberías ver logs en la terminal del server

### 8.2 Verificar Frontend
- Abre `http://localhost:5173` (o el puerto que Vite muestre)
- Deberías ver la página de login o la interfaz principal

### 8.3 Verificar Ollama
```bash
curl http://localhost:11434/api/tags
```
Deberías ver tus modelos listados (qwen2.5:7b, llama3.1:8b, nomic-embed-text:latest)

### 8.4 Verificar Postgres
```bash
docker exec -it anythingllm-postgres-dev psql -U anythingllm -d anythingllm_dev -c "\dt"
```
Deberías ver las tablas de Prisma.

## Checklist de verificación

- [ ] Postgres corriendo (`docker compose ps`)
- [ ] n8n corriendo (`docker compose ps`)
- [ ] Server corriendo en puerto 3001
- [ ] Frontend corriendo (puerto Vite)
- [ ] Collector corriendo
- [ ] Ollama accesible en localhost:11434
- [ ] Migraciones de Prisma ejecutadas
- [ ] Puedes acceder al frontend y hacer login

## Solución de problemas

### Error: "Docker credentials" en macOS

Si ves un error como:
```
error getting credentials - err: exit status 1, out: `One or more parameters passed to the function were not valid. (-50)`
```

**Solución paso a paso:**

1. **Verifica que Docker Desktop esté corriendo:**
   ```bash
   # Deberías ver el ícono de Docker en la barra de menú
   # Si no está, abre Docker Desktop desde Applications
   ```

2. **Reinicia Docker Desktop:**
   - Click derecho en el ícono de Docker → Quit Docker Desktop
   - Espera 10 segundos
   - Abre Docker Desktop nuevamente
   - Espera a que aparezca "Docker Desktop is running"

3. **Verifica que Docker funcione:**
   ```bash
   docker ps
   # Debería mostrar una lista (vacía o con contenedores)
   ```

4. **Si aún falla, intenta logout/login:**
   ```bash
   docker logout
   docker login
   ```

5. **Reintenta docker compose:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

6. **Si persiste, verifica permisos:**
   - System Settings → Privacy & Security → Full Disk Access
   - Asegúrate de que Docker Desktop tenga permisos

### Error: "Cannot find module"
- Ejecuta `yarn setup` nuevamente
- Verifica que `node_modules` exista en cada carpeta

### Error: "Port already in use"
- Cambia `SERVER_PORT` en `server/.env.development`
- O mata el proceso: `lsof -ti:3001 | xargs kill -9`

### Error: "Database connection failed"
- Verifica que Postgres esté corriendo: `docker compose ps`
- Verifica `DATABASE_URL` en `server/.env.development`
- Espera unos segundos después de levantar Docker
- Verifica que el healthcheck de Postgres esté "healthy"

### Error: "Ollama connection failed"
- Verifica que Ollama esté corriendo: `curl http://localhost:11434/api/tags`
- Verifica `OLLAMA_BASE_PATH` en `server/.env.development`

### Error: "TypeError: Cannot read properties of undefined (reading 'prototype')"
**Causa:** Incompatibilidad con Node.js v25+ o versión incorrecta

**Solución:**
```bash
# Verifica tu versión de Node.js
node --version

# Cambia a Node.js 20 (requerido por el proyecto)
nvm use 20
# O si no está instalado:
nvm install 20
nvm use 20

# Limpia solo node_modules (NO borres yarn.lock - está versionado)
cd server
rm -rf node_modules
yarn install

# Repite para frontend y collector si es necesario
cd ../frontend
rm -rf node_modules
yarn install

cd ../collector
rm -rf node_modules
yarn install

# NOTA: yarn.lock está versionado en server/, NO lo borres
```

### Error: "Cannot create JWT as JWT_SECRET is unset"
**Causa:** Falta variable `JWT_SECRET` en `server/.env.development`

**Solución:**
```bash
echo 'JWT_SECRET="dev-secret-key-change-in-production"' >> server/.env.development
```

## Siguiente paso

Una vez que todo esté funcionando, continúa con `DEV_LOCAL.md` para configurar y probar las funcionalidades CRM.


