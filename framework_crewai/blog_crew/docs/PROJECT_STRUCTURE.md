# Estrutura do Projeto Blog Crew

## 📁 Estrutura de Diretórios

```
blog_crew/
├── agents/                    # Agentes do CrewAI
│   ├── formatter_agent.py
│   ├── image_generator_agent.py
│   ├── indexer_agent.py
│   ├── monitor_agent.py
│   ├── publisher_agent.py
│   └── translator_agent.py
│
├── config/                    # Arquivos de configuração
│   ├── agent_post_config.py
│   ├── agents.yaml
│   ├── crewai.yaml           # Configuração principal do CrewAI
│   ├── formatter_enhanced_prompt.py
│   ├── sanity_config.py
│   ├── sanity.config.js      # Config JavaScript do Sanity
│   ├── settings.yaml
│   ├── tasks.yaml
│   └── visual_config.py
│
├── crew/                      # Variações do crew principal
│   └── crew_no_images.py
│
├── create/                    # Scripts de criação
│   └── crew_with_callbacks.py
│
├── data/                      # Arquivos de dados
│   ├── feeds.json            # Feeds RSS configurados
│   └── processed_articles.json
│
├── docs/                      # Documentação
│   ├── *.md                  # Vários arquivos de documentação
│   └── README_FLUXO_FUNCIONAL.md
│
├── examples/                  # Exemplos de uso
│   └── translation_agent_example.py
│
├── logic/                     # Lógica de negócio
│   ├── feed_manager.py
│   └── sanity_client.py
│
├── models/                    # Modelos de dados
│   ├── converters.py
│   ├── feed.py
│   └── post.py
│
├── monitoring/                # Ferramentas de monitoramento
│   ├── health_checker.py
│   └── metrics_dashboard.py
│
├── pipelines/                 # Diferentes pipelines
│   ├── crew/
│   │   └── crew.py
│   └── simple/
│       ├── simple_pipeline.py
│       └── ultra_simple_pipeline.py
│
├── posts_*                    # Diretórios de posts (dados)
│   ├── posts_formatados/
│   ├── posts_imagens/
│   ├── posts_para_traduzir/
│   ├── posts_processados/
│   ├── posts_publicados/
│   └── posts_traduzidos/
│
├── publish/                   # Scripts de publicação
│   ├── publish_all_with_images.py
│   ├── publish_direct.py
│   ├── publish_pipeline_posts.py
│   ├── publish_test_post.py
│   ├── publish_to_new_studio.py
│   ├── publish_via_sanity_client.py
│   └── publish_with_deploy_token.py
│
├── run/                       # Scripts de execução
│   ├── run_crew.py
│   ├── run_dashboard.sh
│   ├── run_pipeline.py
│   ├── run_pipeline_enhanced.py
│   └── run_pipeline_no_images.py
│
├── schemas/                   # Schemas do Sanity
│   ├── author_schema.py
│   ├── category_schema.py
│   └── ...
│
├── scripts/                   # Scripts utilitários
│   ├── build/
│   ├── fixes/               # Scripts de correção
│   │   ├── check_xrp_post.py
│   │   ├── direct_fix_links.py
│   │   └── patch_update_posts.py
│   ├── monitoring/          # Scripts de monitoramento
│   │   ├── check_posts_status.py
│   │   ├── monitor_service.py
│   │   └── rss_monitor.py
│   ├── shell/               # Scripts shell
│   │   ├── build.sh
│   │   ├── clean_json_files.sh
│   │   ├── clean_old_logs.sh
│   │   ├── daily_pipeline.sh
│   │   └── start_monitor.sh
│   └── validation/          # Scripts de validação
│       └── verify_token.py
│
├── tasks/                     # Tarefas do CrewAI
│   ├── blog_tasks.py
│   └── image_generation_task_v2.py
│
├── tests/                     # Testes organizados
│   ├── check_sanity_post.py
│   ├── test_image_integration.py
│   └── ...
│
├── tools/                     # Ferramentas e utilitários
│   ├── maintenance/          # Ferramentas de manutenção
│   ├── algolia_tools.py
│   ├── formatter_tools.py
│   ├── sanity_tools.py
│   └── ...
│
├── update/                    # Scripts de atualização
│   ├── update_existing_post.py
│   ├── update_posts_direct_upload.py
│   └── ...
│
├── utilities/                 # Utilitários diversos
│   ├── delete_algolia_duplicates.py
│   ├── retry_sanity_publish.py
│   ├── sync_sanity_to_algolia.py
│   └── ...
│
├── utils/                     # Utils do sistema
│   ├── parallel_processor.py
│   ├── retry_decorator.py
│   ├── security_validator.py
│   └── structured_logger.py
│
├── venv/                      # Ambiente virtual Python
│
├── backup/                    # Backups
│   └── requirements/         # Requirements antigos
│
├── logs/                      # Arquivos de log
│
├── __init__.py               # Torna o diretório um pacote Python
├── .env                      # Variáveis de ambiente
├── .env.example              # Exemplo de variáveis
├── requirements-base.txt     # Dependências essenciais
├── requirements-dev.txt      # Dependências de desenvolvimento  
├── requirements-prod.txt     # Dependências de produção
├── REQUIREMENTS_GUIDE.md     # Guia dos requirements
├── PROJECT_STRUCTURE.md      # Este arquivo
├── Dockerfile                # Container Docker
├── docker-compose.yml        # Composição Docker
├── docker-entrypoint.sh      # Script de entrada Docker
├── Makefile                  # Comandos make
├── pyproject.toml           # Configuração Python
└── uv.lock                  # Lock de dependências
```

## 🎯 Propósito de Cada Diretório

### Core (Núcleo)
- **agents/** - Agentes especializados do CrewAI
- **tasks/** - Definições de tarefas para os agentes
- **tools/** - Ferramentas que os agentes podem usar
- **models/** - Modelos de dados e estruturas
- **logic/** - Lógica de negócio central

### Execução
- **pipelines/** - Diferentes formas de executar o sistema
- **run/** - Scripts para iniciar pipelines
- **scripts/** - Scripts auxiliares organizados por tipo

### Dados
- **data/** - Arquivos de configuração de dados
- **posts_*/** - Diretórios para diferentes estágios dos posts

### Operações
- **publish/** - Scripts para publicar conteúdo
- **update/** - Scripts para atualizar conteúdo existente
- **utilities/** - Ferramentas de suporte e sincronização

### Qualidade
- **tests/** - Testes automatizados
- **monitoring/** - Monitoramento e métricas
- **scripts/validation/** - Scripts de validação

### Configuração
- **config/** - Todos os arquivos de configuração
- **schemas/** - Definições de esquema do Sanity

## 🚀 Como Usar

### Desenvolvimento Local
```bash
# Instalar dependências
pip install -r requirements-dev.txt

# Executar pipeline simples
python pipelines/simple/ultra_simple_pipeline.py

# Executar com crew completo
python run/run_crew.py
```

### Scripts Úteis
```bash
# Monitorar RSS
python scripts/monitoring/rss_monitor.py

# Verificar status dos posts
python scripts/monitoring/check_posts_status.py

# Limpar logs antigos
bash scripts/shell/clean_old_logs.sh
```

### Docker
```bash
# Build
docker-compose build

# Executar
docker-compose up
```

## 📝 Notas

- Arquivos de teste legados foram movidos para `backup/` ou removidos
- Requirements foram consolidados em 3 arquivos principais
- Scripts foram organizados por funcionalidade
- Configurações centralizadas em `config/`