# Docker MCP - Changelog

## [0.3.0] - 2025-01-30

### 🎉 Novas Funcionalidades

#### Gerenciamento de Volumes
- **list-volumes**: Lista todos os volumes Docker com detalhes
- **remove-volume**: Remove volumes Docker (com opção force)

#### Docker Compose Aprimorado
- **deploy-compose**: Agora suporta arquivos docker-compose.yml locais
- **compose-down**: Para e remove stacks Docker Compose completas
  - Opção para remover volumes
  - Opção para remover imagens

#### Monitoramento
- **get-container-stats**: Mostra estatísticas de uso de recursos em tempo real
  - CPU usage
  - Memória (usage/limit)
  - Network I/O (RX/TX)
  - Block I/O (Read/Write)

## [0.2.0] - 2025-01-30

### 🎉 Novas Funcionalidades

#### Gerenciamento de Containers
- **stop-container**: Para containers em execução
- **start-container**: Inicia containers parados
- **remove-container**: Remove containers (com opção force)

#### Gerenciamento de Imagens
- **list-images**: Lista todas as imagens Docker locais
- **pull-image**: Baixa ou atualiza imagens do Docker Hub
- **remove-image**: Remove imagens não utilizadas

### 🔧 Melhorias
- **list-containers**: Agora mostra informações detalhadas
  - Portas mapeadas
  - Status detalhado (Up X hours, Exited (0))
  - Formato mais legível
  - Filtro opcional para mostrar apenas containers rodando

### 📚 Documentação
- Criada documentação completa em português
- Adicionados exemplos práticos
- FAQ com problemas comuns
- Guia de início rápido

## [0.1.0] - 2025-01-29

### 🎉 Versão Inicial

#### Funcionalidades Básicas
- **create-container**: Cria containers simples
- **deploy-compose**: Deploy com Docker Compose
- **list-containers**: Lista containers (básico)
- **get-logs**: Obtém logs de containers

#### Infraestrutura
- Suporte para macOS, Linux e Windows
- Integração com Claude Code via MCP
- Operações assíncronas
- Tratamento de erros

---

## Roadmap Futuro

### [0.4.0] - Planejado
- **container-exec**: Executar comandos em containers
- **image-build**: Construir imagens a partir de Dockerfile
- **container-inspect**: Inspecionar detalhes completos de containers
- **image-inspect**: Inspecionar detalhes completos de imagens

### [0.5.0] - Planejado
- **network-list**: Listar redes Docker
- **network-create**: Criar redes personalizadas
- **network-remove**: Remover redes
- **network-connect**: Conectar containers a redes

### [1.0.0] - Planejado
- Suporte para Docker Swarm
- Integração com Docker Hub
- Suporte para Docker remoto (DOCKER_HOST)
- Interface web opcional
- Autenticação para registries privados