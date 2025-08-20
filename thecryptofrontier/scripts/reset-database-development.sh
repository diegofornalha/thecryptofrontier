#!/bin/bash

# 🗄️ Reset Banco de Desenvolvimento - Strapi
# Script para limpar APENAS o banco de desenvolvimento/preview
# Criado: 06/07/2024

set -e  # Parar em caso de erro

echo "🔥 RESET BANCO DE DESENVOLVIMENTO"
echo "⚠️  ATENÇÃO: Todos os posts DE TESTE serão perdidos!"
echo ""
echo "📊 Banco que será resetado:"
echo "   - DESENVOLVIMENTO: postgres-strapi-dev"
echo "   - URL: https://ale-blog-preview.agentesintegrados.com/"
echo "   - Porta: 1340"
echo ""

read -p "Confirma reset do banco de desenvolvimento? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "1️⃣ Parando container Strapi de desenvolvimento..."
docker stop strapi-v5-dev-preview || echo "⚠️  Container já estava parado"

echo ""
echo "2️⃣ Limpando banco de DESENVOLVIMENTO..."
docker exec -i postgres-strapi-dev psql -U strapi_dev -d strapi_dev -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"

echo ""
echo "3️⃣ Reiniciando container Strapi de desenvolvimento..."
docker start strapi-v5-dev-preview

echo ""
echo "4️⃣ Aguardando inicialização..."
sleep 30

echo ""
echo "5️⃣ Verificando status..."
docker ps | grep strapi-v5-dev-preview

echo ""
echo "6️⃣ Testando API de desenvolvimento..."
DEV_POSTS=$(curl -s https://ale-blog-preview.agentesintegrados.com/api/posts | jq '.data | length' 2>/dev/null || echo "API offline")
echo "   - Posts em desenvolvimento: $DEV_POSTS"

echo ""
echo "✅ Banco de desenvolvimento resetado com sucesso!"
echo ""
echo "🌐 URL para reconfiguração:"
echo "   - Admin: https://ale-blog-preview.agentesintegrados.com/admin"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acessar painel admin de desenvolvimento"
echo "   2. Criar primeiro usuário administrador"
echo "   3. Configurar Content Types e permissões"
echo "   4. Configurar internacionalização"
echo "   5. Testar novos recursos"
echo "" 