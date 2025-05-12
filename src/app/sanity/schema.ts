// Esquema do Sanity
import { SchemaTypeDefinition } from '@sanity/types';

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
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Título que aparece no topo do rodapé'
    },
    {
      name: 'description',
      title: 'Descrição',
      type: 'string',
      description: 'Breve descrição do site'
    },
    {
      name: 'copyrightText',
      title: 'Texto de Copyright',
      type: 'string',
    },
    {
      name: 'navLinks',
      title: 'Links de Navegação Primários',
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
    {
      name: 'socialLinks',
      title: 'Links de Redes Sociais',
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
              name: 'icon',
              title: 'Ícone',
              type: 'string',
              description: 'Nome do ícone (twitter, facebook, instagram, etc.)',
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
    {
      name: 'secondaryLinks',
      title: 'Links Secundários (Recursos)',
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
    {
      name: 'legalLinks',
      title: 'Links Legais',
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
  siteConfig,
  header,
  footer,
];
