import { CogIcon } from '@sanity/icons'

export default {
  name: 'siteConfig',
  title: 'Configurações do Site',
  type: 'document',
  icon: CogIcon,
  fields: [
    {
      name: 'title',
      title: 'Título do Site',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Descrição do Site',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required()
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'url',
      title: 'URL do Site',
      type: 'url',
      validation: Rule => Rule.required()
    },
    {
      name: 'copyright',
      title: 'Texto de Copyright',
      type: 'string'
    },
    {
      name: 'socialMedia',
      title: 'Redes Sociais',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url'
        },
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url'
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url'
        },
        {
          name: 'telegram',
          title: 'Telegram',
          type: 'url'
        },
        {
          name: 'discord',
          title: 'Discord',
          type: 'url'
        }
      ]
    },
    {
      name: 'seo',
      title: 'SEO Padrão',
      type: 'seo'
    }
  ]
} 