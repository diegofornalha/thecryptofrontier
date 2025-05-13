# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/objects/mainImage.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'mainImage',
    'title': 'Imagem Principal',
    'type': 'image',
    'options': {
        'hotspot': 'true'
    },
    'fields': [
        {
        'name': 'alt',
        'title': 'Texto Alternativo',
        'type': 'string',
        'description': 'Importante para SEO e acessibilidade.',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'caption',
        'title': 'Legenda',
        'type': 'string'
    },
        {
        'name': 'attribution',
        'title': 'Atribuição',
        'type': 'string',
        'description': 'Crédito da imagem (se aplicável)'
    }
    ],
    'preview': {
        'select': {
            'imageUrl': 'asset.url',
            'title': 'alt'
        }
    }
}
