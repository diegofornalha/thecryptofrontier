# 🧠 Mem0 Docker Setup - Documentação Local

## 📋 Visão Geral

Esta configuração permite executar o Mem0 localmente com Docker, incluindo:
- **Vector Database** (Qdrant) para armazenar embeddings
- **Redis** para cache
- **PostgreSQL** para metadados
- **API Service** compatível com a API do Mem0
- **Documentation Scraper** que sincroniza a documentação oficial
- **Web UI** (opcional) para visualização

## 🚀 Como Usar

### 1. Iniciar os Serviços

```bash
# Criar diretórios necessários
mkdir -p /var/lib/docker/volumes/thecryptofrontier-data/{qdrant,redis,postgres} mem0/docs-cache

# Iniciar todos os serviços
docker-compose -f docker-compose.mem0.yml up -d

# Ver logs
docker-compose -f docker-compose.mem0.yml logs -f
```

### 2. Verificar Status

```bash
# Health check
curl http://localhost:8000/health

# Ver estatísticas
curl http://localhost:8000/v1/memories/stats
```

### 3. API Endpoints

#### Criar Memória
```bash
curl -X POST http://localhost:8000/v1/memories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-api-key" \
  -d '{
    "content": "O Next.js 14 introduziu o App Router como padrão",
    "userId": "user123",
    "metadata": {
      "source": "documentation",
      "topic": "nextjs"
    },
    "tags": ["nextjs", "react", "framework"],
    "category": "technical"
  }'
```

#### Buscar Memórias
```bash
curl -X POST http://localhost:8000/v1/memories/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secure-api-key" \
  -d '{
    "query": "Como funciona o App Router?",
    "userId": "user123",
    "limit": 10
  }'
```

#### Listar Memórias
```bash
curl http://localhost:8000/v1/memories?userId=user123 \
  -H "Authorization: Bearer your-secure-api-key"
```

## 📚 Sincronização de Documentação

O scraper sincroniza automaticamente a documentação do Mem0:

1. **Execução Inicial**: Ao iniciar, faz scraping completo
2. **Atualizações**: A cada 6 horas (configurável)
3. **Cache Local**: Salva em `/mem0/docs-cache`
4. **Vector Store**: Cria embeddings automaticamente

### Consultar Documentação

```bash
# Buscar na documentação
curl -X POST http://localhost:8000/v1/docs/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "how to create memories in nodejs"
  }'
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# API Keys
MEM0_API_KEY=your-secure-api-key
OPENAI_API_KEY=sk-... # Opcional, para embeddings

# Database URLs (já configurados no docker-compose)
QDRANT_URL=http://mem0-qdrant:6333
REDIS_URL=redis://mem0-redis:6379
DATABASE_URL=postgresql://mem0:mem0password@mem0-postgres:5432/mem0db

# Documentation
DOCS_URL=https://docs.mem0.ai
UPDATE_INTERVAL=0 */6 * * * # Cron expression
```

### Personalizar Scraping

Para adicionar outras documentações, edite `scraper/index.js`:

```javascript
// Adicionar múltiplas fontes
const DOCUMENTATION_SOURCES = [
  'https://docs.mem0.ai',
  'https://nextjs.org/docs',
  'https://react.dev'
];
```

## 🔌 Integração com MCP Tools

O Mem0 local pode ser usado com as ferramentas MCP:

```javascript
// Exemplo de integração
const mem0Config = {
  apiUrl: 'http://localhost:8000',
  apiKey: process.env.MEM0_API_KEY
};

// Usar com mcp__diego-tools__mem0_add_memory
await addMemory({
  content: "Informação importante",
  userId: "assistant",
  metadata: { source: "local_docs" }
});
```

## 🐳 Comandos Docker Úteis

```bash
# Parar serviços
docker-compose -f docker-compose.mem0.yml down

# Limpar volumes (cuidado: apaga dados!)
docker-compose -f docker-compose.mem0.yml down -v

# Ver logs de um serviço específico
docker-compose -f docker-compose.mem0.yml logs -f mem0-api

# Executar comandos no container
docker-compose -f docker-compose.mem0.yml exec mem0-api sh

# Rebuild após mudanças
docker-compose -f docker-compose.mem0.yml build --no-cache
```

## 📊 Monitoramento

### Qdrant Dashboard
- URL: http://localhost:6333/dashboard
- Visualizar collections e vectors

### PostgreSQL
```bash
# Conectar ao banco
docker-compose -f docker-compose.mem0.yml exec mem0-postgres psql -U mem0 -d mem0db

# Ver tabelas
\dt

# Ver documentação sincronizada
SELECT url, title FROM documentation_pages;
```

### Redis
```bash
# Conectar ao Redis
docker-compose -f docker-compose.mem0.yml exec mem0-redis redis-cli

# Ver chaves
KEYS *
```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
mem0/
├── src/
│   ├── index.ts           # API principal
│   ├── routes/            # Endpoints
│   ├── services/          # Lógica de negócio
│   │   ├── memory-service.ts
│   │   ├── vector-store.ts
│   │   ├── embeddings.ts
│   │   └── cache.ts
│   ├── models/            # Modelos de dados
│   └── utils/             # Utilitários
├── scraper/
│   ├── index.js           # Scraper de documentação
│   └── package.json
├── docs-cache/            # Cache local da documentação
├── Dockerfile             # API
├── Dockerfile.scraper     # Scraper
└── package.json
```

### Adicionar Novos Endpoints

1. Criar rota em `src/routes/`
2. Implementar lógica em `src/services/`
3. Atualizar documentação

## 🚨 Troubleshooting

### Erro: "Cannot connect to Qdrant"
```bash
# Verificar se Qdrant está rodando
docker-compose -f docker-compose.mem0.yml ps
docker-compose -f docker-compose.mem0.yml logs mem0-qdrant
```

### Erro: "Scraper not finding pages"
```bash
# Ver logs do scraper
docker-compose -f docker-compose.mem0.yml logs mem0-docs-scraper

# Executar scraper manualmente
docker-compose -f docker-compose.mem0.yml exec mem0-docs-scraper node index.js
```

### Performance Issues
```bash
# Ajustar limites de memória no docker-compose
services:
  mem0-api:
    mem_limit: 2g
    cpus: '1.0'
```

## 📝 Próximos Passos

1. **Criar Agente Especialista**: `mem0-specialist-agent.ts`
2. **Integrar com Guardian**: Adicionar suporte ao Mem0
3. **UI Melhorada**: Desenvolver interface web completa
4. **Backup Automático**: Script para backup dos dados
5. **Métricas**: Adicionar Prometheus/Grafana

## 🔗 Links Úteis

- [Documentação Oficial Mem0](https://docs.mem0.ai)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Node.js Quickstart](https://docs.mem0.ai/open-source/node-quickstart)