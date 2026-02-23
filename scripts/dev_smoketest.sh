#!/bin/bash
# Smoke test para endpoint de WhatsApp inbound
# Uso: ./scripts/dev_smoketest.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    error "Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# 2. Verificar que el server esté corriendo
info "Verificando que el server esté corriendo..."

# Leer puerto de .env.development o usar default
if [ -f "server/.env.development" ]; then
    SERVER_PORT=$(grep "SERVER_PORT" server/.env.development | cut -d'=' -f2 | tr -d ' ' || echo "3001")
else
    SERVER_PORT=3001
fi

# Intentar conectar al server
if curl -s --max-time 2 "http://localhost:$SERVER_PORT" > /dev/null 2>&1; then
    info "✅ Server está corriendo en puerto $SERVER_PORT"
elif curl -s --max-time 2 "http://localhost:3001" > /dev/null 2>&1; then
    SERVER_PORT=3001
    info "✅ Server está corriendo en puerto $SERVER_PORT"
else
    error "El server no está corriendo en el puerto $SERVER_PORT"
    echo ""
    echo "Inicia el server con:"
    echo "  yarn dev:server"
    echo ""
    echo "O verifica el puerto en server/.env.development (SERVER_PORT)"
    exit 1
fi

# 3. Configurar variables de entorno
cd server
export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"

# 4. Obtener o crear Integration API Key
info "Obteniendo Integration API Key..."

# Intentar obtener key existente
EXISTING_KEY_OUTPUT=$(node -e "
const { IntegrationApiKey } = require('./models/integrationApiKey');
const { User } = require('./models/user');
(async () => {
  try {
    const users = await User.where();
    const premiumUser = users.find(u => u.plan === 'premium');
    if (!premiumUser) {
      console.log('NO_PREMIUM_USER');
      process.exit(1);
    }
    const keys = await IntegrationApiKey.forUser(premiumUser.id);
    const activeKey = keys.find(k => k.active);
    if (activeKey) {
      console.log(activeKey.key);
    } else {
      console.log('NO_KEY');
    }
  } catch (e) {
    console.log('ERROR: ' + e.message);
    process.exit(1);
  }
})();
" 2>&1)

# Extraer solo el token con regex (filtra logs de Prisma)
EXISTING_KEY=$(echo "$EXISTING_KEY_OUTPUT" | grep -Eo 'int_[a-zA-Z0-9]+' | head -n 1)

if [[ "$EXISTING_KEY_OUTPUT" == *"NO_PREMIUM_USER"* ]]; then
    error "No se encontró usuario premium"
    echo "Ejecuta primero: yarn dev:bootstrap"
    cd ..
    exit 1
elif [[ "$EXISTING_KEY_OUTPUT" == *"NO_KEY"* ]] || [[ "$EXISTING_KEY_OUTPUT" == *"ERROR"* ]]; then
    # Crear nuevo key
    info "Creando nuevo Integration API Key..."
    NEW_KEY_OUTPUT=$(node -e "
const { IntegrationApiKey } = require('./models/integrationApiKey');
const { User } = require('./models/user');
(async () => {
  try {
    const users = await User.where();
    const premiumUser = users.find(u => u.plan === 'premium');
    if (!premiumUser) {
      console.log('NO_PREMIUM_USER');
      process.exit(1);
    }
    const result = await IntegrationApiKey.create({
      userId: premiumUser.id,
      name: 'n8n WhatsApp Integration (Auto-generated)',
      planRequired: 'premium'
    });
    if (result.error) {
      console.log('ERROR: ' + result.error);
      process.exit(1);
    }
    console.log(result.key.key);
  } catch (e) {
    console.log('ERROR: ' + e.message);
    process.exit(1);
  }
})();
" 2>&1)
    
    # Extraer solo el token con regex (filtra logs de Prisma)
    NEW_KEY=$(echo "$NEW_KEY_OUTPUT" | grep -Eo 'int_[a-zA-Z0-9]+' | head -n 1)
    
    if [[ -z "$NEW_KEY" ]]; then
        error "Error: No se pudo extraer Integration API Key del output"
        error "Output completo:"
        echo "$NEW_KEY_OUTPUT"
        echo ""
        if [[ "$NEW_KEY_OUTPUT" == *"ERROR"* ]] || [[ "$NEW_KEY_OUTPUT" == *"NO_PREMIUM_USER"* ]]; then
            error "Error creando Integration API Key: $NEW_KEY_OUTPUT"
        fi
        cd ..
        exit 1
    fi
    INTEGRATION_KEY="$NEW_KEY"
    info "✅ Integration API Key creado: $INTEGRATION_KEY"
elif [[ -z "$EXISTING_KEY" ]]; then
    error "Error: No se pudo extraer Integration API Key del output"
    error "Output completo:"
    echo "$EXISTING_KEY_OUTPUT"
    echo ""
    error "El output debería contener un token con formato 'int_...'"
    cd ..
    exit 1
else
    INTEGRATION_KEY="$EXISTING_KEY"
    info "✅ Usando Integration API Key existente: $INTEGRATION_KEY"
fi

cd ..

# 5. Probar endpoint
info "Probando endpoint WhatsApp inbound..."

TEST_PAYLOAD='{"from":"5219999999999","messageId":"wamid.test.'$(date +%s)'","text":"Hola desde smoke test","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","raw":{"source":"smoketest","test":true}}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:$SERVER_PORT/api/integrations/whatsapp/inbound" \
  -H "Content-Type: application/json" \
  -H "X-Integration-Key: $INTEGRATION_KEY" \
  -d "$TEST_PAYLOAD" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
info "═══════════════════════════════════════════════════════════"
info "Resultado del Test"
info "═══════════════════════════════════════════════════════════"
echo ""
echo "HTTP Status Code: $HTTP_CODE"
echo ""
echo "Response Body:"
# Siempre mostrar el body, incluso si es 400
if [ -n "$BODY" ]; then
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo "(vacío)"
fi
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    info "✅ Test exitoso! Endpoint respondió 201 Created"
    
    # 6. (Opcional) Verificar en DB
    info "Verificando en base de datos..."
    
    DB_CHECK=$(cd server && export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev" && node -e "
const prisma = require('./utils/prisma');
(async () => {
  try {
    const messages = await prisma.whatsapp_messages.findMany({
      orderBy: { received_at: 'desc' },
      take: 1,
      include: { lead: { select: { id: true, name: true, status: true } } }
    });
    if (messages.length > 0) {
      const msg = messages[0];
      console.log('FOUND_MESSAGE');
      console.log('ID: ' + msg.id);
      console.log('From: ' + msg.wa_from);
      console.log('Body: ' + msg.body);
      console.log('Lead ID: ' + (msg.lead_id || 'null'));
      if (msg.lead) {
        console.log('Lead Name: ' + msg.lead.name);
        console.log('Lead Status: ' + msg.lead.status);
      }
      console.log('Raw type: ' + typeof msg.raw);
      console.log('Received at: ' + msg.received_at);
    } else {
      console.log('NO_MESSAGES');
    }
  } catch (e) {
    console.log('ERROR: ' + e.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" 2>&1)
    
    if [[ "$DB_CHECK" == *"FOUND_MESSAGE"* ]]; then
        info "✅ Mensaje encontrado en base de datos:"
        echo "$DB_CHECK" | grep -E "(ID|From|Body|Lead ID|Lead Name|Lead Status|Raw type|Received at)" | sed 's/^/  /'
        
        # Verificar que raw es JSON (objeto)
        if echo "$DB_CHECK" | grep -q "Raw type: object"; then
            info "✅ Campo 'raw' es JSON (objeto) - correcto"
        else
            warn "⚠️  Campo 'raw' no es objeto JSON (tipo: $(echo "$DB_CHECK" | grep 'Raw type:' | cut -d: -f2 | xargs))"
        fi
        
        # Verificar que se asoció a lead
        if echo "$DB_CHECK" | grep -q "Lead ID: null"; then
            warn "⚠️  Mensaje no está asociado a un lead"
        else
            info "✅ Mensaje asociado a lead correctamente"
        fi
    else
        warn "⚠️  No se pudo verificar en DB o no se encontró mensaje"
        if [[ "$DB_CHECK" == *"ERROR"* ]]; then
            echo "$DB_CHECK" | grep "ERROR"
        fi
    fi
    
    echo ""
    info "═══════════════════════════════════════════════════════════"
    info "✅ Smoke test completado exitosamente!"
    info "═══════════════════════════════════════════════════════════"
    exit 0
else
    error "❌ Test falló! Endpoint respondió $HTTP_CODE"
    echo ""
    error "Response completo:"
    echo "$BODY"
    echo ""
    error "Verifica:"
    echo "  1. El server está corriendo (yarn dev:server)"
    echo "  2. El Integration API Key es válido"
    echo "  3. El usuario asociado al key tiene plan premium"
    echo "  4. Revisa los logs del server para más detalles"
    exit 1
fi

