#!/usr/bin/env python3
"""
Script para desabilitar Draft & Publish via configuração
"""
import json

print("🔧 Desabilitando Draft & Publish para permitir acesso público...")

# Criar novo schema sem draft & publish
schema_content = {
    "kind": "collectionType",
    "collectionName": "posts",
    "info": {
        "singularName": "post",
        "pluralName": "posts",
        "displayName": "Post",
        "description": "Blog posts"
    },
    "options": {
        "draftAndPublish": False  # DESABILITAR!
    },
    "pluginOptions": {},
    "attributes": {
        "title": {
            "type": "string",
            "required": True
        },
        "slug": {
            "type": "uid",
            "targetField": "title"
        },
        "content": {
            "type": "richtext"
        },
        "excerpt": {
            "type": "text"
        },
        "author": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user",
            "inversedBy": "posts"
        },
        "categories": {
            "type": "json"
        },
        "tags": {
            "type": "json"
        },
        "featuredImage": {
            "type": "media",
            "multiple": False,
            "required": False,
            "allowedTypes": ["images"]
        },
        "seo": {
            "type": "component",
            "repeatable": False,
            "component": "shared.seo"
        },
        "status": {
            "type": "enumeration",
            "enum": ["draft", "published"],
            "default": "published"
        }
    }
}

print("\n📝 Novo schema criado sem Draft & Publish")

# Salvar arquivo
with open('/tmp/post-schema-no-draft.json', 'w') as f:
    json.dump(schema_content, f, indent=2)

print("✅ Salvo em: /tmp/post-schema-no-draft.json")

# Criar script SQL para forçar no banco
sql_script = """
-- Forçar permissões públicas diretamente no banco
-- CUIDADO: Isso bypassa a segurança do Strapi!

-- 1. Garantir que o role Public existe
INSERT INTO up_roles (name, description, type, created_at, updated_at)
VALUES ('Public', 'Default role given to unauthenticated user.', 'public', NOW(), NOW())
ON CONFLICT (type) DO NOTHING;

-- 2. Obter ID do role Public
-- SELECT id FROM up_roles WHERE type = 'public';

-- 3. Criar permissões se não existirem
INSERT INTO up_permissions (action, created_at, updated_at)
VALUES 
  ('api::post.post.find', NOW(), NOW()),
  ('api::post.post.findOne', NOW(), NOW()),
  ('api::post.post.create', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Conectar permissões ao role Public (substitua <PUBLIC_ROLE_ID>)
WITH public_role AS (
  SELECT id FROM up_roles WHERE type = 'public' LIMIT 1
),
post_permissions AS (
  SELECT id FROM up_permissions 
  WHERE action IN ('api::post.post.find', 'api::post.post.findOne', 'api::post.post.create')
)
INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord)
SELECT p.id, r.id, 1
FROM post_permissions p, public_role r
ON CONFLICT DO NOTHING;

-- 5. Verificar
SELECT p.action, r.name, r.type
FROM up_permissions p
JOIN up_permissions_role_lnk prl ON p.id = prl.permission_id
JOIN up_roles r ON prl.role_id = r.id
WHERE r.type = 'public' AND p.action LIKE '%post%';
"""

with open('/tmp/force-public-permissions.sql', 'w') as f:
    f.write(sql_script)

print("\n📄 Script SQL criado: /tmp/force-public-permissions.sql")

print("\n" + "="*60)
print("🚀 COMO APLICAR AS MUDANÇAS")
print("="*60)

print("\n1️⃣ OPÇÃO A - Modificar schema (recomendado):")
print("   docker cp /tmp/post-schema-no-draft.json strapi-v5:/opt/app/src/api/post/content-types/post/schema.json")
print("   docker restart strapi-v5")

print("\n2️⃣ OPÇÃO B - Forçar via SQL:")
print("   docker exec -i strapi-v5-postgres psql -U strapi -d strapi < /tmp/force-public-permissions.sql")
print("   docker restart strapi-v5")

print("\n3️⃣ OPÇÃO C - Criar novo content-type:")
print("   - No admin, crie um novo tipo 'BlogPost' sem Draft & Publish")
print("   - Configure permissões públicas nele")
print("   - Use /api/blog-posts em vez de /api/posts")

print("\n⚠️  ATENÇÃO:")
print("- Desabilitar Draft & Publish remove o controle de publicação")
print("- Todos os posts serão sempre 'publicados'")
print("- Considere as implicações de segurança")

print("\n✅ Após aplicar, o blog preview deve funcionar em:")
print("   https://ale-blog-preview.agentesintegrados.com/")