# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/documents/tag.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'tag',
    'title': 'Tag',
    'type': 'document',
    'fields': [
        {
        'name': 'title',
        'title': 'Título',
        'type': 'string',
        'validation': 'Rule => Rule.required()'
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
        'name': 'description',
        'title': 'Descrição',
        'type': 'text'
    }
    ],
    'preview': {
        'select': {
            'title': 'title',
            'subtitle': 'description'
        }
    }
}
