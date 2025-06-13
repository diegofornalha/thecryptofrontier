# 📝 Guia de Melhorias na Formatação de Posts

## 🎯 Onde Implementar as Melhorias


**Exemplo de melhorias no schema:**
```typescript
// Adicionar novos tipos de blocos
{
  type: 'block',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'H1', value: 'h1'},
    {title: 'H2', value: 'h2'},
    {title: 'H3', value: 'h3'},
    {title: 'Quote', value: 'blockquote'},
    // NOVOS ESTILOS
    {title: 'Destaque', value: 'highlight'},
    {title: 'Introdução', value: 'lead'},
    {title: 'Conclusão', value: 'conclusion'}
  ],
  marks: {
    decorators: [
      {title: 'Strong', value: 'strong'},
      {title: 'Emphasis', value: 'em'},
      {title: 'Code', value: 'code'},
      // NOVOS MARCADORES
      {title: 'Marcador', value: 'marker'},
      {title: 'Tooltip', value: 'tooltip'}
    ],
  },
},
// NOVOS TIPOS DE BLOCOS
{
  type: 'object',
  name: 'highlightBox',
  title: 'Caixa de Destaque',
  fields: [
    {
      name: 'type',
      type: 'string',
      options: {
        list: ['info', 'warning', 'tip', 'success']
      }
    },
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'content',
      type: 'text'
    }
  ]
},
{
  type: 'object',
  name: 'cryptoPriceTable',
  title: 'Tabela de Preços',
  fields: [
    {
      name: 'cryptos',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string'},
          {name: 'symbol', type: 'string'},
          {name: 'showPrice', type: 'boolean'}
        ]
      }]
    }
  ]
},
{
  type: 'object',
  name: 'faqSection',
  title: 'FAQ',
  fields: [
    {
      name: 'questions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'question', type: 'string'},
          {name: 'answer', type: 'text'}
        ]
      }]
    }
  ]
}
```

### 2. **No Frontend Next.js (Recomendado para Estilo)**

#### ✅ O que fazer no Frontend:
- **Aplicar os estilos CSS** melhorados
- **Renderizar componentes customizados** do Portable Text
- **Adicionar interatividade** (tooltips, accordions, etc)
- **Implementar features de UX** (progress bar, table of contents)

#### 📁 Arquivos para modificar:

**1. Importar os novos estilos:**
```typescript
// src/app/post/[slug]/page.tsx
import '@/css/post-enhancements.css';
```

**2. Atualizar os componentes do Portable Text:**
```typescript
// src/app/post/[slug]/page.tsx

import { 
  HighlightBox, 
  CryptoPriceTable, 
  FAQSection,
  TableOfContents,
  ReadingProgress 
} from '@/components/PostEnhancements';

const cryptoBasicComponents = {
  // ... componentes existentes ...
  
  // NOVOS COMPONENTES
  types: {
    highlightBox: ({ value }: any) => (
      <HighlightBox type={value.type} title={value.title}>
        {value.content}
      </HighlightBox>
    ),
    cryptoPriceTable: ({ value }: any) => (
      <CryptoPriceTable cryptos={value.cryptos} />
    ),
    faqSection: ({ value }: any) => (
      <FAQSection faqs={value.questions} />
    ),
  },
  
  // NOVOS ESTILOS DE BLOCO
  block: {
    normal: ({ children }: any) => <p className="mb-7 leading-relaxed">{children}</p>,
    highlight: ({ children }: any) => (
      <div className="highlight-text bg-yellow-50 p-4 rounded-lg my-6 border-l-4 border-yellow-400">
        {children}
      </div>
    ),
    lead: ({ children }: any) => (
      <p className="text-xl leading-relaxed text-gray-700 mb-8 font-light">
        {children}
      </p>
    ),
  },
  
  // NOVOS MARCADORES
  marks: {
    marker: ({ children }: any) => (
      <span className="bg-yellow-200 px-1 rounded">{children}</span>
    ),
    tooltip: ({ children, value }: any) => (
      <span className="border-b-2 border-dotted border-gray-400 cursor-help" title={value.text}>
        {children}
      </span>
    ),
  },
};
```

### 3. **No Framework CrewAI (Para Conteúdo Automatizado)**

#### ✅ O que fazer no CrewAI:
- **Configurar o FormatterAgent** para gerar blocos especiais
- **Treinar os prompts** para usar novos formatos
- **Adicionar lógica** para detectar onde inserir componentes

#### 📁 Arquivo para modificar:
```python
# framework_crewai/blog_crew/agents/formatter_agent.py
```

**Exemplo de prompt melhorado:**
```python
FORMATTER_PROMPT = """
Ao formatar o artigo, use os seguintes componentes quando apropriado:

1. **Caixas de Destaque**: Para informações importantes
   - Use type="info" para informações gerais
   - Use type="warning" para avisos
   - Use type="tip" para dicas
   - Use type="success" para resultados positivos

2. **Tabelas de Preços**: Quando mencionar múltiplas criptomoedas

3. **FAQ**: No final de artigos educacionais

4. **Estilos de Texto**:
   - Use "lead" para o parágrafo introdutório
   - Use "highlight" para trechos muito importantes
   - Use "marker" para destacar termos-chave

Estrutura JSON esperada:
{
  "content": [
    {
      "_type": "block",
      "style": "lead",
      "children": [{"text": "Parágrafo introdutório..."}]
    },
    {
      "_type": "highlightBox",
      "type": "tip",
      "title": "Dica Pro",
      "content": "Conteúdo da dica..."
    }
  ]
}
"""
```

## 🚀 Recomendação de Implementação

### Fase 1: Frontend (Imediato)
1. ✅ Adicionar o arquivo CSS de melhorias
2. ✅ Implementar componentes React interativos
3. ✅ Atualizar o renderizador do Portable Text


### Fase 3: CrewAI (Longo Prazo)
1. 🤖 Atualizar prompts do FormatterAgent
2. 🤖 Adicionar lógica de detecção automática
3. 🤖 Implementar geração de componentes especiais

## 💡 Dicas Importantes

1. **Mantenha retrocompatibilidade**: Posts existentes devem continuar funcionando
2. **Progressive Enhancement**: Adicione features sem quebrar o básico
3. **Performance**: Use lazy loading para componentes pesados
4. **Acessibilidade**: Todos os componentes devem ser acessíveis

## 📊 Métricas de Sucesso

- ⬆️ Aumento no tempo de permanência na página
- ⬆️ Redução na taxa de rejeição
- ⬆️ Maior engajamento (compartilhamentos, comentários)
- ⬆️ Melhor SEO com conteúdo estruturado