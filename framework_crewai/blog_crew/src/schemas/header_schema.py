# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/settings/header.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'header',
    'title': 'Cabeçalho',
    'type': 'document',
    'fields': [
        {
        'name': 'title',
        'title': 'Título',
        'type': 'string'
    },
        {
        'name': 'logo',
        'title': 'Logo',
        'type': 'image',
        'options': {
            'hotspot': 'true'
        }
    },
        {
        'name': 'navLinks',
        'title': 'Links de Navegação',
        'type': 'array',
        'of': [
            {
            'type': 'navLink'
        }
        ],
        'validation': 'Rule => Rule.unique().error(\'Os links devem ser únicos\')'
    },
        {
        'name': 'enableSearch',
        'title': 'Habilitar Busca',
        'type': 'boolean',
        'initialValue': 'true'
    },
        {
        'name': 'enableDarkMode',
        'title': 'Habilitar Alternador de Tema',
        'type': 'boolean',
        'initialValue': 'true'
    },
        {
        'name': 'ctaButton',
        'title': 'Botão de Chamada para Ação',
        'type': 'object',
        'fields': [
            {
            'name': 'text',
            'title': 'Texto',
            'type': 'string'
        },
            {
            'name': 'url',
            'title': 'URL',
            'type': 'string'
        },
            {
            'name': 'isEnabled',
            'title': 'Habilitado',
            'type': 'boolean',
            'initialValue': 'false'
        }
        ]
    },
        {
        'name': 'sticky',
        'title': 'Fixar no Topo',
        'type': 'boolean',
        'initialValue': 'true'
    }
    ],
    'preview': {
        'select': {
            'title': 'title',
            'media': 'logo'
        }
    }
}
