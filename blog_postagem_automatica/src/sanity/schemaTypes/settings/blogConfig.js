import { CogIcon } from '@sanity/icons'

export default {
  name: 'blogConfig',
  title: 'Configurações do Blog',
  type: 'document',
  icon: CogIcon,
  fields: [
    {
      name: 'title',
      title: 'Título da Configuração',
      type: 'string',
      initialValue: 'Configuração Principal',
      validation: Rule => Rule.required()
    },
    {
      name: 'defaultAuthor',
      title: 'Autor Padrão',
      description: 'Autor que será usado por padrão em todas as publicações automáticas',
      type: 'reference',
      to: { type: 'author' },
      validation: Rule => Rule.required()
    },
    {
      name: 'monitoringFrequency',
      title: 'Frequência de Monitoramento (minutos)',
      description: 'Intervalo entre verificações de novos conteúdos',
      type: 'number',
      initialValue: 60,
      validation: Rule => Rule.required().min(15).max(1440)
    },
    {
      name: 'activeFeeds',
      title: 'Feeds RSS Ativos',
      description: 'Lista de feeds RSS que estão sendo monitorados',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Nome do Site',
              type: 'string'
            },
            {
              name: 'url',
              title: 'URL do Feed',
              type: 'url'
            },
            {
              name: 'active',
              title: 'Ativo',
              type: 'boolean',
              initialValue: true
            }
          ]
        }
      ]
    },
    {
      name: 'defaultCategories',
      title: 'Categorias Padrão',
      description: 'Categorias usadas quando não é possível determinar a categoria de um artigo',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      authorName: 'defaultAuthor.name'
    },
    prepare(selection) {
      const { title, authorName } = selection;
      return {
        title: title,
        subtitle: `Autor padrão: ${authorName || 'Não definido'}`
      };
    }
  }
} 