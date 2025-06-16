# 🐳 Docker Infrastructure - The Crypto Frontier

## 📁 Estrutura Consolidada

Este diretório contém todos os arquivos Docker Compose do projeto, organizados e consolidados para facilitar a gestão.

### Arquivos Principais

1. **`docker-compose.yml`** - Serviços principais
   - Frontend (Next.js)
   - Backend (Strapi v5)
   - Database (PostgreSQL)
   - Cache (Redis)
   - Search (Algolia Sync) - opcional com profile

2. **`docker-compose.agents.yml`** - Todos os agentes
   - Guardian Orchestrator
   - Unified Guardian
   - Memory Service (Mem0)
   - Specialists (Strapi, Docker, NextJS, Cleanup, Claude Code)
   - Guardian Bridge

3. **`docker-compose.services.yml`** - Serviços auxiliares
   - CrewAI Pipeline
   - Webhook Server
   - Browserless
   - Puppeteer Service
   - Monitoring Dashboard
   - Log Aggregator

4. **`docker-compose.dev.yml`** - Override para desenvolvimento
   - Hot reload
   - Portas expostas
   - Volumes para desenvolvimento
   - Ferramentas de dev (Watchtower, Mailhog)

## 🚀 Como Usar

### Produção Completa
```bash
# Subir todos os serviços principais
docker-compose -f docker-compose.yml up -d

# Adicionar agentes
docker-compose -f docker-compose.yml -f docker-compose.agents.yml up -d

# Adicionar serviços auxiliares
docker-compose -f docker-compose.yml -f docker-compose.agents.yml -f docker-compose.services.yml up -d
```

### Desenvolvimento
```bash
# Modo desenvolvimento com hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Com agentes em dev
docker-compose -f docker-compose.yml -f docker-compose.agents.yml -f docker-compose.dev.yml up -d
```

### Profiles Disponíveis

Use profiles para ativar serviços opcionais:

```bash
# Ativar busca com Algolia
docker-compose --profile search up -d

# Ativar todos os specialists
docker-compose -f docker-compose.agents.yml --profile specialists up -d

# Ativar pipeline CrewAI
docker-compose -f docker-compose.services.yml --profile pipeline up -d

# Ativar web scraping
docker-compose -f docker-compose.services.yml --profile scraping up -d

# Ativar monitoramento
docker-compose -f docker-compose.services.yml --profile monitoring up -d

# Ferramentas de desenvolvimento
docker-compose -f docker-compose.dev.yml --profile dev-tools up -d
```

## 🏷️ Labels e Organização

Todos os containers possuem labels para facilitar a gestão:

- `com.thecryptofrontier.service` - Nome do serviço
- `com.thecryptofrontier.tier` - Camada (frontend, backend, database, etc)
- `com.thecryptofrontier.type` - Tipo de serviço
- `com.thecryptofrontier.agent` - Para identificar agentes
- `com.thecryptofrontier.specialty` - Especialidade do agente

### Listar por Label
```bash
# Listar todos os agentes
docker ps --filter "label=com.thecryptofrontier.agent"

# Listar serviços de backend
docker ps --filter "label=com.thecryptofrontier.tier=backend"

# Listar specialists
docker ps --filter "label=com.thecryptofrontier.agent=specialist"
```

## 📊 Healthchecks

Todos os serviços possuem healthchecks configurados:

```bash
# Verificar saúde de todos os containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Verificar logs de healthcheck
docker inspect <container> | jq '.[0].State.Health'
```

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Database
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=sua_senha_segura

# Strapi
JWT_SECRET=seu_jwt_secret
ADMIN_JWT_SECRET=seu_admin_jwt_secret
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=seu_api_token_salt
TRANSFER_TOKEN_SALT=seu_transfer_token_salt
STRAPI_API_TOKEN=seu_strapi_api_token

# External Services
CLAUDE_API_KEY=sua_claude_api_key
OPENAI_API_KEY=sua_openai_api_key
ALGOLIA_APP_ID=seu_algolia_app_id
ALGOLIA_API_KEY=sua_algolia_api_key
ALGOLIA_INDEX_NAME=posts

# Security
WEBHOOK_SECRET=seu_webhook_secret
BROWSERLESS_TOKEN=seu_browserless_token
```

## 🛠️ Comandos Úteis

### Logs
```bash
# Ver logs de um serviço
docker-compose logs -f frontend

# Ver logs de todos os agentes
docker-compose -f docker-compose.agents.yml logs -f

# Logs com timestamp
docker-compose logs -f --timestamps
```

### Manutenção
```bash
# Rebuild de um serviço específico
docker-compose build frontend

# Restart de um serviço
docker-compose restart strapi

# Limpar volumes não utilizados
docker volume prune

# Verificar uso de recursos
docker stats
```

### Backup
```bash
# Backup do banco de dados
docker exec thecryptofrontier-postgres pg_dump -U strapi strapi > backup.sql

# Restaurar backup
docker exec -i thecryptofrontier-postgres psql -U strapi strapi < backup.sql
```

## 📈 Monitoramento

Acesse os dashboards:

- Frontend: http://localhost:3300
- Strapi Admin: http://localhost:1337/admin
- Monitoring Dashboard: http://localhost:5000
- Mailhog (dev): http://localhost:8025
- Guardian API: http://localhost:3003/health
- Webhook Server: http://localhost:8000/health

## 🚨 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs <service>

# Verificar configuração
docker-compose config

# Rebuild forçado
docker-compose build --no-cache <service>
```

### Problemas de rede
```bash
# Recriar rede
docker network rm thecryptofrontier_network
docker network create thecryptofrontier_network

# Verificar conectividade
docker exec <container> ping <outro_container>
```

### Limpeza completa
```bash
# Parar tudo
docker-compose -f docker-compose.yml -f docker-compose.agents.yml -f docker-compose.services.yml down

# Remover volumes (CUIDADO - apaga dados!)
docker-compose -f docker-compose.yml -f docker-compose.agents.yml -f docker-compose.services.yml down -v

# Limpeza total do sistema
docker system prune -a --volumes
```

## 📝 Migração dos Arquivos Antigos

Os arquivos Docker Compose antigos foram consolidados aqui:

- `docker-compose.frontend.yml` → `docker-compose.yml`
- `docker-compose.guardian.yml` → `docker-compose.agents.yml`
- `docker-compose.guardian-mcp.yml` → `docker-compose.agents.yml`
- `docker-compose.mem0.yml` → `docker-compose.agents.yml`
- `docker-compose.puppeteer.yml` → `docker-compose.services.yml`
- `docker-compose.webhook.yml` → `docker-compose.services.yml`
- `docker-compose.cleanup.yml` → Integrado em `docker-compose.agents.yml`
- Outros arquivos específicos → Consolidados conforme função

Os arquivos originais foram mantidos para referência mas devem ser considerados deprecados.