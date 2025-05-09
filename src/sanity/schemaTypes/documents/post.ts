export default {
  name: 'post',
  title: 'Post',
  type: 'document',
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
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: {type: 'author'}
    },
    {
      name: 'featuredImage',
      title: 'Imagem Destacada',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo',
        },
      ]
    },
    {
      name: 'categories',
      title: 'Categorias',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
    },
    {
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
    },
    {
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          fields: [
            {
              type: 'text',
              name: 'alt',
              title: 'Texto Alternativo',
              fieldset: 'imageDetails'
            }
          ],
          fieldsets: [
            {
              name: 'imageDetails',
              title: 'Detalhes da imagem',
              options: { collapsible: true }
            }
          ],
          options: {
            hotspot: true
          }
        },
        {
          type: 'code',
          options: {
            withFilename: true,
          },
        }
      ]
    },
    {
      name: 'isFeatured',
      title: 'Destacado',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'isDraft',
      title: 'Rascunho',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Título',
          type: 'string'
        },
        {
          name: 'metaDescription',
          title: 'Meta Descrição',
          type: 'text',
          rows: 3
        },
        {
          name: 'socialImage',
          title: 'Imagem Social',
          type: 'image'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage'
    },
    prepare(selection) {
      const {author} = selection
      return Object.assign({}, selection, {
        subtitle: author && `por ${author}`
      })
    }
  }
} 