import type { Meta, StoryObj } from '@storybook/react';
import NewsHeader from '@/components/sections/NewsHeader';

const meta = {
  title: 'Components/NewsHeader',
  component: NewsHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Header principal do site, inspirado no design minimalista do The Crypto Basic. Apresenta busca, logo centralizado e menu grid.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NewsHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Header padrão com funcionalidade de busca, logo centralizado e menu grid.',
      },
    },
  },
};

export const MenuOpen: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstração do header com menu aberto. O menu grid apresenta as principais seções do site.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simula abertura do menu após 1 segundo
    setTimeout(() => {
      const menuButton = canvasElement.querySelector('[aria-label="Menu"]');
      if (menuButton instanceof HTMLElement) {
        menuButton.click();
      }
    }, 1000);
  },
};

export const SearchActive: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Header com campo de busca ativo, demonstrando a funcionalidade de pesquisa.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simula clique na busca após 1 segundo
    setTimeout(() => {
      const searchButton = canvasElement.querySelector('[aria-label="Buscar"]');
      if (searchButton instanceof HTMLElement) {
        searchButton.click();
      }
    }, 1000);
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
        story: 'Versão mobile do header, mantendo a mesma estrutura mas adaptada para telas menores.',
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
        story: 'Versão tablet do header, com layout responsivo intermediário.',
      },
    },
  },
};