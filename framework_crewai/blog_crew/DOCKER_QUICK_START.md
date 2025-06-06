# 🐳 Blog Crew Docker - Guia Rápido

## Passo 1: Copiar variáveis de ambiente
```bash
cp ../../.env .env
```

## Passo 2: Construir imagem
```bash
docker compose build
```

## Passo 3: Iniciar containers
```bash
docker compose up -d
```

## Passo 4: Executar pipeline
```bash
# Processar 1 artigo
docker compose run --rm blog-crew python run_pipeline.py --limit 1 --clean

# Ou usar Makefile
make pipeline-1
```

## Comandos úteis
- `make logs` - Ver logs
- `make status` - Ver status
- `make down` - Parar tudo
- `make help` - Ver todos comandos

## Estrutura
```
blog-crew/
├── Dockerfile           # Imagem do container
├── docker-compose.yml   # Configuração dos serviços
├── docker-entrypoint.sh # Script de inicialização
├── Makefile            # Comandos facilitados
└── .env                # Suas variáveis de ambiente
```

## Problemas?
- Verifique se Docker está instalado: `docker --version`
- Verifique as variáveis no .env
- Use `docker compose logs` para ver erros