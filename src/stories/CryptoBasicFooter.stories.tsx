import type { Meta, StoryObj } from '@storybook/react';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';

const meta = {
  title: 'Sections/CryptoBasicFooter',
  component: CryptoBasicFooter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Footer inspirado no design do The Crypto Basic. Inclui links organizados por categorias, redes sociais, newsletter e informações de copyright.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CryptoBasicFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Footer completo com todas as seções: logo, links categorizados, redes sociais, newsletter e copyright.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Versão mobile do footer com layout responsivo em coluna única.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Versão tablet do footer com layout de 2 colunas.',
      },
    },
  },
};

export const WithScrolledPage: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        {/* Conteúdo simulado acima do footer */}
        <div className="min-h-screen bg-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-4">Página de Exemplo</h1>
          <p className="mb-4">
            Este exemplo mostra como o footer aparece ao final de uma página com conteúdo.
          </p>
          <p className="text-gray-600">
            Role para baixo para ver o footer no contexto de uma página completa.
          </p>
        </div>
        {/* Footer */}
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Footer exibido no contexto de uma página com conteúdo, simulando uso real.',
      },
    },
  },
};