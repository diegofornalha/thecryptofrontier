import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'seo',
  title: 'SEO & Social',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Título',
      type: 'string',
      description: 'Título para SEO (max. 60 caracteres)',
      validation: Rule => Rule.max(60),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Descrição',
      type: 'text',
      rows: 3,
      description: 'Descrição para SEO (entre 50-160 caracteres)',
      validation: Rule => Rule.min(50).max(160),
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Imagem Open Graph',
      type: 'image',
      description: 'Imagem usada quando compartilhado em redes sociais (1200x630px ideal)',
    }),
    defineField({
      name: 'keywords',
      title: 'Palavras-chave',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'URL Canônica',
      type: 'url',
      description: 'URL canônica, se diferente da URL padrão',
    }),
  ],
}); 