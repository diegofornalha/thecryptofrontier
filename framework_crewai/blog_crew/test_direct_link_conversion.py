#!/usr/bin/env python3
"""
Direct test of markdown link conversion logic
"""

import re
import uuid
import json

def process_links(content: str):
    """Process markdown links and convert to Sanity format"""
    blocks = []
    
    # Split content into paragraphs
    paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
    
    for paragraph in paragraphs:
        # Pattern to find all markdown links
        link_pattern = r'\[([^\]]+)\]\((https?://[^\s)]+)\)'
        
        # Check if paragraph contains links
        if re.search(link_pattern, paragraph):
            # Process paragraph with links
            block = {
                "_type": "block",
                "_key": str(uuid.uuid4())[:8],
                "style": "normal",
                "children": [],
                "markDefs": []
            }
            
            last_end = 0
            mark_index = 0
            
            # Find all links in paragraph
            for match in re.finditer(link_pattern, paragraph):
                start, end = match.span()
                link_text = match.group(1)
                link_url = match.group(2)
                
                # Add text before link
                if start > last_end:
                    block["children"].append({
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph[last_end:start],
                        "marks": []
                    })
                
                # Create mark definition for link
                mark_key = f"mark{mark_index}"
                block["markDefs"].append({
                    "_type": "link",
                    "_key": mark_key,
                    "href": link_url
                })
                
                # Add link text with mark
                block["children"].append({
                    "_type": "span",
                    "_key": str(uuid.uuid4())[:8],
                    "text": link_text,
                    "marks": [mark_key]
                })
                
                last_end = end
                mark_index += 1
            
            # Add remaining text
            if last_end < len(paragraph):
                block["children"].append({
                    "_type": "span",
                    "_key": str(uuid.uuid4())[:8],
                    "text": paragraph[last_end:],
                    "marks": []
                })
            
            blocks.append(block)
        else:
            # Regular paragraph without links
            blocks.append({
                "_type": "block",
                "_key": str(uuid.uuid4())[:8],
                "style": "normal",
                "children": [{
                    "_type": "span",
                    "_key": str(uuid.uuid4())[:8],
                    "text": paragraph,
                    "marks": []
                }],
                "markDefs": []
            })
    
    return blocks

def test_conversion():
    """Test the link conversion"""
    test_content = """O XRP experimentou uma alta impressionante de 647x em seu market cap, saltando de apenas US$ 17 milhões para níveis atuais. [A briga entre](https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/) Elon Musk e Trump tem impactado o mercado.
Analistas apontam que [o futuro do XRP](https://example.com/xrp-future) depende de regulamentações claras. Veja mais em [nosso relatório completo](https://example.com/report).
Para mais informações, acesse [CryptoBasic](https://thecryptobasic.com)."""
    
    print("🔍 Testando conversão de links markdown...")
    print("\n📝 Conteúdo original:")
    print(test_content)
    
    # Convert to Sanity format
    sanity_blocks = process_links(test_content)
    
    print("\n✨ Conteúdo convertido para Sanity:")
    print(json.dumps(sanity_blocks, indent=2, ensure_ascii=False))
    
    # Create complete post
    from datetime import datetime
    post_data = {
        "_type": "post",
        "title": "XRP: Alta de 647x no Market Cap - Links Funcionando",
        "slug": {
            "_type": "slug",
            "current": "xrp-alta-647x-links-funcionando"
        },
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "excerpt": "O XRP experimentou uma alta impressionante de 647x em seu market cap. Post com links markdown corretamente convertidos.",
        "content": sanity_blocks,
        "author": {
            "_type": "reference",
            "_ref": "crypto-frontier"
        }
    }
    
    # Save test file
    filename = "test_post_links_converted.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(post_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Post salvo em: {filename}")
    print("\n📦 Estrutura completa do post:")
    print(json.dumps(post_data, indent=2, ensure_ascii=False))
    
    return post_data

if __name__ == "__main__":
    test_conversion()