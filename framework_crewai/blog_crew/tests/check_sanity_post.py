#!/usr/bin/env python3
"""Verificar conteúdo do post no Sanity"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from logic.sanity_client import client
import json

# Query para buscar o post
query = '''
*[_type == "post" && slug.current == "xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos"][0]{
    title,
    content
}
'''

try:
    post = client.fetch(query)
    
    if post:
        print("Post encontrado:", post['title'])
        print("\n" + "="*50 + "\n")
        
        # Procurar pelo parágrafo com o problema
        for i, block in enumerate(post.get('content', [])):
            if block.get('_type') == 'block':
                # Construir o texto completo do bloco
                full_text = ''
                for child in block.get('children', []):
                    full_text += child.get('text', '')
                
                # Se contém o texto problemático
                if 'briga entre' in full_text or 'coincidiu com' in full_text:
                    print(f"Bloco {i} com link:")
                    print(json.dumps(block, indent=2, ensure_ascii=False))
                    print("\n" + "-"*30 + "\n")
                    
                    # Analisar a estrutura
                    print("Análise do bloco:")
                    print(f"- Tipo: {block.get('_type')}")
                    print(f"- Style: {block.get('style', 'normal')}")
                    print(f"- MarkDefs: {len(block.get('markDefs', []))} definições")
                    print(f"- Children: {len(block.get('children', []))} spans")
                    
                    if block.get('markDefs'):
                        print("\nDefinições de links:")
                        for markDef in block['markDefs']:
                            print(f"  - Key: {markDef.get('_key')}")
                            print(f"    Href: {markDef.get('href')}")
                    
                    print("\nSpans:")
                    for j, child in enumerate(block.get('children', [])):
                        text_preview = child.get('text', '')[:50] + '...' if len(child.get('text', '')) > 50 else child.get('text', '')
                        marks = child.get('marks', [])
                        print(f"  {j+1}. '{text_preview}'")
                        if marks:
                            print(f"     Marks: {marks}")
                    
                    break
    else:
        print("Post não encontrado no Sanity")
        
except Exception as e:
    print(f"Erro ao buscar post: {e}")