#!/bin/bash

# 🗄️ Reset Banco de Produção - Strapi
# Script para limpar APENAS o banco de produção
# Criado: 06/07/2024

set -e  # Parar em caso de erro

echo "🔥 RESET BANCO DE PRODUÇÃO"
echo "⚠️  ATENÇÃO: Todos os posts EM PRODUÇÃO serão perdidos!"
echo ""
echo "📊 Banco que será resetado:"
echo "   - PRODUÇÃO: ale-blog-postgres"
echo "   - URL: https://ale-blog.agentesintegrados.com/"
echo "   - Site: https://thecryptofrontier.agentesintegrados.com/"
echo ""

read -p "Confirma reset do banco de produção? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "1️⃣ Parando container Strapi de produção..."
docker stop ale-blog-strapi-v5 || echo "⚠️  Container já estava parado"

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
echo "3️⃣ Reiniciando container Strapi de produção..."
docker start ale-blog-strapi-v5

echo ""
echo "4️⃣ Aguardando inicialização..."
sleep 30

echo ""
echo "5️⃣ Verificando status..."
docker ps | grep ale-blog-strapi-v5

echo ""
echo "6️⃣ Testando API de produção..."
PROD_POSTS=$(curl -s https://ale-blog.agentesintegrados.com/api/posts | jq '.data | length' 2>/dev/null || echo "API offline")
echo "   - Posts em produção: $PROD_POSTS"

echo ""
echo "✅ Banco de produção resetado com sucesso!"
echo ""
echo "🌐 URL para reconfiguração:"
echo "   - Admin: https://ale-blog.agentesintegrados.com/admin"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acessar painel admin de produção"
echo "   2. Criar primeiro usuário administrador"
echo "   3. Configurar Content Types e permissões"
echo "   4. Configurar internacionalização"
echo "   5. Criar novos posts"
echo "" 