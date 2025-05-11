# Storybook - The Crypto Frontier

Este diretório contém a configuração do Storybook para o projeto The Crypto Frontier.

## Executando o Storybook

```bash
# Iniciar o Storybook
npm run storybook

# Reiniciar o Storybook (caso esteja apresentando problemas)
npm run storybook:restart
```

## Estrutura de Arquivos

- `main.ts` - Configuração principal do Storybook
- `preview.jsx` - Configuração do ambiente de preview (temas, estilos globais)
- `preview-head.html` - HTML injetado no head do iframe de preview
- `manager.js` - Personalização da interface do Storybook
- `mocks/` - Mocks para componentes do Next.js
- `postcss.config.js` - Configuração do PostCSS para o Storybook

## Adicionando Novos Componentes

Para adicionar um novo componente ao Storybook:

1. Crie um arquivo `NomeDoComponente.stories.tsx` na pasta `src/stories/`
2. Use o seguinte modelo:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SeuComponente } from '@/caminho/para/seu/componente';

const meta = {
  title: 'Categoria/NomeDoComponente',
  component: SeuComponente,
  parameters: {
    layout: 'centered', // ou 'fullscreen' para componentes maiores
  },
  tags: ['autodocs'], // Gera documentação automática
} satisfies Meta<typeof SeuComponente>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props do componente
  },
};

// Adicione mais variações conforme necessário
```

## Organização dos Componentes

Os componentes estão organizados nas seguintes categorias:

- `Example/` - Componentes de exemplo do Storybook
- `Migração/` - Componentes migrados para o shadcn/ui

## Documentação

Para melhorar a documentação dos componentes, adicione comentários JSDoc aos seus componentes e propriedades. O Storybook irá usá-los para gerar a documentação automaticamente. 