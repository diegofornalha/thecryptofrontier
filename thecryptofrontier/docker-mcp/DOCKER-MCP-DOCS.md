# Docker MCP - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Ferramentas Disponíveis](#ferramentas-disponíveis)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Arquitetura](#arquitetura)
7. [Troubleshooting](#troubleshooting)
8. [Desenvolvimento](#desenvolvimento)

## 🔍 Visão Geral

O Docker MCP é um servidor Model Context Protocol que permite ao Claude interagir com Docker e Docker Compose diretamente. Com ele, você pode gerenciar todo o ecossistema Docker através de comandos naturais.

### Características (v0.3.0)

- ✅ Gerenciamento completo de containers, imagens e volumes
- ✅ Suporte completo ao Docker e Docker Compose
- ✅ Monitoramento de recursos em tempo real
- ✅ Compatível com macOS, Linux e Windows
- ✅ Integração nativa com Claude Code
- ✅ Operações assíncronas para melhor performance
- ✅ Suporte para arquivos docker-compose.yml locais

## 📦 Instalação

### Pré-requisitos

- Python 3.12 ou superior
- Docker Desktop instalado e em execução
- Claude Code CLI (`claude`)

### Instalação Rápida

1. **Configure o ambiente**:
```bash
cd /root/.claude/docker-mcp
./setup.sh
```

2. **Adicione ao Claude Code**:
```bash
claude mcp add docker-mcp -s user -- python3 /root/.claude/docker-mcp/docker_mcp_server.py

```

3. **Verifique a instalação**:
```bash
claude mcp list | grep docker-mcp
```

### Instalação Manual

Se preferir instalar manualmente:

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install httpx mcp python-dotenv python-on-whales pyyaml

# Adicionar ao Claude
claude mcp add docker-mcp -s user -- python3 /root/.claude/docker-mcp/run.py
```

### Variáveis de Ambiente

Você pode configurar o comportamento através de variáveis de ambiente:

```bash
# Timeout padrão para comandos Docker (em segundos)
export DOCKER_COMMAND_TIMEOUT=300

# Caminho customizado para o Docker (se não estiver no PATH)
export DOCKER_PATH=/usr/local/bin/docker

# Para Docker remoto (futuro)
export DOCKER_HOST=tcp://192.168.1.100:2375
```

## 🛠️ Ferramentas Disponíveis

### Gerenciamento de Containers

#### 1. create-container
Cria e executa um container Docker simples.

**Parâmetros**:
- `image` (obrigatório): Imagem Docker a usar
- `name`: Nome do container
- `ports`: Mapeamento de portas (objeto)
- `environment`: Variáveis de ambiente (objeto)

**Exemplo**:
```json
{
  "image": "nginx:latest",
  "name": "web-server",
  "ports": {"80": "8080"},
  "environment": {"ENV": "production"}
}
```

#### 2. list-containers
Lista todos os containers com informações detalhadas.

**Parâmetros**:
- `all`: Mostrar todos os containers (padrão: true)

**Resposta**:
```
• nginx-server (abc123def456)
  Image: nginx:latest
  Status: Up 2 hours
  Ports: 0.0.0.0:8080->80/tcp
```

#### 3. stop-container
Para um container em execução.

**Parâmetros**:
- `container_name` (obrigatório): Nome ou ID do container

#### 4. start-container
Inicia um container parado.

**Parâmetros**:
- `container_name` (obrigatório): Nome ou ID do container

#### 5. remove-container
Remove um container.

**Parâmetros**:
- `container_name` (obrigatório): Nome ou ID do container
- `force`: Forçar remoção mesmo se estiver rodando (padrão: false)

#### 6. get-logs
Obtém os logs mais recentes de um container.

**Parâmetros**:
- `container_name` (obrigatório): Nome ou ID do container

#### 7. get-container-stats
Mostra estatísticas de recursos em tempo real.

**Parâmetros**:
- `container_name` (obrigatório): Nome ou ID do container

**Resposta**:
```
Container Stats for 'nginx-server':

CPU Usage: 2.34%
Memory Usage: 45.23 MB / 1024.00 MB (4.42%)
Network I/O: RX 12.34 MB / TX 5.67 MB
Block I/O: Read 0.12 MB / Write 0.45 MB
```

### Gerenciamento de Imagens

#### 8. list-images
Lista todas as imagens Docker locais.

**Parâmetros**: Nenhum

**Resposta**:
```
• nginx:latest
  ID: sha256:abc123
  Size: 142.4MB
  Created: 2 days ago
```

#### 9. pull-image
Baixa ou atualiza uma imagem do Docker Hub.

**Parâmetros**:
- `image` (obrigatório): Nome da imagem com tag opcional

**Exemplo**:
```json
{
  "image": "nginx:latest"
}
```

#### 10. remove-image
Remove uma imagem Docker.

**Parâmetros**:
- `image` (obrigatório): Nome ou ID da imagem
- `force`: Forçar remoção mesmo se usada por containers (padrão: false)

### Gerenciamento de Volumes

#### 11. list-volumes
Lista todos os volumes Docker.

**Parâmetros**:
- `filters`: Filtros opcionais (ex: {"dangling": "true"})

**Resposta**:
```
• my-data-volume
  Driver: local
  Scope: local
  Mountpoint: /var/lib/docker/volumes/my-data-volume/_data
  Labels: app=myapp, env=prod
```

#### 12. remove-volume
Remove um volume Docker.

**Parâmetros**:
- `volume_name` (obrigatório): Nome do volume
- `force`: Forçar remoção mesmo se em uso (padrão: false)

### Docker Compose

#### 13. deploy-compose
Faz deploy de um stack usando Docker Compose.

**Parâmetros**:
- `project_name` (obrigatório): Nome do projeto
- `compose_yaml`: Conteúdo YAML inline (se não usar compose_file)
- `compose_file`: Caminho para arquivo docker-compose.yml local

**Exemplo com arquivo local**:
```json
{
  "project_name": "myapp",
  "compose_file": "/root/projeto/docker-compose.yml"
}
```

**Exemplo com YAML inline**:
```json
{
  "project_name": "myapp",
  "compose_yaml": "version: '3.8'\nservices:\n  web:\n    image: nginx"
}
```

#### 14. compose-down
Para e remove um stack Docker Compose.

**Parâmetros**:
- `project_name` (obrigatório): Nome do projeto
- `compose_file`: Caminho opcional para docker-compose.yml
- `remove_volumes`: Remover volumes associados (padrão: false)
- `remove_images`: Remover imagens usadas (padrão: false)

## 📚 Exemplos de Uso

### Exemplo 1: Ciclo Completo de Container

```
# Criar um servidor web
"Crie um container nginx chamado web-server na porta 8080"

# Verificar status
"Liste todos os containers"

# Monitorar recursos
"Mostre as estatísticas do container web-server"

# Parar quando necessário
"Pare o container web-server"

# Remover quando não precisar mais
"Remova o container web-server"
```

### Exemplo 2: Gerenciamento de Imagens

```
# Listar imagens disponíveis
"Liste todas as imagens Docker"

# Baixar nova imagem
"Baixe a imagem postgres:15"

# Remover imagem antiga
"Remova a imagem postgres:14"
```

### Exemplo 3: Deploy com Docker Compose Local

```
# Deploy usando arquivo existente
"Faça deploy do meu projeto usando o docker-compose.yml em /root/myapp"

# Parar e limpar tudo
"Pare o stack myapp e remova os volumes"
```

### Exemplo 4: Monitoramento e Debug

```
# Ver logs de erro
"Mostre os logs do container api-server"

# Monitorar performance
"Mostre as estatísticas de CPU e memória do container database"

# Gerenciar volumes
"Liste todos os volumes Docker e remova os não utilizados"
```

### Exemplo 5: Stack Completo WordPress

```
"Crie um stack WordPress com MySQL, configure senhas seguras, 
use volumes persistentes e exponha na porta 8080"
```

Claude irá:
1. Gerar um docker-compose.yml apropriado
2. Configurar WordPress e MySQL
3. Criar volumes para persistência
4. Fazer deploy do stack completo

## 🏗️ Arquitetura

### Fluxo de Comunicação

```
Claude → MCP Protocol → docker-mcp → Docker Engine
                              ↓
                        handlers.py
                              ↓
                     python-on-whales → Docker CLI
```

### Componentes Principais

#### server.py
- Define todas as 14 ferramentas disponíveis
- Implementa o protocolo MCP
- Gerencia a comunicação com Claude
- Versão atual: 0.3.0

#### handlers.py
- Contém a lógica de cada ferramenta
- Validação robusta de parâmetros
- Formatação detalhada de respostas
- Tratamento de erros específicos

#### docker_executor.py
- Executa comandos Docker Compose
- Gerencia arquivos temporários
- Abstrai diferenças entre plataformas

### Segurança

- ✅ Validação de todos os parâmetros de entrada
- ✅ Sanitização de comandos Docker
- ✅ Timeouts configuráveis para prevenir travamentos
- ✅ Logs detalhados para auditoria
- ✅ Isolamento de operações perigosas

## 🔧 Troubleshooting

### Problema: "Docker não encontrado"

**Solução**:
```bash
# Verificar instalação
docker --version

# macOS: Instalar Docker Desktop
brew install --cask docker

# Linux: Instalar Docker Engine
curl -fsSL https://get.docker.com | sh
```

### Problema: "Permissão negada"

**Solução Linux**:
```bash
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

### Problema: "Container não inicia"

**Diagnóstico**:
```
"Mostre os logs do container [nome]"
"Liste todos os containers e seus status"
"Verifique as portas em uso"
```

### Problema: "MCP não responde"

**Debug**:
```bash
# Ver logs do MCP
tail -f ~/Library/Logs/Claude/mcp-docker-mcp.log

# Testar servidor manualmente
cd /root/.claude/docker-mcp
source venv/bin/activate
python3 run.py
```

### Verificar Processos

```bash
# Ver se docker-mcp está rodando
ps aux | grep docker-mcp

# Reiniciar se necessário
claude mcp restart docker-mcp
```

## 👨‍💻 Desenvolvimento

### Adicionando Novas Ferramentas

1. **Defina em server.py**:
```python
types.Tool(
    name="nova-ferramenta",
    description="Descrição clara",
    inputSchema={
        "type": "object",
        "properties": {
            "param1": {"type": "string"}
        },
        "required": ["param1"]
    }
)
```

2. **Implemente em handlers.py**:
```python
@staticmethod
async def handle_nova_ferramenta(arguments: Dict[str, Any]) -> List[TextContent]:
    param1 = arguments.get("param1")
    # Implementação
    return [TextContent(type="text", text="Resultado")]
```

3. **Adicione ao switch em server.py**:
```python
elif name == "nova-ferramenta":
    return await DockerHandlers.handle_nova_ferramenta(arguments)
```

### Testando Localmente

```bash
# Preparar ambiente
cd /root/.claude/docker-mcp
source venv/bin/activate

# Executar testes
python3 -m pytest tests/

# Executar servidor em modo debug
PYTHONPATH=. python3 run.py
```

### Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commit: `git commit -am 'Add: nova funcionalidade'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

## 📝 Notas Adicionais

### Performance

- Todas operações são assíncronas
- Timeout padrão de 200 segundos
- Suporte para operações concorrentes
- Cache inteligente de resultados

### Compatibilidade

- **macOS**: Totalmente compatível (testado)
- **Linux**: Totalmente compatível
- **Windows**: Compatível via Docker Desktop
- **WSL2**: Recomendado para Windows

### Limitações Atuais

1. Não suporta Docker Swarm ainda
2. Limite de 100 linhas de logs por vez
3. Não suporta builds de imagens ainda
4. Sem suporte para Docker remoto (em desenvolvimento)

### Roadmap

**v0.4.0** (Próxima)
- [ ] container-exec: Executar comandos em containers
- [ ] image-build: Construir imagens de Dockerfile
- [ ] container-inspect: Detalhes completos
- [ ] image-inspect: Detalhes de imagens

**v0.5.0**
- [ ] Gerenciamento de redes Docker
- [ ] Suporte para Docker registries
- [ ] Healthchecks automáticos

**v1.0.0**
- [ ] Suporte Docker Swarm
- [ ] Docker remoto (DOCKER_HOST)
- [ ] Interface web opcional

## 🆘 Suporte

Para problemas ou dúvidas:

1. Consulte esta documentação
2. Verifique os logs: `~/Library/Logs/Claude/`
3. Execute diagnóstico: `"Liste containers e mostre logs de erros"`
4. Reporte issues no GitHub

---

**Versão**: 0.3.0  
**Última atualização**: 30 de Janeiro de 2025  
**Autor**: Diego (via Claude)  
**Licença**: MIT