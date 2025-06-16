#!/bin/bash
# Script para aplicar modificações no Strapi rodando em Docker

echo "🐳 Aplicando modificações no Strapi Docker..."
echo "================================================"

CONTAINER_NAME="strapi-v5"
CURRENT_DIR=$(pwd)

# Verificar se o container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME não está rodando"
    exit 1
fi

echo "✅ Container encontrado: $CONTAINER_NAME"

# Verificar diretório do app no container
echo -e "\n📁 Verificando estrutura do container..."
APP_DIR="/opt/app"

echo "📁 Diretório do app: $APP_DIR"

# 1. Copiar arquivo de plugins
echo -e "\n1️⃣ Copiando configuração de plugins..."
docker exec $CONTAINER_NAME mkdir -p "$APP_DIR/config"
docker cp "$CURRENT_DIR/config/plugins.js" "$CONTAINER_NAME:$APP_DIR/config/plugins.js"
echo "✅ Copiado: config/plugins.js"

# 2. Copiar middleware customizado
echo -e "\n2️⃣ Copiando middleware customizado..."
docker exec $CONTAINER_NAME mkdir -p "$APP_DIR/src/middlewares"
docker cp "$CURRENT_DIR/src/middlewares/allow-public-post" "$CONTAINER_NAME:$APP_DIR/src/middlewares/"
echo "✅ Copiado: src/middlewares/allow-public-post/"

# 3. Fazer backup e copiar configuração de middlewares
echo -e "\n3️⃣ Copiando configuração de middlewares..."
docker exec $CONTAINER_NAME sh -c "if [ -f $APP_DIR/config/middlewares.js ]; then cp $APP_DIR/config/middlewares.js $APP_DIR/config/middlewares.js.backup; fi"
docker cp "$CURRENT_DIR/config/middlewares.js" "$CONTAINER_NAME:$APP_DIR/config/middlewares.js"
echo "✅ Copiado: config/middlewares.js"

# 4. Copiar política customizada
echo -e "\n4️⃣ Copiando política customizada..."
docker exec $CONTAINER_NAME mkdir -p "$APP_DIR/src/api/post/policies"
docker cp "$CURRENT_DIR/src/api/post/policies/is-public-allowed.js" "$CONTAINER_NAME:$APP_DIR/src/api/post/policies/"
echo "✅ Copiado: src/api/post/policies/is-public-allowed.js"

# 5. Atualizar rotas
echo -e "\n5️⃣ Atualizando rotas do Post..."
cat > /tmp/post-routes.js << 'EOF'
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

docker cp /tmp/post-routes.js "$CONTAINER_NAME:$APP_DIR/src/api/post/routes/post.js"
echo "✅ Rotas atualizadas"
rm /tmp/post-routes.js

# 6. Verificar arquivos copiados
echo -e "\n6️⃣ Verificando arquivos no container..."
echo "Config:"
docker exec $CONTAINER_NAME ls -la "$APP_DIR/config/" | grep -E "(plugins|middlewares)"
echo -e "\nMiddlewares:"
docker exec $CONTAINER_NAME ls -la "$APP_DIR/src/middlewares/"
echo -e "\nPolicies:"
docker exec $CONTAINER_NAME ls -la "$APP_DIR/src/api/post/policies/" 2>/dev/null || echo "Diretório de policies não encontrado"

# 7. Reiniciar container
echo -e "\n7️⃣ Reiniciando container Strapi..."
docker restart $CONTAINER_NAME

# 8. Aguardar inicialização
echo -e "\n⏳ Aguardando Strapi iniciar (40 segundos)..."
sleep 40

# 9. Verificar logs
echo -e "\n📋 Últimas linhas do log:"
docker logs --tail 20 $CONTAINER_NAME

# 10. Testar
echo -e "\n8️⃣ Testando criação pública..."
if [ -f "$CURRENT_DIR/test_public_after_config.py" ]; then
    python3 "$CURRENT_DIR/test_public_after_config.py"
else
    # Teste inline
    echo "Executando teste direto..."
    curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
      -H "Content-Type: application/json" \
      -d '{"data":{"title":"Teste Docker Config","content":"Post criado após configuração Docker"}}' \
      -w "\nStatus: %{http_code}\n"
fi

echo -e "\n================================================"
echo "✅ Modificações aplicadas no container!"
echo ""
echo "Se ainda não funcionar:"
echo "1. Verifique: docker logs $CONTAINER_NAME"
echo "2. Entre no container: docker exec -it $CONTAINER_NAME sh"
echo "3. Execute o script SQL em emergency_permissions.sql"
echo "4. Ou reconstrua a imagem com as modificações"