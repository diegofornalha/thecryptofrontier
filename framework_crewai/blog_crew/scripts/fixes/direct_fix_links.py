#!/usr/bin/env python3
"""
Correção direta dos links no post XRP
"""

import os
from strapiio import Client

# Configuração direta
strapi_PROJECT_ID = 'sgy3g5d4'
strapi_DATASET = 'production'
strapi_API_VERSION = '2024-01-01'
strapi_API_TOKEN = os.getenv('strapi_API_TOKEN')

# Cliente
client = Client(
    project_id=strapi_PROJECT_ID,
    dataset=strapi_DATASET,
    api_version=strapi_API_VERSION,
    token=strapi_API_TOKEN,
    use_cdn=False
)

# Slug do post
slug = 'xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos'

print(f"🔍 Buscando post: {slug}")

# Buscar o post
query = f'*[_type == "post" && slug.current == "{slug}"][0]'
post = client.fetch(query)

if not post:
    print("❌ Post não encontrado!")
    exit(1)

print(f"✅ Post encontrado: {post.get('title')}")
print(f"   ID: {post['_id']}")

# Criar o bloco corrigido
corrected_block = {
    "_type": "block",
    "_key": "fixed_para_1",
    "style": "normal",
    "markDefs": [
        {
            "_type": "link",
            "_key": "link_briga",
            "href": "https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/"
        }
    ],
    "children": [
        {
            "_type": "span",
            "_key": "s1",
            "text": "Notavelmente, o XRP caiu para US$ 2,0647 na semana passada, marcando uma queda de 9,4% em relação aos US$ 2,281 negociados no início da semana. A queda coincidiu com "
        },
        {
            "_type": "span",
            "_key": "s2",
            "text": "a briga entre",
            "marks": ["link_briga"]
        },
        {
            "_type": "span",
            "_key": "s3",
            "text": " o bilionário Elon Musk e o presidente dos EUA, Donald Trump, que levou a uma queda massiva nas ações da Tesla. A controvérsia se espalhou para o espaço cripto devido à associação de ambos os indivíduos com criptomoedas."
        }
    ]
}

# Processar conteúdo
content = post.get('content', [])
new_content = []
fixed = False

for i, block in enumerate(content):
    if block.get('_type') == 'block':
        # Verificar texto
        text = ''
        for child in block.get('children', []):
            text += child.get('text', '')
        
        if '[a briga entre]' in text:
            print(f"\n📝 Encontrado bloco problemático no índice {i}")
            print(f"   Texto: {text[:100]}...")
            new_content.append(corrected_block)
            fixed = True
        else:
            new_content.append(block)
    else:
        new_content.append(block)

if fixed:
    print("\n🔧 Atualizando post...")
    try:
        result = client.mutate([
            {
                'patch': {
                    'id': post['_id'],
                    'set': {
                        'content': new_content
                    }
                }
            }
        ])
        print("✅ Post atualizado com sucesso!")
    except Exception as e:
        print(f"❌ Erro: {e}")
else:
    print("\n⚠️  Bloco problemático não encontrado")