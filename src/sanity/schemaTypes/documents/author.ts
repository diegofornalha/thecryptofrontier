import { defineField, defineType } from 'sanity';
import { FiUser } from 'react-icons/fi';

export default defineType({
  name: 'author',
  title: 'Autor',
  type: 'document',
  icon: FiUser,
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
          title: 'Twitter/X',
          type: 'url',
          description: 'URL do perfil do Twitter/X',
          validation: Rule => Rule.uri({
            scheme: ['http', 'https']
          }).custom((url) => {
            if (!url) return true;
            if (url.includes('twitter.com') || url.includes('x.com')) return true;
            return 'URL deve ser do Twitter/X';
          }),
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          description: 'URL do perfil do Instagram',
          validation: Rule => Rule.uri({
            scheme: ['http', 'https']
          }).custom((url) => {
            if (!url) return true;
            if (url.includes('instagram.com')) return true;
            return 'URL deve ser do Instagram';
          }),
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'URL do perfil do LinkedIn',
          validation: Rule => Rule.uri({
            scheme: ['http', 'https']
          }).custom((url) => {
            if (!url) return true;
            if (url.includes('linkedin.com')) return true;
            return 'URL deve ser do LinkedIn';
          }),
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'url',
          description: 'URL do perfil do GitHub',
          validation: Rule => Rule.uri({
            scheme: ['http', 'https']
          }).custom((url) => {
            if (!url) return true;
            if (url.includes('github.com')) return true;
            return 'URL deve ser do GitHub';
          }),
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