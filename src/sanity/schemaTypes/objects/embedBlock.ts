import {defineField, defineType} from 'sanity'
import {FiCode} from 'react-icons/fi'

export default defineType({
  name: 'embedBlock',
  title: 'Embed',
  type: 'object',
  icon: FiCode,
  fields: [
    defineField({
      name: 'embedType',
      title: 'Tipo de Embed',
      type: 'string',
      options: {
        list: [
          {title: 'Twitter/X', value: 'twitter'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'TradingView', value: 'tradingview'},
          {title: 'CodePen', value: 'codepen'},
          {title: 'GitHub Gist', value: 'gist'},
          {title: 'Custom iframe', value: 'iframe'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'URL do conteúdo a ser incorporado',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https']
      }),
    }),
    defineField({
      name: 'caption',
      title: 'Legenda (opcional)',
      type: 'string',
    }),
    defineField({
      name: 'height',
      title: 'Altura',
      type: 'number',
      description: 'Altura em pixels (apenas para alguns tipos)',
      hidden: ({parent}) => !['youtube', 'tradingview', 'iframe'].includes(parent?.embedType),
      initialValue: 400,
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Proporção',
      type: 'string',
      options: {
        list: [
          {title: '16:9', value: '16:9'},
          {title: '4:3', value: '4:3'},
          {title: '1:1', value: '1:1'},
          {title: '9:16', value: '9:16'},
        ],
      },
      hidden: ({parent}) => !['youtube', 'iframe'].includes(parent?.embedType),
      initialValue: '16:9',
    }),
  ],
  preview: {
    select: {
      embedType: 'embedType',
      url: 'url',
      caption: 'caption',
    },
    prepare({embedType, url, caption}) {
      const typeLabels = {
        twitter: 'Twitter/X',
        youtube: 'YouTube',
        tradingview: 'TradingView',
        codepen: 'CodePen',
        gist: 'GitHub Gist',
        iframe: 'Custom iframe',
      }
      return {
        title: caption || url || 'Embed',
        subtitle: typeLabels[embedType] || 'Embed',
      }
    },
  },
})