import { UserIcon } from '@sanity/icons'

export default {
  name: 'author',
  title: 'Autor',
  type: 'document',
  icon: UserIcon,
  fields: [
    {
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'bio',
      title: 'Biografia',
      type: 'array',
      of: [
        {
          title: 'Block',
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: []
        }
      ]
    },
    {
      name: 'email',
      title: 'Email',
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
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url'
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url'
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'url'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image'
    }
  }
} 