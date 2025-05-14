# Blog Automação - The Crypto Frontier

Este é o projeto de automação para o blog The Crypto Frontier, que utiliza agentes de IA (CrewAI) para monitorar feeds RSS, selecionar artigos relevantes, traduzir conteúdo e publicar no Sanity CMS.

## Funcionalidades

- **Monitoramento**: Monitorar feeds RSS e selecionar artigos relevantes
- **Tradução**: Traduzir artigos do inglês para português brasileiro
- **Publicação**: Formatar e publicar os artigos traduzidos no Sanity CMS
- **Verificação de Duplicatas**: Detectar e remover artigos duplicados no blog

## Estrutura do Projeto

```
framework_crewai/
├── src/
│   └── blog_automacao/
│       ├── config/            # Configurações YAML dos agentes e tarefas
│       ├── tools/             # Ferramentas para os agentes (RSS, Sanity, etc.)
│       ├── logic/             # Lógica de negócio
│       ├── ui/                # Componentes da interface do Streamlit
│       ├── crew.py            # Definição das crews e agentes
│       └── main.py            # Ponto de entrada principal
├── script_verificar_duplicatas.py  # Script específico para verificar duplicatas
└── ... (outros arquivos)
```

## Requisitos

- Python 3.10+
- Dependências listadas em `requirements.txt` ou `pyproject.toml`
- Credenciais do Sanity CMS
- Chave de API do Gemini Pro (GEMINI_API_KEY)

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente (crie um arquivo `.env` na raiz):

```
GEMINI_API_KEY=sua_chave_api_gemini
SANITY_PROJECT_ID=seu_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=seu_token_sanity
```

## Uso

### Executar o fluxo completo

```bash
python -m src.blog_automacao.main --completo
```

### Executar apenas o monitoramento

```bash
python -m src.blog_automacao.main --monitoramento
```

### Executar apenas a tradução

```bash
python -m src.blog_automacao.main --traducao
```

### Executar apenas a publicação

```bash
python -m src.blog_automacao.main --publicacao
```

### Verificar artigos duplicados

Você pode usar o script dedicado:

```bash
# Apenas detectar duplicatas
./script_verificar_duplicatas.py

# Detectar e remover duplicatas
./script_verificar_duplicatas.py --remover

# Ajustar o número de artigos a verificar
./script_verificar_duplicatas.py --limite 30
```

Ou através do script principal:

```bash
# Apenas detectar duplicatas
python -m src.blog_automacao.main --verificar-duplicatas

# Detectar e remover duplicatas
python -m src.blog_automacao.main --remover-duplicatas

# Ajustar o número de artigos a verificar
python -m src.blog_automacao.main --verificar-duplicatas --limite-duplicatas 30
```

## Agentes e Tarefas

### Agentes

- **Monitor**: Monitora feeds RSS para novos artigos
- **Selector**: Seleciona artigos relevantes para o público brasileiro
- **Translator**: Traduz os artigos selecionados para português
- **Publisher**: Publica os artigos traduzidos no Sanity CMS
- **DuplicateDetector**: Verifica e remove artigos duplicados no Sanity CMS

### Tarefas

- **monitoring_task**: Monitoramento de feeds RSS
- **selection_task**: Seleção de artigos relevantes
- **translation_task**: Tradução de artigos
- **publish_task**: Publicação no Sanity CMS
- **duplicate_detection_task**: Detecção e remoção de artigos duplicados

## Interface Streamlit

O projeto também inclui uma interface Streamlit para gerenciamento visual:

```bash
streamlit run app.py
```

## Licença

MIT 