# -*- coding: utf-8 -*-
# Gerado automaticamente a partir de src/sanity/schemaTypes/objects/cryptoMeta.ts
# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.

schema = {
    'name': 'cryptoMeta',
    'title': 'Metadados de Criptomoeda',
    'type': 'object',
    'fields': [
        {
        'name': 'coinName',
        'title': 'Nome da Moeda',
        'type': 'string',
        'description': 'Ex: Bitcoin, Ethereum, etc.'
    },
        {
        'name': 'coinSymbol',
        'title': 'Símbolo',
        'type': 'string',
        'description': 'Ex: BTC, ETH, etc.'
    },
        {
        'name': 'coinLogo',
        'title': 'Logo',
        'type': 'image',
        'options': {
            'hotspot': 'true'
        }
    },
        {
        'name': 'currentPrice',
        'title': 'Preço Atual',
        'type': 'number',
        'description': 'Preço no momento da publicação'
    },
        {
        'name': 'priceChange24h',
        'title': 'Variação 24h (%)',
        'type': 'number',
        'description': 'Variação percentual nas últimas 24 horas'
    },
        {
        'name': 'marketCap',
        'title': 'Capitalização de Mercado',
        'type': 'number'
    },
        {
        'name': 'coingeckoId',
        'title': 'ID CoinGecko',
        'type': 'string',
        'description': 'Identificador da moeda no CoinGecko para atualização automática'
    },
        {
        'name': 'links',
        'title': 'Links Relevantes',
        'type': 'array',
        'of': [
            {
            'type': 'object',
            'fields': [
                {
                'name': 'title',
                'title': 'Título',
                'type': 'string'
            },
                {
                'name': 'url',
                'title': 'URL',
                'type': 'url'
            }
            ]
        }
        ]
    }
    ]
}
