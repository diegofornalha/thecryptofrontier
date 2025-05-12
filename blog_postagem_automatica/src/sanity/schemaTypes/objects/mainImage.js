export default {
  name: 'mainImage',
  title: 'Imagem Principal',
  type: 'object',
  fields: [
    {
      name: 'asset',
      title: 'Imagem',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'alt',
      title: 'Texto Alternativo',
      type: 'string',
      description: 'Importante para SEO e acessibilidade',
      validation: Rule => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Legenda',
      type: 'string',
    },
    {
      name: 'attribution',
      title: 'Atribuição',
      type: 'string',
      description: 'Crédito da imagem, se necessário',
    }
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'alt',
    },
  },
} 