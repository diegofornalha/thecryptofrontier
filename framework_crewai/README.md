# The Crypto Frontier - Framework CrewAI

Framework de automação para o blog Crypto Frontier utilizando CrewAI, Streamlit e Redis.

## Como acessar a aplicação

Após iniciar os contêineres com Docker Compose, você pode acessar a aplicação de duas formas:

### Acesso direto ao Streamlit (recomendado)
- URL: [http://localhost:8501](http://localhost:8501)
- Útil para desenvolvimento local e testes

### Acesso via proxy Caddy (alternativa)
- URL: [http://localhost:8080](http://localhost:8080)

O Caddy atua como um proxy reverso, encaminhando todas as requisições para o Streamlit.

### Iniciando a aplicação

```bash
# Clonar o repositório (se ainda não tiver feito)
git clone https://github.com/your-username/framework_crewai.git
cd framework_crewai

# Criar arquivo .env com as variáveis de ambiente necessárias
cat > .env << EOF
GEMINI_API_KEY=sua_chave_api_gemini
SANITY_PROJECT_ID=seu_project_id_sanity
SANITY_API_TOKEN=seu_token_sanity
NEXT_PUBLIC_ALGOLIA_APP_ID=seu_app_id_algolia
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=sua_search_api_key_algolia
EOF

# Iniciar os contêineres
docker-compose up -d

# Verificar se os contêineres estão rodando
docker-compose ps
```

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