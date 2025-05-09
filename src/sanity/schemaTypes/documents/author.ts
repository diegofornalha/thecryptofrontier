export default {
  name: 'author',
  title: 'Autor',
  type: 'document',
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
      }
    },
    {
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo'
        }
      ]
    },
    {
      name: 'role',
      title: 'Cargo',
      type: 'string'
    },
    {
      name: 'bio',
      title: 'Biografia',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    },
    {
      name: 'socialLinks',
      title: 'Redes Sociais',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Twitter/X', value: 'twitter' },
                  { title: 'GitHub', value: 'github' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'Website', value: 'website' }
                ]
              }
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url'
            }
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url'
            }
          }
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