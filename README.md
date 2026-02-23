# 🤖 Agentos

**AI-powered Desktop CRM con Workflow Automation — 100% Local**

Aplicación que integra chatbot con IA (Ollama), CRM, gestión de productos, agentes IA y automatización de workflows (n8n). Todo corre localmente en tu máquina.

---

## 📋 Requisitos previos

- **Docker Desktop** (v4.0+) — [docker.com](https://www.docker.com/products/docker-desktop/)
- **Git** — [git-scm.com](https://git-scm.com/)

Eso es todo. No necesitas instalar Node.js, PostgreSQL, ni nada más.

---

## 🚀 Instalación (2 comandos)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roberto-rgb-code/agentos.git
cd agentos
```

### 2. Levantar todo

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Esto automáticamente:
- ✅ Levanta **PostgreSQL** (base de datos)
- ✅ Levanta **Ollama** y descarga los modelos de IA (llama3.1:8b + nomic-embed-text)
- ✅ Levanta el **Backend** (Node.js + Prisma), ejecuta migraciones y crea datos de ejemplo
- ✅ Levanta el **Frontend** (React + Nginx)
- ✅ Levanta **n8n** (workflow automation)

> ⏳ La primera vez tarda ~10-15 minutos porque descarga imágenes Docker y modelos de IA.

### 3. Abrir la app

Abre en tu navegador: **http://localhost:3000**

---

## 🔐 Credenciales

### Login de Agentos
| Campo | Valor |
|-------|-------|
| **Usuario** | `admin` |
| **Contraseña** | `admin123` |

### Login de n8n (Workflows)
| Campo | Valor |
|-------|-------|
| **Email** | `admin@agentos.local` |
| **Contraseña** | `Admin123!` |

---

## 📦 Servicios que levanta Docker

| Servicio | Puerto | Contenedor | Descripción |
|----------|--------|------------|-------------|
| Frontend | 3000 | agentos-frontend | React UI (nginx) |
| Backend | 3001 | agentos-server | Node.js API + Prisma |
| PostgreSQL | 5432 | agentos-postgres | Base de datos |
| Ollama | 11434 | agentos-ollama | IA local (LLM) |
| n8n | 5678 | agentos-n8n | Workflow automation |

---

## 🔄 Configurar el Workflow de n8n (WhatsApp → CRM)

### Paso 1: Abrir n8n
1. En la app, haz click en **Workflows** en el sidebar izquierdo
2. Inicia sesión con las credenciales de n8n

### Paso 2: Importar el workflow
1. En n8n, haz click en los **3 puntos (⋯)** arriba a la derecha
2. Selecciona **"Import from file"**
3. Selecciona el archivo del proyecto:
   ```
   n8n-workflows/webhook-to-crm.json
   ```
4. Se carga un workflow con 4 nodos:
   - **Webhook WhatsApp** → recibe datos
   - **Procesar Datos** → transforma los datos
   - **Crear Lead en CRM** → envía al backend
   - **Responder OK** → confirma la recepción

### Paso 3: Publicar
1. Haz click en **"Publish"** (arriba a la derecha)
2. El webhook queda activo en: `http://localhost:5678/webhook/whatsapp-lead`

### Paso 4: Probar
Simula un mensaje de WhatsApp:

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
Ve a **CRM - Leads** en el sidebar → el lead "Juan Perez" aparece con source "WHATSAPP"

---

## 🌐 Webhook de producción (WhatsApp real)

Para conectar WhatsApp real necesitas exponer el webhook a internet:

### 1. Crear un túnel público

```bash
# Opción A: ngrok (rápido para pruebas)
ngrok http 5678

# Opción B: Cloudflare Tunnel (gratis, más estable)
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

## 🖥️ Modo Desktop (Electron) — Opcional

Si quieres usarlo como app de escritorio (requiere Node.js 20):

```bash
cd electron
npm install
npm run dev
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
```

---

## 📱 Qué incluye la app

| Sección | Descripción |
|---------|-------------|
| **Chatbot IA** | Chat con Ollama. Usa `@agent` para consultar datos del CRM |
| **CRM - Leads** | Gestión de leads con pipeline y conversaciones |
| **Productos** | Catálogo de productos con precio y stock |
| **Agentes IA** | Agentes de IA configurables |
| **Workflows** | n8n embebido para automatización |
| **Settings** | Configuración y cerrar sesión |

---

## 🗄️ Datos de ejemplo incluidos

La DB se inicializa con:
- **5 leads** (María García, Carlos López, Ana Martínez, Roberto Hernández, Laura Sánchez)
- **5 productos** (Plan Básico, Premium, Consultoría, Integración WhatsApp, Soporte)
- **2 agentes IA** (Agente WhatsApp Ventas, Agente Soporte)
- **Conversaciones y eventos** de ejemplo

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

# Reset completo (borra datos)
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 📄 Licencia

MIT
