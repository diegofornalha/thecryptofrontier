import type { Meta, StoryObj } from '@storybook/react';
import BreakingNewsTicker from '@/components/sections/home/breaking-news-ticker';

const meta = {
  title: 'Sections/Home/BreakingNewsTicker',
  component: BreakingNewsTicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Ticker de últimas notícias com rotação automática. Exibe as últimas publicações do blog com navegação manual e links para os posts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    news: {
      control: 'object',
      description: 'Array de notícias para exibir. Se não fornecido, busca do Strapi CMS.',
    },
  },
} satisfies Meta<typeof BreakingNewsTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNews = [
  { title: "Bitcoin atinge nova máxima histórica de $75.000", slug: "bitcoin-nova-maxima-75000" },
  { title: "Ethereum 2.0: Tudo que você precisa saber sobre a atualização", slug: "ethereum-2-0-atualizacao" },
  { title: "SEC aprova primeiro ETF de Bitcoin spot nos EUA", slug: "sec-aprova-etf-bitcoin-spot" },
  { title: "Solana supera Cardano em capitalização de mercado", slug: "solana-supera-cardano" },
  { title: "MicroStrategy compra mais 3.000 bitcoins", slug: "microstrategy-compra-bitcoins" },
];

export const Default: Story = {
  args: {
    news: mockNews,
  },
};

export const ComUmaNoticia: Story = {
  args: {
    news: [
      { title: "Notícia única sem rotação automática", slug: "noticia-unica" }
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Quando há apenas uma notícia, os botões de navegação ficam desabilitados.',
      },
    },
  },
};

export const SemSlug: Story = {
  args: {
    news: [
      { title: "Notícia sem link - apenas texto informativo" },
      { title: "Outra notícia sem link de redirecionamento" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Notícias sem slug não são clicáveis, apenas exibem o texto.',
      },
    },
  },
};

export const BuscandoDados: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Quando não há propriedade news, o componente busca automaticamente do Strapi CMS.',
      },
    },
  },
};

export const TitulosLongos: Story = {
  args: {
    news: [
      { 
        title: "Análise completa: Como as novas regulamentações europeias podem impactar o mercado de criptomoedas nos próximos anos", 
        slug: "analise-regulamentacoes-europeias" 
      },
      { 
        title: "Guia definitivo para iniciantes: Entendendo blockchain, criptomoedas e o futuro das finanças descentralizadas", 
        slug: "guia-iniciantes-blockchain" 
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Títulos longos são truncados com ellipsis devido ao whitespace-nowrap.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    news: mockNews,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Visualização mobile do ticker de notícias.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {
    news: mockNews,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Visualização tablet do ticker de notícias.',
      },
    },
  },
};