import { defineField, defineType } from 'sanity';
import { FiFileText } from 'react-icons/fi';

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: FiFileText,
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
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(100),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
      validation: Rule => Rule.required(),
      group: 'metadata',
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'mainImage',
      group: 'content',
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: { type: 'author' },
      validation: Rule => Rule.required(),
      group: 'metadata',
    }),
    defineField({
      name: 'source',
      title: 'Origem do Post',
      type: 'string',
      options: {
        list: [
          { title: 'Manual', value: 'manual' },
          { title: 'Agent AI', value: 'agent' },
          { title: 'RSS Import', value: 'rss' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      description: 'Como este post foi criado',
      group: 'metadata',
      readOnly: ({ currentUser }) => {
        // Apenas admins podem alterar a origem
        return !currentUser?.roles?.some(r => r.name === 'administrator');
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(300),
      description: 'Breve descrição do post para SEO e previews',
      group: 'content',
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
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Destaque', value: 'highlight'},
            {title: 'Nota', value: 'note'},
            {title: 'Aviso', value: 'warning'},
          ],
          lists: [
            {title: 'Lista', value: 'bullet'},
            {title: 'Lista Numerada', value: 'number'},
            {title: 'Checklist', value: 'checklist'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link externo',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: Rule => Rule.uri({
                      scheme: ['http', 'https', 'mailto', 'tel']
                    }),
                  },
                  {
                    name: 'target',
                    title: 'Abrir em nova aba',
                    type: 'string',
                    options: {
                      list: [
                        {title: 'Mesma aba', value: '_self'},
                        {title: 'Nova aba', value: '_blank'}
                      ],
                    },
                    initialValue: '_blank',
                  }
                ]
              },
              {
                name: 'internalLink',
                type: 'object',
                title: 'Link interno',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    title: 'Referência',
                    to: [
                      {type: 'post'},
                      {type: 'page'},
                    ],
                  },
                ]
              },
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
        { type: 'code' },
        { type: 'highlightBox' },
        { type: 'cryptoWidget' },
        { type: 'embedBlock' },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social',
      type: 'seo',
      group: 'seo',
      description: 'Otimização para mecanismos de busca e redes sociais',
    }),
    defineField({
      name: 'featured',
      title: 'Post em Destaque',
      type: 'boolean',
      initialValue: false,
      description: 'Mostrar este post em destaque na homepage',
      group: 'metadata',
    }),
    defineField({
      name: 'readingTime',
      title: 'Tempo de Leitura',
      type: 'number',
      description: 'Tempo estimado de leitura em minutos',
      validation: Rule => Rule.min(1).max(60).positive().integer(),
      group: 'metadata',
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Posts Relacionados',
      type: 'array',
      of: [{ 
        type: 'reference', 
        to: { type: 'post' },
        options: {
          disableNew: true,
          filter: ({ document }) => ({
            filter: '_id != $id',
            params: {
              id: document._id
            }
          })
        }
      }],
      validation: Rule => Rule.max(5).unique(),
      description: 'Sugestões de posts relacionados (máx. 5)',
      group: 'metadata',
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
    {
      title: 'Data de Publicação (Mais Antiga)',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Título (A-Z)',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Título (Z-A)',
      name: 'titleDesc',
      by: [
        {field: 'title', direction: 'desc'}
      ]
    }
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
      const authorName = author || 'Sem autor';
      
      return {
        title,
        subtitle: `${authorName} | ${formattedDate}`,
        media,
      };
    },
  },
}); 