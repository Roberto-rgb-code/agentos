# 🤖 Agentos

**Self-hosted, Local-first, AI-powered Desktop CRM with Workflow Automation**

Una aplicación de escritorio que integra chatbot con IA (Ollama), CRM, Analytics y automatización de workflows (n8n) — todo corriendo localmente en tu máquina.

---

## 📋 Requisitos

- **Docker Desktop** (v4.0+)
- **Docker Compose** (v2.0+)
- **Ollama** instalado nativamente ([ollama.com](https://ollama.com))
- **Node.js 20** (solo para desarrollo con Electron)
- **Git**

---

## 🚀 Instalación rápida (Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roberto-rgb-code/agentos.git
cd agentos
```

### 2. Instalar Ollama (en el host)

```bash
# macOS
brew install ollama

# O descargar desde https://ollama.com

# Descargar modelos
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### 3. Levantar todos los servicios

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

Esto levanta:
| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 3000 | React UI (nginx) |
| Backend  | 3001 | Node.js API |
| PostgreSQL | 5432 | Base de datos |
| n8n | 5678 | Workflow automation |

### 4. Acceder

- **App web:** http://localhost:3000
- **n8n:** http://localhost:5678
- **API:** http://localhost:3001/api

### 5. Primer uso

1. Abre http://localhost:3000
2. Completa el formulario de registro
3. Crea tu primer workspace
4. ¡Empieza a chatear con la IA!

---

## 🖥️ Modo Desktop (Electron)

Para usar como app de escritorio:

### 1. Asegúrate de que Docker está corriendo los servicios

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Instalar dependencias de Electron

```bash
cd electron
npm install
```

### 3. Abrir la app

```bash
cd electron
npm run dev
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│            Docker Compose               │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Frontend │  │ Backend  │            │
│  │ (React + │──│ (Node.js)│            │
│  │  Nginx)  │  │  :3001   │            │
│  │  :3000   │  └────┬─────┘            │
│  └──────────┘       │                  │
│                     │                  │
│  ┌──────────┐  ┌────┴─────┐            │
│  │   n8n    │  │PostgreSQL│            │
│  │  :5678   │  │  :5432   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
         │
         │ http://host.docker.internal:11434
         ▼
┌─────────────────┐
│  Ollama (host)  │
│  LLM local      │
└─────────────────┘
```

**¿Por qué Ollama fuera de Docker?**
- Mejor rendimiento (acceso directo a CPU/GPU)
- Sin overhead de contenedores para inferencia
- Más fácil de gestionar modelos

---

## 📦 Servicios incluidos

### 🤖 Chat con IA (Ollama)
- Chat conversacional con LLMs locales
- Soporte para múltiples modelos (llama3.1, qwen2.5, mistral, etc.)
- Embeddings locales para búsqueda semántica
- Sin datos enviados a la nube

### 📊 CRM
- Gestión de leads y contactos
- Pipeline de ventas
- Timeline de eventos por lead
- Integración con WhatsApp

### 📈 Analytics
- Dashboard de KPIs
- Métricas: leads contactados, calificados, conversión, RPR
- Filtros por fecha, canal, usuario

### 🔄 Workflows (n8n)
- Automatización de procesos
- Integración con WhatsApp Cloud API
- Webhooks para recibir datos externos
- Conexión directa a la base de datos

---

## 👥 Roles de usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: usuarios, configuración, LLM, CRM, Analytics, Workflows |
| `manager` | CRM, Analytics, gestión de usuarios |
| `default` | Chat, CRM básico |

---

## 🔧 Configuración

### Variables de entorno principales

Las variables se configuran en `docker-compose.dev.yml`:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://agentos:agentos@postgres:5432/agentos_dev` |
| `JWT_SECRET` | Secret para tokens | `agentos-secret-change-in-production` |
| `LLM_PROVIDER` | Proveedor de LLM | `ollama` |
| `OLLAMA_BASE_PATH` | URL de Ollama | `http://host.docker.internal:11434` |
| `OLLAMA_MODEL_PREF` | Modelo preferido | `llama3.1:8b` |
| `EMBEDDING_ENGINE` | Motor de embeddings | `ollama` |
| `EMBEDDING_BASE_PATH` | URL del embedder | `http://host.docker.internal:11434` |
| `EMBEDDING_MODEL_PREF` | Modelo de embeddings | `nomic-embed-text` |

### Cambiar el LLM

Desde la UI:
1. Settings → AI Providers → LLM
2. Selecciona el proveedor (Ollama, OpenAI, Anthropic, etc.)
3. Configura los parámetros
4. Guarda

---

## 🛠️ Desarrollo

### Modo desarrollo (sin Docker para frontend/backend)

```bash
# Terminal 1: Levantar DB y n8n
docker compose -f docker-compose.dev.yml up postgres n8n -d

# Terminal 2: Backend
cd server
yarn install
yarn dev

# Terminal 3: Frontend
cd frontend
yarn install
yarn dev

# Terminal 4 (opcional): Electron
cd electron
npm install
npm run dev
```

### Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.dev.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.dev.yml logs -f server

# Reiniciar un servicio
docker compose -f docker-compose.dev.yml restart server

# Parar todo
docker compose -f docker-compose.dev.yml down

# Parar y borrar volúmenes (⚠️ borra datos)
docker compose -f docker-compose.dev.yml down -v

# Reconstruir imágenes
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 📱 Integración con WhatsApp

1. Configura n8n (http://localhost:5678)
2. Crea un workflow con nodo Webhook
3. Conecta con WhatsApp Cloud API (Meta for Developers)
4. Los mensajes de WhatsApp se reciben → n8n → API → DB → CRM

Para desarrollo local necesitas un túnel público:
```bash
# Opción A: ngrok
ngrok http 5678

# Opción B: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5678
```

---

## 📁 Estructura del proyecto

```
agentos/
├── docker/
│   ├── Dockerfile.server      # Backend containerizado
│   ├── Dockerfile.frontend    # Frontend containerizado
│   └── nginx.conf             # Nginx config para frontend
├── docker-compose.dev.yml     # Todos los servicios
├── server/                    # Backend Node.js
│   ├── endpoints/             # API endpoints
│   ├── models/                # Modelos de datos
│   ├── prisma/                # Schema y migraciones
│   └── utils/                 # Utilidades
├── frontend/                  # React + Vite
│   └── src/
│       ├── components/        # Componentes React
│       ├── pages/             # Páginas (CRM, Analytics, Workflows)
│       └── utils/             # Utilidades
├── electron/                  # App desktop (Electron)
│   ├── main.js                # Proceso principal
│   └── preload.js             # Preload script
└── README.md
```

---

## 🐛 Solución de problemas

### Los contenedores no arrancan
```bash
docker compose -f docker-compose.dev.yml logs
```

### Ollama no responde
```bash
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/tags

# Si no responde, iniciar Ollama
ollama serve
```

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté corriendo
docker compose -f docker-compose.dev.yml ps postgres

# Ver logs de PostgreSQL
docker compose -f docker-compose.dev.yml logs postgres
```

### Reconstruir desde cero
```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 📄 Licencia

MIT

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/mi-feature`)
3. Commit tus cambios (`git commit -m 'Add mi feature'`)
4. Push a la branch (`git push origin feature/mi-feature`)
5. Abre un Pull Request
