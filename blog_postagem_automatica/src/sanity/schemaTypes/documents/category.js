import { TagIcon } from '@sanity/icons'

export default {
  name: 'category',
  title: 'Categoria',
  type: 'document',
  icon: TagIcon,
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Descrição',
      type: 'text',
      rows: 3
    },
    {
      name: 'icon',
      title: 'Ícone',
      type: 'string',
      description: 'Nome do ícone (ex: "bitcoin", "ethereum")'
    },
    {
      name: 'color',
      title: 'Cor',
      type: 'string',
      description: 'Código hexadecimal da cor (ex: "#f7931a" para Bitcoin)'
    },
    {
      name: 'featuredImage',
      title: 'Imagem Destacada',
      type: 'image',
      options: {
        hotspot: true
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'featuredImage'
    }
  }
} 