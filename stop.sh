#!/bin/bash
# ============================================
#  🛑 Agentos - Detener Servicios
# ============================================
echo ""
echo "🛑 Deteniendo Agentos..."
docker compose -f docker-compose.dev.yml down
echo ""
echo "✅ Todos los servicios detenidos."
echo "   Los datos se mantienen en los volúmenes Docker."
echo "   Para borrar todo (incluidos datos): docker compose -f docker-compose.dev.yml down -v"
echo ""

