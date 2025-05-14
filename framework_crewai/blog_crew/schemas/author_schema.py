# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/documents/author.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'author',
    'title': 'Autor',
    'type': 'document',
    'fields': [
        {
        'name': 'name',
        'title': 'Nome',
        'type': 'string',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'slug',
        'title': 'Slug',
        'type': 'slug',
        'options': {
            'source': 'name',
            'maxLength': '96'
        },
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'image',
        'title': 'Imagem',
        'type': 'image',
        'options': {
            'hotspot': 'true'
        }
    },
        {
        'name': 'bio',
        'title': 'Bio',
        'type': 'array',
        'of': [
            {
            'type': 'block'
        }
        ]
    },
        {
        'name': 'role',
        'title': 'Cargo',
        'type': 'string'
    },
        {
        'name': 'social',
        'title': 'Redes Sociais',
        'type': 'object',
        'fields': [
            {
            'name': 'twitter',
            'title': 'Twitter',
            'type': 'url'
        },
            {
            'name': 'linkedin',
            'title': 'LinkedIn',
            'type': 'url'
        },
            {
            'name': 'github',
            'title': 'GitHub',
            'type': 'url'
        }
        ]
    }
    ],
    'preview': {
        'select': {
            'title': 'name',
            'subtitle': 'role',
            'media': 'image'
        }
    }
}
