# Sistema de Automação de Blog (CrewAI + Redis)

Este sistema automatiza o fluxo de trabalho para tradução e publicação de artigos sobre criptomoedas. O sistema usa Redis como middleware para gerenciar filas de artigos, combinado com CrewAI para processamento inteligente.

## Arquitetura do Sistema

O sistema é composto por:

1. **Sistema de Fila Redis** - Gerencia artigos em diferentes estágios de processamento
2. **CrewAI Agents** - Tradução, formatação e publicação de conteúdo
3. **Integração Sanity** - Publicação dos artigos no CMS Sanity

```
  [Feeds RSS]          [Artigos de Demonstração]
       |                          |
       v                          v
  +------------------------------------------+
  |               Redis Queue                |
  | (pending → processing → completed/error) |
  +------------------------------------------+
                     |
                     v
  +------------------------------------------+
  |               CrewAI                     |
  | (Translator → JSON Formatter → Publisher)|
  +------------------------------------------+
                     |
                     v
  +------------------------------------------+
  |             Sanity CMS                   |
  +------------------------------------------+
```

## Componentes Principais

### 1. Sistema de Fila Redis

O sistema de fila Redis (`redis_tools.py`) gerencia artigos em diferentes estágios:

- **Fila Pendente**: Artigos prontos para processamento
- **Fila em Processamento**: Artigos sendo processados
- **Fila Concluídos**: Artigos processados com sucesso
- **Fila de Erros**: Artigos que falharam no processamento

Principais classes:
- `RedisMemoryTool`: Armazenamento e recuperação de dados contextuais
- `RedisFeedCache`: Cache para feeds RSS
- `RedisArticleQueue`: Gerenciamento da fila de artigos

### 2. Ferramentas de CrewAI

- `duplicate_detector_tool.py`: Detecta e remove artigos duplicados
- `sanity_tools.py`: Integração com Sanity CMS
- `rss_tools.py`: Monitoramento de feeds RSS

### 3. Scripts de Processamento

- `enqueue_demo_article.py`: Adiciona artigos à fila
- `process_article_queue.py`: Processa artigos da fila

## Uso

### Configuração

1. Instale as dependências:
```
pip install -r requirements.txt
```

2. Configure as variáveis de ambiente:
```
# Redis (opcional - padrão é localhost:6379)
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=senha_segura

# Sanity CMS
export SANITY_PROJECT_ID=seu_id_do_projeto
export SANITY_API_TOKEN=seu_token_da_api

# Google Gemini (para CrewAI)
export GEMINI_API_KEY=sua_chave_da_api
```

### Enfileirar Artigos

Para enfileirar artigos de demonstração:
```
# Enfileirar 5 artigos de demonstração
python enqueue_demo_article.py -g 5

# Enfileirar artigos de um diretório específico
python enqueue_demo_article.py -d /caminho/para/artigos -a

# Enfileirar um arquivo específico
python enqueue_demo_article.py -f /caminho/para/artigo.json
```

### Processar Artigos

Para processar artigos da fila:
```
# Processar todos os artigos na fila
python process_article_queue.py

# Processar um número máximo de artigos
python process_article_queue.py -m 5

# Ajustar intervalo de processamento (segundos)
python process_article_queue.py -i 10
```

### Monitoramento e Recuperação

Para monitorar o sistema:
```
# Verificar estatísticas da fila
python -c "from redis_tools import RedisArticleQueue; print(RedisArticleQueue().get_queue_stats())"

# Recuperar artigos presos
python -c "from redis_tools import RedisArticleQueue; print(RedisArticleQueue().recover_stalled_articles(3600))"
```

## Características Avançadas

1. **Detecção de Duplicatas**: Sistema inteligente usando distância de Levenshtein para evitar conteúdo duplicado
2. **Recuperação de Falhas**: Recuperação automática de artigos presos no processamento
3. **Logging Estruturado**: Sistema de logs para auditoria e depuração
4. **Exponential Backoff**: Reconexão automática com Redis em caso de falhas

## Fluxo de Trabalho Completo

1. Artigos são adicionados à fila pendente por `enqueue_demo_article.py` ou `rss_to_sanity.py`
2. O processador de filas (`process_article_queue.py`) obtém o próximo artigo pendente
3. O artigo é publicado via SanityPublishTool ou salvo localmente para publicação posterior
4. O artigo é marcado como concluído ou com erro
5. O processo continua até a fila estar vazia ou atingir um limite definido

## Resolução de Problemas

- **Erro no Redis**: Verifique a conexão com o Redis usando `redis-cli ping`
- **Artigos Presos**: Execute `recover_stalled_articles()` para recuperar artigos presos
- **Detecção de Duplicatas**: Verifique os logs em `enqueue.log` por informações sobre duplicatas detectadas

## Limitações Conhecidas

- A implementação atual assume um único processo de processamento por vez
- As filas Redis não têm persistência garantida em caso de falha do Redis