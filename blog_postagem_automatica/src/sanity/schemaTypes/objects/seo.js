export default {
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta Título',
      type: 'string',
      description: 'Título para os mecanismos de busca (máximo 70 caracteres)',
      validation: Rule => Rule.max(70),
    },
    {
      name: 'metaDescription',
      title: 'Meta Descrição',
      type: 'text',
      rows: 3,
      description: 'Descrição para os mecanismos de busca (máximo 160 caracteres)',
      validation: Rule => Rule.max(160),
    },
    {
      name: 'shareTitle',
      title: 'Título para Compartilhamento',
      type: 'string',
      description: 'Título para compartilhamento em redes sociais',
    },
    {
      name: 'shareDescription',
      title: 'Descrição para Compartilhamento',
      type: 'text',
      rows: 3,
      description: 'Descrição para compartilhamento em redes sociais',
    },
    {
      name: 'shareImage',
      title: 'Imagem para Compartilhamento',
      type: 'image',
      description: 'Imagem para compartilhamento em redes sociais (1200x630px recomendado)',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'keywords',
      title: 'Palavras-chave',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      description: 'Palavras-chave relevantes para o conteúdo',
    },
    {
      name: 'canonicalUrl',
      title: 'URL Canônica',
      type: 'url',
      description: 'URL canônica, se diferente da URL padrão',
    }
  ]
} 