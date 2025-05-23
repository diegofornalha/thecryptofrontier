import type { Meta, StoryObj } from '@storybook/react';
import BreakingNewsTicker from '../components/sections/home/BreakingNewsTicker';

const meta: Meta<typeof BreakingNewsTicker> = {
  title: 'Components/Home/BreakingNewsTicker',
  component: BreakingNewsTicker,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story com dados mockados
export const Default: Story = {
  args: {
    news: [
      { title: "Bitcoin atinge nova máxima histórica de $75.000 em meio a aprovação de ETF", slug: "bitcoin-75k" },
      { title: "Ethereum ultrapassa $4.000 após atualização Dencun ser confirmada", slug: "eth-4k" },
      { title: "SEC aprova primeiro ETF de Bitcoin spot nos Estados Unidos", slug: "sec-etf" },
      { title: "MicroStrategy compra mais 10.000 BTC aumentando reservas para 189.000", slug: "microstrategy-btc" },
      { title: "Binance anuncia nova parceria com governo de Dubai para hub cripto", slug: "binance-dubai" }
    ]
  },
};

// Story com apenas uma notícia
export const SingleNews: Story = {
  args: {
    news: [{ title: "Breaking: Bitcoin ultrapassa marca histórica de $100.000", slug: "bitcoin-100k" }]
  },
};

// Story com notícias em português
export const PortugueseNews: Story = {
  args: {
    news: [
      { title: "Bitcoin atinge nova máxima histórica: O que esperar do mercado cripto", slug: "bitcoin-maxima" },
      { title: "Banco Central do Brasil anuncia novas regras para criptomoedas", slug: "bcb-regras" },
      { title: "Ethereum se prepara para próxima grande atualização", slug: "eth-update" },
      { title: "Analistas preveem alta volatilidade nos próximos dias", slug: "volatilidade" },
      { title: "DeFi ultrapassa $100 bilhões em valor total bloqueado", slug: "defi-100b" }
    ]
  },
};

// Story sem props (usa dados do Sanity)
export const LiveData: Story = {
  args: {},
};

// Story com notícias longas
export const LongNews: Story = {
  args: {
    news: [
      { title: "URGENTE: Federal Reserve mantém taxas de juros inalteradas, mercado de criptomoedas reage positivamente com Bitcoin subindo 5% nas últimas 24 horas", slug: "fed-taxas" },
      { title: "Vitalik Buterin anuncia roadmap completo para Ethereum 3.0: Sharding, zkEVM e outras inovações prometem revolucionar a rede", slug: "eth-3" },
      { title: "Relatório da JPMorgan indica que investidores institucionais estão aumentando exposição a Bitcoin como proteção contra inflação", slug: "jpmorgan-btc" }
    ]
  },
};

// Story com visualização mobile
export const MobileView: Story = {
  args: {
    news: [
      { title: "Bitcoin ultrapassa $50,000", slug: "bitcoin-50k" },
      { title: "Ethereum 2.0 lançado com sucesso", slug: "eth-2" },
      { title: "Solana atinge novo recorde de velocidade", slug: "solana-speed" }
    ]
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm mx-auto">
        <Story />
      </div>
    ),
  ],
};