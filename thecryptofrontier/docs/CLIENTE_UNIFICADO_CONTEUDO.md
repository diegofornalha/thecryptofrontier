# Cliente Unificado de Conteúdo - ContentAPIClient

## Visão Geral

O `ContentAPIClient` é uma abstração unificada que consolida todas as operações de gerenciamento de conteúdo em uma única interface. Este cliente foi criado para facilitar a migração futura de Sanity para Strapi.

**IMPORTANTE**: Apesar dos nomes e comentários mencionarem "Strapi", o cliente **ainda usa a API do Sanity**. A nomenclatura foi mantida propositalmente para facilitar a migração.

## Localização

```
/home/strapi/thecryptofrontier/framework_crewai/post_crew/src/core/content_api_client.py
```

## Características Principais

### 1. Padrão Singleton
- Garante uma única instância do cliente em toda a aplicação
- Configuração centralizada
- Cache compartilhado

### 2. Interface Unificada
Consolida funcionalidades de três implementações anteriores:
- `sanity_tools.py`
- `sanity_tools_enhanced.py`
- `sanity_client.py`

### 3. Detecção Automática de Metadados
- Categorias baseadas em palavras-chave
- Tags extraídas do conteúdo
- Autor padrão configurado

### 4. Sistema de Métricas
- Rastreamento de requisições
- Taxa de sucesso/falha
- Tempo médio de resposta
- Contadores por operação

### 5. Cache Inteligente
- Evita requisições repetidas para categorias/tags
- Melhora performance
- Método para limpar cache quando necessário

## API do Cliente

### Inicialização

```python
from src.core.content_api_client import get_content_client

# Obter instância singleton
client = get_content_client()
```

### Operações CRUD

#### Criar Post
```python
result = client.create_post({
    "title": "Bitcoin atinge nova máxima",
    "content": "Conteúdo do artigo...",
    "excerpt": "Resumo do artigo",
    "slug": "bitcoin-nova-maxima"  # Opcional, gerado automaticamente
}, auto_metadata=True)  # Detecta categorias/tags automaticamente
```

#### Atualizar Post
```python
result = client.update_post(
    post_id="post-123",
    updates={
        "title": "Novo título",
        "content": "Conteúdo atualizado",
        "categories": ["Bitcoin", "Análise de Mercado"],
        "tags": ["btc", "trading"]
    }
)
```

#### Obter Post
```python
# Por ID
result = client.get_post(post_id="post-123")

# Por slug
result = client.get_post(slug="bitcoin-nova-maxima")
```

#### Deletar Post
```python
result = client.delete_post(post_id="post-123")
```

#### Listar Posts
```python
result = client.list_posts(limit=10, offset=0)
```

### Gerenciamento de Metadados

#### Categorias
```python
# Criar/obter referências para categorias
category_refs = client.manage_categories(["Bitcoin", "DeFi", "NFT"])
```

#### Tags
```python
# Criar/obter referências para tags
tag_refs = client.manage_tags(["bitcoin", "ethereum", "trading"])
```

#### Autor
```python
# Garantir que autor existe
author_ref = client.ensure_author_exists("Crypto Frontier")
```

### Utilitários

#### Criar Slug
```python
slug = ContentAPIClient.criar_slug("Título do Artigo")
# Resultado: "titulo-do-artigo"
```

#### Converter Texto para Portable Text
```python
blocks = ContentAPIClient.texto_para_portable_text("Texto simples")
```

#### Obter Métricas
```python
metrics = client.get_metrics()
print(f"Total de requisições: {metrics['total_requests']}")
print(f"Taxa de sucesso: {metrics['success_rate']:.2%}")
```

#### Limpar Cache
```python
client.reset_cache()
```

## Detecção Automática de Metadados

### Categorias Detectadas
- **Bitcoin**: bitcoin, btc, satoshi, lightning network
- **Ethereum**: ethereum, eth, vitalik, smart contract
- **DeFi**: defi, yield, liquidity, amm, dex
- **NFT**: nft, opensea, digital art
- **Análise de Mercado**: price, market, trading, análise
- **Regulação**: regulation, sec, government, compliance
- **Tecnologia**: blockchain, consensus, protocol
- **Altcoins**: xrp, ada, dot, bnb, sol, avax, matic

### Tags Extraídas
- Nomes de criptomoedas mencionadas
- Termos temáticos (trading, defi, nft, web3, mining, wallet)

## Migração para Strapi

### Arquivos que Usam o Cliente

Para migrar, apenas estes arquivos precisam ser atualizados para usar o novo cliente:

1. **Scripts de publicação**:
   - `/scripts/actions/publish/*.py`
   - Substituir importações diretas por `get_content_client()`

2. **Ferramentas do CrewAI**:
   - `/src/tools/sanity_tools.py`
   - `/src/tools/sanity_tools_enhanced.py`
   - Usar métodos do cliente unificado

3. **Pipeline de blog**:
   - `/src/pipelines/simple/*.py`
   - Substituir chamadas diretas por cliente

### Passos de Migração

1. **Fase 1 - Preparação**
   - Configurar Strapi com schema equivalente
   - Migrar dados existentes
   - Testar endpoints

2. **Fase 2 - Atualização do Cliente**
   ```python
   # Modificar em content_api_client.py
   # De:
   f"https://{project_id}.api.sanity.io/..."
   # Para:
   f"{strapi_url}/api/posts"
   ```

3. **Fase 3 - Variáveis de Ambiente**
   ```bash
   # Substituir:
   SANITY_PROJECT_ID=xxx
   SANITY_API_TOKEN=xxx
   
   # Por:
   STRAPI_API_URL=http://localhost:1337
   STRAPI_API_TOKEN=xxx
   ```

4. **Fase 4 - Testes**
   - Executar suite de testes
   - Validar todas as operações
   - Comparar métricas antes/depois

5. **Fase 5 - Deploy**
   - Feature flag para alternar entre APIs
   - Deploy gradual
   - Monitoramento contínuo

## Vantagens da Arquitetura

1. **Ponto Único de Mudança**: Toda lógica de API em um arquivo
2. **Interface Estável**: Consumidores não precisam mudar código
3. **Métricas Integradas**: Comparação fácil entre implementações
4. **Cache Otimizado**: Performance mantida na migração
5. **Detecção Automática**: Reduz trabalho manual de categorização

## Exemplo de Uso Completo

```python
from src.core.content_api_client import get_content_client

# Inicializar cliente
client = get_content_client()

# Criar post com detecção automática
result = client.create_post({
    "title": "Ethereum 2.0: O Futuro das Finanças Descentralizadas",
    "content": """
    O Ethereum está passando por uma transformação significativa com a 
    implementação do Ethereum 2.0. Esta atualização traz melhorias em 
    escalabilidade, segurança e sustentabilidade através do Proof of Stake.
    
    As aplicações DeFi como Uniswap e Aave serão beneficiadas com taxas 
    menores e transações mais rápidas.
    """,
    "excerpt": "Análise completa sobre o impacto do Ethereum 2.0 no ecossistema DeFi"
})

if result['success']:
    print(f"Post criado com ID: {result['document_id']}")
    print(f"Categorias detectadas: {result['categories']}")
    print(f"Tags detectadas: {result['tags']}")
    
    # Ver métricas
    metrics = client.get_metrics()
    print(f"Total de operações: {metrics['total_requests']}")
else:
    print(f"Erro: {result['error']}")
```

## Monitoramento e Métricas

O cliente registra automaticamente:
- Número total de requisições
- Taxa de sucesso/falha
- Tempo médio de resposta
- Distribuição por tipo de operação

Para acessar:
```python
metrics = client.get_metrics()
```

## Troubleshooting

### Erro de Credenciais
```
WARNING: ID do projeto não configurado (SANITY_PROJECT_ID)
WARNING: Token de API não configurado (SANITY_API_TOKEN)
```
**Solução**: Configurar variáveis de ambiente

### Cache Desatualizado
Se categorias/tags não aparecem após criação:
```python
client.reset_cache()
```

### Timeout em Requisições
O cliente usa timeout de 30 segundos. Para operações longas, considere processamento assíncrono.

## Conclusão

O `ContentAPIClient` representa uma evolução na arquitetura do sistema, preparando o terreno para uma migração suave e mantendo a funcionalidade atual intacta. A abstração permite que toda a complexidade da migração fique isolada em um único componente, minimizando o impacto no resto do sistema.