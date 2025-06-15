#!/bin/bash

echo "🔄 Reconstruindo Strapi com novos Content-Types..."

# Parar container
echo "⏸️  Parando container..."
docker stop strapi-cms

# Remover container
echo "🗑️  Removendo container antigo..."
docker rm strapi-cms

# Rebuild e iniciar
echo "🔨 Reconstruindo e iniciando..."
cd /home/strapi/thecryptofrontier/strapi
docker compose up -d --build

# Aguardar
echo "⏳ Aguardando Strapi iniciar (30s)..."
sleep 30

# Verificar status
echo "✅ Verificando status..."
docker logs strapi-cms --tail 20

echo "
📋 Próximos passos:
1. Acesse https://ale-blog.agentesintegrados.com/admin
2. Crie sua conta de administrador
3. Configure as permissões públicas em Settings > Roles > Public
4. Execute novamente o script de migração
"