# Plano de Migração para shadcn/ui: Fase 0 - Configuração do Design System

## 1. Introdução e Objetivos

A Fase 0 é a etapa fundamental do processo de migração para o shadcn/ui. Nesta fase, estabeleceremos as bases do nosso design system, garantindo que todos os componentes futuros sejam construídos de forma consistente.

**Objetivos:**
- Consolidar e organizar variáveis CSS existentes
- Configurar um tema global para o shadcn/ui
- Estabelecer padrões de tipografia, espaçamento e cores
- Preparar a estrutura para componentes reutilizáveis
- Criar um guia de estilo de referência

## 2. Análise do Estado Atual

### Configuração Atual do shadcn/ui

Analisando o arquivo `components.json`, identificamos:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/css/main.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Isso nos mostra que:
- Estamos utilizando o estilo "New York" (mais arredondado)
- Temos suporte a React Server Components
- Estamos usando TypeScript (.tsx)
- O arquivo CSS principal está em `src/css/main.css`
- A biblioteca de ícones é a Lucide

### Variáveis CSS Existentes

No arquivo `src/css/main.css`, já temos várias variáveis CSS definidas para o tema claro e escuro:

```css
:root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    /* ... outras variáveis ... */
}
.dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... outras variáveis para o tema escuro ... */
}
```

### Classes Personalizadas

Também temos muitas classes CSS personalizadas com prefixo "sb-" que precisarão ser substituídas:

```css
@layer components {
    .sb-markdown {
        /* ... */
    }
    /* ... outros componentes ... */
}
```

## 3. Configuração das Variáveis CSS

### 3.1 Consolidação de Variáveis

**Tarefa:** Auditar e consolidar as variáveis CSS atuais.

1. Crie um arquivo `tokens.js` na pasta `src/lib` para documentar todas as variáveis:

```javascript
// src/lib/tokens.js
export const tokens = {
  colors: {
    primary: '221.2 83.2% 53.3%',
    secondary: '0 0% 96.1%',
    // ... outras cores ...
  },
  borderRadius: {
    default: '0.5rem',
    // ... outros raios ...
  },
  // ... outros tokens ...
}
```

2. Utilize este arquivo como referência única para variáveis do design system

### 3.2 Ajuste do main.css

**Tarefa:** Reorganizar o arquivo CSS principal para separar claramente:

```css
/* src/css/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 1. Variáveis do Design System */
@layer base {
    :root {
        /* Cores principais */
        --background: 0 0% 100%;
        --foreground: 0 0% 3.9%;
        /* ... outras variáveis ... */
        
        /* Tipografia */
        --font-sans: 'Inter', sans-serif;
        --font-serif: 'Roboto Slab', serif;
        
        /* Espaçamentos */
        --spacing-1: 0.25rem;
        --spacing-2: 0.5rem;
        --spacing-3: 0.75rem;
        --spacing-4: 1rem;
        /* ... outros espaçamentos ... */
    }
    
    .dark {
        /* ... variáveis do tema escuro ... */
    }
    
    /* Estilos base */
    body {
        @apply bg-background text-foreground;
        font-family: var(--font-sans);
    }
    
    /* ... outros estilos base ... */
}

/* 2. Componentes shadcn/ui - deixar espaço para shadcn */
@layer components {
    /* Componentes shadcn serão inseridos aqui via CLI */
}

/* 3. Classes utilitárias personalizadas */
@layer utilities {
    /* ... utilitários personalizados ... */
}
```

## 4. Configuração de Tipografia

### 4.1 Definição de Fontes

**Tarefa:** Configurar as fontes para uso com shadcn/ui.

```javascript
// tailwind.config.js
module.exports = {
  // ... configuração existente ...
  theme: {
    extend: {
      // ... extensões existentes ...
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
      fontSize: {
        // Ajustar tamanhos de fonte para alinhamento com shadcn/ui
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
}
```

### 4.2 Criação de Componentes Tipográficos

**Tarefa:** Configurar componentes de tipografia com shadcn/ui:

```bash
npx shadcn-ui@latest add typography
```

### 4.3 Personalização da Tipografia

Criar arquivo `src/components/ui/typography.tsx` para componentes tipográficos personalizados:

```tsx
// src/components/ui/typography.tsx
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  className?: string
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn("scroll-m-20 text-4xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  )
}

// ... outros componentes de tipografia ...
```

## 5. Espaçamentos e Grade

### 5.1 Padronização de Espaçamentos

**Tarefa:** Definir escala de espaçamentos para o projeto:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        // Se necessário, adicionar valores personalizados além dos padrões do Tailwind
        '4.5': '1.125rem',
        // ... outros espaçamentos customizados ...
      },
    },
  },
}
```

### 5.2 Container e Breakpoints

**Tarefa:** Configurar o componente Container do shadcn/ui:

```bash
npx shadcn-ui@latest add container
```

Personalizar os breakpoints no Container para alinhar com o design:

```jsx
// src/components/ui/container.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full max-w-screen-xl px-4 md:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
})
Container.displayName = "Container"

export { Container }
```

## 6. Paleta de Cores

### 6.1 Revisão da Paleta de Cores

**Tarefa:** Verificar e organizar a paleta de cores existente:

1. Documentar todas as cores usadas no projeto
2. Mapear cores para variáveis CSS semânticas
3. Garantir acessibilidade de contraste entre cores

### 6.2 Configuração de Temas

**Tarefa:** Configurar o provedor de tema do shadcn/ui para suportar tema claro/escuro:

```bash
npx shadcn-ui@latest add theme-provider
```

Implementar o provedor de tema na raiz do projeto:

```tsx
// src/app/providers.tsx
"use client"

import { ThemeProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  )
}
```

## 7. Componentes Base

### 7.1 Instalação de Componentes Essenciais

**Tarefa:** Instalar os componentes básicos do shadcn/ui:

```bash
# Componentes básicos
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toggle
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add toast
```

### 7.2 Criação de Exemplo para Cada Componente

**Tarefa:** Criar um componente de exemplo para cada componente base:

```tsx
// src/app/design-system/page.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// ... outros componentes ...

export default function DesignSystemPage() {
  return (
    <div className="container py-10 space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-4">Botões</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      
      {/* ... outros componentes ... */}
    </div>
  )
}
```

## 8. Guia de Estilo

### 8.1 Documentação do Design System

**Tarefa:** Criar uma página de documentação do design system:

1. Criar pasta `src/app/design-system`
2. Implementar páginas para cada grupo de componentes:
   - Cores
   - Tipografia
   - Espaçamentos
   - Componentes básicos
   - Variantes de componentes

### 8.2 Criação de Utilidades para o Desenvolvimento

**Tarefa:** Melhorar o arquivo de utilidades para o design system:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Adicionar funções para manipulação de cores
export function hexToHsl(hex: string): string {
  // Implementação da conversão de hex para HSL em formato de string
}

// ... outras utilidades ...
```

## 9. Próximos Passos

### 9.1 Preparação para a Fase 1

**Tarefa:** Documentar todos os componentes existentes que precisarão ser migrados:

1. Criar uma planilha com os componentes atuais, mapeando-os para equivalentes do shadcn/ui
2. Priorizar componentes por importância e frequência de uso
3. Identificar possíveis gaps onde será necessário criar componentes personalizados

### 9.2 Definição de Métricas de Sucesso

**Tarefas:** Estabelecer critérios claros para medir o sucesso da fase 0:

- [ ] Todas as variáveis CSS consolidadas e documentadas
- [ ] Tema claro/escuro funcionando corretamente
- [ ] Componentes básicos instalados e configurados
- [ ] Guia de estilo inicial criado
- [ ] Plano detalhado para Fase 1 finalizado
