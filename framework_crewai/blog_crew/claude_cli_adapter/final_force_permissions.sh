#!/bin/bash
# Script FINAL para forçar permissões - Strapi v5

echo "🚀 FORÇANDO PERMISSÕES DEFINITIVAMENTE..."
echo "================================================"

# Configurações
DB_CONTAINER="strapi-v5-postgres"
DB_NAME="strapi"
DB_USER="strapi"
export PGPASSWORD="strapi"

# 1. Limpar permissões antigas
echo "1️⃣ Limpando permissões antigas de Post..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
DELETE FROM up_permissions WHERE action LIKE 'api::post.post%';"

# 2. Criar todas as permissões necessárias
echo -e "\n2️⃣ Criando permissões completas..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
INSERT INTO up_permissions (action, created_at, updated_at)
VALUES 
  ('api::post.post.find', NOW(), NOW()),
  ('api::post.post.findOne', NOW(), NOW()),
  ('api::post.post.create', NOW(), NOW()),
  ('api::post.post.update', NOW(), NOW()),
  ('api::post.post.delete', NOW(), NOW())
ON CONFLICT DO NOTHING;"

# 3. Obter IDs
echo -e "\n3️⃣ Obtendo IDs..."
PUBLIC_ROLE_ID=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM up_roles WHERE type = 'public';" | tr -d ' ')
echo "Role Public ID: $PUBLIC_ROLE_ID"

# 4. Conectar permissões ao role Public
echo -e "\n4️⃣ Conectando permissões ao role Public..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
-- Limpar links antigos
DELETE FROM up_permissions_role_lnk 
WHERE role_id = $PUBLIC_ROLE_ID 
  AND permission_id IN (SELECT id FROM up_permissions WHERE action LIKE 'api::post.post%');

-- Inserir novos links
INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord)
SELECT p.id, $PUBLIC_ROLE_ID, 1
FROM up_permissions p
WHERE p.action IN ('api::post.post.find', 'api::post.post.findOne', 'api::post.post.create');"

# 5. Verificar
echo -e "\n5️⃣ Verificando permissões..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
SELECT p.action, r.name as role_name, r.type
FROM up_permissions p
JOIN up_permissions_role_lnk prl ON p.id = prl.permission_id
JOIN up_roles r ON prl.role_id = r.id
WHERE r.type = 'public' AND p.action LIKE 'api::post.post%'
ORDER BY p.action;"

# 6. Verificar se existe alguma configuração bloqueando
echo -e "\n6️⃣ Verificando configurações de API..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
SELECT * FROM strapi_core_store_settings 
WHERE key LIKE '%api%' OR key LIKE '%permission%' OR key LIKE '%public%'
LIMIT 10;"

# 7. Limpar cache e reiniciar
echo -e "\n7️⃣ Limpando cache e reiniciando..."
docker exec strapi-v5 rm -rf .cache/* 2>/dev/null || true
docker restart strapi-v5

echo -e "\n⏳ Aguardando 40 segundos..."
sleep 40

# 8. Teste final
echo -e "\n8️⃣ TESTE FINAL..."
echo "Teste 1 - POST sem token:"
curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{"data":{"title":"Teste Final SQL","content":"Se isso funcionar, problema resolvido!"}}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\nTeste 2 - GET sem token:"
curl -X GET https://ale-blog.agentesintegrados.com/api/posts \
  -w "\nStatus: %{http_code}\n" \
  -s | head -20

echo -e "\n================================================"
echo "✅ Script executado!"
echo ""
echo "Se AINDA não funcionar, as opções são:"
echo "1. Há uma configuração no código bloqueando (verificar middlewares)"
echo "2. Usar autenticação JWT (recomendado)"
echo "3. Criar um plugin customizado para bypass"
echo "4. Modificar o core do Strapi (não recomendado)"