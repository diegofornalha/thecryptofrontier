import { defineField, defineType } from 'sanity';
import { FiCreditCard } from 'react-icons/fi';

export default defineType({
  name: 'footer',
  title: 'Rodapé',
  type: 'document',
  icon: FiCreditCard,
  fields: [
    defineField({
      name: 'copyrightText',
      title: 'Texto de Copyright',
      type: 'string',
      initialValue: `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`,
    }),
    defineField({
      name: 'logo',
      title: 'Logo do Rodapé',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'navColumns',
      title: 'Colunas de Navegação',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Título da Coluna',
              type: 'string',
            },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [{ type: 'navLink' }],
            },
          ],
          preview: {
            select: {
              title: 'title',
              linksCount: 'links.length',
            },
            prepare({ title, linksCount }) {
              return {
                title: title || 'Coluna sem título',
                subtitle: `${linksCount || 0} links`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Links de Redes Sociais',
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
                  { title: 'Twitter', value: 'twitter' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Telegram', value: 'telegram' },
                  { title: 'Discord', value: 'discord' },
                  { title: 'GitHub', value: 'github' },
                ],
              },
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'disclaimer',
      title: 'Texto de Aviso Legal',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Rodapé do Site',
      };
    },
  },
}); 