# Guia de Publicação no Strapi (via Pipeline RSS Multilíngue)

Este documento descreve como o pipeline de RSS multilíngue (`pipeline_rss_multilingual.py`) interage com o Strapi para publicar artigos.

## 1. Visão Geral da Integração

A integração com o Strapi é gerenciada pela classe `StrapiI18nIntegration` dentro do script `pipeline_rss_multilingual.py`. Esta classe é responsável por fazer as requisições HTTP para a API do Strapi para criar novas postagens.

## 2. Configuração do Strapi

Para que a integração funcione, o Strapi precisa estar acessível e configurado com um token de API que tenha permissões para criar conteúdo na coleção `posts`.

### Variáveis de Ambiente

As credenciais do Strapi são carregadas de variáveis de ambiente:

- `STRAPI_URL`: A URL base da sua instância Strapi (ex: `https://ale-blog-preview.agentesintegrados.com`).
- `STRAPI_API_TOKEN_PREVIEW`: O token de API com permissões de escrita para o Strapi.

Essas variáveis são acessadas no construtor da classe `StrapiI18nIntegration`:

```python
class StrapiI18nIntegration:
    def __init__(self):
        self.strapi_url = "https://ale-blog-preview.agentesintegrados.com"
        self.strapi_token = os.environ.get('STRAPI_API_TOKEN_PREVIEW')
        self.headers = {
            'Authorization': f'Bearer {self.strapi_token}',
            'Content-Type': 'application/json'
        }
```

## 3. Criação de Postagens

A criação de postagens é realizada pelo método `create_post` da classe `StrapiI18nIntegration`.

### Método `create_post`

```python
    def create_post(self, post_data, locale='pt-BR'):
        """Cria um post no Strapi com o idioma especificado"""
        try:
            data = {
                "data": {
                    "title": post_data['title'],
                    "content": post_data['content'], 
                    "slug": post_data['slug'],
                    "excerpt": post_data.get('excerpt', ''),
                    "publishedAt": datetime.now().isoformat(),
                    "locale": locale
                }
            }
            
            response = requests.post(
                f"{self.strapi_url}/api/posts",
                headers=self.headers,
                json=data,
                timeout=30
            )
            
            # ... (tratamento de resposta e erros)

```

### Estrutura do `post_data`

O método `create_post` espera um dicionário `post_data` com as seguintes chaves:

- `title` (obrigatório): O título do artigo.
- `content` (obrigatório): O conteúdo principal do artigo.
- `slug` (obrigatório): Um slug amigável para a URL do artigo.
- `excerpt` (opcional): Um resumo curto do artigo.

Além disso, o `locale` (idioma) é passado como um argumento separado para o método, permitindo que o post seja criado no idioma correto no Strapi.

### Endpoint e Requisição

- **Método HTTP**: `POST`
- **Endpoint**: `{STRAPI_URL}/api/posts`
- **Headers**: Inclui o `Authorization` com o token de API e `Content-Type: application/json`.
- **Corpo da Requisição (JSON)**: Os dados do post são encapsulados sob a chave `"data"`, conforme o formato esperado pela API do Strapi para criação de entradas.

### Exemplo de Payload Enviado ao Strapi

```json
{
  "data": {
    "title": "Título do Artigo",
    "content": "Conteúdo completo do artigo em Markdown ou HTML.",
    "slug": "titulo-do-artigo",
    "excerpt": "Um breve resumo do artigo.",
    "publishedAt": "2025-07-07T10:00:00.000Z",
    "locale": "pt-BR"
  }
}
```

## 4. Processo no Pipeline

No `pipeline_rss_multilingual.py`, a função `process_article` é responsável por preparar os dados para cada idioma (incluindo a tradução/adaptação e geração do slug) e, em seguida, chamar `self.strapi.create_post()` para publicar o artigo no Strapi para cada `locale` configurado (`pt-BR`, `en`, `es`).

Este processo garante que os artigos sejam publicados no Strapi com o conteúdo e metadados corretos para cada idioma, prontos para serem consumidos por outras aplicações (como o frontend Next.js ou feeds RSS gerados pelo Strapi).