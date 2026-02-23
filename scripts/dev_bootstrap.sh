#!/bin/bash
# Bootstrap script para desarrollo - Configura todo el entorno
# Uso: ./scripts/dev_bootstrap.sh

set -e

# Función para cargar nvm de forma segura (no falla si hay errores)
load_nvm() {
    export NVM_DIR="$HOME/.nvm"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        # Desactivar set -e temporalmente para cargar nvm
        set +e
        \. "$NVM_DIR/nvm.sh" 2>/dev/null
        set -e
    fi
}

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

# 1. Verificar Node.js v20
info "Verificando Node.js versión..."

# Cargar nvm si está disponible (de forma segura)
load_nvm

NODE_VERSION=$(node -v 2>/dev/null || echo "none")

# Usar regex para validar v20.*
if [[ ! "$NODE_VERSION" =~ ^v20\. ]]; then
    error "Node.js versión incorrecta: $NODE_VERSION"
    error "Se requiere Node.js v20.x"
    echo ""
    error "Debug info:"
    echo "  which node: $(which node 2>/dev/null || echo 'not found')"
    echo "  node -v: $(node -v 2>/dev/null || echo 'command failed')"
    echo ""
    echo "Para cambiar a Node.js 20:"
    echo "  1. Si tienes nvm:"
    echo "     nvm install 20"
    echo "     nvm use 20"
    echo ""
    echo "  2. Si no tienes nvm, instálalo:"
    echo "     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "     source ~/.zshrc  # o ~/.bash_profile"
    echo "     nvm install 20"
    echo "     nvm use 20"
    echo ""
    echo "  3. Verifica:"
    echo "     node -v  # Debe mostrar v20.x.x"
    exit 3
fi

info "✅ Node.js versión correcta: $NODE_VERSION"

# 2. Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ] || [ ! -f ".nvmrc" ]; then
    error "Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# 3. yarn install (idempotente - no borra yarn.lock)
info "Instalando dependencias con yarn..."
if [ -d "node_modules" ]; then
    warn "node_modules ya existe, saltando instalación de root..."
else
    yarn install
fi

# Verificar subdirectorios (idempotente - solo instala si falta)
for dir in server frontend collector; do
    if [ -d "$dir" ]; then
        if [ -d "$dir/node_modules" ] && [ -f "$dir/package.json" ]; then
            # Verificar si node_modules está completo (tiene al menos un paquete)
            if [ -d "$dir/node_modules/.bin" ] || [ "$(ls -A $dir/node_modules 2>/dev/null | head -1)" ]; then
                warn "$dir/node_modules ya existe, saltando..."
            else
                info "node_modules incompleto en $dir, reinstalando..."
                (cd "$dir" && yarn install)
            fi
        else
            info "Instalando dependencias en $dir..."
            (cd "$dir" && yarn install)
        fi
    fi
done

info "✅ Dependencias instaladas"

# 4. Docker Compose
info "Levantando Docker Compose..."

# Verificar si ya están corriendo
if docker compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
    warn "Docker Compose ya está corriendo"
else
    docker compose -f docker-compose.dev.yml up -d
    info "Esperando a que los servicios inicien..."
    sleep 5
fi

# 5. Esperar a que Postgres esté healthy
info "Esperando a que Postgres esté healthy..."
MAX_WAIT=60
WAITED=0
HEALTHY=false

while [ $WAITED -lt $MAX_WAIT ]; do
    if docker compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "healthy"; then
        HEALTHY=true
        break
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo -n "."
done
echo ""

if [ "$HEALTHY" = true ]; then
    info "✅ Postgres está healthy"
else
    error "Postgres no está healthy después de $MAX_WAIT segundos"
    error "Verifica con: docker compose -f docker-compose.dev.yml ps"
    exit 1
fi

# 6. Configurar variables de entorno en server/.env.development
info "Configurando variables de entorno..."

SERVER_ENV_FILE="server/.env.development"

# Crear archivo si no existe
if [ ! -f "$SERVER_ENV_FILE" ]; then
    touch "$SERVER_ENV_FILE"
fi

# Agregar DATABASE_URL si no existe
if ! grep -q "DATABASE_URL" "$SERVER_ENV_FILE" 2>/dev/null; then
    echo 'DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"' >> "$SERVER_ENV_FILE"
    info "Agregado DATABASE_URL a $SERVER_ENV_FILE"
fi

# Agregar JWT_SECRET si no existe
if ! grep -q "JWT_SECRET" "$SERVER_ENV_FILE" 2>/dev/null; then
    echo 'JWT_SECRET="dev-secret-key-change-in-production"' >> "$SERVER_ENV_FILE"
    info "Agregado JWT_SECRET a $SERVER_ENV_FILE"
fi

# Agregar SERVER_PORT si no existe
if ! grep -q "SERVER_PORT" "$SERVER_ENV_FILE" 2>/dev/null; then
    echo 'SERVER_PORT=3001' >> "$SERVER_ENV_FILE"
    info "Agregado SERVER_PORT a $SERVER_ENV_FILE"
fi

# 7. Prisma: generate, migrate, seed
info "Configurando base de datos con Prisma..."

cd server

# Exportar DATABASE_URL para Prisma
export DATABASE_URL="postgresql://anythingllm:anythingllm@localhost:5432/anythingllm_dev"

# Generate (idempotente)
info "Generando Prisma Client..."
yarn db:generate || {
    error "Error generando Prisma Client"
    cd ..
    exit 1
}

# Migrate (idempotente - solo aplica migraciones pendientes)
info "Ejecutando migraciones..."
if yarn db:migrate 2>&1 | grep -q "No pending migrations"; then
    info "✅ Migraciones ya aplicadas"
elif yarn db:migrate 2>&1 | grep -q "Applied migration"; then
    info "✅ Migraciones aplicadas"
else
    warn "Migraciones ya aplicadas o error (puede ser normal si ya están aplicadas)"
fi

# Seed (idempotente - solo crea si no existe)
info "Ejecutando seed..."
export SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-admin@local}"
export SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-admin123}"
SEED_OUTPUT=$(yarn db:seed 2>&1)
if echo "$SEED_OUTPUT" | grep -q "Created admin premium user\|Updated existing admin\|set to premium plan"; then
    info "✅ Seed ejecutado correctamente"
elif echo "$SEED_OUTPUT" | grep -q "already exists\|not found"; then
    warn "Seed ya ejecutado (usuario ya existe)"
else
    warn "Seed ejecutado (puede ser normal si ya existe el usuario)"
    echo "$SEED_OUTPUT" | tail -3
fi

cd ..

info "✅ Base de datos configurada"

# 8. Resumen y próximos pasos
echo ""
info "═══════════════════════════════════════════════════════════"
info "✅ Bootstrap completado exitosamente!"
info "═══════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Iniciar el server (en esta terminal o en otra):"
echo "   yarn dev:server"
echo ""
echo "2. En otra terminal, iniciar frontend (opcional):"
echo "   yarn dev:frontend"
echo ""
echo "3. En otra terminal, iniciar collector (opcional):"
echo "   yarn dev:collector"
echo ""
echo "4. Probar el endpoint (cuando el server esté corriendo):"
echo "   yarn dev:smoketest"
echo ""
echo "El server debería iniciar en: http://localhost:3001"
echo "Busca en los logs: 'Primary server in HTTP mode listening on port 3001'"
echo ""

