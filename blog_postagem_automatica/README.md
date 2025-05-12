# Blog Postagem Automática

Sistema de automação para monitoramento de feeds RSS, tradução e publicação de conteúdo sobre criptomoedas utilizando Google Gemini.

## Estrutura do Projeto

Este projeto segue a estrutura padrão do CrewAI:

```
blog_postagem_automatica/
├── .env                      # Arquivo de variáveis de ambiente (criar a partir do .env.example)
├── feeds.json                # Configuração dos feeds RSS a serem monitorados
├── pyproject.toml            # Configuração do projeto Python
├── posts_database.sqlite     # Banco de dados para controle de artigos processados
├── posts_traduzidos/         # Diretório onde os artigos traduzidos são salvos
├── posts_publicados/         # Diretório onde os artigos publicados são movidos
└── src/                      # Código-fonte principal
    └── blog_automacao/       # Pacote principal da aplicação
        ├── __init__.py       # Inicializador do pacote
        ├── main.py           # Script principal de execução
        ├── crew.py           # Definição das Crews (equipes de agentes)
        ├── tools/            # Ferramentas para os agentes
        │   ├── __init__.py
        │   ├── rss_tools.py  # Ferramentas para monitoramento de RSS
        │   └── sanity_tools.py # Ferramentas para publicação no Sanity CMS
        └── config/           # Arquivos de configuração
            ├── agents.yaml   # Definição dos agentes e seus papéis
            └── tasks.yaml    # Definição das tarefas dos agentes
```

## Requisitos

- Python 3.10+
- CrewAI 0.28.0+
- API Key do Google Gemini (opcional para monitoramento direto)
- Conta no Sanity CMS (para publicação)
- Conta no Algolia (para indexação e pesquisa)

## Configuração

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/blog_postagem_automatica.git
cd blog_postagem_automatica
```

2. Crie e ative um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -e .
```

4. Crie um arquivo `.env` com suas credenciais:
```
# API Google Gemini (necessária para funcionamento)
GEMINI_API_KEY=sua_chave_api_gemini

# Chave OpenAI fictícia para garantir compatibilidade com LiteLLM
OPENAI_API_KEY=sk-123

# Credenciais do Sanity CMS
SANITY_PROJECT_ID=seu_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2023-05-03
SANITY_API_TOKEN=seu_token

# Configurações Algolia (opcional)
ALGOLIA_APP_ID=seu_app_id
ALGOLIA_API_KEY=sua_api_key
ALGOLIA_INDEX_NAME=blog_posts
```

5. Configure os feeds RSS no arquivo `feeds.json`:
```json
[
  "https://cointelegraph.com/rss",
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://decrypt.co/feed",
  "https://blog.chain.link/rss/",
  "https://bitcoin.org/en/rss/blog.xml",
  "https://bitcoinmagazine.com/feed"
]
```

> **Nota**: O sistema também pode usar automaticamente os feeds configurados em `agentes_backup_legado/config.py` se o arquivo existir.

## Uso do Google Gemini

Este projeto usa o Google Gemini como modelo de IA para alimentar os agentes CrewAI. Ele oferece:

1. **Tradução de alta qualidade**: O Gemini 2.0 oferece excelentes traduções de inglês para português
2. **Baixa latência**: Respostas rápidas para processamento eficiente
3. **Custo menor**: Alternativa mais econômica em comparação com outros modelos

A integração é feita através do LangChain, que permite a comunicação entre o CrewAI e a API do Gemini.

## Uso

### Monitoramento de Feeds

Para monitorar feeds RSS e gerar artigos para tradução:

```bash
python -m src.blog_automacao.main --monitoramento
```

Para executar em loop a cada X minutos:

```bash
python -m src.blog_automacao.main --monitoramento --loop 60  # Executa a cada 60 minutos
```

### Monitoramento Direto (Sem CrewAI/Gemini)

Se você estiver enfrentando problemas com a integração do Gemini ou simplesmente quiser executar o monitoramento de feeds sem usar a IA, use o modo direto:

```bash
python -m src.blog_automacao.main --direto
```

Para executar em loop a cada X minutos:

```bash
python -m src.blog_automacao.main --direto --loop 60  # Executa a cada 60 minutos
```

Este modo:
1. Monitora os feeds RSS configurados
2. Salva os artigos encontrados em `posts_traduzidos/` com prefixo `para_traduzir_`
3. Não usa API do Gemini ou CrewAI, funcionando mesmo sem configurações de IA
4. Segue o mesmo fluxo de dados do sistema completo

### Tradução de Artigos

Para traduzir artigos encontrados no monitoramento:

```bash
python -m src.blog_automacao.main --traducao
```

### Publicação no Sanity CMS

Para publicar os artigos traduzidos no Sanity CMS:

```bash
python -m src.blog_automacao.main --publicacao
```

### Fluxo Completo

Para executar o fluxo completo (monitoramento, tradução e publicação):

```bash
python -m src.blog_automacao.main --completo
```

## Banco de Dados

O sistema utiliza um banco de dados SQLite (`posts_database.sqlite`) para controlar os artigos já processados, evitando duplicações. Principais funcionalidades:

- Identificação de artigos por GUID e hash de conteúdo
- Rastreamento de status de processamento
- Armazenamento de metadados como origem, data de publicação e título

## Fluxo de Trabalho

1. **Monitoramento**: O sistema monitora feeds RSS de sites de criptomoedas e seleciona artigos relevantes
2. **Tradução**: Os artigos selecionados são traduzidos do inglês para português brasileiro usando o Google Gemini
3. **Adaptação**: O conteúdo é adaptado para o contexto brasileiro
4. **Publicação**: Os artigos são publicados no Sanity CMS

## Troubleshooting

### Erro de API Key do Gemini

Se você encontrar erros relacionados à API key do Gemini:

1. Verifique se a chave está configurada no arquivo `.env`
2. Alternativamente, coloque a chave no arquivo `agentes_backup_legado/config.py` 
3. Certifique-se de que a chave está ativa e tem permissões corretas
4. **Alternativa**: Use o modo direto (`--direto`) que não depende do Gemini

O sistema procura a chave na seguinte ordem:
1. Variável de ambiente `GEMINI_API_KEY`
2. Arquivo `.env`
3. Arquivo `agentes_backup_legado/config.py`

### Erro no LiteLLM ou CrewAI

Se estiver encontrando erros persistentes com o LiteLLM ou CrewAI:

1. Use o modo direto para monitoramento: `python -m src.blog_automacao.main --direto`
2. Este modo não depende do Gemini, LiteLLM ou CrewAI e funciona com a mesma eficácia para monitoramento de feeds

## Licença

MIT 