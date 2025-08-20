# Correção da Conexão do Docker MCP

## 🔍 Problema Identificado

O docker-mcp estava falhando ao conectar no Claude Code devido a um caminho incorreto na configuração.

### Erro encontrado:
```json
{
  "error": "Connection failed: spawn /root/.claude/docker-mcp/venv/bin/python3 ENOENT",
  "timestamp": "2025-06-01T22:47:24.413Z"
}
```

O sistema estava tentando usar `/root/.claude/docker-mcp/venv/bin/python3`, mas esse arquivo não existe porque o docker-mcp não usa um ambiente virtual (venv).

## ✅ Solução Aplicada

### 1. Diagnóstico
```bash
# Verificamos os logs de erro
cat /root/.cache/claude-cli-nodejs/-root--claude/mcp-logs-docker-mcp/2025-06-01T22-47-22-355Z.txt

# Identificamos a configuração incorreta
claude mcp list | grep docker-mcp
# Resultado: docker-mcp: /root/.claude/docker-mcp/venv/bin/python3 /root/.claude/docker-mcp/docker_mcp_server.py
```

### 2. Correção
```bash
# Removemos a configuração incorreta
claude mcp remove docker-mcp

# Adicionamos com o script correto
claude mcp add docker-mcp -s user -- /root/.claude/docker-mcp/start-docker.sh
```

## 📋 O que mudou?

### Antes (❌ Incorreto):
```
Comando: /root/.claude/docker-mcp/venv/bin/python3 /root/.claude/docker-mcp/docker_mcp_server.py
Problema: Tentava usar um Python de um venv que não existe
```

### Depois (✅ Correto):
```
Comando: /root/.claude/docker-mcp/start-docker.sh
Solução: Usa o script que executa o Docker container com todas as dependências
```

## 🏗️ Como o start-docker.sh funciona?

O script `/root/.claude/docker-mcp/start-docker.sh`:
1. Verifica se a imagem Docker `docker-mcp:latest` existe
2. Se não existir, constrói a imagem
3. Executa o container com:
   - Montagem do socket Docker (`/var/run/docker.sock`)
   - Variáveis de ambiente necessárias
   - Modo interativo para comunicação stdio

## 🔧 Dependências Instaladas

Durante a investigação, também instalamos as dependências Python necessárias:
```bash
pip install -r requirements.txt --break-system-packages
# Instalou: python-on-whales, docker, pyyaml
```

## 🎯 Resultado

Após a correção e reiniciar o Claude:
- ✅ docker-mcp aparece como "connected"
- ✅ Todas as funcionalidades Docker estão disponíveis
- ✅ Pode gerenciar containers, imagens, volumes, etc.

## 💡 Lições Aprendidas

1. **Sempre verificar logs**: Os logs em `/root/.cache/claude-cli-nodejs/` são essenciais para debug
2. **Usar o comando correto**: Para Docker MCP, use o script `start-docker.sh` que já cuida de tudo
3. **Containers vs Python local**: O Docker MCP roda em container, não precisa de venv local

## 🚀 Como verificar se está funcionando?

```bash
# No Claude, execute:
mcp

# Deve mostrar:
# • docker-mcp: connected ✅
```