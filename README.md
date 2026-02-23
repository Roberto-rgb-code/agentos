# 🤖 Agentos

**AI-powered Desktop CRM con Workflow Automation — 100% Local**

Aplicación de escritorio que integra chatbot con IA (Ollama), CRM, gestión de productos, agentes IA y automatización de workflows (n8n). Todo corre localmente en tu máquina.

---

## 📋 Requisitos previos

- **Docker Desktop** (v4.0+) — [docker.com](https://www.docker.com/products/docker-desktop/)
- **Node.js 20** — [nodejs.org](https://nodejs.org/)
- **Git** — [git-scm.com](https://git-scm.com/)

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roberto-rgb-code/agentos.git
cd agentos
```

### 2. Levantar los servicios Docker

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Esto levanta automáticamente:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| PostgreSQL | 5432 | Base de datos |
| Ollama | 11434 | IA local (LLM) |
| n8n | 5678 | Workflow automation |

### 3. Esperar a que Ollama descargue los modelos

La primera vez, Ollama descarga los modelos de IA (~5-10 min):

```bash
# Verificar que los modelos estén listos
docker logs agentos-ollama 2>&1 | tail -5
```

### 4. Instalar dependencias del backend y migrar la DB

```bash
cd server
yarn install
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma db seed --schema=./prisma/schema.prisma
cd ..
```

### 5. Iniciar el backend

```bash
cd server
NODE_ENV=development node index.js &
cd ..
```

### 6. Instalar e iniciar el frontend

```bash
cd frontend
yarn install
yarn dev &
cd ..
```

### 7. Abrir la app de escritorio (Electron)

```bash
cd electron
npm install
npm run dev
```

---

## 🔐 Credenciales

### Login de Agentos
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Login de n8n (Workflows)
- **Email:** `admin@agentos.local`
- **Contraseña:** `Admin123!`

---

## 🔄 Configurar el Workflow de n8n (WhatsApp → CRM)

### Paso 1: Abrir n8n
1. En la app, haz click en **Workflows** en el sidebar izquierdo
2. Inicia sesión con las credenciales de n8n de arriba

### Paso 2: Importar el workflow
1. En n8n, haz click en los **3 puntos (⋯)** arriba a la derecha
2. Selecciona **"Import from file"**
3. Navega a la carpeta del proyecto y selecciona:
   ```
   n8n-workflows/webhook-to-crm.json
   ```
4. Se cargará un workflow con 4 nodos:
   - **Webhook WhatsApp** → recibe datos
   - **Procesar Datos** → transforma los datos
   - **Crear Lead en CRM** → envía al backend
   - **Responder OK** → confirma la recepción

### Paso 3: Publicar el workflow
1. Haz click en **"Publish"** (arriba a la derecha)
2. El webhook queda activo automáticamente en: `http://localhost:5678/webhook/whatsapp-lead`

### Paso 4: Probar
Desde una terminal, simula un mensaje de WhatsApp:

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Perez",
    "phone": "+5215512345678",
    "email": "juan@email.com",
    "message": "Me interesa el Plan Premium"
  }'
```

### Paso 5: Verificar en el CRM
1. Ve a **CRM - Leads** en el sidebar
2. El nuevo lead "Juan Perez" aparecerá con source "WHATSAPP"

---

## 🌐 Webhook de producción (WhatsApp real)

Para conectar WhatsApp real necesitas exponer el webhook a internet:

### 1. Crear un túnel público

**Opción A — ngrok (rápido para pruebas):**
```bash
ngrok http 5678
# Te da una URL tipo: https://abc123.ngrok-free.app
```

**Opción B — Cloudflare Tunnel (gratis, más estable):**
```bash
cloudflared tunnel --url http://localhost:5678
```

### 2. Configurar en Meta Business (WhatsApp Cloud API)
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea o selecciona tu app
3. En **WhatsApp → Configuration → Webhook**
4. Pon la URL del túnel + la ruta del webhook:
   ```
   https://tu-tunel.ngrok-free.app/webhook/whatsapp-lead
   ```
5. Configura el token de verificación

### 3. Actualizar la URL del webhook en Docker
En `docker-compose.dev.yml`, cambia:
```yaml
- WEBHOOK_URL=https://tu-tunel.ngrok-free.app
```

### 4. Reiniciar n8n
```bash
docker compose -f docker-compose.dev.yml restart n8n
```

El flujo queda:
```
WhatsApp (Meta) → túnel público → n8n local → API backend → PostgreSQL → CRM
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│              Docker Compose                 │
│                                             │
│  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │   Ollama   │            │
│  │   :5432    │  │  :11434    │            │
│  └────────────┘  └────────────┘            │
│                                             │
│  ┌────────────┐                             │
│  │    n8n     │                             │
│  │   :5678    │                             │
│  └────────────┘                             │
└─────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
┌────────────┐       ┌────────────┐
│  Backend   │──────▶│  Frontend  │
│  :3001     │       │  :3000     │
└────────────┘       └────────────┘
        │
        ▼
┌────────────────┐
│ Electron App   │
│ (Desktop)      │
└────────────────┘
```

---

## 📦 Qué incluye la app

| Sección | Descripción |
|---------|-------------|
| **Chatbot IA** | Chat con Ollama (llama3.1:8b). Usa `@agent` para consultar datos del CRM |
| **CRM - Leads** | Gestión de leads con pipeline, filtros, conversaciones |
| **Productos** | Catálogo de productos con precio y stock |
| **Agentes IA** | Gestión de agentes de IA configurables |
| **Workflows** | n8n embebido para automatización (webhooks, WhatsApp, etc.) |
| **Settings** | Configuración, seguridad, cerrar sesión |

---

## 🗄️ Base de datos

La DB incluye datos de ejemplo:
- **5 leads** (María García, Carlos López, Ana Martínez, Roberto Hernández, Laura Sánchez)
- **5 productos** (Plan Básico, Premium, Consultoría, Integración WhatsApp, Soporte)
- **2 agentes IA** (Agente WhatsApp Ventas, Agente Soporte)
- **Conversaciones** y **eventos** de ejemplo

---

## 🛠️ Comandos útiles

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.dev.yml ps

# Ver logs de un servicio
docker compose -f docker-compose.dev.yml logs -f n8n

# Reiniciar un servicio
docker compose -f docker-compose.dev.yml restart n8n

# Parar todo
docker compose -f docker-compose.dev.yml down

# Parar y borrar datos (reset completo)
docker compose -f docker-compose.dev.yml down -v

# Reconstruir imágenes
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 📁 Estructura del proyecto

```
agentos/
├── docker-compose.dev.yml      # Servicios Docker (Postgres, Ollama, n8n)
├── server/                     # Backend Node.js
│   ├── endpoints/crm.js        # API del CRM (leads, productos, agentes, webhooks)
│   ├── models/                 # Modelos (lead, producto, agente, conversacion)
│   ├── prisma/                 # Schema DB y migraciones
│   │   ├── schema.prisma
│   │   ├── seed.js             # Datos iniciales
│   │   └── migrations/
│   └── .env                    # Variables de entorno
├── frontend/                   # React + Vite
│   └── src/
│       ├── pages/              # CRM, Productos, Agentes, Workflows
│       └── components/         # Sidebar, Footer, Settings
├── electron/                   # App de escritorio
│   ├── main.js
│   └── preload.js
├── n8n-workflows/              # Workflows pre-hechos
│   └── webhook-to-crm.json    # WhatsApp → CRM Lead
├── docs/                       # Documentación adicional
├── start.sh                    # Script para iniciar todo
├── stop.sh                     # Script para parar todo
└── README.md
```

---

## 📄 Licencia

MIT
