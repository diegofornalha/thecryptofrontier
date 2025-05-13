import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'header',
  title: 'Cabeçalho',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'navLinks',
      title: 'Links de Navegação',
      type: 'array',
      of: [{ type: 'navLink' }],
      validation: Rule => Rule.unique().error('Os links devem ser únicos'),
    }),
    defineField({
      name: 'enableSearch',
      title: 'Habilitar Busca',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'enableDarkMode',
      title: 'Habilitar Alternador de Tema',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'ctaButton',
      title: 'Botão de Chamada para Ação',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Texto',
          type: 'string',
        },
        {
          name: 'url',
          title: 'URL',
          type: 'string',
        },
        {
          name: 'isEnabled',
          title: 'Habilitado',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),
    defineField({
      name: 'sticky',
      title: 'Fixar no Topo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'logo',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Cabeçalho do Site',
        media,
      };
    },
  },
}); 