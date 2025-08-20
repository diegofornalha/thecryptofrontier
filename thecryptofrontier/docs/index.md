# 📚 Documentação - The Crypto Frontier

Índice completo da documentação do projeto multilíngue de notícias sobre criptomoedas.

## 🏗️ **Arquitetura do Sistema**

### **Frontend (Next.js)**
- 🌐 **URL**: https://thecryptofrontier.agentesintegrados.com/
- 🚪 **Porta**: 3300
- 📁 **Código**: `frontend-nextjs/`
- 🎯 **Função**: Interface do usuário em 3 idiomas (EN, PT-BR, ES)

### **Backend Strapi**
#### **🟢 Produção**
- 🌐 **URL**: https://ale-blog.agentesintegrados.com/
- 🚪 **Porta**: 1339
- 🎯 **Função**: API de produção (dados reais)

#### **🟡 Preview/Desenvolvimento**
- 🌐 **URL**: https://ale-blog-preview.agentesintegrados.com/
- 🚪 **Porta**: 1340
- 🎯 **Função**: API de desenvolvimento (testes)

---

## 📖 **Documentação Disponível**

### **🔧 Configuração de Ambientes**
- **📄 Configuração Completa**: [`configuracao-ambientes.md`](./configuracao-ambientes.md)
- **🔧 .env.preview**: Ambiente de desenvolvimento/preview
- **🟢 .env.production**: Ambiente de produção
- **🔧 Switching entre ambientes**: Comandos e boas práticas

### **🗄️ Reset de Banco de Dados**
- **📄 Guia Completo**: [`reset-database-strapi.md`](./reset-database-strapi.md)
- **🛠️ Scripts**: [`scripts/README.md`](../scripts/README.md)
- **💾 Backup**: [`scripts/backup-database.sh`](../scripts/backup-database.sh)
- **🔥 Reset Completo**: [`scripts/reset-database-complete.sh`](../scripts/reset-database-complete.sh)
- **🟢 Reset Produção**: [`scripts/reset-database-production.sh`](../scripts/reset-database-production.sh)
- **🟡 Reset Desenvolvimento**: [`scripts/reset-database-development.sh`](../scripts/reset-database-development.sh)

### **🔄 Integração Automática**
- **📄 Integração Strapi**: [`integracao-automatica-strapi.md`](./integracao-automatica-strapi.md)
- **🔧 Webhook Revalidation**: `frontend-nextjs/app/api/revalidate/route.js`
- **🌐 Locale Utils**: `frontend-nextjs/lib/locale-utils.js`

---

## 🚀 **Guias Rápidos**

### **Reset Completo do Sistema**
```bash
# 1. Fazer backup
./scripts/backup-database.sh

# 2. Reset completo
./scripts/reset-database-complete.sh

# 3. Reconfigurar admin panels
# https://ale-blog.agentesintegrados.com/admin
# https://ale-blog-preview.agentesintegrados.com/admin
```

### **Verificar Status do Sistema**
```bash
# Containers ativos
docker ps | grep -E "(strapi|postgres|frontend)"

# APIs funcionando
curl https://ale-blog.agentesintegrados.com/api/posts
curl https://ale-blog-preview.agentesintegrados.com/api/posts

# Site frontend
curl https://thecryptofrontier.agentesintegrados.com/
```

### **Deploy Frontend**
```bash
cd infrastructure-docker/docker-yml
docker compose -f docker-compose.frontend.yml down
docker compose -f docker-compose.frontend.yml build
docker compose -f docker-compose.frontend.yml up -d
```

---

## 🌍 **Sistema Multilíngue**

### **Mapeamento de Locales**
| Frontend | Strapi | Descrição |
|----------|---------|-----------|
| `en` | `en` | Inglês |
| `br` | `pt-BR` | Português Brasil |
| `es` | `es` | Espanhol |

### **URLs Suportadas**
```
🇺🇸 INGLÊS
├── / ou /en/                    → Home em inglês
├── /en/post/                    → Lista de posts
└── /en/post/[slug]/            → Post individual

🇧🇷 PORTUGUÊS
├── /br/                         → Home em português
├── /br/post/                    → Lista de posts
└── /br/post/[slug]/            → Post individual

🇪🇸 ESPANHOL
├── /es/                         → Home em espanhol
├── /es/post/                    → Lista de posts
└── /es/post/[slug]/            → Post individual
```

### **Validação de URLs**
- Posts com sufixo `-english` → Apenas `/en/post/`
- Posts com sufixo `-portugues` ou `-pt` → Apenas `/br/post/`
- Posts com sufixo `-espanol` ou `-es` → Apenas `/es/post/`
- URLs inválidas retornam 404

---

## 🔧 **Configurações Técnicas**

### **Variáveis de Ambiente**

#### **Estrutura Simplificada (2 arquivos)**
```bash
# .env.preview (desenvolvimento/preview)
NEXT_PUBLIC_STRAPI_URL=https://ale-blog-preview.agentesintegrados.com
NEXT_PUBLIC_STRAPI_API_TOKEN=[preview_token]
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=development_mcpx_content
NEXT_TELEMETRY_DISABLED=1
REDIS_HOST=redis
# + todas as outras configurações

# .env.production (produção)
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
NEXT_PUBLIC_STRAPI_API_TOKEN=[production_token]
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=production_mcpx_content
NODE_ENV=production
PORT=3000
# + todas as outras configurações
```

### **Estrutura de Posts (Strapi)**
```javascript
{
  title: "Título do Post",
  content: "Conteúdo rico em markdown/HTML",
  slug: "titulo-do-post-idioma",
  publishedAt: "2024-07-06T22:00:00.000Z",
  locale: "en" | "pt-BR" | "es",
  // ... outros campos
}
```

### **Docker Compose**
```yaml
# Frontend
docker-compose.frontend.yml → thecryptofrontier-frontend:3300

# Strapi Produção
docker-compose.yml → ale-blog-strapi-v5:1339

# Strapi Desenvolvimento
docker-compose.dev.yml → strapi-v5-dev-preview:1340
```

---

## 🐛 **Troubleshooting**

### **Posts não aparecem**
1. Verificar API: `curl https://ale-blog.agentesintegrados.com/api/posts`
2. Verificar permissões no Strapi admin
3. Verificar locale correto (`en`, `pt-BR`, `es`)
4. Verificar logs: `docker logs thecryptofrontier-frontend`

### **URLs retornam 404**
1. Verificar validação de locale em `lib/locale-validation.js`
2. Verificar sufixos dos slugs (`-english`, `-portugues`, `-espanol`)
3. Verificar mapeamento de locales em `lib/locale-utils.js`

### **Frontend não atualiza**
1. Forçar revalidação: `curl -X POST "https://thecryptofrontier.agentesintegrados.com/api/revalidate?secret=token"`
2. Rebuild container: `docker compose -f docker-compose.frontend.yml build`
3. Verificar cache do browser

### **Strapi não inicia**
1. Verificar logs: `docker logs ale-blog-strapi-v5`
2. Verificar conexão com banco: `docker exec ale-blog-postgres pg_isready -U strapi`
3. Verificar permissões: `docker exec -i ale-blog-postgres psql -U strapi -d strapi -c "\du"`

---

## 📊 **Monitoramento**

### **Status dos Serviços**
```bash
# Health check completo
curl -s https://thecryptofrontier.agentesintegrados.com/ > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend ERRO"
curl -s https://ale-blog.agentesintegrados.com/api/posts > /dev/null && echo "✅ Strapi Prod OK" || echo "❌ Strapi Prod ERRO"
curl -s https://ale-blog-preview.agentesintegrados.com/api/posts > /dev/null && echo "✅ Strapi Dev OK" || echo "❌ Strapi Dev ERRO"
```

### **Logs em Tempo Real**
```bash
# Frontend
docker logs -f thecryptofrontier-frontend

# Strapi Produção
docker logs -f ale-blog-strapi-v5

# Strapi Desenvolvimento
docker logs -f strapi-v5-dev-preview

# Bancos de dados
docker logs -f ale-blog-postgres
docker logs -f postgres-strapi-dev
```

### **Métricas de Performance**
```bash
# Uso de recursos
docker stats ale-blog-strapi-v5 ale-blog-postgres thecryptofrontier-frontend

# Tamanho dos containers
docker images | grep -E "(strapi|frontend)"

# Espaço em disco
du -sh /var/lib/docker/volumes/
```

---

## 🔗 **Links Úteis**

### **Painéis Admin**
- 🟢 [Produção](https://ale-blog.agentesintegrados.com/admin)
- 🟡 [Preview](https://ale-blog-preview.agentesintegrados.com/admin)

### **APIs**
- 🟢 [Posts Produção](https://ale-blog.agentesintegrados.com/api/posts)
- 🟡 [Posts Preview](https://ale-blog-preview.agentesintegrados.com/api/posts)

### **Frontend**
- 🌐 [Site Principal](https://thecryptofrontier.agentesintegrados.com/)
- 🇺🇸 [Inglês](https://thecryptofrontier.agentesintegrados.com/en/)
- 🇧🇷 [Português](https://thecryptofrontier.agentesintegrados.com/br/)
- 🇪🇸 [Espanhol](https://thecryptofrontier.agentesintegrados.com/es/)

### **Documentação Externa**
- [Strapi v5 Docs](https://docs.strapi.io/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

## 📅 **Histórico de Versões**

| Data | Versão | Alterações | Autor |
|------|--------|------------|--------|
| 2024-07-06 | 1.0.0 | Setup inicial + i18n + reset database | Claude Agent |

---

**📝 Criado em: 06/07/2024**  
**👤 Autor: Claude Agent**  
**🔄 Última atualização: 06/07/2024**  
**🌟 Status: Ativo e funcional**