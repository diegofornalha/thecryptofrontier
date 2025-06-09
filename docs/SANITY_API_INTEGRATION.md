# Integração com Sanity - Como os Dados são Enviados

## 📡 Visão Geral

O projeto utiliza a API do Sanity para enviar e gerenciar conteúdo. A comunicação é feita através do cliente oficial do Sanity para Python.

## 🔧 Cliente Sanity

### Configuração
```python
# framework_crewai/blog_crew/logic/sanity_client.py
from sanity import Client

client = Client(
    project_id=SANITY_PROJECT_ID,
    dataset=SANITY_DATASET,
    token=SANITY_TOKEN,
    api_version="2024-01-01",
    use_cdn=False
)
```

### Variáveis de Ambiente Necessárias
- `SANITY_PROJECT_ID`: ID do projeto no Sanity
- `SANITY_DATASET`: Dataset (geralmente "production")
- `SANITY_TOKEN`: Token de autenticação com permissões de escrita

## 📤 Métodos de Envio

### 1. Criação de Posts
```python
# Método principal para criar posts
def create_post(post_data):
    document = {
        "_type": "post",
        "title": post_data["title"],
        "slug": {"current": post_data["slug"]},
        "body": post_data["body"],
        "excerpt": post_data["excerpt"],
        "mainImage": post_data.get("mainImage"),
        "publishedAt": post_data["publishedAt"],
        "author": {"_ref": author_id},
        "categories": [{"_ref": cat_id} for cat_id in category_ids]
    }
    
    result = client.create(document)
    return result
```

### 2. Upload de Imagens
```python
# Upload via API de assets
def upload_image(image_path):
    with open(image_path, 'rb') as f:
        asset = client.assets.upload(
            file=f,
            filename=os.path.basename(image_path)
        )
    return asset
```

### 3. Atualização de Documentos
```python
# Atualizar documento existente
def update_post(document_id, updates):
    result = client.patch(document_id).set(updates).commit()
    return result
```

## 🔄 Fluxo de Publicação

1. **RSS Feed → Python Script**
   - Monitor RSS coleta novos artigos
   - Dados são processados e formatados

2. **Processamento Local**
   - Tradução (Google Translate API)
   - Formatação (GPT-4)
   - Geração de imagens (DALL-E 3)

3. **Envio para Sanity**
   - Upload de imagens primeiro
   - Criação do documento post
   - Associação de categorias e autor

4. **Sincronização com Algolia**
   - Webhook do Sanity dispara
   - Dados são indexados para busca

## 🛠️ Ferramentas Utilizadas

### sanity_tools.py
```python
class SanityPublishTool:
    def upload_and_publish(self, post_data, image_path):
        # 1. Upload da imagem
        image_asset = self.upload_image(image_path)
        
        # 2. Prepara dados do post
        post_data['mainImage'] = {
            '_type': 'mainImage',
            'asset': {'_ref': image_asset['_id']},
            'alt': post_data.get('imageAlt', '')
        }
        
        # 3. Cria o post
        return self.create_post(post_data)
```

## 🔐 Autenticação

A API do Sanity usa tokens Bearer para autenticação:
```python
headers = {
    "Authorization": f"Bearer {SANITY_TOKEN}",
    "Content-Type": "application/json"
}
```

## 📊 Estrutura dos Dados

### Post Schema
```typescript
{
  _type: 'post',
  title: string,
  slug: { current: string },
  body: array, // Portable Text
  excerpt: string,
  mainImage: {
    _type: 'mainImage',
    asset: { _ref: string },
    alt: string
  },
  author: { _ref: string },
  categories: [{ _ref: string }],
  tags: [{ _ref: string }],
  publishedAt: datetime
}
```

## 🚀 Endpoints Principais

- **Create**: `POST https://[PROJECT_ID].api.sanity.io/v2024-01-01/data/mutate/[DATASET]`
- **Upload Asset**: `POST https://[PROJECT_ID].api.sanity.io/v2024-01-01/assets/images/[DATASET]`
- **Query**: `GET https://[PROJECT_ID].api.sanity.io/v2024-01-01/data/query/[DATASET]`

## 🔍 Monitoramento

O sistema mantém logs de todas as operações:
```python
# processed_articles.json
{
  "article_id": {
    "status": "published",
    "sanity_id": "_id_do_documento",
    "published_at": "2024-01-01T00:00:00Z"
  }
}
```

## ⚡ Performance

- Upload de imagens é feito de forma assíncrona
- Batch operations para múltiplos posts
- Cache local para evitar reprocessamento
- Retry automático em caso de falha

## 🐛 Tratamento de Erros

```python
try:
    result = client.create(document)
except Exception as e:
    logger.error(f"Erro ao publicar: {e}")
    # Retry logic ou fallback
```

## 📝 Notas Importantes

1. **Rate Limits**: A API tem limites de requisições
2. **Tamanho de Imagens**: Máximo 20MB por asset
3. **Validação**: Dados são validados contra o schema antes do envio
4. **Webhook**: Configurado para sincronizar com Algolia após publicação