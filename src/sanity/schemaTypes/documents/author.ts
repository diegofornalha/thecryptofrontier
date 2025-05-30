import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Autor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
    defineField({
      name: 'role',
      title: 'Cargo',
      type: 'string',
    }),
    defineField({
      name: 'social',
      title: 'Redes Sociais',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Instagram',
          type: 'url',
          description: 'URL do perfil do Instagram',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'URL do perfil do LinkedIn',
        },
        {
          name: 'github',
          title: 'Link da Oferta',
          type: 'url',
          description: 'URL para página de oferta/produto',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
}); 