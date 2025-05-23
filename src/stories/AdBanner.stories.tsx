import type { Meta, StoryObj } from '@storybook/react';
import AdBanner from '../components/sections/home/AdBanner';

const meta: Meta<typeof AdBanner> = {
  title: 'Components/AdBanner',
  component: AdBanner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente de banner publicitário para ser usado na home e outras páginas do site. Suporta imagem, texto sobreposto, links e animações de Bitcoin.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    imageUrl: {
      control: 'text',
      description: 'URL da imagem do banner',
    },
    title: {
      control: 'text',
      description: 'Título opcional sobreposto à imagem',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo opcional sobreposto à imagem',
    },
    link: {
      control: 'text',
      description: 'URL para onde o banner deve direcionar quando clicado',
    },
    targetBlank: {
      control: 'boolean',
      description: 'Se true, abre o link em nova aba',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais',
    },
    showBitcoinAnimation: {
      control: 'boolean',
      description: 'Se true, mostra animações de Bitcoin, estrelas e foguete no fundo',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story padrão - com animações Bitcoin
export const Default: Story = {
  args: {
    showBitcoinAnimation: true,
  },
};

// Banner com texto e animações Bitcoin
export const WithTextAndAnimations: Story = {
  args: {
    title: 'Sinais Cripto Expert',
    subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado',
    showBitcoinAnimation: true,
  },
};

// Banner sem animações - apenas imagem
export const WithoutAnimations: Story = {
  args: {
    title: 'Banner Sem Animações',
    subtitle: 'Versão simples sem Bitcoin animado',
    showBitcoinAnimation: false,
  },
};

// Banner com link externo e animações
export const WithExternalLink: Story = {
  args: {
    title: 'Sinais Cripto Expert',
    subtitle: 'Copie e cole recomendações de moedas promissoras',
    link: 'https://example.com',
    targetBlank: true,
    showBitcoinAnimation: true,
  },
};

// Banner com link interno
export const WithInternalLink: Story = {
  args: {
    title: 'Últimas Notícias Cripto',
    subtitle: 'Fique por dentro das tendências do mercado',
    link: '/blog',
    targetBlank: false,
    showBitcoinAnimation: true,
  },
};

// Banner apenas imagem com animações
export const ImageOnlyWithAnimations: Story = {
  args: {
    link: 'https://example.com',
    showBitcoinAnimation: true,
  },
};

// Banner apenas imagem sem animações
export const ImageOnlyClean: Story = {
  args: {
    link: 'https://example.com',
    showBitcoinAnimation: false,
  },
};

// Banner customizado com efeitos completos
export const FullEffects: Story = {
  args: {
    title: '🚀 Bitcoin Expert',
    subtitle: 'Maximize seus lucros com sinais profissionais de cripto',
    link: 'https://wa.me/5511999999999',
    className: 'shadow-2xl',
    showBitcoinAnimation: true,
  },
}; 