# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/documents/category.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'category',
    'title': 'Categoria',
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
    },
        {
        'name': 'icon',
        'title': 'Ícone',
        'type': 'image',
        'options': {
            'hotspot': 'true'
        }
    },
        {
        'name': 'order',
        'title': 'Ordem de Exibição',
        'type': 'number',
        'initialValue': '999'
    }
    ],
    'orderings': [
        {
        'title': 'Ordem de Exibição',
        'name': 'orderAsc',
        'by': [
            {
            'field': 'order',
            'direction': 'asc'
        }
        ]
    },
        {
        'title': 'Nome, A-Z',
        'name': 'titleAsc',
        'by': [
            {
            'field': 'title',
            'direction': 'asc'
        }
        ]
    }
    ],
    'preview': {
        'select': {
            'title': 'title',
            'subtitle': 'description',
            'media': 'icon'
        }
    }
}
