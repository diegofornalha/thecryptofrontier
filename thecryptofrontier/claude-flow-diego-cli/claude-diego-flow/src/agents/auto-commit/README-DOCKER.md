# Auto Commit Agent - Docker

## Construir e Executar

### 1. Construir a imagem

```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego-cli/claude-diego-flow
docker build -f src/agents/auto-commit/Dockerfile -t auto-commit-agent .
```

### 2. Executar com Docker

```bash
# Executar monitorando o diretório atual
docker run -d \
  --name auto-commit-agent \
  -p 3030:3030 \
  -v $(pwd):/workspace \
  -v auto-commit-data:/app/.diego-tools \
  -e PROJECT_PATH=/workspace \
  -e ENABLE_DASHBOARD=true \
  auto-commit-agent
```

### 3. Executar com Docker Compose

```bash
cd src/agents/auto-commit

# Definir o caminho do projeto a ser monitorado
export PROJECT_PATH=/caminho/do/seu/projeto

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Configuração

### Variáveis de Ambiente

- `PROJECT_PATH`: Caminho do projeto a monitorar (default: /workspace)
- `DASHBOARD_PORT`: Porta do dashboard (default: 3030)
- `DEBOUNCE_TIME`: Tempo de espera antes do commit (default: 3000ms)
- `ENABLE_DASHBOARD`: Habilitar dashboard web (default: true)
- `ENABLE_MCP`: Habilitar integração MCP (default: true)
- `ENABLE_MEM0`: Habilitar integração Mem0 (default: true)
- `STRAPI_URL`: URL do Strapi para persistência (opcional)
- `SSH_PRIVATE_KEY`: Chave SSH privada (opcional)

### Volumes

- `/workspace`: Projeto a ser monitorado
- `/app/.diego-tools`: Dados persistentes (chaves SSH, logs, etc)

### Portas

- `3030`: Dashboard web

## Usar com SSH

### Opção 1: Variável de Ambiente

```bash
docker run -d \
  --name auto-commit-agent \
  -e SSH_PRIVATE_KEY="$(cat ~/.ssh/id_rsa)" \
  # ... outras configurações
  auto-commit-agent
```

### Opção 2: Montar volume SSH

```bash
docker run -d \
  --name auto-commit-agent \
  -v ~/.ssh:/root/.ssh:ro \
  # ... outras configurações
  auto-commit-agent
```

## Dashboard

Acesse o dashboard em: http://localhost:3030

Funcionalidades:
- Visualizar métricas em tempo real
- Forçar commits manuais
- Pausar/resumir monitoramento
- Ver histórico de commits
- Gerenciar chave SSH

## Integração com outros containers

O Auto Commit Agent pode se integrar com:

1. **Strapi**: Para persistir histórico de commits
2. **Mem0**: Para memória de longo prazo
3. **MCP Server**: Para comunicação com outros agentes

Certifique-se de que todos estão na mesma rede Docker:

```yaml
networks:
  diego-network:
    external: true
```

## Troubleshooting

### Container não inicia
```bash
# Ver logs
docker logs auto-commit-agent

# Verificar se o diretório é um repositório git
docker exec auto-commit-agent git status
```

### Dashboard não acessível
```bash
# Verificar se a porta está mapeada
docker port auto-commit-agent

# Verificar saúde do container
docker inspect auto-commit-agent --format='{{.State.Health.Status}}'
```

### Commits não funcionam
```bash
# Entrar no container
docker exec -it auto-commit-agent sh

# Testar git
git status
git remote -v

# Verificar chave SSH
ls -la /app/.diego-tools/
```