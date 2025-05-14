# Blog Crew - Automação de blog com CrewAI

Este projeto implementa um fluxo automatizado para blog usando o framework CrewAI. Ele gerencia todo o processo desde monitorar feeds RSS até publicar conteúdo no Sanity CMS.

## Estrutura

O projeto segue a estrutura padrão recomendada pela [documentação do CrewAI](https://docs.crewai.com/):

```
blog_crew/
│
├── agents/                # Definição dos agentes
│   ├── monitor_agent.py   # Agente monitor de feeds RSS
│   ├── translator_agent.py  # Agente tradutor
│   ├── formatter_agent.py   # Agente formatador de conteúdo
│   └── publisher_agent.py   # Agente publicador no Sanity
│
├── tools/                 # Ferramentas para os agentes
│   ├── rss_tools.py       # Ferramentas de leitura de RSS
│   ├── file_tools.py      # Ferramentas de manipulação de arquivos 
│   ├── formatter_tools.py  # Ferramentas de formatação
│   └── sanity_tools.py    # Ferramentas de publicação no Sanity
│
├── tasks/                 # Definição das tarefas
│   └── blog_tasks.py      # Tarefas do fluxo de blog
│
├── logic/                 # Lógica de negócios
│   ├── feed_manager.py    # Gerenciador de feeds RSS
│   └── sanity_client.py   # Cliente para Sanity CMS
│
├── config/                # Configurações do projeto
│   ├── settings.yaml      # Configurações gerais
│   └── sanity_config.py   # Configurações do Sanity
│
├── schemas/               # Schemas do Sanity CMS
│   └── post_schema.py     # Schema de post
│
├── crew.py                # Definição do Crew para CLI
├── crewai.yaml            # Configuração para o CLI da CrewAI
├── main.py                # Script principal
│
├── requirements.txt       # Dependências do projeto
│
└── README.md              # Esta documentação
```

## Feeds RSS

O sistema está configurado para monitorar os seguintes feeds RSS:

```json
[
  {
    "name": "thecryptobasic.com",
    "url": "https://thecryptobasic.com/feed"
  },
  {
    "name": "u.today",
    "url": "https://u.today/rss"
  }
]
```

## Funcionalidades

### Monitoramento de RSS
- Lê feeds RSS de diversas fontes sobre criptomoedas
- Seleciona artigos relevantes para o público brasileiro
- Salva os artigos para tradução

### Tradução
- Traduz artigos do inglês para português brasileiro
- Adapta termos técnicos e referências culturais
- Mantém a fluência e naturalidade do texto

### Formatação
- Prepara o conteúdo traduzido para o Sanity CMS
- Cria slugs, organiza metadados e estrutura o conteúdo
- Otimiza para SEO

### Publicação
- Publica o conteúdo formatado no Sanity CMS
- Verifica sucesso da publicação
- Gerencia o ciclo de vida dos artigos publicados

## Requisitos

- Python 3.9+
- CrewAI
- Langchain
- API Key do Google Gemini
- Credenciais do Sanity CMS

## Instalação

1. Instale o CLI da CrewAI:
```bash
pip install crewai --upgrade
```

2. Instale o projeto blog_crew:
```bash
cd blog_crew
crewai install
```

3. Configure as variáveis de ambiente:
```bash
export GEMINI_API_KEY="sua-chave-api-do-gemini"
export SANITY_PROJECT_ID="seu-id-do-projeto-sanity"
export SANITY_API_TOKEN="seu-token-do-sanity"
```

## Uso

### Usando o CLI da CrewAI

Execute o Crew diretamente usando o CLI:

```bash
cd blog_crew
crewai run
```

### Usando o script Python

Alternativamente, você pode executar via script Python:

```bash
cd blog_crew
python main.py
```

O programa irá:
1. Monitorar feeds RSS
2. Traduzir artigos relevantes
3. Formatar para o Sanity CMS
4. Publicar no blog

## Personalização

- Modifique `config/settings.yaml` para ajustar configurações globais
- Altere os agentes em `agents/` para customizar habilidades e comportamentos
- Adicione novas ferramentas em `tools/` para expandir capacidades
- Edite `crewai.yaml` para configurar o comportamento do CLI