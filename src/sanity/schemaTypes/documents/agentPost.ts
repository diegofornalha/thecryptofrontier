import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'agentPost',
  title: 'Post do Agente (Simplificado)',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Conteúdo',
      default: true,
    },
    {
      name: 'metadata',
      title: 'Metadados',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required().min(10).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'mainImage',
      group: 'content',
      description: 'Imagem gerada automaticamente pelo agente',
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Breve descrição do artigo (máx. 300 caracteres)',
      validation: Rule => Rule.max(300),
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      group: 'content',
      of: [
        { 
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Legenda',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texto Alternativo',
            },
          ],
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
      group: 'metadata',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      group: 'metadata',
      to: { type: 'author' },
      description: 'Autor do artigo',
    }),
    defineField({
      name: 'originalSource',
      title: 'Fonte Original',
      type: 'object',
      group: 'metadata',
      fields: [
        {
          name: 'url',
          title: 'URL Original',
          type: 'url',
        },
        {
          name: 'title',
          title: 'Título Original',
          type: 'string',
        },
        {
          name: 'site',
          title: 'Site de Origem',
          type: 'string',
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Data de Publicação (Mais Recente)',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      date: 'publishedAt',
      author: 'author.name',
    },
    prepare({ title, media, date, author }) {
      const formattedDate = date ? new Date(date).toLocaleDateString('pt-BR') : '';
      const authorName = author || 'Agente AI';
      
      return {
        title,
        subtitle: `${authorName} | ${formattedDate}`,
        media,
      };
    },
  },
});