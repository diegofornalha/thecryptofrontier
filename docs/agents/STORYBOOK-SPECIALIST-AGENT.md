# 📚 Storybook Specialist Agent - Documentação Completa

## 📋 Visão Geral

O **Storybook Specialist Agent** é um especialista em Storybook focado na documentação e visualização de componentes. Ele analisa stories, verifica cobertura, otimiza performance e garante boas práticas de acessibilidade e design system.

### 🎯 Capacidades Principais

- **Análise de Stories** - Verifica componentes documentados
- **Documentação de Componentes** - Ajuda na criação de stories
- **Verificação de Build** - Status e otimização do build estático
- **Testes Visuais** - Configuração de testes de regressão visual
- **Verificação de Acessibilidade** - Análise de a11y
- **Otimização de Performance** - Redução do tamanho do build
- **Integração com Design System** - Tokens e componentes
- **Relatório de Cobertura** - Percentual de componentes documentados

## 🛠️ Como Usar

### Execução Direta

```bash
# Análise geral
npx tsx /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents/storybook-specialist-agent.ts

# Análise específica
npx tsx [...]/storybook-specialist-agent.ts "verificar cobertura"
```

### Comandos Disponíveis

```bash
# Análise de stories
"analisar stories"

# Verificar build
"verificar build"

# Cobertura de componentes
"check coverage"

# Acessibilidade
"verificar acessibilidade"

# Performance
"analisar performance"

# Design System
"design system"
```

## 📊 Tipos de Análise

### 1. Análise de Stories 📖

Verifica todos os arquivos de stories no projeto:
- Conta total de stories
- Organiza por categorias
- Identifica componentes sem documentação
- Sugere prioridades para documentar

**Output exemplo**:
```
📊 Resumo:
- Total de arquivos de stories: 15
- Categorias: Components (8), Pages (4), UI (3)

⚠️ Componentes sem Stories:
- src/components/Header/Header.tsx
- src/components/Footer/Footer.tsx
```

### 2. Verificação de Build 🏗️

Analisa o build estático do Storybook:
- Verifica existência do build
- Tamanho total e por arquivo
- Idade do build
- Scripts disponíveis

**Métricas verificadas**:
- Tamanho do build em MB
- Número de stories no build
- Versão do Storybook
- Framework utilizado

### 3. Cobertura de Componentes 📊

Calcula percentual de componentes documentados:
```
📈 Estatísticas de Cobertura:
- Total de componentes: 50
- Componentes com stories: 35
- Cobertura: 70%

📊 Visualização:
[██████████████      ] 70%
```

**Recomendações baseadas na cobertura**:
- < 30%: Cobertura crítica
- 30-70%: Cobertura moderada  
- > 70%: Boa cobertura

### 4. Análise de Acessibilidade ♿

Verifica configuração de a11y:
- Addon @storybook/addon-a11y instalado
- Checklist de acessibilidade WCAG
- Exemplos de testes a11y

**Checklist incluído**:
- Visual (contraste, fontes)
- Navegação (teclado, tabs)
- Screen readers (ARIA, labels)

### 5. Análise de Performance 🚀

Otimizações do build:
- Tamanho total e por chunk
- Arquivos grandes (> 500KB)
- Lazy loading habilitado
- Tree shaking configurado

**Otimizações sugeridas**:
```javascript
// Lazy loading
features: {
  storyStoreV7: true
}

// Code splitting
optimization: {
  splitChunks: {
    chunks: "all"
  }
}
```

### 6. Design System 🎨

Integração com sistema de design:
- Estrutura de componentes
- Tokens de design (cores, espaçamento, tipografia)
- Organização recomendada
- Integração com tema

**Estrutura sugerida**:
```
src/
├── design-system/
│   ├── tokens/
│   ├── components/
│   └── index.ts
└── stories/
    └── design-system/
```

## 🚀 Templates e Exemplos

### Story Básica

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    backgroundColor: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: "Button",
  },
};
```

### Story com Acessibilidade

```typescript
export const AccessibleButton: Story = {
  args: {
    label: "Click me",
    ariaLabel: "Click to submit form",
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## 📦 Instalação e Configuração

### Instalação Inicial

```bash
# Instalar Storybook
npx storybook@latest init

# Addons recomendados
npm install --save-dev @storybook/addon-a11y
npm install --save-dev @storybook/addon-essentials
```

### Configuração Principal

```javascript
// .storybook/main.js
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  features: {
    storyStoreV7: true, // Performance
  },
};
```

### Preview com Tema

```javascript
// .storybook/preview.js
import { tokens } from "../src/design-system/tokens";

export const parameters = {
  backgrounds: {
    values: [
      { name: "light", value: tokens.colors.background.light },
      { name: "dark", value: tokens.colors.background.dark },
    ],
  },
};

export const decorators = [
  (Story) => (
    <ThemeProvider theme={tokens}>
      <Story />
    </ThemeProvider>
  ),
];
```

## 💻 Comandos Úteis

```bash
# Desenvolvimento
npm run storybook

# Build estático
npm run build-storybook

# Servir build
npx http-server storybook-static

# Testes de acessibilidade
npm run storybook -- --ci --smoke-test

# Deploy no Chromatic
npx chromatic --project-token=<token>
```

## 📈 Métricas e KPIs

### Métricas Rastreadas
- **Cobertura**: % de componentes documentados
- **Build Size**: Tamanho em MB
- **Load Time**: Tempo de carregamento
- **A11y Score**: Score de acessibilidade

### Metas Recomendadas
- Cobertura mínima: 70%
- Build máximo: 20MB
- Todos componentes públicos documentados
- Zero erros de acessibilidade críticos

## 🔗 Recursos Úteis

### Documentação Oficial
- [Storybook Docs](https://storybook.js.org/docs)
- [Addon Gallery](https://storybook.js.org/addons)
- [Tutorials](https://storybook.js.org/tutorials)

### Ferramentas Complementares
- **Chromatic** - Visual testing
- **Percy** - Visual regression
- **Compodoc** - Documentação adicional
- **Figma Plugin** - Design to code

## 🤝 Integração com Outros Agentes

O Storybook Specialist trabalha bem com:
- **NextJS Specialist** - Componentes React/Next.js
- **Docker Specialist** - Deploy do Storybook
- **Guardian Orchestrator** - Documentação geral

## 🔒 Boas Práticas

### Organização
- Uma story por componente
- Categorias claras (UI, Forms, Layout)
- Stories próximas aos componentes
- Use CSF 3.0 (Component Story Format)

### Documentação
- Use JSDoc/TSDoc nos componentes
- Adicione descrições nas stories
- Documente props com argTypes
- Exemplos de uso real

### Performance
- Lazy load stories grandes
- Otimize assets (imagens, fontes)
- Use webpack aliases
- Configure cache apropriado

## 🐛 Troubleshooting

### Problemas Comuns

1. **Stories não aparecem**
   - Verificar padrão de glob em main.js
   - Confirmar exportação default

2. **Build muito grande**
   - Habilitar code splitting
   - Remover addons desnecessários
   - Otimizar imports

3. **Erro de acessibilidade**
   - Instalar addon-a11y
   - Configurar regras apropriadas
   - Testar com screen reader

## 📚 Base de Conhecimento

O agente analisa:
- Arquivos `*.stories.*`
- Componentes em pastas específicas
- Configuração em `.storybook/`
- Build em `storybook-static/`

---

**Última atualização**: 15/06/2025  
**Versão**: 1.0.0  
**Localização**: `/claude-flow-diego/claude-diego-flow/src/agents/storybook-specialist-agent.ts`