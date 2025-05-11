// Esquema do Sanity
import { SchemaTypeDefinition } from 'sanity';

// Tipo básico de página
const page: SchemaTypeDefinition = {
  name: 'page',
  title: 'Página',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
};

// Tipo para post do blog
const post: SchemaTypeDefinition = {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
    },
    {
      name: 'mainImage',
      title: 'Imagem Principal',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
    },
    {
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        { 
          type: 'block',
        },
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          type: 'code',
        }
      ],
    },
  ],
};

// Tipo para configuração do site
const siteConfig: SchemaTypeDefinition = {
  name: 'siteConfig',
  title: 'Configuração do Site',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título do Site',
      type: 'string',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    },
    {
      name: 'defaultSocialImage',
      title: 'Imagem Social Padrão',
      type: 'image',
    },
  ],
};

// Tipo para cabeçalho
const header: SchemaTypeDefinition = {
  name: 'header',
  title: 'Cabeçalho',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
    },
    {
      name: 'navLinks',
      title: 'Links de Navegação',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};

// Tipo para rodapé
const footer: SchemaTypeDefinition = {
  name: 'footer',
  title: 'Rodapé',
  type: 'document',
  fields: [
    {
      name: 'copyrightText',
      title: 'Texto de Copyright',
      type: 'string',
    },
    {
      name: 'navLinks',
      title: 'Links de Navegação',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};

// Exportando todos os esquemas
export const schemaTypes = [
  page,
  post,
  siteConfig,
  header,
  footer,
];

// O schema exportado para o Sanity Studio
export const schema = {
  types: schemaTypes,
}; 