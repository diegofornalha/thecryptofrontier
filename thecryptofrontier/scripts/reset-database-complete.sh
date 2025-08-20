#!/bin/bash

# 🗄️ Reset Completo dos Bancos de Dados - Strapi
# Script para limpar TODOS os bancos (produção + desenvolvimento)
# Criado: 06/07/2024

set -e  # Parar em caso de erro

echo "🔥 INICIANDO RESET COMPLETO DOS BANCOS DE DADOS"
echo "⚠️  ATENÇÃO: Todos os dados serão perdidos!"
echo ""
echo "📊 Bancos que serão resetados:"
echo "   - PRODUÇÃO: ale-blog-postgres (posts em produção)"
echo "   - DESENVOLVIMENTO: postgres-strapi-dev (posts de teste)"
echo ""

read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "1️⃣ Parando containers Strapi..."
docker stop ale-blog-strapi-v5 strapi-v5-dev-preview || echo "⚠️  Alguns containers já estavam parados"

echo ""
echo "2️⃣ Limpando banco de PRODUÇÃO..."
docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "
DO \$\$ 
DECLARE r RECORD; 
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
    END LOOP; 
END \$\$;"

echo ""
echo "3️⃣ Limpando banco de DESENVOLVIMENTO..."
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
echo "4️⃣ Reiniciando containers Strapi..."
docker start ale-blog-strapi-v5 strapi-v5-dev-preview

echo ""
echo "5️⃣ Aguardando inicialização..."
sleep 30

echo ""
echo "6️⃣ Verificando status..."
docker ps | grep strapi

echo ""
echo "7️⃣ Testando APIs..."
PROD_POSTS=$(curl -s https://ale-blog.agentesintegrados.com/api/posts | jq '.data | length' 2>/dev/null || echo "API offline")
DEV_POSTS=$(curl -s https://ale-blog-preview.agentesintegrados.com/api/posts | jq '.data | length' 2>/dev/null || echo "API offline")

echo "   - Produção: $PROD_POSTS posts"
echo "   - Desenvolvimento: $DEV_POSTS posts"

echo ""
echo "✅ RESET CONCLUÍDO COM SUCESSO!"
echo ""
echo "🌐 URLs para reconfiguração:"
echo "   - Produção: https://ale-blog.agentesintegrados.com/admin"
echo "   - Preview: https://ale-blog-preview.agentesintegrados.com/admin"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acessar painel admin"
echo "   2. Criar primeiro usuário administrador"
echo "   3. Configurar Content Types e permissões"
echo "   4. Configurar internacionalização (en, pt-BR, es)"
echo "" 