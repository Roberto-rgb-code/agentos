#!/bin/bash
# Script para configurar Node.js 20 usando nvm

set -e

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar si nvm está instalado
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm no está instalado."
    echo "Instalando nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Verificar versión actual
CURRENT_NODE=$(node -v 2>/dev/null || echo "none")
echo "Node.js actual: $CURRENT_NODE"

# Leer versión requerida desde .nvmrc
REQUIRED_VERSION=$(cat .nvmrc 2>/dev/null || echo "20")
echo "Versión requerida: v$REQUIRED_VERSION"

# Instalar y usar Node.js 20 si no está instalado
if ! nvm list | grep -q "v$REQUIRED_VERSION"; then
    echo "Instalando Node.js v$REQUIRED_VERSION..."
    nvm install $REQUIRED_VERSION
fi

# Usar la versión correcta
echo "Cambiando a Node.js v$REQUIRED_VERSION..."
nvm use $REQUIRED_VERSION

# Verificar
NEW_VERSION=$(node -v)
echo "✅ Node.js configurado: $NEW_VERSION"

# Verificar yarn
if ! command -v yarn &> /dev/null; then
    echo "⚠️  Yarn no está instalado. Instálalo con: npm install -g yarn"
    exit 1
fi

YARN_VERSION=$(yarn --version)
echo "✅ Yarn: $YARN_VERSION"

