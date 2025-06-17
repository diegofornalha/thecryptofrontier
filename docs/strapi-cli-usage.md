# Gerenciamento de Conteúdo via CLI - Strapi

Este projeto oferece ferramentas CLI completas para gerenciar conteúdo no Strapi sem precisar acessar o CMS. Perfeito para automação, CI/CD e gerenciamento programático.

## 🚀 Configuração Inicial

### 1. Configurar Token de API

Primeiro, você precisa de um token de API do Strapi:

1. Acesse o painel admin do Strapi
2. Vá para Settings > API Tokens
3. Crie um novo token com permissões de leitura/escrita
4. Configure o token:

```bash
npm run strapi config
```

Ou adicione manualmente ao `.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=seu_token_aqui
```

## 📝 Publicar Artigos

### Método 1: Publicar do Markdown (Mais Simples)

Para publicar o artigo que você tem no formato markdown:

```bash
# Da pasta src/
npm run publish-article ../framework_crewai/blog_crew/claude_cli_adapter/artigo_para_publicar.md

# Ou diretamente
node scripts/publish-article.js framework_crewai/blog_crew/claude_cli_adapter/artigo_para_publicar.md
```

### Método 2: Usando a CLI Completa

```bash
# Publicar artigo de um arquivo markdown
npm run strapi publish framework_crewai/blog_crew/claude_cli_adapter/artigo_para_publicar.md

# Salvar como rascunho
npm run strapi publish artigo.md --draft
```

## 🛠️ Comandos Disponíveis

### Gerenciar Posts

```bash
# Listar posts
npm run strapi list
npm run strapi list --search "bitcoin"
npm run strapi list --page 2 --limit 20

# Criar post
npm run strapi create -t "Título do Post" -c "Conteúdo aqui" --publish

# Atualizar post
npm run strapi update 123 -t "Novo Título" --publish

# Deletar post
npm run strapi delete 123
```

### Importar Múltiplos Posts

Crie um arquivo JSON com a estrutura:

```json
[
  {
    "title": "Post 1",
    "content": "Conteúdo...",
    "slug": "post-1",
    "publish": true
  },
  {
    "title": "Post 2",
    "content": "Conteúdo...",
    "slug": "post-2",
    "publish": false
  }
]
```

Depois importe:

```bash
npm run strapi import posts.json
```

## 🔧 API Programática

Você também pode usar as funções diretamente em seus scripts:

```javascript
const contentManager = require('./scripts/strapi-content-manager').default;

// Publicar artigo
const result = await contentManager.publishArticleFromMarkdown('artigo.md', {
  draft: false,
  createCategory: true,
  authorId: 1
});

// Criar post programaticamente
const post = await contentManager.createPost({
  title: 'Meu Post',
  content: 'Conteúdo...',
  slug: 'meu-post',
  publish: true,
  tags: ['bitcoin', 'defi'],
  categoryId: 1
});

// Upload de imagem
const image = await contentManager.uploadImage('./imagem.jpg');
```

## 📊 Gerenciamento Avançado

### Buscar e Filtrar

```bash
# Buscar posts publicados
npm run strapi list --status published

# Buscar rascunhos
npm run strapi list --status draft

# Ordenar por título
npm run strapi list --sort "title:asc"
```

### Exportar em JSON

```bash
# Exportar resultados em JSON
npm run strapi list --json > posts.json
```

### Operações em Lote

```javascript
// Script customizado para operações em lote
const manager = require('./scripts/strapi-content-manager').default;

async function updateAllPosts() {
  const { /var/lib/docker/volumes/thecryptofrontier-data: posts } = await manager.getPosts({ limit: 100 });
  
  for (const post of posts) {
    await manager.updatePost(post.id, {
      // suas alterações
    });
  }
}
```

## 🤖 Automação

### GitHub Actions

```yaml
name: Publicar Artigo
on:
  push:
    paths:
      - 'content/**.md'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run publish-article content/novo-artigo.md
        env:
          STRAPI_API_TOKEN: ${{ secrets.STRAPI_API_TOKEN }}
```

### Script de Publicação Automática

```bash
#!/bin/bash
# publish-all.sh

for file in content/*.md; do
  echo "Publicando $file..."
  npm run publish-article "$file"
  sleep 2 # Evita rate limiting
done
```

## 📋 Formato do Arquivo Markdown

O arquivo markdown deve seguir este formato:

```markdown
## Título:
Meu Artigo Incrível

## Slug:
meu-artigo-incrivel

## Resumo:
Um breve resumo do artigo

## Tags:
bitcoin, blockchain, defi

## Categorias:
Tecnologia, Criptomoedas

## SEO:
- Meta Título: Título para SEO
- Meta Descrição: Descrição para mecanismos de busca

---

## CONTEÚDO COMPLETO:

# Título Principal

Conteúdo do artigo aqui...
```

## 🔐 Segurança

- Nunca commite tokens de API no repositório
- Use variáveis de ambiente para tokens sensíveis
- Configure permissões mínimas necessárias no token
- Considere usar tokens diferentes para dev/prod

## 🚨 Troubleshooting

### Token não autorizado
- Verifique se o token tem as permissões corretas
- Confirme que o token está configurado corretamente

### Post não aparece no site
- Verifique se foi publicado (não está como rascunho)
- Limpe o cache do Next.js
- Verifique os logs do console

### Erro de importação
- Valide o formato JSON
- Verifique campos obrigatórios
- Confirme que categorias/autores existem