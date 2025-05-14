# The Crypto Frontier - Framework CrewAI

Framework de automação para o blog Crypto Frontier utilizando CrewAI, Streamlit e Redis.

## Como acessar a aplicação

Após iniciar os contêineres com Docker Compose, acesse a aplicação via:

- Interface principal: [http://localhost:8080](http://localhost:8080)
- Streamlit direto: [http://localhost:8080/streamlit](http://localhost:8080/streamlit)

## Estrutura do projeto

- `src/blog_automacao`: Módulos principais da aplicação
  - `tools`: Ferramentas para operações (Redis, processamento, etc.)
  - `logic`: Lógica de negócio e gerenciamento de sessão
  - `ui`: Componentes da interface Streamlit

## Comandos úteis

Iniciar todos os serviços:
```bash
docker-compose up -d
```

Visualizar logs:
```bash
docker-compose logs -f
```

Parar todos os serviços:
```bash
docker-compose down
```

## Migração de código legado

O código legado foi migrado da pasta `backup_legado_aprendizados` para a estrutura modular em `src/blog_automacao/tools`.
As principais ferramentas migradas incluem:

- Redis: `redis_tools.py` - Gerenciamento de cache e filas no Redis
- Processamento: `process_queue.py` - Processamento de artigos da fila

## Configuração do proxy reverso

A aplicação utiliza o Caddy como proxy reverso para:
- Servir arquivos estáticos
- Redirecionar tráfego para o Streamlit
- Fornecer um ponto de acesso unificado