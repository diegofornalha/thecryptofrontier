import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'mainImage',
  title: 'Imagem Principal',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto Alternativo',
      type: 'string',
      description: 'Importante para SEO e acessibilidade.',
    }),
    defineField({
      name: 'caption',
      title: 'Legenda',
      type: 'string',
    }),
    defineField({
      name: 'attribution',
      title: 'Atribuição',
      type: 'string',
      description: 'Crédito da imagem (se aplicável)',
    }),
  ],
  preview: {
    select: {
      imageUrl: 'asset.url',
      title: 'alt',
    },
  },
}); 