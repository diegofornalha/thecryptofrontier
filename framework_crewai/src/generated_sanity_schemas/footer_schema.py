# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/settings/footer.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'footer',
    'title': 'Rodapé',
    'type': 'document',
    'fields': [
        {
        'name': 'copyrightText',
        'title': 'Texto de Copyright',
        'type': 'string',
        'initialValue': '`© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`'
    },
        {
        'name': 'logo',
        'title': 'Logo do Rodapé',
        'type': 'image',
        'options': {
            'hotspot': 'true'
        }
    },
        {
        'name': 'navColumns',
        'title': 'Colunas de Navegação',
        'type': 'array',
        'of': [
            {
            'type': 'object',
            'fields': [
                {
                'name': 'title',
                'title': 'Título da Coluna',
                'type': 'string'
            },
                {
                'name': 'links',
                'title': 'Links',
                'type': 'array',
                'of': [
                    {
                    'type': 'navLink'
                }
                ]
            }
            ],
            'preview': {
                'select': {
                    'title': 'title',
                    'linksCount': 'links.length'
                }
            }
        }
        ]
    },
        {
        'name': 'socialLinks',
        'title': 'Links de Redes Sociais',
        'type': 'array',
        'of': [
            {
            'type': 'object',
            'fields': [
                {
                'name': 'platform',
                'title': 'Plataforma',
                'type': 'string',
                'options': {
                    'list': [
                        {
                        'title': 'Twitter',
                        'value': 'twitter'
                    },
                        {
                        'title': 'Facebook',
                        'value': 'facebook'
                    },
                        {
                        'title': 'Instagram',
                        'value': 'instagram'
                    },
                        {
                        'title': 'LinkedIn',
                        'value': 'linkedin'
                    },
                        {
                        'title': 'YouTube',
                        'value': 'youtube'
                    },
                        {
                        'title': 'Telegram',
                        'value': 'telegram'
                    },
                        {
                        'title': 'Discord',
                        'value': 'discord'
                    },
                        {
                        'title': 'GitHub',
                        'value': 'github'
                    }
                    ]
                }
            },
                {
                'name': 'url',
                'title': 'URL',
                'type': 'url'
            }
            ],
            'preview': {
                'select': {
                    'title': 'platform',
                    'subtitle': 'url'
                }
            }
        }
        ]
    },
        {
        'name': 'disclaimer',
        'title': 'Texto de Aviso Legal',
        'type': 'text',
        'rows': '3'
    }
    ],
    'preview': '''{
    prepare() {
      return {
        title: \'Rodapé do Site\',
      };
    },
  }'''
}
