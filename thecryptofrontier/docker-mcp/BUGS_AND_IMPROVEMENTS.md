# Docker MCP - Bugs Encontrados e Melhorias Sugeridas

**Última atualização**: 06/01/2025

## 🐛 Bugs Encontrados

### 1. ✅ **get-logs - Erro com containers específicos** 
**Status**: CORRIGIDO
**Descrição**: `Error: can not get logs from container which is dead or marked for removal`
- **Causa**: Container foi recriado/removido mas o nome ainda era usado
- **Solução implementada**: 
  - Verifica estado do container antes de buscar logs
  - Mensagens de erro mais claras indicando se container foi removido
  - Adicionados novos parâmetros: `tail`, `follow`, `timestamps`, `since`, `until`

### 2. ✅ **get-container-stats - Erro de implementação**
**Status**: CORRIGIDO
**Descrição**: `Error: 'ContainerCLI' object has no attribute 'get'`
- **Causa**: python-on-whales usa objetos ContainerStats ao invés de dicts
- **Solução implementada**:
  - Reescrito para trabalhar com objetos ContainerStats
  - Agora mostra CPU%, memória, rede e I/O corretamente
```python
# Corrigido para usar:
stats_list = await asyncio.to_thread(docker_client.container.stats, container_name)
stats = stats_list[0]  # ContainerStats object
```

## 🔧 Melhorias Implementadas

### 1. ✅ **Mostrar portas mapeadas corretamente**
**Status**: IMPLEMENTADO
- Agora mostra: `Ports: 0.0.0.0:5437->5432/tcp, :::5437->5432/tcp`
- Implementado via inspect para obter informações completas de port bindings

### 2. ✅ **Health check status**
**Status**: IMPLEMENTADO
- Containers agora mostram: `Running (healthy)`, `Running (unhealthy)`, etc.
- Integrado na listagem de containers

### 3. ✅ **Comandos exec**
**Status**: IMPLEMENTADO
- Nova ferramenta `exec-container` disponível
- Suporta: `user`, `workdir`, `env`, `privileged`, `detach`
- Exemplo: `exec-container(container_name="postgres", command="psql -U user -c 'SELECT 1'")`

### 4. ✅ **Logs melhorados**
**Status**: IMPLEMENTADO
- Novos parâmetros: `tail`, `follow`, `timestamps`, `since`, `until`
- Exemplo: `get-logs(container_name="app", tail=50, timestamps=true, since="2h")`

## 🔧 Melhorias Pendentes

### 1. **Filtros mais avançados para list-containers**
- Filtrar por label (ex: `--filter label=app=web`)
- Filtrar por network (ex: `--filter network=bridge`)  
- Filtrar por status específico (ex: `--filter status=exited`)

### 2. **Informações de rede**
- Mostrar IPs internos dos containers
- Listar networks conectadas
- Mostrar configurações de rede detalhadas

### 7. **Docker Compose integrado**
**Ferramentas adicionais sugeridas**:
- `compose-ps`: Listar containers de um projeto compose específico
- `compose-restart`: Reiniciar serviços de um compose
- `compose-logs`: Logs agregados de todos os serviços
- `compose-scale`: Escalar serviços (ex: `web=3`)

### 8. **Informações de recursos**
- Mostrar limites de CPU/memória configurados
- Estatísticas agregadas de todos os containers
- Alertas quando containers excedem limites

### 9. **Backup e restore**
- `export-container`: Exportar container como tar
- `import-container`: Importar container de arquivo tar
- `backup-volume`: Fazer backup de volumes

### 10. **Melhorias na UI/output**
- Formatação colorida para diferentes status
- Tabelas mais legíveis para listagens
- Opção de output em JSON para automação

### 3. **Docker Compose integrado**
- `compose-ps`: Listar containers de um projeto compose específico
- `compose-restart`: Reiniciar serviços de um compose
- `compose-logs`: Logs agregados de todos os serviços
- `compose-scale`: Escalar serviços (ex: `web=3`)

### 4. **Informações de recursos**
- Mostrar limites de CPU/memória configurados
- Estatísticas agregadas de todos os containers
- Alertas quando containers excedem limites

### 5. **Backup e restore**
- `export-container`: Exportar container como tar
- `import-container`: Importar container de arquivo tar
- `backup-volume`: Fazer backup de volumes

### 6. **Melhorias na UI/output**
- Formatação colorida para diferentes status
- Tabelas mais legíveis para listagens
- Opção de output em JSON para automação

## 📊 Resumo do Progresso

### ✅ Implementado (7 melhorias)
- Bug get-container-stats corrigido
- Bug get-logs corrigido
- Portas mapeadas exibidas corretamente
- Health check status funcionando
- Ferramenta exec-container implementada
- Logs com parâmetros avançados
- Todas as melhorias de alta e média prioridade concluídas

### 📝 Pendente (3 melhorias de baixa prioridade)
- Filtros avançados para list-containers
- Ferramentas Docker Compose integradas
- Informações detalhadas de rede

## 🚀 Como usar as novas funcionalidades

### exec-container
```bash
# Executar comando SQL no PostgreSQL
mcp__docker-mcp__exec-container(
    container_name="postgres_db",
    command="psql -U postgres -c 'SELECT version()'"
)

# Executar como usuário específico
mcp__docker-mcp__exec-container(
    container_name="app",
    command="whoami",
    user="www-data"
)
```

### get-logs com filtros
```bash
# Últimas 50 linhas com timestamps
mcp__docker-mcp__get-logs(
    container_name="app",
    tail=50,
    timestamps=true
)

# Logs das últimas 2 horas
mcp__docker-mcp__get-logs(
    container_name="app",
    since="2h"
)
```