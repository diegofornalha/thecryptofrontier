import {defineField, defineType} from 'sanity'
import {FiTrendingUp} from 'react-icons/fi'

export default defineType({
  name: 'cryptoWidget',
  title: 'Widget de Criptomoeda',
  type: 'object',
  icon: FiTrendingUp,
  fields: [
    defineField({
      name: 'widgetType',
      title: 'Tipo de Widget',
      type: 'string',
      options: {
        list: [
          {title: 'Gráfico de Preço', value: 'priceChart'},
          {title: 'Ticker de Preço', value: 'priceTicker'},
          {title: 'Conversor', value: 'converter'},
          {title: 'Lista de Mercado', value: 'marketList'},
          {title: 'Mapa de Calor', value: 'heatmap'},
        ],
      },
      initialValue: 'priceChart',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'symbol',
      title: 'Símbolo da Moeda',
      type: 'string',
      description: 'Ex: BTC, ETH, SOL',
      validation: Rule => Rule.required().uppercase(),
    }),
    defineField({
      name: 'vsCurrency',
      title: 'Moeda de Comparação',
      type: 'string',
      options: {
        list: [
          {title: 'USD', value: 'usd'},
          {title: 'EUR', value: 'eur'},
          {title: 'BRL', value: 'brl'},
          {title: 'BTC', value: 'btc'},
        ],
      },
      initialValue: 'usd',
    }),
    defineField({
      name: 'height',
      title: 'Altura do Widget',
      type: 'number',
      description: 'Altura em pixels',
      initialValue: 400,
      validation: Rule => Rule.min(200).max(800),
    }),
    defineField({
      name: 'theme',
      title: 'Tema',
      type: 'string',
      options: {
        list: [
          {title: 'Claro', value: 'light'},
          {title: 'Escuro', value: 'dark'},
          {title: 'Automático', value: 'auto'},
        ],
      },
      initialValue: 'auto',
    }),
  ],
  preview: {
    select: {
      symbol: 'symbol',
      widgetType: 'widgetType',
    },
    prepare({symbol, widgetType}) {
      const widgetLabels = {
        priceChart: 'Gráfico',
        priceTicker: 'Ticker',
        converter: 'Conversor',
        marketList: 'Lista',
        heatmap: 'Mapa de Calor',
      }
      return {
        title: `${symbol || 'CRYPTO'} - ${widgetLabels[widgetType] || 'Widget'}`,
        subtitle: 'Widget de Criptomoeda',
      }
    },
  },
})