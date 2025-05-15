# Blog Crew - Framework CrewAI com Sanity CMS

Este projeto implementa um sistema automatizado para monitoramento de feeds RSS, tradução, formatação e publicação de artigos no Sanity CMS, utilizando o framework CrewAI.

## Visão Geral

O sistema utiliza agentes autônomos do CrewAI para executar diferentes etapas do processo de publicação de conteúdo:

1. **Monitor de Feeds RSS** - Monitora fontes de notícias e seleciona artigos relevantes
2. **Tradutor de Conteúdo** - Traduz os artigos para português brasileiro
3. **Formatador de Conteúdo** - Formata os artigos para o schema do Sanity CMS
4. **Publicador de Conteúdo** - Publica os artigos no Sanity CMS

Todos os dados são validados usando modelos Pydantic para garantir compatibilidade completa com o Sanity CMS.

## Estrutura do Projeto

```
blog_crew/
├── README.md               # Documentação principal
├── agents/                 # Definição dos agentes CrewAI
│   ├── formatter_agent.py  # Agente formatador
│   ├── monitor_agent.py    # Agente monitor
│   ├── publisher_agent.py  # Agente publicador
│   └── translator_agent.py # Agente tradutor
├── config/                 # Configurações
│   ├── agents.yaml         # Configurações dos agentes
│   ├── sanity_config.py    # Configurações do Sanity
│   ├── settings.yaml       # Configurações gerais
│   └── tasks.yaml          # Configurações das tarefas
├── crew.py                 # Definição da Crew (decoradores modernos)
├── crewai.yaml             # Configuração do CrewAI CLI
├── feeds.json              # Lista de feeds RSS
├── logic/                  # Lógica de negócio
│   ├── feed_manager.py     # Gerenciador de feeds RSS
│   └── sanity_client.py    # Cliente para o Sanity
├── models/                 # Modelos Pydantic
│   ├── converters.py       # Funções de conversão
│   ├── feed.py             # Modelos para feeds e artigos
│   └── post.py             # Modelo para posts do Sanity
├── publish_single.py       # Publica um único post no Sanity
├── pyproject.toml          # Dependências do projeto
├── run_crew.py             # Ponto de entrada do CrewAI
├── run_pipeline.py         # Pipeline sem dependência da OpenAI
├── schemas/                # Schemas do Sanity
│   ├── post_schema.py      # Schema para posts
│   └── ...                 # Outros schemas
├── scripts/                # Scripts utilitários
├── tasks/                  # Definição das tarefas CrewAI
│   └── blog_tasks.py       # Tarefas de blog
└── tools/                  # Ferramentas para os agentes
    ├── file_tools.py       # Ferramentas para arquivos
    ├── formatter_tools.py  # Ferramentas para formatação
    ├── rss_tools.py        # Ferramentas para feeds RSS
    └── sanity_tools.py     # Ferramentas para Sanity
```

## Requisitos

- Python 3.10+
- CrewAI 0.28.0+
- Pydantic 2.5.0+
- Sanity CMS (conta configurada)

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -e .
```

ou

```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente:

```bash
export SANITY_PROJECT_ID=your-project-id
export SANITY_API_TOKEN=your-api-token
export SANITY_DATASET=production
```

## Configuração

1. Edite o arquivo `feeds.json` para adicionar ou remover fontes de conteúdo
2. Ajuste as configurações em `config/settings.yaml` de acordo com suas necessidades

## Uso

Execute o workflow completo usando o CrewAI (depende da API da OpenAI):

```bash
python run_crew.py
```

Ou execute o pipeline sem depender da API da OpenAI:

```bash
python run_pipeline.py
```

Opções disponíveis no pipeline:

```
--max-articles N     # Número máximo de artigos por feed (padrão: 3)
--skip-steps etapas  # Etapas a pular (ex: monitorar,traduzir)
--only-steps etapas  # Apenas executar estas etapas (ex: formatar,publicar)
--input-files lista  # Arquivos específicos para processar
--delay segundos     # Atraso entre etapas (padrão: 2)
```

Para publicar um post manualmente:

```bash
python publish_single.py caminho/para/arquivo.json
```

## Modelos Pydantic

Este projeto utiliza modelos Pydantic para garantir a integridade dos dados em cada etapa do processo:

- `FeedArticle` - Modelo para artigos extraídos de feeds RSS
- `TranslatedArticle` - Modelo para artigos traduzidos
- `FormattedArticle` - Modelo para artigos formatados para o Sanity
- `Post` - Modelo principal para artigos no formato Sanity

Para mais detalhes sobre a implementação dos modelos Pydantic, consulte o arquivo [README_PYDANTIC.md](./README_PYDANTIC.md).

## Integração com MCP (Model Context Protocol)

Este projeto pode ser integrado com o MCP para melhorar a interação com o Sanity CMS. Para demonstrar como isso funcionaria, execute:

```bash
python sanity_mcp_integration.py
```

Para implementar a integração real com MCP, você precisaria instalar:

```bash
pip install crewai-tools[mcp]
```

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue para discutir as mudanças antes de enviar um pull request.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.