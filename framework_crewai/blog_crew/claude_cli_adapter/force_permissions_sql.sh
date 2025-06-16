#!/bin/bash
# Script para forçar permissões via SQL no PostgreSQL

echo "🔧 Forçando permissões via SQL..."
echo "================================================"

# Configurações do banco
DB_CONTAINER="strapi-v5-postgres"
DB_NAME="strapi"
DB_USER="strapi"
export PGPASSWORD="strapi"

# Verificar se o container está rodando
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "❌ Container $DB_CONTAINER não está rodando"
    exit 1
fi

echo "✅ Container PostgreSQL encontrado"

# Executar queries SQL
echo -e "\n1️⃣ Buscando role Public..."
PUBLIC_ROLE_ID=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM up_roles WHERE type = 'public';" | tr -d ' ')

if [ -z "$PUBLIC_ROLE_ID" ]; then
    echo "❌ Role Public não encontrado"
    exit 1
fi

echo "✅ Role Public ID: $PUBLIC_ROLE_ID"

# 2. Buscar permissões de post
echo -e "\n2️⃣ Buscando permissões de Post..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
SELECT id, action FROM up_permissions 
WHERE action LIKE 'api::post.post%'
ORDER BY action;"

# 3. Buscar ID da permissão create
CREATE_PERM_ID=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM up_permissions WHERE action = 'api::post.post.create';" | tr -d ' ')

if [ -z "$CREATE_PERM_ID" ]; then
    echo "❌ Permissão create não encontrada"
    
    # Tentar criar a permissão
    echo "📝 Tentando criar permissão..."
    docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
    INSERT INTO up_permissions (action, created_at, updated_at)
    VALUES ('api::post.post.create', NOW(), NOW())
    RETURNING id;"
    
    CREATE_PERM_ID=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM up_permissions WHERE action = 'api::post.post.create';" | tr -d ' ')
fi

echo "✅ Permissão create ID: $CREATE_PERM_ID"

# 4. Criar link entre role e permissão
echo -e "\n3️⃣ Criando link entre Public role e create permission..."

# Verificar se já existe
EXISTING=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM up_permissions_role_lnk WHERE permission_id = $CREATE_PERM_ID AND role_id = $PUBLIC_ROLE_ID;" | tr -d ' ')

if [ "$EXISTING" -eq "0" ]; then
    docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
    INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_order)
    VALUES ($CREATE_PERM_ID, $PUBLIC_ROLE_ID, 1);"
    echo "✅ Link criado!"
else
    echo "⚠️  Link já existe"
fi

# 5. Adicionar também find e findOne
echo -e "\n4️⃣ Adicionando permissões de leitura..."

for ACTION in "find" "findOne"; do
    PERM_ID=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM up_permissions WHERE action = 'api::post.post.$ACTION';" | tr -d ' ')
    
    if [ ! -z "$PERM_ID" ]; then
        EXISTING=$(docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM up_permissions_role_lnk WHERE permission_id = $PERM_ID AND role_id = $PUBLIC_ROLE_ID;" | tr -d ' ')
        
        if [ "$EXISTING" -eq "0" ]; then
            docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
            INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_order)
            VALUES ($PERM_ID, $PUBLIC_ROLE_ID, 1);"
            echo "✅ Permissão $ACTION adicionada"
        fi
    fi
done

# 6. Verificar resultado
echo -e "\n5️⃣ Verificando permissões configuradas..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
SELECT p.action, r.name as role_name, r.type as role_type
FROM up_permissions p
JOIN up_permissions_role_lnk prl ON p.id = prl.permission_id
JOIN up_roles r ON prl.role_id = r.id
WHERE r.type = 'public' AND p.action LIKE '%post%'
ORDER BY p.action;"

# 7. Limpar cache do Strapi
echo -e "\n6️⃣ Reiniciando Strapi para aplicar mudanças..."
docker restart strapi-v5

echo -e "\n⏳ Aguardando Strapi reiniciar (30 segundos)..."
sleep 30

# 8. Testar
echo -e "\n7️⃣ Testando criação pública..."
curl -X POST https://ale-blog.agentesintegrados.com/api/posts \
  -H "Content-Type: application/json" \
  -d '{"data":{"title":"Teste SQL Force","content":"Post criado após forçar permissões via SQL"}}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n================================================"
echo "✅ Permissões forçadas via SQL!"
echo ""
echo "Se ainda não funcionar:"
echo "1. Verifique se há cache do Strapi"
echo "2. Tente reiniciar novamente: docker restart strapi-v5"
echo "3. Use a solução com JWT (mais segura)"