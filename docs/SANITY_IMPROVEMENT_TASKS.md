# 📋 Tarefas para Alcançar 100% de Conformidade com Sanity

## 🎯 Objetivo
Elevar todas as áreas do projeto para 100% de conformidade com as melhores práticas do Sanity Studio.

---

## 📝 1. SCHEMAS (70% → 100%)

### 1.1 Reativar Campos Essenciais
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Descomentar e melhorar os campos
defineField({
  name: 'categories',
  title: 'Categorias',
  type: 'array',
  of: [{ type: 'reference', to: { type: 'category' } }],
  validation: Rule => Rule.required().min(1).error('Selecione pelo menos uma categoria'),
  group: 'metadata',
}),

defineField({
  name: 'tags',
  title: 'Tags',
  type: 'array',
  of: [{ type: 'reference', to: { type: 'tag' } }],
  description: 'Tags para melhorar a descoberta do conteúdo',
  group: 'metadata',
}),

defineField({
  name: 'cryptoMeta',
  title: 'Informações da Criptomoeda',
  type: 'cryptoMeta',
  hidden: ({ document }) => !document?.categories?.some(cat => cat._ref === 'crypto-category-id'),
  group: 'crypto',
}),

defineField({
  name: 'seo',
  title: 'SEO & Social',
  type: 'seo',
  group: 'seo',
}),
```

### 1.2 Adicionar Grupos de Campos
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Adicionar no início do schema
groups: [
  {
    name: 'content',
    title: 'Conteúdo',
    default: true,
  },
  {
    name: 'metadata',
    title: 'Metadados',
  },
  {
    name: 'seo',
    title: 'SEO',
  },
  {
    name: 'crypto',
    title: 'Crypto Info',
  },
],
```

### 1.3 Corrigir Labels Incorretos
**Arquivo:** `src/sanity/schemaTypes/documents/author.ts`

```typescript
// TAREFA: Corrigir os labels
defineField({
  name: 'twitter',
  title: 'Twitter', // ERA: 'Instagram'
  type: 'url',
  validation: Rule => Rule.uri({
    scheme: ['http', 'https']
  }).error('URL inválida'),
}),

defineField({
  name: 'github',
  title: 'GitHub', // ERA: 'Link da Oferta'
  type: 'url',
  validation: Rule => Rule.uri({
    scheme: ['http', 'https']
  }).error('URL inválida'),
}),
```

### 1.4 Consolidar Schemas Duplicados
**TAREFA:** Mesclar `post.ts` e `agentPost.ts`

```typescript
// Em post.ts, adicionar campo para diferenciar origem
defineField({
  name: 'source',
  title: 'Origem',
  type: 'string',
  options: {
    list: [
      { title: 'Manual', value: 'manual' },
      { title: 'Agent AI', value: 'agent' },
      { title: 'RSS Import', value: 'rss' },
    ],
  },
  initialValue: 'manual',
  readOnly: ({ currentUser }) => !currentUser.roles.some(r => r.name === 'administrator'),
}),
```

### 1.5 Adicionar Validações Robustas
**Arquivo:** `src/sanity/schemaTypes/objects/cryptoMeta.ts`

```typescript
// TAREFA: Adicionar validações
defineField({
  name: 'currentPrice',
  title: 'Preço Atual',
  type: 'number',
  validation: Rule => Rule.positive().precision(8),
}),

defineField({
  name: 'priceChange24h',
  title: 'Variação 24h (%)',
  type: 'number',
  validation: Rule => Rule.min(-100).max(10000)
    .error('Variação deve estar entre -100% e 10000%'),
}),

defineField({
  name: 'marketCap',
  title: 'Market Cap',
  type: 'number',
  validation: Rule => Rule.positive(),
}),
```

### 1.6 Adicionar Campos Úteis
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Adicionar novos campos
defineField({
  name: 'featured',
  title: 'Post em Destaque',
  type: 'boolean',
  initialValue: false,
  description: 'Mostrar este post em destaque na homepage',
  group: 'metadata',
}),

defineField({
  name: 'readingTime',
  title: 'Tempo de Leitura',
  type: 'number',
  description: 'Tempo estimado de leitura em minutos',
  validation: Rule => Rule.min(1).max(60),
  group: 'metadata',
}),

defineField({
  name: 'relatedPosts',
  title: 'Posts Relacionados',
  type: 'array',
  of: [{ type: 'reference', to: { type: 'post' } }],
  validation: Rule => Rule.max(5),
  group: 'metadata',
}),
```

### 1.7 Adicionar Ícones aos Schemas
**TAREFA:** Adicionar ícones para melhor UX

```typescript
// Em cada schema de documento
import { DocumentTextIcon, UserIcon, TagIcon, FolderIcon } from '@sanity/icons'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  // ...
})
```

---

## 🔌 2. PLUGINS (40% → 100%)

### 2.1 Instalar Plugins Essenciais
**TAREFA:** Executar comandos de instalação

```bash
# Dashboard para analytics
npm install @sanity/dashboard @sanity/google-analytics-plugin

# Melhor gestão de mídia
npm install @sanity/asset-source-unsplash

# SEO tools
npm install sanity-plugin-seo-tools

# Scheduled publishing
npm install @sanity/scheduled-publishing

# Melhor preview
npm install sanity-plugin-iframe-pane
```

### 2.2 Configurar Dashboard Plugin
**Arquivo:** `sanity.config.ts`

```typescript
// TAREFA: Adicionar configuração do dashboard
import { dashboardTool } from '@sanity/dashboard'
import { googleAnalytics } from '@sanity/google-analytics-plugin'

plugins: [
  dashboardTool({
    widgets: [
      {
        name: 'google-analytics',
        options: {
          propertyId: 'GA_PROPERTY_ID',
          startDate: '30daysAgo',
          endDate: 'today',
        },
      },
      {
        name: 'project-info',
      },
      {
        name: 'project-users',
      },
      {
        name: 'document-list',
        options: {
          title: 'Posts Recentes',
          types: ['post'],
          limit: 10,
          order: '_createdAt desc',
        },
      },
    ],
  }),
  // ... outros plugins
]
```

### 2.3 Configurar Asset Sources
**Arquivo:** `sanity.config.ts`

```typescript
// TAREFA: Adicionar fonte de imagens Unsplash
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'

plugins: [
  unsplashImageAsset({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
  }),
  // ... outros plugins
]
```

### 2.4 Implementar SEO Tools
**Arquivo:** `sanity.config.ts`

```typescript
// TAREFA: Configurar plugin de SEO
import { seoTools } from 'sanity-plugin-seo-tools'

plugins: [
  seoTools({
    baseUrl: 'https://thecryptofrontier.com',
    slug: (doc) => doc.slug?.current,
    fetchRemote: true,
    content: (doc) => doc.content,
    title: (doc) => doc.title,
    description: (doc) => doc.excerpt,
    locale: (doc) => 'pt-BR',
    contentSelector: 'body',
  }),
  // ... outros plugins
]
```

### 2.5 Adicionar Scheduled Publishing
**Arquivo:** `sanity.config.ts`

```typescript
// TAREFA: Configurar publicação agendada
import { scheduledPublishing } from '@sanity/scheduled-publishing'

plugins: [
  scheduledPublishing({
    enabled: true,
    inputDateTimeFormat: 'dd/MM/yyyy HH:mm',
  }),
  // ... outros plugins
]
```

### 2.6 Melhorar Preview com IFrame
**Arquivo:** `sanity.config.ts`

```typescript
// TAREFA: Configurar preview melhorado
import { iframePane } from 'sanity-plugin-iframe-pane'

// Em structure.ts
S.document().views([
  S.view.form(),
  S.view
    .component(iframePane)
    .options({
      url: (doc) => doc?.slug?.current
        ? `https://thecryptofrontier.com/api/preview?slug=${doc.slug.current}`
        : null,
      reload: { button: true },
    })
    .title('Preview'),
])
```

---

## 📄 3. PORTABLE TEXT (60% → 100%)

### 3.1 Adicionar Suporte para Links
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Adicionar annotations para links
{
  type: 'block',
  marks: {
    decorators: [
      // ... decorators existentes
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'Link Externo',
        icon: LinkIcon,
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
            validation: Rule => Rule.required().uri({
              allowRelative: true,
              scheme: ['http', 'https', 'mailto', 'tel'],
            }),
          },
          {
            name: 'blank',
            type: 'boolean',
            title: 'Abrir em nova aba',
            initialValue: true,
          },
        ],
      },
      {
        name: 'internalLink',
        type: 'object',
        title: 'Link Interno',
        icon: DocumentIcon,
        fields: [
          {
            name: 'reference',
            type: 'reference',
            to: [{ type: 'post' }, { type: 'page' }],
          },
        ],
      },
    ],
  },
}
```

### 3.2 Adicionar Novos Estilos
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Expandir estilos disponíveis
styles: [
  { title: 'Normal', value: 'normal' },
  { title: 'H1', value: 'h1' },
  { title: 'H2', value: 'h2' },
  { title: 'H3', value: 'h3' },
  { title: 'H4', value: 'h4' },
  { title: 'Quote', value: 'blockquote' },
  { title: 'Destaque', value: 'highlight' },
  { title: 'Nota', value: 'note' },
  { title: 'Aviso', value: 'warning' },
],
```

### 3.3 Criar Blocos Customizados
**Arquivo:** `src/sanity/schemaTypes/objects/highlightBox.ts`

```typescript
// TAREFA: Criar novo tipo de bloco
import { defineType, defineField } from 'sanity'
import { InfoOutlineIcon } from '@sanity/icons'

export default defineType({
  name: 'highlightBox',
  title: 'Caixa de Destaque',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Dica', value: 'tip' },
          { title: 'Aviso', value: 'warning' },
          { title: 'Erro', value: 'error' },
          { title: 'Sucesso', value: 'success' },
        ],
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
    },
    prepare({ title, type }) {
      return {
        title: title || `Caixa ${type}`,
        subtitle: type,
      }
    },
  },
})
```

### 3.4 Adicionar Widget de Crypto
**Arquivo:** `src/sanity/schemaTypes/objects/cryptoWidget.ts`

```typescript
// TAREFA: Criar widget para dados de crypto
import { defineType, defineField } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons'

export default defineType({
  name: 'cryptoWidget',
  title: 'Widget de Criptomoeda',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'type',
      title: 'Tipo de Widget',
      type: 'string',
      options: {
        list: [
          { title: 'Preço Atual', value: 'price' },
          { title: 'Gráfico', value: 'chart' },
          { title: 'Tabela de Preços', value: 'table' },
          { title: 'Calculadora', value: 'calculator' },
        ],
      },
    }),
    defineField({
      name: 'symbol',
      title: 'Símbolo',
      type: 'string',
      description: 'Ex: BTC, ETH, ADA',
      validation: Rule => Rule.required().uppercase(),
    }),
    defineField({
      name: 'settings',
      title: 'Configurações',
      type: 'object',
      fields: [
        {
          name: 'showChange',
          title: 'Mostrar Variação',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'period',
          title: 'Período',
          type: 'string',
          options: {
            list: ['1h', '24h', '7d', '30d'],
          },
          initialValue: '24h',
        },
      ],
    }),
  ],
})
```

### 3.5 Implementar Embed Blocks
**Arquivo:** `src/sanity/schemaTypes/objects/embedBlock.ts`

```typescript
// TAREFA: Criar bloco de embed
import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export default defineType({
  name: 'embedBlock',
  title: 'Embed',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https'],
      }),
    }),
    defineField({
      name: 'platform',
      title: 'Plataforma',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      url: 'url',
    },
    prepare({ url }) {
      const platform = detectPlatform(url)
      return {
        title: `Embed: ${platform}`,
        subtitle: url,
      }
    },
  },
})

function detectPlatform(url) {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('tradingview.com')) return 'TradingView'
  return 'Unknown'
}
```

### 3.6 Atualizar Content Field
**Arquivo:** `src/sanity/schemaTypes/documents/post.ts`

```typescript
// TAREFA: Atualizar array de content com novos tipos
defineField({
  name: 'content',
  title: 'Conteúdo',
  type: 'array',
  of: [
    { type: 'block' }, // Com todas as melhorias acima
    { type: 'image' }, // Já existe
    { type: 'code' }, // Já existe
    { type: 'highlightBox' }, // NOVO
    { type: 'cryptoWidget' }, // NOVO
    { type: 'embedBlock' }, // NOVO
    {
      type: 'object',
      name: 'divider',
      title: 'Divisor',
      fields: [
        {
          name: 'style',
          type: 'string',
          options: {
            list: ['solid', 'dashed', 'dotted'],
          },
          initialValue: 'solid',
        },
      ],
    },
  ],
})
```

---

## 🔷 4. TYPESCRIPT (50% → 100%)

### 4.1 Habilitar Strict Mode
**Arquivo:** `tsconfig.json`

```json
// TAREFA: Habilitar configurações strict gradualmente
{
  "compilerOptions": {
    // Fase 1 - Básico
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    
    // Fase 2 - Intermediário
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    
    // Fase 3 - Avançado
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // Melhorias adicionais
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
  }
}
```

### 4.2 Gerar Tipos dos Schemas
**TAREFA:** Criar script para gerar tipos

```json
// package.json
{
  "scripts": {
    "sanity:types": "sanity schema extract && sanity typegen generate"
  }
}
```

```bash
# Executar para gerar tipos
npm run sanity:types
```

### 4.3 Criar Tipos para Queries GROQ
**Arquivo:** `src/sanity/types/queries.ts`

```typescript
// TAREFA: Criar tipos para queries
export type PostQuery = {
  _id: string
  _type: 'post'
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt?: string
  author?: {
    _id: string
    name: string
    image?: {
      asset: {
        url: string
      }
    }
  }
  mainImage?: {
    asset: {
      url: string
    }
    alt?: string
  }
  categories?: Array<{
    _id: string
    title: string
    slug: { current: string }
  }>
  tags?: Array<{
    _id: string
    title: string
  }>
  content: any[] // Portable Text
}

export type AuthorQuery = {
  _id: string
  _type: 'author'
  name: string
  slug: { current: string }
  bio?: any[] // Portable Text
  image?: {
    asset: {
      url: string
    }
  }
}
```

### 4.4 Adicionar Tipos Utilitários
**Arquivo:** `src/sanity/types/utils.ts`

```typescript
// TAREFA: Criar tipos utilitários
export type SanityDocument<T = any> = T & {
  _id: string
  _type: string
  _rev: string
  _createdAt: string
  _updatedAt: string
}

export type SanityReference = {
  _type: 'reference'
  _ref: string
}

export type SanityImage = {
  _type: 'image'
  asset: SanityReference
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  alt?: string
  caption?: string
}

export type PortableTextBlock = {
  _type: 'block'
  _key: string
  style?: string
  markDefs?: any[]
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks?: string[]
  }>
}
```

### 4.5 Tipar Componentes React
**TAREFA:** Adicionar tipos aos componentes

```typescript
// Exemplo para componente de post
import { FC } from 'react'
import { PostQuery } from '@/sanity/types/queries'

interface PostPageProps {
  post: PostQuery
  relatedPosts?: PostQuery[]
}

const PostPage: FC<PostPageProps> = ({ post, relatedPosts }) => {
  // Componente com tipos seguros
}
```

### 4.6 Criar Validadores de Tipo
**Arquivo:** `src/sanity/lib/validators.ts`

```typescript
// TAREFA: Criar validadores runtime
import { z } from 'zod'

export const PostValidator = z.object({
  _id: z.string(),
  _type: z.literal('post'),
  title: z.string().min(10).max(100),
  slug: z.object({
    current: z.string(),
  }),
  publishedAt: z.string().datetime(),
  excerpt: z.string().max(300).optional(),
  author: z.object({
    _ref: z.string(),
  }).optional(),
})

export type ValidatedPost = z.infer<typeof PostValidator>

// Função helper
export function validatePost(data: unknown): ValidatedPost {
  return PostValidator.parse(data)
}
```

### 4.7 Configurar Path Aliases
**Arquivo:** `tsconfig.json`

```json
// TAREFA: Adicionar aliases para imports mais limpos
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/sanity/*": ["src/sanity/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/types/*": ["src/types/*"],
    }
  }
}
```

---

## 📊 Checklist de Implementação

### Fase 1 - Schemas (1 semana)
- [ ] Reativar campos comentados em post.ts
- [ ] Corrigir labels em author.ts
- [ ] Adicionar grupos de campos
- [ ] Consolidar post.ts e agentPost.ts
- [ ] Adicionar validações robustas
- [ ] Implementar campos úteis (featured, readingTime)
- [ ] Adicionar ícones aos schemas

### Fase 2 - Plugins (3-4 dias)
- [ ] Instalar todos os plugins listados
- [ ] Configurar Dashboard
- [ ] Implementar Asset Sources
- [ ] Configurar SEO Tools
- [ ] Adicionar Scheduled Publishing
- [ ] Melhorar Preview com IFrame

### Fase 3 - Portable Text (1 semana)
- [ ] Adicionar suporte para links
- [ ] Implementar novos estilos
- [ ] Criar highlightBox
- [ ] Criar cryptoWidget
- [ ] Criar embedBlock
- [ ] Atualizar content field com novos tipos

### Fase 4 - TypeScript (3-4 dias)
- [ ] Habilitar strict mode (gradualmente)
- [ ] Gerar tipos dos schemas
- [ ] Criar tipos para queries GROQ
- [ ] Adicionar tipos utilitários
- [ ] Tipar componentes React
- [ ] Implementar validadores
- [ ] Configurar path aliases

---

## 🎯 Resultado Esperado

Após implementar todas as tarefas:

- **Schemas**: 100% ✅ - Estrutura completa, validada e otimizada
- **Plugins**: 100% ✅ - Funcionalidades avançadas disponíveis
- **Portable Text**: 100% ✅ - Editor rico e flexível
- **TypeScript**: 100% ✅ - Type safety completo

O projeto estará totalmente alinhado com as melhores práticas do Sanity, oferecendo uma experiência superior para editores e desenvolvedores.