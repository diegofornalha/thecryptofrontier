#!/usr/bin/env python3
"""
Modifica configurações do Strapi para permitir criação pública
ATENÇÃO: Isso reduz a segurança do sistema
"""
import os
import json
from pathlib import Path

print("⚠️  AVISO: Este script modifica configurações de segurança do Strapi")
print("         Use apenas em ambiente de desenvolvimento ou com rate limiting\n")

# Criar arquivo de configuração para permitir criação pública
config_content = """
'use strict';

module.exports = ({ env }) => ({
  // Configuração do plugin users-permissions
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      // Permite registro público
      register: {
        allowedFields: ['email', 'username', 'password'],
      },
      // Configurações de email
      email: {
        resetPasswordLimit: 2,
        confirmEmailTemplate: {
          subject: 'Confirm your email',
        },
      },
      // Configurações avançadas
      advanced: {
        defaultRole: 'authenticated',
        // IMPORTANTE: Permite criação pública temporariamente
        allowPublicCreate: true,
      },
    },
  },
});
"""

print("1️⃣ Criando arquivo de configuração do plugin...")
plugins_config = Path("./config/plugins.js")
with open(plugins_config, 'w') as f:
    f.write(config_content)
print(f"✅ Criado: {plugins_config}")

# Criar middleware customizado para permitir POST público
middleware_content = """
'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Permitir POST em /api/posts sem autenticação
    if (ctx.request.method === 'POST' && ctx.request.url.includes('/api/posts')) {
      // Temporariamente definir usuário público
      ctx.state.user = {
        id: 'public',
        role: {
          type: 'public'
        }
      };
      
      // Log para debug
      strapi.log.info('Public POST allowed for /api/posts');
    }
    
    await next();
  };
};
"""

print("\n2️⃣ Criando middleware customizado...")
middleware_dir = Path("./src/middlewares/allow-public-post")
middleware_dir.mkdir(parents=True, exist_ok=True)

middleware_file = middleware_dir / "index.js"
with open(middleware_file, 'w') as f:
    f.write(middleware_content)
print(f"✅ Criado: {middleware_file}")

# Criar configuração do middleware
middlewares_config = """
module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Middleware customizado para permitir POST público
  {
    name: 'global::allow-public-post',
    config: {}
  }
];
"""

print("\n3️⃣ Atualizando configuração de middlewares...")
middleware_config_file = Path("./config/middlewares.js")
with open(middleware_config_file, 'w') as f:
    f.write(middlewares_config)
print(f"✅ Atualizado: {middleware_config_file}")

# Criar política customizada para o Post
policy_content = """
'use strict';

module.exports = async (ctx, config, { strapi }) => {
  // Permitir criação pública temporariamente
  if (ctx.request.method === 'POST') {
    // Verificar rate limiting básico
    const ip = ctx.request.ip;
    const key = `post_create_${ip}`;
    const attempts = await strapi.cache.get(key) || 0;
    
    if (attempts > 10) {
      ctx.throw(429, 'Too many requests');
    }
    
    await strapi.cache.set(key, attempts + 1, 3600); // 1 hora
    
    return true; // Permitir
  }
  
  // Para outros métodos, usar permissões padrão
  return true;
};
"""

print("\n4️⃣ Criando política customizada para Post...")
policy_dir = Path("./src/api/post/policies")
policy_dir.mkdir(parents=True, exist_ok=True)

policy_file = policy_dir / "is-public-allowed.js"
with open(policy_file, 'w') as f:
    f.write(policy_content)
print(f"✅ Criado: {policy_file}")

# Atualizar rotas do Post para usar a política
routes_update = """
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
"""

print("\n5️⃣ Atualizando rotas do Post...")
routes_file = Path("./src/api/post/routes/post.js")
if routes_file.exists():
    with open(routes_file, 'w') as f:
        f.write(routes_update)
    print(f"✅ Atualizado: {routes_file}")
else:
    print(f"⚠️  Arquivo não encontrado: {routes_file}")

# Criar script de configuração do banco de dados
db_script = """
-- Script SQL para forçar permissões no banco
-- Use apenas se as outras opções falharem

-- Buscar o ID do role Public
SELECT id, name, type FROM up_roles WHERE type = 'public';

-- Buscar o ID da permissão de criar posts
SELECT id, action FROM up_permissions 
WHERE action = 'api::post.post.create';

-- Conectar role Public com permissão de criar
-- SUBSTITUA OS IDS pelos valores reais
-- INSERT INTO up_permissions_role_links (permission_id, role_id) 
-- VALUES (<permission_id>, <public_role_id>);

-- Verificar se funcionou
SELECT p.*, r.name as role_name 
FROM up_permissions p
JOIN up_permissions_role_links prl ON p.id = prl.permission_id
JOIN up_roles r ON prl.role_id = r.id
WHERE r.type = 'public' AND p.action LIKE '%post%';
"""

print("\n6️⃣ Criando script SQL de emergência...")
sql_file = Path("./emergency_permissions.sql")
with open(sql_file, 'w') as f:
    f.write(db_script)
print(f"✅ Criado: {sql_file}")

# Criar script de teste
test_script = """#!/usr/bin/env python3
import requests
import json
from datetime import datetime

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("🧪 Testando criação pública após modificações...\\n")

# Dados de teste
test_data = {
    "data": {
        "title": f"Teste Público Após Config - {datetime.now().strftime('%H:%M:%S')}",
        "content": "Post criado publicamente após modificar configurações",
        "slug": f"teste-publico-{datetime.now().strftime('%H%M%S')}",
        "status": "published"
    }
}

# Sem autenticação
headers = {'Content-Type': 'application/json'}

resp = requests.post(
    f"{STRAPI_URL}/api/posts",
    headers=headers,
    json=test_data,
    timeout=10
)

print(f"Status: {resp.status_code}")
if resp.status_code in [200, 201]:
    print("✅ SUCESSO! Criação pública funcionando!")
    print(f"Post ID: {resp.json().get('data', {}).get('id')}")
else:
    print(f"❌ Ainda não funciona: {resp.text[:200]}")
"""

print("\n7️⃣ Criando script de teste...")
test_file = Path("./test_public_after_config.py")
with open(test_file, 'w') as f:
    f.write(test_script)
os.chmod(test_file, 0o755)
print(f"✅ Criado: {test_file}")

print("\n" + "="*60)
print("📋 INSTRUÇÕES DE IMPLEMENTAÇÃO")
print("="*60)

print("\n1️⃣ COPIAR ARQUIVOS PARA O SERVIDOR:")
print("   scp -r ./config ./src usuario@servidor:/caminho/do/strapi/")

print("\n2️⃣ NO SERVIDOR, REINICIAR O STRAPI:")
print("   cd /caminho/do/strapi")
print("   npm run build")
print("   pm2 restart strapi  # ou systemctl restart strapi")

print("\n3️⃣ TESTAR:")
print("   python3 test_public_after_config.py")

print("\n⚠️  SEGURANÇA:")
print("   - Este setup permite POST público!")
print("   - Use rate limiting (já incluído básico)")
print("   - Monitore logs para abuso")
print("   - Considere adicionar CAPTCHA")

print("\n🚨 SE AINDA NÃO FUNCIONAR:")
print("   1. Execute o script SQL no PostgreSQL")
print("   2. Ou use a solução com JWT (mais segura)")

print("\n📁 ARQUIVOS CRIADOS:")
print("   - config/plugins.js")
print("   - config/middlewares.js")
print("   - src/middlewares/allow-public-post/")
print("   - src/api/post/policies/is-public-allowed.js")
print("   - emergency_permissions.sql")
print("   - test_public_after_config.py")