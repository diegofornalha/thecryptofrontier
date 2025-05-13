import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'cryptoMeta',
  title: 'Metadados de Criptomoeda',
  type: 'object',
  fields: [
    defineField({
      name: 'coinName',
      title: 'Nome da Moeda',
      type: 'string',
      description: 'Ex: Bitcoin, Ethereum, etc.',
    }),
    defineField({
      name: 'coinSymbol',
      title: 'Símbolo',
      type: 'string',
      description: 'Ex: BTC, ETH, etc.',
    }),
    defineField({
      name: 'coinLogo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'currentPrice',
      title: 'Preço Atual',
      type: 'number',
      description: 'Preço no momento da publicação',
    }),
    defineField({
      name: 'priceChange24h',
      title: 'Variação 24h (%)',
      type: 'number',
      description: 'Variação percentual nas últimas 24 horas',
    }),
    defineField({
      name: 'marketCap',
      title: 'Capitalização de Mercado',
      type: 'number',
    }),
    defineField({
      name: 'coingeckoId',
      title: 'ID CoinGecko',
      type: 'string',
      description: 'Identificador da moeda no CoinGecko para atualização automática',
    }),
    defineField({
      name: 'links',
      title: 'Links Relevantes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Título',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
        },
      ],
    }),
  ],
}); 