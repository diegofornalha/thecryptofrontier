# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/settings/siteConfig.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'siteConfig',
    'title': 'Configuração do Site',
    'type': 'document',
    'fields': [
        {
        'name': 'title',
        'title': 'Título do Site',
        'type': 'string',
        'validation': 'Rule => Rule.required()'
    },
        {
        'name': 'description',
        'title': 'Descrição do Site',
        'type': 'text',
        'validation': 'Rule => Rule.required()'
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
        'name': 'favicon',
        'title': 'Favicon',
        'type': 'image'
    },
        {
        'name': 'defaultSocialImage',
        'title': 'Imagem Social Padrão',
        'type': 'image',
        'description': 'Usada quando nenhuma imagem específica for fornecida para compartilhamento social'
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
            'name': 'facebook',
            'title': 'Facebook',
            'type': 'url'
        },
            {
            'name': 'instagram',
            'title': 'Instagram',
            'type': 'url'
        },
            {
            'name': 'youtube',
            'title': 'YouTube',
            'type': 'url'
        },
            {
            'name': 'linkedin',
            'title': 'LinkedIn',
            'type': 'url'
        },
            {
            'name': 'telegram',
            'title': 'Telegram',
            'type': 'url'
        }
        ]
    },
        {
        'name': 'analytics',
        'title': 'Configurações de Analytics',
        'type': 'object',
        'fields': [
            {
            'name': 'googleAnalyticsId',
            'title': 'ID do Google Analytics',
            'type': 'string'
        },
            {
            'name': 'googleTagManagerId',
            'title': 'ID do Google Tag Manager',
            'type': 'string'
        }
        ]
    },
        {
        'name': 'monetization',
        'title': 'Configurações de Monetização',
        'type': 'object',
        'fields': [
            {
            'name': 'adsenseId',
            'title': 'ID do Google AdSense',
            'type': 'string'
        },
            {
            'name': 'enableAds',
            'title': 'Habilitar Anúncios',
            'type': 'boolean',
            'initialValue': 'false'
        }
        ]
    }
    ],
    'preview': {
        'select': {
            'title': 'title',
            'subtitle': 'description',
            'media': 'logo'
        }
    }
}
