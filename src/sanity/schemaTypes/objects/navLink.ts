import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'navLink',
  title: 'Link de Navegação',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'isExternal',
      title: 'É Link Externo?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'icon',
      title: 'Ícone',
      type: 'string',
      description: 'Nome do ícone (opcional)',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
    },
  },
}); 