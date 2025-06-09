#!/usr/bin/env python3
"""
Script específico para corrigir os links markdown no post do XRP
"""

import os
import json

# Usar o sanity_client diretamente
from tools.sanity_client import get_sanity_client

def main():
    # Inicializar cliente
    client = get_sanity_client()
    
    # Slug do post
    slug = 'xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos'
    
    print(f"🔍 Buscando post: {slug}")
    
    # Buscar o post
    query = f'*[_type == "post" && slug.current == "{slug}"][0]'
    post = client.fetch(query)
    
    if not post:
        print("❌ Post não encontrado!")
        return
    
    print(f"✅ Post encontrado: {post.get('title')}")
    
    # Conteúdo corrigido manualmente para o parágrafo problemático
    # Vamos criar o bloco correto com o link formatado adequadamente
    corrected_block = {
        "_type": "block",
        "_key": "fixed_block_1",
        "style": "normal",
        "markDefs": [
            {
                "_type": "link",
                "_key": "link1",
                "href": "https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/",
                "target": "_blank"
            }
        ],
        "children": [
            {
                "_type": "span",
                "_key": "span1",
                "text": "Notavelmente, o XRP caiu para US$ 2,0647 na semana passada, marcando uma queda de 9,4% em relação aos US$ 2,281 negociados no início da semana. A queda coincidiu com "
            },
            {
                "_type": "span",
                "_key": "span2",
                "text": "a briga entre",
                "marks": ["link1"]
            },
            {
                "_type": "span",
                "_key": "span3",
                "text": " o bilionário Elon Musk e o presidente dos EUA, Donald Trump, que levou a uma queda massiva nas ações da Tesla. A controvérsia se espalhou para o espaço cripto devido à associação de ambos os indivíduos com criptomoedas."
            }
        ]
    }
    
    # Processar o conteúdo e substituir o bloco problemático
    content = post.get('content', [])
    new_content = []
    found_and_fixed = False
    
    for block in content:
        if block.get('_type') == 'block':
            # Reconstruir texto do bloco
            text = ''
            for child in block.get('children', []):
                text += child.get('text', '')
            
            # Verificar se é o bloco problemático
            if 'coincidiu com [a briga entre]' in text:
                print("  📝 Bloco problemático encontrado! Substituindo...")
                new_content.append(corrected_block)
                found_and_fixed = True
            else:
                new_content.append(block)
        else:
            new_content.append(block)
    
    if found_and_fixed:
        print("\n🔧 Atualizando post no Sanity...")
        try:
            # Atualizar o post
            result = client.patch(post['_id']).set({'content': new_content}).commit()
            print("✅ Post atualizado com sucesso!")
            print(f"   ID: {result['_id']}")
            print(f"   Rev: {result['_rev']}")
        except Exception as e:
            print(f"❌ Erro ao atualizar: {e}")
    else:
        print("\n⚠️  Bloco problemático não encontrado. Verificando conteúdo...")
        # Mostrar primeiros blocos para debug
        for i, block in enumerate(content[:5]):
            if block.get('_type') == 'block':
                text = ''
                for child in block.get('children', []):
                    text += child.get('text', '')
                print(f"\nBloco {i}: {text[:100]}...")

if __name__ == '__main__':
    main()