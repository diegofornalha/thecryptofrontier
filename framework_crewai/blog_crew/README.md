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
│   └── sanity_tools.py    # Ferramentas de publicação no Sanity
│
├── tasks/                 # Definição das tarefas
│   └── blog_tasks.py      # Tarefas do fluxo de blog
│
├── config/                # Configurações do projeto
│   └── settings.yaml      # Arquivo de configuração
│
├── main.py                # Script principal
│
├── requirements.txt       # Dependências do projeto
│
└── README.md              # Esta documentação
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

## Configuração

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Configure as variáveis de ambiente:
```bash
export GEMINI_API_KEY="sua-chave-api-do-gemini"
export SANITY_PROJECT_ID="seu-id-do-projeto-sanity"
export SANITY_API_TOKEN="seu-token-do-sanity"
```

3. Crie um arquivo `feeds.json` na raiz do projeto com o formato:
```json
[
  {
    "name": "CoinDesk",
    "url": "https://www.coindesk.com/arc/outboundfeeds/rss/"
  },
  {
    "name": "CryptoPotato",
    "url": "https://cryptopotato.com/feed/"
  }
]
```

## Uso

Execute o script principal:

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