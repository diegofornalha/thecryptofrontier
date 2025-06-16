#!/bin/bash
# Script para aplicar modificações no Strapi

echo "🚀 Aplicando modificações no Strapi..."
echo "================================================"

# Diretório do Strapi
STRAPI_DIR="/home/strapi/thecryptofrontier/strapi-v5-fresh"
CURRENT_DIR=$(pwd)

# Verificar se o diretório existe
if [ ! -d "$STRAPI_DIR" ]; then
    echo "❌ Diretório do Strapi não encontrado: $STRAPI_DIR"
    echo "   Ajuste a variável STRAPI_DIR no script"
    exit 1
fi

echo "📁 Diretório do Strapi: $STRAPI_DIR"

# 1. Copiar arquivo de plugins
echo -e "\n1️⃣ Copiando configuração de plugins..."
if [ -f "$CURRENT_DIR/config/plugins.js" ]; then
    cp "$CURRENT_DIR/config/plugins.js" "$STRAPI_DIR/config/plugins.js"
    echo "✅ Copiado: config/plugins.js"
else
    echo "⚠️  Arquivo não encontrado: config/plugins.js"
fi

# 2. Copiar middleware customizado
echo -e "\n2️⃣ Copiando middleware customizado..."
if [ -d "$CURRENT_DIR/src/middlewares/allow-public-post" ]; then
    mkdir -p "$STRAPI_DIR/src/middlewares"
    cp -r "$CURRENT_DIR/src/middlewares/allow-public-post" "$STRAPI_DIR/src/middlewares/"
    echo "✅ Copiado: src/middlewares/allow-public-post/"
else
    echo "⚠️  Diretório não encontrado: src/middlewares/allow-public-post"
fi

# 3. Copiar configuração de middlewares
echo -e "\n3️⃣ Copiando configuração de middlewares..."
if [ -f "$CURRENT_DIR/config/middlewares.js" ]; then
    # Fazer backup do original
    if [ -f "$STRAPI_DIR/config/middlewares.js" ]; then
        cp "$STRAPI_DIR/config/middlewares.js" "$STRAPI_DIR/config/middlewares.js.backup"
        echo "📦 Backup criado: config/middlewares.js.backup"
    fi
    cp "$CURRENT_DIR/config/middlewares.js" "$STRAPI_DIR/config/middlewares.js"
    echo "✅ Copiado: config/middlewares.js"
else
    echo "⚠️  Arquivo não encontrado: config/middlewares.js"
fi

# 4. Copiar política customizada
echo -e "\n4️⃣ Copiando política customizada..."
if [ -d "$CURRENT_DIR/src/api/post/policies" ]; then
    mkdir -p "$STRAPI_DIR/src/api/post/policies"
    cp -r "$CURRENT_DIR/src/api/post/policies/" "$STRAPI_DIR/src/api/post/"
    echo "✅ Copiado: src/api/post/policies/"
else
    echo "⚠️  Diretório não encontrado: src/api/post/policies"
fi

# 5. Verificar se precisamos criar/atualizar rotas
echo -e "\n5️⃣ Verificando rotas do Post..."
ROUTES_FILE="$STRAPI_DIR/src/api/post/routes/post.js"
if [ -f "$ROUTES_FILE" ]; then
    echo "📝 Atualizando arquivo de rotas existente..."
    # Fazer backup
    cp "$ROUTES_FILE" "$ROUTES_FILE.backup"
    
    # Criar novo arquivo de rotas
    cat > "$ROUTES_FILE" << 'EOF'
'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::post.post', {
  config: {
    create: {
      policies: ['api::post.is-public-allowed'],
      middlewares: [],
    },
  },
});
EOF
    echo "✅ Rotas atualizadas"
else
    echo "⚠️  Arquivo de rotas não encontrado: $ROUTES_FILE"
fi

# 6. Reiniciar Strapi
echo -e "\n6️⃣ Reiniciando Strapi..."
cd "$STRAPI_DIR"

# Verificar se está usando PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando com PM2..."
    pm2 restart strapi || pm2 restart ecosystem.config.js || pm2 restart 0
elif [ -f "/etc/systemd/system/strapi.service" ]; then
    echo "🔄 Reiniciando com systemctl..."
    sudo systemctl restart strapi
else
    echo "⚠️  Não foi possível determinar como reiniciar o Strapi"
    echo "   Execute manualmente:"
    echo "   - pm2 restart strapi"
    echo "   - ou: systemctl restart strapi"
    echo "   - ou: npm run develop"
fi

# 7. Aguardar Strapi iniciar
echo -e "\n⏳ Aguardando Strapi iniciar (30 segundos)..."
sleep 30

# 8. Testar
echo -e "\n7️⃣ Testando criação pública..."
cd "$CURRENT_DIR"
if [ -f "test_public_after_config.py" ]; then
    python3 test_public_after_config.py
else
    echo "⚠️  Script de teste não encontrado"
fi

echo -e "\n================================================"
echo "✅ Modificações aplicadas!"
echo ""
echo "Se ainda não funcionar:"
echo "1. Verifique os logs do Strapi"
echo "2. Execute o script SQL em emergency_permissions.sql"
echo "3. Ou use a solução com JWT (mais segura)"