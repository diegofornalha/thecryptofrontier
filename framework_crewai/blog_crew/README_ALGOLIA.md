# Integração com Algolia Search

Este módulo fornece integração entre o Sanity CMS e o Algolia Search para indexação e busca de conteúdo.

## Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente:

```bash
# Sanity CMS (obrigatório)
export SANITY_API_TOKEN=seu_token_api_sanity

# Algolia Search
export ALGOLIA_APP_ID=42TZWHW8UP
export ALGOLIA_API_KEY=d0cb55ec8f07832bc5f57da0bd25c535  # Admin API Key para indexação
export ALGOLIA_SEARCH_API_KEY=b32edbeb383fc3d1279658e7c3661843  # Para consultas de pesquisa (frontend)
export ALGOLIA_INDEX_NAME=development_mcpx_content
```

Os valores para o Algolia já estão configurados por padrão nos scripts, mas podem ser sobrescritos pelas variáveis de ambiente.

## Ferramentas Disponíveis

### 1. Script de Sincronização Standalone

```bash
# Sincronizar posts do Sanity para o Algolia
python sync_sanity_to_algolia.py post
```

### 2. Ferramenta para o CrewAI

Adicione a ferramenta ao seu agente CrewAI para permitir sincronização dentro do fluxo de automação:

```python
from tools.sync_algolia_tool import sync_sanity_to_algolia

# No seu arquivo de configuração de agentes
tools = [
    sync_sanity_to_algolia,
    # ... outras ferramentas
]

# Configurando o agente
monitor_agent = Agent(
    role="Monitor de Publicações",
    goal="Monitorar publicações e garantir indexação no Algolia",
    backstory="Responsável por manter o conteúdo atualizado e pesquisável",
    tools=tools
)
```

### 3. Ferramentas Básicas do Algolia

O arquivo `tools/algolia_tools.py` contém ferramentas para:

- Indexar conteúdo no Algolia
- Pesquisar no Algolia
- Remover documentos do Algolia

## Prevenção de Duplicação

O sistema implementa três mecanismos para evitar duplicação de conteúdo no Algolia:

1. **Verificação por ID**: Verifica se o documento já existe pelo ID do Sanity
2. **Verificação por Slug**: Impede duplicação de conteúdo com mesmo slug mas IDs diferentes
3. **Verificação por URL**: Previne duplicação de artigos da mesma fonte (mesmo conteúdo republicado)

## Recuperando Dados do Sanity CMS

O script `list_sanity_documents.py` pode ser usado para listar documentos do Sanity:

```bash
# Listar posts em formato legível
python list_sanity_documents.py post

# Listar posts em formato JSON (útil para debugging)
python list_sanity_documents.py post --json
```

## Fluxo de Trabalho Típico

1. Novos artigos são publicados no RSS
2. Agente Monitor detecta artigos
3. Artigos são traduzidos e preparados
4. Conteúdo é publicado no Sanity CMS
5. Ferramenta de sincronização envia conteúdo para o Algolia
6. O frontend pode realizar pesquisas usando o Algolia Search API

## Exemplos de Uso

### Sincronizando posts manualmente

```bash
# Definir token do Sanity (necessário)
export SANITY_API_TOKEN=seu_token_api_sanity

# Executar sincronização
python sync_sanity_to_algolia.py post
```

### Verificando conteúdo do índice Algolia

```bash
# Executar script de teste
python test_algolia.py
```