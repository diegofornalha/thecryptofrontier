# Correção do Erro 'ContainerCLI' object has no attribute 'get'

## Problema
O docker-mcp estava usando incorretamente `docker_client.containers.get()` que não existe na API do python-on-whales.

## Solução
Alterado em `src/docker_mcp/handlers.py`:

### handle_stop_container (linha 369)
```python
# ANTES:
container = await asyncio.to_thread(docker_client.containers.get, container_name)
await asyncio.to_thread(container.stop)

# DEPOIS:
await asyncio.to_thread(docker_client.container.stop, container_name)
```

### handle_start_container (linha 383)
```python
# ANTES:
container = await asyncio.to_thread(docker_client.containers.get, container_name)
await asyncio.to_thread(container.start)

# DEPOIS:
await asyncio.to_thread(docker_client.container.start, container_name)
```

### handle_remove_container (linha 399)
```python
# ANTES:
container = await asyncio.to_thread(docker_client.containers.get, container_name)
if container.state.status == "running" and not force:
    return [TextContent(...)]
await asyncio.to_thread(container.remove, force=force)

# DEPOIS:
if not force:
    try:
        container_info = await asyncio.to_thread(docker_client.container.inspect, container_name)
        if container_info.state.status == "running":
            return [TextContent(...)]
    except:
        pass
await asyncio.to_thread(docker_client.container.remove, container_name, force=force)
```

## Como aplicar a correção

1. Reconstruir a imagem Docker:
```bash
cd /root/.claude/docker-mcp
docker build -t docker-mcp:latest .
```

2. Reiniciar o MCP no Claude CLI para usar a nova versão.

## Verificação
A correção foi testada e funciona corretamente. O método correto em python-on-whales é usar os comandos diretamente no `docker_client.container` sem precisar obter o objeto container primeiro.