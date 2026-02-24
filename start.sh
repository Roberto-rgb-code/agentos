#!/bin/bash
# ============================================
#  🚀 Agentos - Script de Inicio Rápido
# ============================================
# Uso: ./start.sh
#
# Requisitos:
#   - Docker Desktop instalado y corriendo
#   - Node.js 20+ (solo para Electron desktop)
#
# Este script levanta todos los servicios:
#   ✅ PostgreSQL (base de datos)
#   ✅ Ollama + modelos IA (llama3.1:8b, nomic-embed-text)
#   ✅ Backend (Node.js API)
#   ✅ Frontend (React + Nginx)
#   ✅ n8n (Workflows)
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  🚀 Agentos - Inicio Rápido${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# 1. Verificar Docker
echo -e "${YELLOW}[1/4]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado.${NC}"
    echo "   Descárgalo en: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo. Abre Docker Desktop primero.${NC}"
    exit 1
fi
echo -e "${GREEN}   ✅ Docker está listo${NC}"

# 2. Levantar servicios
echo ""
echo -e "${YELLOW}[2/4]${NC} Levantando servicios con Docker Compose..."
echo "   Esto puede tardar unos minutos la primera vez..."
echo ""
docker compose -f docker-compose.dev.yml up -d --build

# 3. Esperar a que Ollama descargue los modelos
echo ""
echo -e "${YELLOW}[3/4]${NC} Descargando modelos de IA (primera vez puede tardar ~5-10 min)..."
echo "   Puedes ver el progreso con: docker logs -f agentos-ollama-models"
echo ""

# Esperar a que el modelo loader termine
timeout=600 # 10 minutos max
elapsed=0
while docker ps --filter "name=agentos-ollama-models" --filter "status=running" -q | grep -q .; do
    if [ $elapsed -ge $timeout ]; then
        echo -e "${YELLOW}   ⚠️  La descarga está tardando mucho. Puedes verificar con:${NC}"
        echo "      docker logs agentos-ollama-models"
        break
    fi
    sleep 10
    elapsed=$((elapsed + 10))
    echo -e "   ⏳ Descargando modelos... (${elapsed}s)"
done

echo -e "${GREEN}   ✅ Modelos listos${NC}"

# 4. Mostrar resumen
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🎉 ¡Agentos está corriendo!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}   http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}    http://localhost:3001"
echo -e "  ${BLUE}n8n:${NC}        http://localhost:5678"
echo -e "  ${BLUE}Ollama:${NC}     http://localhost:11434"
echo -e "  ${BLUE}Postgres:${NC}   localhost:5432"
echo ""
echo -e "  ${YELLOW}Login:${NC}      admin / admin123"
echo -e "  ${YELLOW}n8n Login:${NC}  admin / admin (crear cuenta en primer uso)"
echo ""
echo -e "  ${BLUE}Iniciando app de escritorio (Electron)...${NC}"
echo ""

# 5. Iniciar Electron
if [ -d "electron" ]; then
    cd electron
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[4/5]${NC} Instalando dependencias de Electron (solo primera vez)..."
        npm install
    fi
    echo -e "${YELLOW}[5/5]${NC} Abriendo app de escritorio..."
    npm run dev &
    cd ..
    echo -e "${GREEN}   ✅ App de escritorio iniciada${NC}"
else
    echo -e "${YELLOW}   ⚠️  Carpeta 'electron' no encontrada. Inicia manualmente:${NC}"
    echo "      cd electron && npm install && npm run dev"
fi

echo ""
echo -e "  ${BLUE}Para detener todo:${NC}"
echo "    ./stop.sh"
echo "    (o: docker compose -f docker-compose.dev.yml down)"
echo ""
echo -e "  ${BLUE}Para ver logs:${NC}"
echo "    docker compose -f docker-compose.dev.yml logs -f"
echo ""

