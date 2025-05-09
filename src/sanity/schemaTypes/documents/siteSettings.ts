export default {
  name: 'siteSettings',
  title: 'Configurações do Site',
  type: 'document',
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
      rows: 3
    },
    {
      name: 'logo',
      title: 'Logo',
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
      name: 'headerNav',
      title: 'Navegação do Cabeçalho',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Rótulo',
              type: 'string'
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string'
            },
            {
              name: 'isButton',
              title: 'É um Botão',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'subItems',
              title: 'Subitens',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      title: 'Rótulo',
                      type: 'string'
                    },
                    {
                      name: 'url',
                      title: 'URL',
                      type: 'string'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'footerNav',
      title: 'Navegação do Rodapé',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Rótulo',
              type: 'string'
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string'
            }
          ]
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
                  { title: 'Facebook', value: 'facebook' }
                ]
              }
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url'
            }
          ]
        }
      ]
    },
    {
      name: 'defaultSeo',
      title: 'SEO Padrão',
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
  ]
} 