# Automação de Blog com CrewAI - Versão Simplificada

Este é um fluxo simplificado para automação de blog usando CrewAI. O script processa fontes RSS, traduz artigos para português brasileiro e publica no Sanity CMS.

## Vantagens desta versão simplificada

- **Sem dependências complexas** - Não requer Redis ou interface Streamlit
- **Execução única** - Todo o fluxo roda em um único script
- **Manutenção fácil** - Código simplificado e bem documentado
- **Menor footprint** - Estrutura compacta e direta

## Pré-requisitos

- Python 3.9+
- Pacotes Python: crewai, langchain, langchain-google-genai, feedparser, requests
- Credenciais do Sanity CMS
- API Key do Google Gemini

## Configuração

1. Instale as dependências:

```bash
pip install crewai langchain langchain-google-genai feedparser requests
```

2. Configure as variáveis de ambiente necessárias:

```bash
export GEMINI_API_KEY="sua-api-key-do-gemini"
export SANITY_PROJECT_ID="seu-id-do-projeto-sanity"
export SANITY_API_TOKEN="seu-token-do-sanity"
```

3. Certifique-se de ter um arquivo `feeds.json` na pasta do projeto no seguinte formato:

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

Para executar o fluxo completo, simplesmente rode:

```bash
cd /path/to/framework_crewai
python -m src.blog_automacao.simple.simple_flow
```

O script irá:

1. Monitorar os feeds RSS e selecionar artigos relevantes
2. Traduzir os artigos selecionados para português brasileiro
3. Formatar os artigos para publicação no Sanity
4. Publicar os artigos no Sanity CMS

## Estrutura de Pastas

O script criará e usará as seguintes pastas:

- `posts_para_traduzir`: Artigos capturados dos feeds RSS
- `posts_traduzidos`: Artigos já traduzidos
- `posts_formatados`: Artigos formatados para o Sanity
- `posts_publicados`: Artigos publicados com sucesso

## Personalização

Você pode facilmente modificar o comportamento dos agentes editando as descrições das tarefas e os prompts de cada agente no arquivo `simple_flow.py`.

## Troubleshooting

### API Key inválida
Se você receber erros relacionados à API do Google, verifique se sua variável de ambiente GEMINI_API_KEY está correta.

### Falha na publicação no Sanity
Verifique se as credenciais do Sanity estão corretas e se o seu token tem permissões para publicação.

### Erros de conexão com feeds RSS
Verifique o formato da URL no arquivo feeds.json e certifique-se de que está acessível.

## Logs

O script gera logs detalhados no console que mostram o progresso do fluxo e eventuais erros. Os logs são úteis para identificar problemas de conexão ou erros de processamento.