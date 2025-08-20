# 🌍 Configuração de Ambientes - The Crypto Frontier

Documentação completa sobre a estrutura de ambientes do projeto multilíngue.

## 🏗️ **Visão Geral da Arquitetura**

O projeto utiliza uma estrutura bem organizada de **ambientes isolados** para garantir segurança entre desenvolvimento local, preview e produção.

```
🌍 AMBIENTES DO PROJETO

📦 FRONTEND (Next.js)
├── 🟠 .env.local        → Desenvolvimento local (localhost:3300)
├── 🟡 .env.preview      → Ambiente de preview/staging
├── 🟢 .env.production   → Ambiente de produção
└── 🌐 Site: thecryptofrontier.agentesintegrados.com

📊 BACKEND STRAPI
├── 🟡 Preview/Dev       → ale-blog-preview.agentesintegrados.com:1340
├── 🟢 Produção          → ale-blog.agentesintegrados.com:1339
└── 🗄️ PostgreSQL        → Bancos isolados por ambiente
```

---

## 📁 **Estrutura de Arquivos de Ambiente**

### **`.env.local` (Desenvolvimento Local)**
Arquivo usado quando você roda `npm run dev` (localhost:3300):

```bash
# Telemetria e Analytics
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SFGD9XKTLD

# Redis (para Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# Strapi Preview/Development (CONECTA COM PREVIEW!)
NEXT_PUBLIC_STRAPI_URL=https://ale-blog-preview.agentesintegrados.com
STRAPI_API_TOKEN=[preview_token_longo]
NEXT_PUBLIC_STRAPI_API_TOKEN=[preview_token_longo]

# Algolia Development
NEXT_PUBLIC_ALGOLIA_APP_ID=42TZWHW8UP
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=b32edbeb383fc3d1279658e7c3661843
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=development_mcpx_content
ALGOLIA_ADMIN_API_KEY=d0cb55ec8f07832bc5f57da0bd25c535
ALGOLIA_WRITE_API_KEY=197d9ad99abb5bb69b4703dfb4820d2c

# Google API
GOOGLE_API_KEY=AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U
```

### **`.env.preview` (Desenvolvimento/Preview)**
Todas as configurações para o ambiente de testes:

```bash
# Telemetria e Analytics
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SFGD9XKTLD

# Redis (para Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# Strapi Preview/Development
NEXT_PUBLIC_STRAPI_URL=https://ale-blog-preview.agentesintegrados.com
STRAPI_API_TOKEN=[preview_token_longo]
NEXT_PUBLIC_STRAPI_API_TOKEN=[preview_token_longo]

# Algolia Development
NEXT_PUBLIC_ALGOLIA_APP_ID=42TZWHW8UP
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=b32edbeb383fc3d1279658e7c3661843
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=development_mcpx_content
ALGOLIA_ADMIN_API_KEY=d0cb55ec8f07832bc5f57da0bd25c535
ALGOLIA_WRITE_API_KEY=197d9ad99abb5bb69b4703dfb4820d2c

# Google API
GOOGLE_API_KEY=AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U
```

### **`.env.production` (Produção)**
Todas as configurações para o ambiente de produção:

```bash
# Telemetria e Analytics
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SFGD9XKTLD

# Redis (para Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# Strapi Production
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=[production_token_longo]
NEXT_PUBLIC_STRAPI_API_TOKEN=[production_token_longo]

# Node Environment
NODE_ENV=production
PORT=3000

# Algolia Production
NEXT_PUBLIC_ALGOLIA_APP_ID=42TZWHW8UP
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=b32edbeb383fc3d1279658e7c3661843
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=production_mcpx_content
ALGOLIA_ADMIN_API_KEY=d0cb55ec8f07832bc5f57da0bd25c535
ALGOLIA_WRITE_API_KEY=197d9ad99abb5bb69b4703dfb4820d2c

# Google API
GOOGLE_API_KEY=AIzaSyALJKZfAQLrHp-pRJmUZDJvESIWYQ8561U
```

---

## 🔀 **Mapeamento de Ambientes**

### **🟡 PREVIEW/DESENVOLVIMENTO**
```
Frontend:
├── 📁 Arquivo: .env.preview
├── 🌐 URL: N/A (desenvolvimento local)
└── 🎯 Uso: Testes, desenvolvimento, validação

Backend Strapi:
├── 🌐 URL: https://ale-blog-preview.agentesintegrados.com/
├── 🚪 Porta: 1340
├── 🗄️ PostgreSQL: postgres-strapi-dev (porta 5434)
├── 🐳 Container: strapi-v5-dev-preview
└── 🎯 Uso: API de testes, posts de desenvolvimento

Database:
├── 🗄️ Nome: strapi_dev
├── 👤 Usuário: strapi_dev
└── 🔧 Reset: ./scripts/reset-database-development.sh
```

### **🟢 PRODUÇÃO**
```
Frontend:
├── 📁 Arquivo: .env.production
├── 🌐 URL: https://thecryptofrontier.agentesintegrados.com/
├── 🚪 Porta: 3300
├── 🐳 Container: thecryptofrontier-frontend
└── 🎯 Uso: Site público, usuários finais

Backend Strapi:
├── 🌐 URL: https://ale-blog.agentesintegrados.com/
├── 🚪 Porta: 1339
├── 🗄️ PostgreSQL: ale-blog-postgres
├── 🐳 Container: ale-blog-strapi-v5
└── 🎯 Uso: API de produção, posts públicos

Database:
├── 🗄️ Nome: strapi
├── 👤 Usuário: strapi
└── 🔧 Reset: ./scripts/reset-database-production.sh
```

---

## 🚀 **Deploy por Ambiente**

### **Desenvolvimento Local**
```bash
# 1. Configurar arquivo local (primeira vez)
cd frontend-nextjs
cp .env.preview .env.local  # Cria arquivo para desenvolvimento local

# 2. Rodar em desenvolvimento
npm run dev

# 3. Acessar
# http://localhost:3300 → conecta com ale-blog-preview.agentesintegrados.com
```

### **Preview/Desenvolvimento**
```bash
# 1. Verificar configurações
cat frontend-nextjs/.env.preview

# 2. Configurar Strapi preview
docker compose -f infrastructure-docker/docker-yml/docker-compose.dev.yml up -d

# 3. Testar localmente (se necessário)
cd frontend-nextjs
cp .env.preview .env.local  # Para desenvolvimento local
npm run dev
```

### **Produção**
```bash
# 1. Verificar configurações
cat frontend-nextjs/.env.production

# 2. Deploy do frontend
cd infrastructure-docker/docker-yml
docker compose -f docker-compose.frontend.yml down
docker compose -f docker-compose.frontend.yml build
docker compose -f docker-compose.frontend.yml up -d

# 3. Verificar Strapi de produção
docker compose -f docker-compose.yml ps
```

---

## 🔄 **Switching Entre Ambientes**

### **Para Desenvolvimento Local**
```bash
# Usar configurações de preview para desenvolvimento local
cd frontend-nextjs
cp .env.preview .env.local  # Se usando desenvolvimento local
npm run dev  # Roda na porta 3000 local
```

### **Para Testes de Preview**
```bash
# Strapi preview já está rodando em ale-blog-preview.agentesintegrados.com
# Frontend pode ser testado localmente apontando para preview
```

### **Para Deploy em Produção**
```bash
# Frontend automaticamente usa .env.production no container Docker
# Strapi de produção roda em ale-blog.agentesintegrados.com
```

---

## 🛡️ **Segurança e Isolamento**

### **Tokens de API Diferentes**
- **Preview**: Token com permissões de desenvolvimento
- **Produção**: Token com permissões restritivas de produção

### **Bancos de Dados Isolados**
- **Preview**: `postgres-strapi-dev` (porta 5434)
- **Produção**: `ale-blog-postgres` (porta padrão)

### **Índices Algolia Separados**
- **Preview**: `development_mcpx_content`
- **Produção**: `production_mcpx_content`

---

## 🔧 **Comandos Úteis**

### **Verificar Configuração Atual**
```bash
# Ver variáveis carregadas
cd frontend-nextjs
cat .env.preview  # ou .env.production

# Testar conexões
curl https://ale-blog-preview.agentesintegrados.com/api/posts
curl https://ale-blog.agentesintegrados.com/api/posts
```

### **Alternar Configurações**
```bash
# Para desenvolvimento local com preview
cp .env.preview .env.local

# Para desenvolvimento local com produção (CUIDADO!)
cp .env.production .env.local
```

### **Reset por Ambiente**
```bash
# Preview/desenvolvimento
./scripts/reset-database-development.sh

# Produção (CUIDADO!)
./scripts/reset-database-production.sh

# Ambos
./scripts/reset-database-complete.sh
```

---

## 📊 **Monitoramento por Ambiente**

### **Health Checks**
```bash
# Preview
curl -s https://ale-blog-preview.agentesintegrados.com/api/posts > /dev/null && echo "✅ Preview OK" || echo "❌ Preview ERRO"

# Produção  
curl -s https://ale-blog.agentesintegrados.com/api/posts > /dev/null && echo "✅ Produção OK" || echo "❌ Produção ERRO"
curl -s https://thecryptofrontier.agentesintegrados.com/ > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend ERRO"
```

### **Status dos Containers**
```bash
# Preview
docker ps | grep "strapi-v5-dev-preview\|postgres-strapi-dev"

# Produção
docker ps | grep "ale-blog-strapi-v5\|ale-blog-postgres\|thecryptofrontier-frontend"
```

---

## 🐛 **Troubleshooting por Ambiente**

### **Preview não Funciona**
```bash
# Verificar container
docker logs strapi-v5-dev-preview --tail=20

# Verificar banco
docker exec postgres-strapi-dev pg_isready -U strapi_dev

# Verificar variáveis
cat frontend-nextjs/.env.preview | grep STRAPI_URL
```

### **Produção não Funciona**
```bash
# Verificar containers
docker logs ale-blog-strapi-v5 --tail=20
docker logs thecryptofrontier-frontend --tail=20

# Verificar banco
docker exec ale-blog-postgres pg_isready -U strapi

# Verificar variáveis
docker exec thecryptofrontier-frontend printenv | grep STRAPI
```

---

## 📅 **Boas Práticas**

### **✅ Recomendado**
- Sempre testar em **preview** antes de aplicar em **produção**
- Usar tokens diferentes para cada ambiente
- Manter bancos de dados isolados
- Fazer backup antes de mudanças em produção

### **❌ Evitar**
- Usar token de produção em desenvolvimento
- Conectar desenvolvimento ao banco de produção
- Aplicar mudanças direto em produção sem testes
- Compartilhar tokens entre ambientes

---

## 🔗 **URLs de Acesso**

| Ambiente | Tipo | URL | Porta |
|----------|------|-----|-------|
| Preview | Strapi Admin | https://ale-blog-preview.agentesintegrados.com/admin | 1340 |
| Preview | Strapi API | https://ale-blog-preview.agentesintegrados.com/api | 1340 |
| Produção | Strapi Admin | https://ale-blog.agentesintegrados.com/admin | 1339 |
| Produção | Strapi API | https://ale-blog.agentesintegrados.com/api | 1339 |
| Produção | Frontend | https://thecryptofrontier.agentesintegrados.com/ | 3300 |

---

**📝 Criado em: 06/07/2024**  
**👤 Autor: Claude Agent**  
**🔄 Última atualização: 06/07/2024**  
**🎯 Estrutura: .env.preview + .env.production** 