import type { Meta, StoryObj } from '@storybook/react';
import AdBanner from '@/components/sections/home/AdBanner';

const meta = {
  title: 'Sections/Home/AdBanner',
  component: AdBanner,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Banner publicitário com animações de Bitcoin e foguete. Usado para promover ofertas e serviços relacionados a criptomoedas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título principal do banner',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo ou descrição da oferta',
    },
    link: {
      control: 'text',
      description: 'URL de destino ao clicar no banner',
    },
    targetBlank: {
      control: 'boolean',
      description: 'Se deve abrir o link em nova aba',
    },
    showBitcoinAnimation: {
      control: 'boolean',
      description: 'Se deve mostrar as animações de Bitcoin e foguete',
    },
  },
} satisfies Meta<typeof AdBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Sinais Cripto Expert',
    subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
    link: 'https://eternityscale.com.br/sce-blog/',
    targetBlank: true,
    showBitcoinAnimation: true,
  },
};

export const SemAnimacao: Story = {
  args: {
    title: 'Aprenda sobre Criptomoedas',
    subtitle: 'Curso completo para iniciantes no mundo das criptomoedas.',
    link: '/cursos/cripto-iniciantes',
    targetBlank: false,
    showBitcoinAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner sem as animações de Bitcoin e foguete, apenas com fundo gradiente.',
      },
    },
  },
};

export const LinkInterno: Story = {
  args: {
    title: 'Newsletter Crypto Insights',
    subtitle: 'Receba análises diárias do mercado cripto diretamente no seu email.',
    link: '/newsletter',
    targetBlank: false,
    showBitcoinAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner com link interno (usa Next.js Link ao invés de tag <a>).',
      },
    },
  },
};

export const SemLink: Story = {
  args: {
    title: 'Em Breve: Nova Plataforma',
    subtitle: 'Estamos preparando algo incrível para você. Aguarde novidades!',
    link: undefined,
    targetBlank: false,
    showBitcoinAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner sem link - apenas visual, não clicável.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    title: 'Oferta Mobile',
    subtitle: 'Texto otimizado para visualização em dispositivos móveis.',
    link: 'https://example.com',
    targetBlank: true,
    showBitcoinAnimation: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Visualização do banner em dispositivo móvel.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {
    title: 'Visualização Tablet',
    subtitle: 'Banner responsivo adaptado para tablets.',
    link: 'https://example.com',
    targetBlank: true,
    showBitcoinAnimation: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Visualização do banner em tablet.',
      },
    },
  },
};