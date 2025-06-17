# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/strapi/schemaTypes/objects/navLink.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'navLink',
    'title': 'Link de Navegação',
    'type': 'object',
    'fields': [
        {
        'name': 'label',
        'title': 'Label',
        'type': 'string',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'url',
        'title': 'URL',
        'type': 'string',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'isExternal',
        'title': 'É Link Externo?',
        'type': 'boolean',
        'initialValue': 'false'
    },
        {
        'name': 'icon',
        'title': 'Ícone',
        'type': 'string',
        'description': 'Nome do ícone (opcional)'
    }
    ],
    'preview': {
        'select': {
            'title': 'label',
            'subtitle': 'url'
        }
    }
}
