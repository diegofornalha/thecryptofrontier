import { TagIcon } from '@sanity/icons'

export default {
  name: 'tag',
  title: 'Tag',
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
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description'
    }
  }
} 