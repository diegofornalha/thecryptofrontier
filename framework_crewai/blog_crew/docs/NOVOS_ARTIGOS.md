# Pipeline Atualizado: Busca de Artigos Novos + Sincronização com Algolia

## ✅ O que foi implementado

### 1. Busca de Artigos Novos

O pipeline agora verifica automaticamente se um artigo já foi publicado no Strapi antes de processá-lo. Isso garante que o comando:

```bash
python run_pipeline.py --max-articles 10
```

Sempre busque **10 artigos novos** (não publicados), em vez de simplesmente pegar os últimos 10 do RSS.

## 🔍 Como funciona

1. **Busca artigos publicados**: Ao iniciar, o pipeline consulta o Strapi CMS para obter uma lista de todos os títulos já publicados.

2. **Filtragem inteligente**: Para cada artigo do RSS, o pipeline verifica:
   - Se o título já existe no Strapi (artigo publicado)
   - Se o artigo já foi processado na sessão atual (duplicata)
   - Se contém palavras da blacklist

3. **Processamento seletivo**: Apenas artigos que passaram por todos os filtros são processados.

## 📋 Comandos úteis

### Buscar e processar artigos novos:
```bash
# Buscar 10 artigos novos
python run_pipeline.py --max-articles 10

# Buscar 5 artigos novos (padrão)
python run_pipeline.py
```

### Testar se está funcionando:
```bash
# Verificar quantos artigos já estão publicados
python test_new_articles.py

# Listar todos os artigos no Strapi
python list_strapi_documents.py post
```

## 🛑 Importante

1. **Token do Strapi**: A verificação de artigos publicados requer o token do Strapi:
   ```bash
   export strapi_API_TOKEN="seu_token_aqui"
   ```

2. **Sem token**: Se o token não estiver disponível, o pipeline ainda funcionará, mas não poderá verificar artigos já publicados.

3. **Performance**: A busca de artigos publicados é feita apenas uma vez no início do processo, não afetando a performance geral.

### 2. Sincronização Automática com Algolia

O pipeline agora sincroniza automaticamente os artigos publicados com o Algolia para busca:

```bash
# Novo fluxo completo
python run_pipeline.py --max-articles 10
```

O comando agora executa:
1. Busca 10 artigos novos no RSS
2. Traduz os artigos
3. Formata para o Strapi
4. Publica no Strapi CMS
5. **Sincroniza automaticamente com Algolia** ✨

## 🔧 Detalhes técnicos

### Verificação de artigos publicados

A função `obter_artigos_publicados()` foi adicionada ao arquivo `run_pipeline.py`:

- Consulta o Strapi usando a API com GROQ query
- Retorna um conjunto (set) de títulos em minúsculas
- Faz comparação case-insensitive dos títulos

A lógica de verificação foi adicionada na função `monitorar_feeds()`:

```python
# Verificar se o artigo já foi publicado no Strapi
if title.lower() in published_titles:
    logger.warning(f"Artigo já publicado no Strapi ignorado: {title}")
    articles_skipped += 1
    continue
```

### Sincronização com Algolia

A função `sincronizar_com_algolia()` foi adicionada para:

- Buscar detalhes completos dos artigos publicados no Strapi
- Preparar documentos com os campos necessários para busca
- Indexar os documentos no Algolia automaticamente

## 📊 Logs

O pipeline agora mostra informações detalhadas sobre o processo:

- Quantos artigos já estão publicados no Strapi
- Quais artigos foram ignorados por já estarem publicados
- Quais artigos foram ignorados por serem duplicatas
- Quais artigos foram ignorados por conterem palavras da blacklist
- **Novo**: Quantos artigos foram sincronizados com Algolia
- **Novo**: Status da sincronização com Algolia

### Exemplo de saída do pipeline:

```
=== PIPELINE DE BLOG CONCLUÍDO ===
Artigos selecionados: 10
Artigos traduzidos: 10
Artigos formatados: 10
Artigos publicados: 10
Falhas na publicação: 0
Artigos sincronizados com Algolia: 10
Falhas na sincronização com Algolia: 0
```

## 🛠️ Scripts auxiliares

### Sincronização manual com Algolia

Se precisar sincronizar artigos já publicados:

```bash
# Sincronizar todos os posts
python sync_strapi_to_algolia.py post

# Sincronizar apenas os últimos 10 artigos
python sync_direct_algolia.py
```

## 🚀 Próximos passos

Para melhorar ainda mais o sistema, considere:

1. Adicionar verificação por URL além do título
2. Implementar cache local dos artigos publicados
3. Criar um comando para forçar re-publicação de artigos específicos
4. Adicionar suporte para atualização de artigos existentes
5. Adicionar configuração para escolher o índice do Algolia (dev/prod)