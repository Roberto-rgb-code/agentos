#!/bin/bash

# Script para actualizar todos los workspaces a español
# Ejecutar: bash COMANDO_ACTUALIZAR_ESPANOL.sh

echo "🔄 Actualizando workspaces a español..."

cd "$(dirname "$0")"

# Ejecutar el script dentro del contenedor
docker exec -it agentos-server node server/scripts/update-workspaces-spanish.js

echo ""
echo "✅ ¡Listo! Ahora reinicia el servidor:"
echo "   docker compose -f docker-compose.dev.yml restart server"

