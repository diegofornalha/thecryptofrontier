# 📄 Análise da Configuração do Portable Text

## 🔍 Estado Atual

### 1. **Configuração no Schema (post.ts)**

#### ✅ Pontos Positivos:
- **Estrutura básica implementada** com blocos, estilos e marcadores
- **Plugin @sanity/code-input** configurado no `sanity.config.ts`
- **Suporte para imagens** com campos de caption e alt text
- **Estilos básicos** (H1-H4, Quote) configurados

#### ❌ Limitações Atuais:

**a) Decorators limitados:**
```typescript
decorators: [
  {title: 'Strong', value: 'strong'},
  {title: 'Emphasis', value: 'em'},
  {title: 'Code', value: 'code'},
  {title: 'Underline', value: 'underline'},
  {title: 'Strike', value: 'strike-through'},
]
```
Faltam: marcador/highlight, tooltip, subscript/superscript

**b) Annotations ausentes:**
- Não há configuração de `annotations` para links customizados
- Links internos não estão configurados
- Sem suporte para âncoras de página

**c) Tipos de blocos limitados:**
- Apenas `block`, `image` e `code`
- Sem blocos customizados (caixas de destaque, FAQs, tabelas de preços)

### 2. **Configuração no Schema (agentPost.ts)**

#### ⚠️ Ainda mais limitado:
- Apenas decorators básicos (strong, em)
- Sem suporte para code blocks
- Menos estilos de heading (sem H4)
- Simplificado demais para conteúdo rico

### 3. **Renderização no Frontend**

#### ✅ Implementações existentes:
- **CSS personalizado** em `post-enhancements.css`
- **Componentes React** em `PostEnhancements.tsx`
- **Twitter embeds** implementados
- **Estilos visuais** bem definidos

#### ❌ Problemas:
- Componentes não integrados ao Portable Text
- Tipos customizados não mapeados
- Falta de consistência entre schema e renderização

## 🎯 Melhorias Recomendadas

### 1. **Expandir Configuração do Block Content**

```typescript
// src/sanity/schemaTypes/documents/post.ts
defineField({
  name: 'content',
  title: 'Conteúdo',
  type: 'array',
  of: [
    { 
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
        // ADICIONAR:
        {title: 'Introdução', value: 'lead'},
        {title: 'Destaque', value: 'highlight'},
        {title: 'Nota', value: 'note'}
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
          // ADICIONAR:
          {title: 'Marcador', value: 'marker'},
          {
            title: 'Subscript',
            value: 'sub',
            icon: () => 'sub'
          },
          {
            title: 'Superscript',
            value: 'sup',
            icon: () => 'sup'
          }
        ],
        // ADICIONAR ANNOTATIONS:
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: Rule => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              },
              {
                name: 'target',
                type: 'string',
                title: 'Target',
                options: {
                  list: [
                    {title: 'Mesma aba', value: '_self'},
                    {title: 'Nova aba', value: '_blank'}
                  ]
                }
              }
            ]
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Link Interno',
            fields: [
              {
                name: 'reference',
                type: 'reference',
                title: 'Referência',
                to: [
                  {type: 'post'},
                  {type: 'page'}
                ]
              }
            ]
          },
          {
            name: 'anchor',
            type: 'object',
            title: 'Âncora',
            fields: [
              {
                name: 'id',
                type: 'string',
                title: 'ID da âncora'
              }
            ]
          }
        ]
      },
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
        // ADICIONAR:
        {title: 'Checklist', value: 'checklist'}
      ]
    },
    // BLOCOS EXISTENTES
    {
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Legenda',
        },
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo',
          validation: Rule => Rule.required()
        },
        // ADICIONAR:
        {
          name: 'attribution',
          type: 'string',
          title: 'Atribuição/Fonte'
        }
      ],
    },
    { 
      type: 'code',
      options: {
        language: 'javascript',
        languageAlternatives: [
          {title: 'JavaScript', value: 'javascript'},
          {title: 'TypeScript', value: 'typescript'},
          {title: 'Python', value: 'python'},
          {title: 'Solidity', value: 'solidity'},
          {title: 'JSON', value: 'json'},
          {title: 'Bash', value: 'bash'}
        ],
        withFilename: true
      }
    },
    // NOVOS TIPOS DE BLOCOS
    {
      name: 'highlightBox',
      type: 'object',
      title: 'Caixa de Destaque',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Tipo',
          options: {
            list: [
              {title: 'Informação', value: 'info'},
              {title: 'Aviso', value: 'warning'},
              {title: 'Dica', value: 'tip'},
              {title: 'Sucesso', value: 'success'}
            ]
          }
        },
        {
          name: 'title',
          type: 'string',
          title: 'Título (opcional)'
        },
        {
          name: 'content',
          type: 'array',
          title: 'Conteúdo',
          of: [{type: 'block'}]
        }
      ],
      preview: {
        select: {
          title: 'title',
          type: 'type'
        },
        prepare({ title, type }) {
          const icons = {
            info: '💡',
            warning: '⚠️',
            tip: '💎',
            success: '✅'
          };
          return {
            title: title || `Caixa ${type}`,
            media: () => icons[type] || '📦'
          };
        }
      }
    },
    {
      name: 'cryptoWidget',
      type: 'object',
      title: 'Widget de Criptomoeda',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Tipo de Widget',
          options: {
            list: [
              {title: 'Preço Simples', value: 'price'},
              {title: 'Tabela de Preços', value: 'priceTable'},
              {title: 'Gráfico', value: 'chart'},
              {title: 'Calculadora', value: 'calculator'}
            ]
          }
        },
        {
          name: 'symbols',
          type: 'array',
          title: 'Símbolos',
          of: [{type: 'string'}],
          description: 'Ex: BTC, ETH, XRP'
        }
      ]
    },
    {
      name: 'faqSection',
      type: 'object',
      title: 'Seção FAQ',
      fields: [
        {
          name: 'title',
          type: 'string',
          title: 'Título da Seção',
          initialValue: 'Perguntas Frequentes'
        },
        {
          name: 'questions',
          type: 'array',
          title: 'Perguntas',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'question',
                  type: 'string',
                  title: 'Pergunta',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'answer',
                  type: 'array',
                  title: 'Resposta',
                  of: [{type: 'block'}],
                  validation: Rule => Rule.required()
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'embed',
      type: 'object',
      title: 'Embed',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'URL',
          description: 'Twitter/X, YouTube, TradingView, etc.'
        },
        {
          name: 'type',
          type: 'string',
          title: 'Tipo',
          options: {
            list: ['twitter', 'youtube', 'tradingview', 'other']
          }
        }
      ]
    }
  ],
})
```

### 2. **Atualizar Renderização no Frontend**

```typescript
// src/app/post/[slug]/page.tsx
import {
  HighlightBox,
  CryptoPriceTable,
  FAQSection,
  CryptoWidget,
  CodeBlock
} from '@/components/PostEnhancements';

const cryptoBasicComponents = {
  types: {
    // Blocos customizados
    highlightBox: ({ value }) => (
      <HighlightBox type={value.type} title={value.title}>
        <PortableText value={value.content} components={cryptoBasicComponents} />
      </HighlightBox>
    ),
    
    cryptoWidget: ({ value }) => (
      <CryptoWidget type={value.type} symbols={value.symbols} />
    ),
    
    faqSection: ({ value }) => (
      <FAQSection title={value.title} faqs={value.questions} />
    ),
    
    embed: ({ value }) => {
      if (value.type === 'twitter') {
        return <TwitterEmbed url={value.url} />;
      }
      // Outros tipos de embed
      return null;
    },
    
    code: ({ value }) => (
      <CodeBlock 
        code={value.code} 
        language={value.language}
        filename={value.filename}
      />
    )
  },
  
  block: {
    lead: ({ children }) => (
      <p className="text-xl leading-relaxed text-gray-700 mb-8 font-light">
        {children}
      </p>
    ),
    highlight: ({ children }) => (
      <div className="bg-yellow-50 p-4 rounded-lg my-6 border-l-4 border-yellow-400">
        {children}
      </div>
    ),
    note: ({ children }) => (
      <aside className="bg-gray-100 p-4 rounded-lg my-6 text-sm">
        {children}
      </aside>
    )
  },
  
  marks: {
    marker: ({ children }) => (
      <mark className="bg-yellow-200 px-1 rounded">{children}</mark>
    ),
    sub: ({ children }) => <sub>{children}</sub>,
    sup: ({ children }) => <sup>{children}</sup>,
    anchor: ({ children, value }) => (
      <span id={value.id}>{children}</span>
    )
  },
  
  list: {
    checklist: ({ children }) => (
      <ul className="checklist space-y-2">{children}</ul>
    )
  },
  
  listItem: {
    checklist: ({ children }) => (
      <li className="flex items-start">
        <input type="checkbox" className="mr-2 mt-1" disabled />
        <span>{children}</span>
      </li>
    )
  }
};
```

### 3. **Criar Tipos TypeScript**

```typescript
// src/types/portable-text.ts
export interface HighlightBoxBlock {
  _type: 'highlightBox';
  type: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  content: PortableTextBlock[];
}

export interface CryptoWidgetBlock {
  _type: 'cryptoWidget';
  type: 'price' | 'priceTable' | 'chart' | 'calculator';
  symbols: string[];
}

export interface FAQSectionBlock {
  _type: 'faqSection';
  title?: string;
  questions: {
    question: string;
    answer: PortableTextBlock[];
  }[];
}

export interface EmbedBlock {
  _type: 'embed';
  url: string;
  type: 'twitter' | 'youtube' | 'tradingview' | 'other';
}
```

## 🚀 Implementação Recomendada

### Fase 1: Schema Enhancement (1-2 dias)
1. ✅ Adicionar annotations para links
2. ✅ Expandir decorators
3. ✅ Criar tipos de blocos básicos (highlightBox)

### Fase 2: Frontend Integration (2-3 dias)
1. ✅ Mapear novos componentes
2. ✅ Integrar com PostEnhancements.tsx
3. ✅ Adicionar tipos TypeScript

### Fase 3: Advanced Features (3-5 dias)
1. 📝 Widgets de criptomoedas
2. 📝 Embeds avançados
3. 📝 Componentes interativos

### Fase 4: CrewAI Integration (1 semana)
1. 🤖 Treinar agentes para usar novos blocos
2. 🤖 Adicionar lógica de detecção
3. 🤖 Gerar conteúdo estruturado

## 📊 Benefícios Esperados

1. **Melhor experiência de edição** no Sanity Studio
2. **Conteúdo mais rico e interativo**
3. **Maior engajamento dos leitores**
4. **SEO aprimorado** com conteúdo estruturado
5. **Consistência** entre conteúdo manual e automatizado

## ⚠️ Considerações Importantes

1. **Retrocompatibilidade**: Manter suporte para posts existentes
2. **Performance**: Lazy load para componentes pesados
3. **Acessibilidade**: Todos os componentes devem ser acessíveis
4. **Mobile**: Garantir responsividade
5. **Validação**: Adicionar validação nos campos do Sanity