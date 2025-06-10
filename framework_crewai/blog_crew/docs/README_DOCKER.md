# Blog Crew - Execução via Docker 🐳

Configuração completa para executar o Blog Crew em containers Docker.

## 🚀 Início Rápido

### 1. Configurar variáveis de ambiente
```bash
# Copiar .env.example (se não existir .env)
cp ../../.env .env

# Ou criar novo
make env-example
cp .env.example .env

# Editar .env com suas chaves
nano .env
```

### 2. Construir e iniciar
```bash
# Construir imagens
make build

# Iniciar containers
make up

# Verificar status
make status
```

### 3. Executar pipeline
```bash
# Processar 3 artigos (padrão)
make pipeline

# Processar apenas 1 artigo
make pipeline-1

# Processar 10 artigos
make pipeline-10
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `make help` | Mostra ajuda com todos comandos |
| `make build` | Constrói as imagens Docker |
| `make up` | Inicia os containers em background |
| `make down` | Para os containers |
| `make logs` | Mostra logs em tempo real |
| `make shell` | Acessa shell do container |
| `make pipeline` | Executa pipeline (3 artigos) |
| `make pipeline-1` | Processa 1 artigo |
| `make pipeline-10` | Processa 10 artigos |
| `make monitor` | Inicia monitor RSS contínuo |
| `make status` | Mostra status dos containers |
| `make clean` | Remove containers e limpa dados |

## 🏗️ Arquitetura

### Containers
1. **blog-crew-redis** - Cache Redis para CrewAI
2. **blog-crew-app** - Pipeline principal
3. **blog-crew-monitor** - Monitor RSS (opcional)

### Volumes
- `./posts_*` - Diretórios de dados persistentes
- `./logs` - Arquivos de log
- `./feeds.json` - Configuração de feeds
- `redis-data` - Dados do Redis

## 🔧 Configuração Avançada

### Executar comando customizado
```bash
docker compose run --rm blog-crew python [comando]
```

### Acessar shell do container
```bash
make shell
# ou
docker compose exec blog-crew /bin/bash
```

### Ver logs específicos
```bash
# Logs do blog-crew
docker compose logs -f blog-crew

# Logs do Redis
docker compose logs -f redis
```

### Monitor RSS Contínuo
```bash
# Iniciar monitor
make monitor

# Parar monitor
docker compose --profile monitor down
```

## 🐛 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker compose logs blog-crew

# Reconstruir imagem
docker compose build --no-cache blog-crew
```

### Erro de permissão
```bash
# Ajustar permissões dos volumes
sudo chown -R $USER:$USER posts_* logs/
```

### Redis não conecta
```bash
# Verificar se Redis está rodando
docker compose ps redis

# Reiniciar Redis
docker compose restart redis
```

## 🔄 Desenvolvimento

### Modo desenvolvimento
```bash
# Editar docker-compose.yml e adicionar:
volumes:
  - ./:/app  # Monta código local

# Executar com reload automático
docker compose run --rm blog-crew python run_crew.py --watch
```

### Rebuild após mudanças
```bash
# Reconstruir imagem
make build

# Reiniciar containers
make restart
```

## 📊 Monitoramento

### Verificar uso de recursos
```bash
docker stats blog-crew-app blog-crew-redis
```

### Verificar logs de processamento
```bash
# Últimos 100 logs
docker compose logs --tail=100 blog-crew

# Logs em tempo real
make logs
```

## 🛑 Parar Tudo

```bash
# Parar containers mantendo dados
make down

# Limpar TUDO (containers + dados)
make clean
```

---

**Dica**: Use `make help` para ver todos os comandos disponíveis!