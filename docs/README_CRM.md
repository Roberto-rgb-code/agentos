# Módulo CRM/Sales - Guía Rápida

## 🚀 Inicio Rápido

### 1. Configurar Node.js 20

```bash
nvm use 20
# Si no está instalado: nvm install 20
```

### 2. Bootstrap Automático

```bash
yarn dev:bootstrap
```

Este comando configura todo automáticamente:
- ✅ Verifica Node.js v20
- ✅ Instala dependencias
- ✅ Levanta Docker (Postgres + n8n)
- ✅ Configura base de datos
- ✅ Crea usuario premium

### 3. Iniciar Server

```bash
yarn dev:server
```

Busca en los logs: `Primary server in HTTP mode listening on port 3001`

### 4. Probar Endpoint (Opcional)

```bash
# En otra terminal
yarn dev:smoketest
```

## 📋 Scripts Disponibles

- `yarn dev:bootstrap` - Configura todo el entorno de desarrollo
- `yarn dev:smoketest` - Prueba el endpoint de WhatsApp inbound
- `yarn dev:server` - Inicia el server
- `yarn dev:frontend` - Inicia el frontend
- `yarn dev:collector` - Inicia el collector

## 🔑 Integration API Key

El script `dev:smoketest` crea automáticamente un Integration API Key si no existe.

Para crear uno manualmente:

```bash
cd server
export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"
node -e "
const { IntegrationApiKey } = require('./models/integrationApiKey');
const { User } = require('./models/user');
(async () => {
  const users = await User.where();
  const premiumUser = users.find(u => u.plan === 'premium');
  const result = await IntegrationApiKey.create({
    userId: premiumUser.id,
    name: 'n8n WhatsApp Integration',
    planRequired: 'premium'
  });
  console.log(result.key.key);
})();
"
```

## 📚 Documentación Completa

- `DEV_SETUP.md` - Guía completa de setup inicial
- `DEV_LOCAL.md` - Guía de desarrollo y pruebas
- `STARTUP_GUIDE.md` - Guía de arranque rápido
- `NODE20_SETUP.md` - Configuración de Node.js 20

