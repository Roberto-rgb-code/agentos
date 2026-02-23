# 🤖 Agentos

**AI-powered Desktop CRM con Workflow Automation — 100% Local**

Aplicación de escritorio que integra chatbot con IA (Ollama), CRM, gestión de productos, agentes IA y automatización de workflows (n8n). Todo corre localmente en tu máquina.

---

## 📋 Requisitos previos

- **Docker Desktop** (v4.0+) — [docker.com](https://www.docker.com/products/docker-desktop/)
- **Node.js 20** — [nodejs.org](https://nodejs.org/)
- **Git** — [git-scm.com](https://git-scm.com/)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roberto-rgb-code/agentos.git
cd agentos
```

### 2. Levantar los servicios (Docker)

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Esto levanta automáticamente:
- ✅ **PostgreSQL** — base de datos
- ✅ **Ollama** — IA local + descarga modelos (llama3.1:8b, nomic-embed-text)
- ✅ **Backend** — API Node.js + migraciones + datos de ejemplo
- ✅ **Frontend** — React + Nginx
- ✅ **n8n** — workflow automation

> ⏳ La primera vez tarda ~10-15 minutos porque descarga imágenes Docker y modelos de IA.

### 3. Instalar Electron (solo la primera vez)

```bash
cd electron
npm install
cd ..
```

### 4. Abrir la app de escritorio

```bash
cd electron
npm run dev
```

Se abre la ventana de **Agentos** como app nativa de escritorio.

### 5. Login

| Campo | Valor |
|-------|-------|
| **Usuario** | `admin` |
| **Contraseña** | `admin123` |

---

## 🔐 Credenciales

### Agentos (app principal)
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### n8n (Workflows)
- **Email:** `admin@agentos.local`
- **Contraseña:** `Admin123!`

---

## 📦 Servicios Docker

| Servicio | Puerto | Contenedor |
|----------|--------|------------|
| Frontend | 3000 | agentos-frontend |
| Backend | 3001 | agentos-server |
| PostgreSQL | 5432 | agentos-postgres |
| Ollama (IA) | 11434 | agentos-ollama |
| n8n | 5678 | agentos-n8n |

---

## 🔄 Configurar el Workflow (WhatsApp → CRM)

### Paso 1: Abrir Workflows
En la app, haz click en **Workflows** en el sidebar izquierdo e inicia sesión en n8n.

### Paso 2: Importar el workflow
1. Click en los **3 puntos (⋯)** arriba a la derecha
2. **"Import from file"**
3. Selecciona: `n8n-workflows/webhook-to-crm.json`

### Paso 3: Publicar
Click en **"Publish"** arriba a la derecha. El webhook queda activo.

### Paso 4: Probar
Desde una terminal:

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

### Paso 5: Verificar
Ve a **CRM - Leads** en el sidebar → aparece "Juan Perez" con source "WHATSAPP".

---

## 🌐 Webhook de producción (WhatsApp real)

Para conectar WhatsApp real necesitas exponer el webhook a internet:

### 1. Crear un túnel público

```bash
# Opción A: ngrok
ngrok http 5678

# Opción B: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5678
```

### 2. Configurar en Meta Business
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. En **WhatsApp → Configuration → Webhook**
3. URL: `https://tu-tunel.ngrok-free.app/webhook/whatsapp-lead`

### 3. Actualizar la URL en Docker
En `docker-compose.dev.yml`, cambia:
```yaml
- WEBHOOK_URL=https://tu-tunel.ngrok-free.app
```

### 4. Reiniciar n8n
```bash
docker compose -f docker-compose.dev.yml restart n8n
```

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────┐
│              Docker Compose                  │
│                                              │
│  ┌────────────┐       ┌────────────┐        │
│  │ Frontend   │──API──│  Backend   │        │
│  │ React+Nginx│       │  Node.js   │        │
│  │  :3000     │       │  :3001     │        │
│  └────────────┘       └─────┬──────┘        │
│                             │               │
│  ┌────────────┐       ┌─────┴──────┐        │
│  │   n8n      │       │ PostgreSQL │        │
│  │  :5678     │──────▶│  :5432     │        │
│  └────────────┘       └────────────┘        │
│                                              │
│  ┌────────────┐                              │
│  │  Ollama    │  ← IA local (LLM)           │
│  │  :11434    │                              │
│  └────────────┘                              │
└──────────────────────────────────────────────┘
         │
         ▼
┌────────────────┐
│ Electron App   │  ← App de escritorio
│ (Desktop)      │
└────────────────┘
```

---

## 📱 Qué incluye la app

| Sección | Descripción |
|---------|-------------|
| **Chatbot IA** | Chat con Ollama. Usa `@agent` para consultar datos del CRM |
| **CRM - Leads** | Gestión de leads con pipeline y conversaciones |
| **Productos** | Catálogo de productos con precio y stock |
| **Agentes IA** | Agentes de IA configurables |
| **Workflows** | n8n para automatización (WhatsApp, webhooks) |
| **Settings** | Configuración y cerrar sesión |

---

## 🗄️ Datos de ejemplo

La DB se inicializa con:
- **5 leads** con conversaciones y eventos
- **5 productos** (Plan Básico, Premium, Consultoría, Integración WhatsApp, Soporte)
- **2 agentes IA** (Agente WhatsApp Ventas, Agente Soporte)

---

## 🛠️ Comandos útiles

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.dev.yml ps

# Ver logs de un servicio
docker compose -f docker-compose.dev.yml logs -f server

# Reiniciar un servicio
docker compose -f docker-compose.dev.yml restart server

# Parar todo
docker compose -f docker-compose.dev.yml down

# Reset completo (borra todos los datos)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 📄 Licencia

MIT
