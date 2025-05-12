# Blog Automação - The Crypto Frontier

Sistema de automação para monitoramento, tradução e publicação de artigos sobre criptomoedas para o blog The Crypto Frontier.

## Visão Geral

Este sistema automatiza todo o fluxo de trabalho para criação de conteúdo para um blog sobre criptomoedas, dividido em quatro etapas principais:

1. **Monitoramento**: Monitorar feeds RSS de sites especializados em criptomoedas
2. **Tradução**: Traduzir artigos relevantes de inglês para português usando Google Gemini
3. **Publicação**: Publicar os artigos traduzidos no Sanity CMS
4. **Indexação**: Indexar os artigos publicados no Algolia para permitir buscas

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

- Python 3.8+
- Node.js 18+
- Dependências Python: `pip install -r requirements.txt`
- Dependências Node.js: `npm install`
- Arquivo `.env` com credenciais do Sanity CMS e Algolia

## Configuração

1. Clone o repositório
2. Instale as dependências
3. Configure o arquivo `.env` com suas credenciais (ver `.env.example`)
4. Configure os feeds RSS em `feeds.json`

## Uso

### Método 1: Script de Fluxo Completo

Para simplificar a execução, use o script `executar_fluxo_completo.sh`:

```bash
# Executar o fluxo completo (uma vez)
./executar_fluxo_completo.sh

# Ou apenas o monitoramento
./executar_fluxo_completo.sh --monitor

# Monitoramento contínuo a cada 60 minutos
./executar_fluxo_completo.sh --monitor --loop 60

# Apenas tradução dos artigos pendentes
./executar_fluxo_completo.sh --translate

# Apenas publicação dos artigos traduzidos
./executar_fluxo_completo.sh --publish

# Apenas indexação no Algolia
./executar_fluxo_completo.sh --index

# Exibir ajuda
./executar_fluxo_completo.sh --help
```

### Método 2: Execução Manual

Alternativamente, você pode executar cada etapa manualmente:

```bash
# Monitoramento (um ciclo)
python main.py

# Monitoramento contínuo (a cada 60 minutos)
python main.py --loop 60

# Tradução de artigos
python main.py --traducao

# Publicação no Sanity
node publicar_posts_markdown.js

# Indexação no Algolia
node scripts/indexar-sanity-para-algolia.js
```

### Interface Web (Streamlit)

Também está disponível uma interface web para controle do sistema:

```bash
streamlit run app.py
```

## Estrutura de Diretórios

- `posts_para_traduzir/`: Artigos baixados que aguardam tradução
- `posts_traduzidos/`: Artigos traduzidos que aguardam publicação
- `posts_publicados/`: Artigos que já foram publicados no Sanity
- `scripts/`: Scripts auxiliares para publicação e indexação
- `src/`: Código-fonte principal do sistema
- `app.py`: Interface web Streamlit

## Correções e Melhorias Recentes

1. **Correção do formato Portable Text**: Os artigos agora são convertidos para o formato Portable Text correto para o Sanity, evitando o erro "Invalid property value" no Sanity Studio.

2. **Correção da referência de autor**: Agora é usada a referência correta para o autor Alexandre Bianchi.

3. **Melhoria na tradução de títulos**: O título é traduzido separadamente para garantir qualidade na tradução.

4. **Script de automação completa**: Novo script `executar_fluxo_completo.sh` para facilitar a execução de todo o fluxo.

5. **Tratamento de erros robusto**: Melhor tratamento de erros em todas as etapas do processo.

## Observações Importantes

1. NUNCA defina `PUBLISH_DIRECTLY = True` em `main.py`, pois quebraria o fluxo de trabalho separado.
2. Sempre verifique se os diretórios necessários existem.
3. Mantenha as credenciais no arquivo `.env` atualizadas.
4. Para republicar um artigo, mova-o de volta para a pasta `posts_traduzidos/`.

## Arquivos de Configuração Importantes

- `.env`: Credenciais do Sanity e Algolia
- `feeds.json`: Lista de feeds RSS para monitoramento
- `src/blog_automacao/config/settings.py`: Configurações gerais do sistema

## Solução de Problemas

Se você encontrar o erro "Invalid property value" no Sanity Studio:
- Verifique se o conteúdo está sendo convertido para o formato correto (array de blocos)
- Execute novamente o script de publicação para aplicar a correção

Para outros problemas, consulte os logs na interface web ou execute os comandos com a flag `--verbose`.

## Licença

MIT 