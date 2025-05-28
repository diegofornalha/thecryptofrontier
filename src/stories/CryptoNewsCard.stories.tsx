import type { Meta, StoryObj } from '@storybook/react';
import CryptoNewsCard from '@/components/sections/CryptoNewsCard';

const meta = {
  title: 'Sections/CryptoNewsCard',
  component: CryptoNewsCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Card de notícias inspirado no design do The Crypto Basic. Suporta modo vertical (padrão), horizontal e featured (destaque).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da notícia',
    },
    slug: {
      control: 'text',
      description: 'Slug para URL da notícia',
    },
    excerpt: {
      control: 'text',
      description: 'Resumo da notícia (opcional)',
    },
    author: {
      control: 'object',
      description: 'Informações do autor',
    },
    publishedAt: {
      control: 'date',
      description: 'Data de publicação',
    },
    category: {
      control: 'object',
      description: 'Categoria da notícia',
    },
    readTime: {
      control: 'number',
      description: 'Tempo de leitura em minutos',
    },
    featured: {
      control: 'boolean',
      description: 'Se é uma notícia em destaque (maior)',
    },
    horizontal: {
      control: 'boolean',
      description: 'Se deve usar layout horizontal',
    },
  },
} satisfies Meta<typeof CryptoNewsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage = {
  _type: 'image',
  asset: {
    _id: 'image-123',
    _type: 'reference',
    _ref: 'image-123',
  },
};

export const Default: Story = {
  args: {
    title: 'Bitcoin ultrapassa $70.000 e estabelece novo recorde histórico',
    slug: 'bitcoin-ultrapassa-70000-novo-recorde',
    excerpt: 'A principal criptomoeda do mundo atingiu um novo marco histórico, impulsionada pela aprovação de ETFs spot nos Estados Unidos.',
    coverImage: mockImage,
    author: {
      firstName: 'João',
      lastName: 'Silva',
    },
    publishedAt: new Date().toISOString(),
    category: {
      title: 'Bitcoin',
      slug: 'bitcoin',
    },
    readTime: 5,
  },
};

export const Horizontal: Story = {
  args: {
    ...Default.args,
    horizontal: true,
    title: 'Ethereum prepara grande atualização para reduzir taxas de transação',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card em layout horizontal, ideal para listagens laterais ou widgets.',
      },
    },
  },
};

export const Featured: Story = {
  args: {
    ...Default.args,
    featured: true,
    title: 'Análise Completa: O que esperar do mercado cripto em 2024',
    excerpt: 'Especialistas compartilham suas previsões para Bitcoin, Ethereum e as principais altcoins. Veja os fatores que podem impactar o mercado.',
  },
  decorators: [
    (Story) => (
      <div className="max-w-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Card em destaque com tamanho maior, ideal para notícias principais.',
      },
    },
  },
};

export const SemImagem: Story = {
  args: {
    title: 'DeFi atinge $100 bilhões em valor total bloqueado',
    slug: 'defi-100-bilhoes-tvl',
    author: {
      firstName: 'Maria',
      lastName: 'Santos',
    },
    publishedAt: new Date().toISOString(),
    category: {
      title: 'DeFi',
      slug: 'defi',
    },
    readTime: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card sem imagem de capa, usa placeholder.',
      },
    },
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CryptoNewsCard
        title="Solana registra crescimento de 300% em TVL"
        slug="solana-crescimento-tvl"
        coverImage={mockImage}
        author={{ firstName: 'Pedro', lastName: 'Costa' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'Altcoins', slug: 'altcoins' }}
        readTime={4}
      />
      <CryptoNewsCard
        title="SEC aprova primeiro ETF de Bitcoin spot nos EUA"
        slug="sec-aprova-etf-bitcoin"
        coverImage={mockImage}
        author={{ firstName: 'Ana', lastName: 'Lima' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'Regulação', slug: 'regulacao' }}
        readTime={6}
      />
      <CryptoNewsCard
        title="NFTs voltam a ganhar força com novos projetos"
        slug="nfts-novos-projetos"
        coverImage={mockImage}
        author={{ firstName: 'Lucas', lastName: 'Oliveira' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'NFTs', slug: 'nfts' }}
        readTime={5}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemplo de grid com múltiplos cards.',
      },
    },
  },
};

export const ListaHorizontal: Story = {
  render: () => (
    <div className="max-w-[400px] space-y-4">
      <CryptoNewsCard
        horizontal
        title="Binance lança novo programa de staking"
        slug="binance-programa-staking"
        coverImage={mockImage}
        author={{ firstName: 'Carlos', lastName: 'Mendes' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'Exchanges', slug: 'exchanges' }}
        readTime={3}
      />
      <CryptoNewsCard
        horizontal
        title="Cardano anuncia parceria com governo africano"
        slug="cardano-parceria-africa"
        coverImage={mockImage}
        author={{ firstName: 'Julia', lastName: 'Ferreira' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'Blockchain', slug: 'blockchain' }}
        readTime={4}
      />
      <CryptoNewsCard
        horizontal
        title="MicroStrategy compra mais 5.000 bitcoins"
        slug="microstrategy-compra-bitcoins"
        coverImage={mockImage}
        author={{ firstName: 'Roberto', lastName: 'Silva' }}
        publishedAt={new Date().toISOString()}
        category={{ title: 'Mercado', slug: 'mercado' }}
        readTime={2}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Lista de cards horizontais, ideal para sidebar.',
      },
    },
  },
};