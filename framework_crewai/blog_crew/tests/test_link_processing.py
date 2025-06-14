#!/usr/bin/env python3
"""Test para verificar o processamento de links no meio de parágrafos"""

import json
import re
import uuid

def convert_paragraph_with_links(paragraph):
    """Converte parágrafo com links markdown para formato Strapi"""
    # Pattern para detectar links markdown
    link_pattern = r'\[([^\]]+)\]\((https?://[^\s)]+)\)'
    
    # Encontrar todos os links
    matches = list(re.finditer(link_pattern, paragraph))
    
    if not matches:
        return {
            "_type": "block",
            "_key": str(uuid.uuid4())[:8],
            "style": "normal",
            "children": [{
                "_type": "span",
                "_key": str(uuid.uuid4())[:8],
                "text": paragraph
            }]
        }
    
    # Processar texto com links
    children = []
    markDefs = []
    last_end = 0
    
    for match in matches:
        # Adicionar texto antes do link
        if match.start() > last_end:
            text_before = paragraph[last_end:match.start()]
            if text_before:
                children.append({
                    "_type": "span",
                    "_key": str(uuid.uuid4())[:8],
                    "text": text_before
                })
        
        # Criar definição de link
        link_key = str(uuid.uuid4())[:8]
        link_text = match.group(1)
        link_url = match.group(2)
        
        markDefs.append({
            "_type": "link",
            "_key": link_key,
            "href": link_url,
            "target": "_blank"
        })
        
        # Adicionar span com link
        children.append({
            "_type": "span",
            "_key": str(uuid.uuid4())[:8],
            "text": link_text,
            "marks": [link_key]
        })
        
        last_end = match.end()
    
    # Adicionar texto após o último link
    if last_end < len(paragraph):
        text_after = paragraph[last_end:]
        if text_after:
            children.append({
                "_type": "span",
                "_key": str(uuid.uuid4())[:8],
                "text": text_after
            })
    
    return {
        "_type": "block",
        "_key": str(uuid.uuid4())[:8],
        "style": "normal",
        "markDefs": markDefs,
        "children": children
    }

# Testar com o parágrafo problemático
test_paragraph = """Notavelmente, o XRP caiu para US$ 2,0647 na semana passada, marcando uma queda de 9,4% em relação aos US$ 2,281 negociados no início da semana. A queda coincidiu com [a briga entre](https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/) o bilionário Elon Musk e o presidente dos EUA, Donald Trump, que levou a uma queda massiva nas ações da Tesla. A controvérsia se espalhou para o espaço cripto devido à associação de ambos os indivíduos com criptomoedas."""

print("=== TESTE DE PROCESSAMENTO DE LINKS ===")
print("\nParágrafo original:")
print(test_paragraph)
print("\n" + "="*50 + "\n")

result = convert_paragraph_with_links(test_paragraph)

print("Resultado processado:")
print(json.dumps(result, indent=2, ensure_ascii=False))

# Verificar se o link foi detectado
if result.get("markDefs"):
    print("\n✅ Links detectados:")
    for link in result["markDefs"]:
        print(f"  - {link['href']}")
else:
    print("\n❌ Nenhum link foi detectado!")

# Verificar a estrutura dos children
print("\n📝 Estrutura dos spans:")
for i, child in enumerate(result.get("children", [])):
    text = child.get("text", "")[:50] + "..." if len(child.get("text", "")) > 50 else child.get("text", "")
    marks = child.get("marks", [])
    print(f"  {i+1}. '{text}' {f'[Link: {marks}]' if marks else ''}")