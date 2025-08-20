# Docker MCP - Containerização

## Visão Geral
O Docker MCP foi containerizado para melhor isolamento e portabilidade.

## Estrutura

### Arquivos Criados
- `Dockerfile` - Define a imagem Docker
- `requirements.txt` - Dependências Python
- `.dockerignore` - Arquivos ignorados no build
- `start-docker.sh` - Script para iniciar via Docker

### Imagem Docker
- Base: `python:3.11-slim`
- Inclui todas as dependências necessárias
- Inclui Docker CLI para compatibilidade com python-on-whales
- Acesso ao socket Docker do host

## Como Usar

### Construir a Imagem
```bash
cd /root/.claude/docker-mcp
docker build -t docker-mcp:latest .
```

### Executar o Container
```bash
./start-docker.sh
```

Ou manualmente:
```bash
docker run -i --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DOCKER_HOST=unix:///var/run/docker.sock \
  docker-mcp:latest
```

## Permissões
O container precisa de acesso ao socket Docker:
- Monta `/var/run/docker.sock` do host
- Define `DOCKER_HOST` para usar o socket

## Migração
1. A pasta `venv/` pode ser removida após validação
2. Use `start-docker.sh` ao invés de `start.sh`
3. O MCP continua funcionando normalmente

## Vantagens
- Isolamento completo do ambiente
- Facilita distribuição e deployment
- Não precisa gerenciar venv local
- Dependências consistentes