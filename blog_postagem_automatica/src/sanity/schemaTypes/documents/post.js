import { DocumentTextIcon } from '@sanity/icons'

export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {
      name: 'content',
      title: 'Conteúdo',
    },
    {
      name: 'meta',
      title: 'Meta',
    },
    {
      name: 'crypto',
      title: 'Crypto',
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(120),
      group: 'content',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      group: 'content',
    },
    {
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(200),
      group: 'content',
    },
    {
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'mainImage',
      group: 'content',
    },
    {
      name: 'body',
      title: 'Conteúdo',
      type: 'blockContent',
      group: 'content',
    },
    {
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      group: 'meta',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'meta',
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: {type: 'author'},
      group: 'meta',
    },
    {
      name: 'categories',
      title: 'Categorias',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
      group: 'meta',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: {type: 'tag'}}],
      group: 'meta',
    },
    {
      name: 'cryptoMeta',
      title: 'Informações Crypto',
      type: 'cryptoMeta',
      group: 'crypto',
    },
    {
      name: 'originalSource',
      title: 'Fonte Original',
      type: 'object',
      group: 'crypto',
      fields: [
        {
          name: 'url',
          title: 'URL',
          type: 'url',
        },
        {
          name: 'name',
          title: 'Nome',
          type: 'string',
        },
        {
          name: 'publishedAt',
          title: 'Data de Publicação Original',
          type: 'datetime',
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      category: 'categories.0.title',
    },
    prepare(selection) {
      const {author, category} = selection
      return Object.assign({}, selection, {
        subtitle: author && category ? `${category} | por ${author}` : category || author,
      })
    },
  },
} 