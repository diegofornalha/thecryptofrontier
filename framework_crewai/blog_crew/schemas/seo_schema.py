# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/objects/seo.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'seo',
    'title': 'SEO & Social',
    'type': 'object',
    'fields': [
        {
        'name': 'metaTitle',
        'title': 'Meta Título',
        'type': 'string',
        'description': 'Título para SEO (max. 60 caracteres)',
        'validation': 'Rule => Rule.max(60)'
    },
        {
        'name': 'metaDescription',
        'title': 'Meta Descrição',
        'type': 'text',
        'rows': '3',
        'description': 'Descrição para SEO (entre 50-160 caracteres)',
        'validation': 'Rule => Rule.min(50).max(160)'
    },
        {
        'name': 'openGraphImage',
        'title': 'Imagem Open Graph',
        'type': 'image',
        'description': 'Imagem usada quando compartilhado em redes sociais (1200x630px ideal)'
    },
        {
        'name': 'keywords',
        'title': 'Palavras-chave',
        'type': 'array',
        'of': [
            {
            'type': 'string'
        }
        ],
        'options': {
            'layout': 'tags'
        }
    },
        {
        'name': 'canonicalUrl',
        'title': 'URL Canônica',
        'type': 'url',
        'description': 'URL canônica, se diferente da URL padrão'
    }
    ]
}
