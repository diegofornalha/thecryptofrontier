# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/documents/post.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'post',
    'title': 'Post',
    'type': 'document',
    'fields': [
        {
        'name': 'title',
        'title': 'Título',
        'type': 'string',
        'validation': 'Rule => Rule.required().min(10).max(100)'
    },
        {
        'name': 'slug',
        'title': 'Slug',
        'type': 'slug',
        'options': {
            'source': 'title',
            'maxLength': '96'
        },
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'publishedAt',
        'title': 'Data de Publicação',
        'type': 'datetime',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'mainImage',
        'title': 'Imagem Principal',
        'type': 'mainImage'
    },
        {
        'name': 'categories',
        'title': 'Categorias',
        'type': 'array',
        'of': [
            {
            'type': 'reference',
            'to': 'category'
        }
        ]
    },
        {
        'name': 'tags',
        'title': 'Tags',
        'type': 'array',
        'of': [
            {
            'type': 'reference',
            'to': 'tag'
        }
        ]
    },
        {
        'name': 'author',
        'title': 'Autor',
        'type': 'reference',
        'to': 'author'
    },
        {
        'name': 'excerpt',
        'title': 'Resumo',
        'type': 'text',
        'rows': '3',
        'validation': 'Rule => Rule.max(300)'
    },
        {
        'name': 'content',
        'title': 'Conteúdo',
        'type': 'array',
        'of': [
            {
            'type': 'block',
            'styles': [
                {
                'title': 'Normal',
                'value': 'normal'
            },
                {
                'title': 'H1',
                'value': 'h1'
            },
                {
                'title': 'H2',
                'value': 'h2'
            },
                {
                'title': 'H3',
                'value': 'h3'
            },
                {
                'title': 'H4',
                'value': 'h4'
            },
                {
                'title': 'Quote',
                'value': 'blockquote'
            }
            ],
            'marks': {
                'decorators': [
                    {
                    'title': 'Strong',
                    'value': 'strong'
                },
                    {
                    'title': 'Emphasis',
                    'value': 'em'
                },
                    {
                    'title': 'Code',
                    'value': 'code'
                },
                    {
                    'title': 'Underline',
                    'value': 'underline'
                },
                    {
                    'title': 'Strike',
                    'value': 'strike-through'
                }
                ]
            }
        },
            {
            'type': 'image',
            'options': {
                'hotspot': 'true'
            },
            'fields': [
                {
                'name': 'caption',
                'type': 'string',
                'title': 'Legenda'
            },
                {
                'name': 'alt',
                'type': 'string',
                'title': 'Texto Alternativo'
            }
            ]
        },
            {
            'type': 'code'
        }
        ],
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'seo',
        'title': 'SEO & Social',
        'type': 'seo'
    },
        {
        'name': 'originalSource',
        'title': 'Fonte Original',
        'type': 'object',
        'fields': [
            {
            'name': 'url',
            'title': 'URL Original',
            'type': 'url'
        },
            {
            'name': 'title',
            'title': 'Título Original',
            'type': 'string'
        },
            {
            'name': 'site',
            'title': 'Site de Origem',
            'type': 'string'
        }
        ]
    }
    ],
    'preview': {
        'select': {
            'title': 'title',
            'media': 'mainImage',
            'date': 'publishedAt',
            'category0': 'categories.0.title'
        }
    }
}
