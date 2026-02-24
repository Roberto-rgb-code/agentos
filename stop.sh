#!/bin/bash
# ============================================
#  🛑 Agentos - Detener Servicios
# ============================================
echo ""
echo "🛑 Deteniendo Agentos..."

# Detener Electron
echo "   Deteniendo app de escritorio (Electron)..."
pkill -f "electron" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Detener Docker
echo "   Deteniendo servicios Docker..."
docker compose -f docker-compose.dev.yml down

echo ""
echo "✅ Todos los servicios detenidos."
echo "   Los datos se mantienen en los volúmenes Docker."
echo "   Para borrar todo (incluidos datos): docker compose -f docker-compose.dev.yml down -v"
echo ""

