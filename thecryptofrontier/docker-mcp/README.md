# Docker MCP 🐳

> Gerencie containers Docker diretamente através do Claude usando o Model Context Protocol (MCP)

## 🚀 Instalação (Containerizado)

### Método Recomendado - Docker:
```bash
# 1. Navegue até o diretório
cd /root/.claude/docker-mcp

# 2. Construa a imagem (se ainda não existe)
docker build -t docker-mcp:latest .

# 3. Adicione ao Claude
claude mcp add docker-mcp -s user -- /root/.claude/docker-mcp/start-docker.sh

# 4. Verifique
claude mcp list
```

### Método Alternativo - Python Local (Legado):
```bash
# Use apenas se preferir não usar Docker
claude mcp add docker-mcp -s user -- \
  /root/.claude/docker-mcp/venv/bin/python3 \
  /root/.claude/docker-mcp/docker_mcp_server.py
```

### ⚠️ IMPORTANTE:
- **RECOMENDADO**: Use o método containerizado com `start-docker.sh`
- **Container tem acesso total** ao Docker do host via socket
- **Não precisa mais do venv** se usar o método Docker

## 🚀 Ferramentas Disponíveis (14 total)

- create-container
- list-containers
- stop-container
- start-container
- remove-container
- get-logs
- get-container-stats
- list-images
- pull-image
- remove-image
- list-volumes
- remove-volume
- deploy-compose
- compose-down

## 🔧 Solução de Problemas

### Se aparecer "docker-mcp: failed":
Veja o arquivo **`SOLUCAO_DEFINITIVA_DOCKER_MCP.md`**

### Para reinstalar:
```bash
claude mcp remove docker-mcp -s user
claude mcp add docker-mcp -s user -- /root/.claude/docker-mcp/venv/bin/python3 /root/.claude/docker-mcp/docker_mcp_server.py
```

## 📁 Arquivos Importantes

### Arquivos Docker (Novo):
- `Dockerfile` - Define a imagem Docker do MCP
- `requirements.txt` - Dependências Python
- `start-docker.sh` - Script para iniciar via Docker
- `.dockerignore` - Arquivos ignorados no build
- `CONTAINERIZATION.md` - Documentação da containerização

### Arquivos Originais:
- `docker_mcp_server.py` - Script principal do servidor
- `src/` - Código fonte do servidor MCP
- `setup.sh` - Instalador de dependências (legado)

## 🔄 Migração para Docker

1. **Teste o container**: `./start-docker.sh`
2. **Se funcionar bem**: `rm -rf venv/`
3. **Atualize o Claude**: 
   ```bash
   claude mcp remove docker-mcp -s user
   claude mcp add docker-mcp -s user -- /root/.claude/docker-mcp/start-docker.sh
   ```

---
Versão: 0.4.0 | Status: ✅ Containerizado