export default {
  name: 'cryptoMeta',
  title: 'Informações da Criptomoeda',
  type: 'object',
  fields: [
    {
      name: 'symbol',
      title: 'Símbolo',
      type: 'string',
      description: 'Ex: BTC, ETH, SOL',
    },
    {
      name: 'currentPrice',
      title: 'Preço Atual',
      type: 'number',
      description: 'Preço em USD',
    },
    {
      name: 'priceChange24h',
      title: 'Variação 24h',
      type: 'number',
      description: 'Variação de preço nas últimas 24h em porcentagem',
    },
    {
      name: 'marketCap',
      title: 'Capitalização de Mercado',
      type: 'number',
      description: 'Valor em USD',
    },
    {
      name: 'rank',
      title: 'Ranking de Mercado',
      type: 'number',
      description: 'Posição no ranking de mercado',
    },
    {
      name: 'lastUpdated',
      title: 'Última Atualização',
      type: 'datetime',
    },
    {
      name: 'priceSource',
      title: 'Fonte de Dados',
      type: 'string',
      description: 'Ex: CoinGecko, CoinMarketCap',
    }
  ]
} 