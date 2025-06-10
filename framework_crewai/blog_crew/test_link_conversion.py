#!/usr/bin/env python3
"""
Test script to verify markdown link conversion to Sanity format
"""

import os
import sys
import json
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our tools
from tools.formatter_tools import convert_markdown_to_sanity_objects
from tools.sanity_key_validator import ensure_array_keys
from tools.sanity_tools_enhanced import publish_to_sanity_enhanced

def test_link_conversion():
    """Test markdown link conversion with a sample post"""
    
    # Sample content with markdown links
    test_content = """
    O XRP experimentou uma alta impressionante de 647x em seu market cap, saltando de apenas US$ 17 milhões para níveis atuais. [A briga entre](https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/) Elon Musk e Trump tem impactado o mercado.
    
    Analistas apontam que [o futuro do XRP](https://example.com/xrp-future) depende de regulamentações claras. Veja mais em [nosso relatório completo](https://example.com/report).
    
    Para mais informações, acesse [CryptoBasic](https://thecryptobasic.com).
    """
    
    print("🔍 Testando conversão de links markdown...")
    print("\n📝 Conteúdo original:")
    print(test_content)
    
    # Convert to Sanity format
    sanity_blocks = convert_markdown_to_sanity_objects(test_content)
    
    print("\n✨ Conteúdo convertido para Sanity:")
    print(json.dumps(sanity_blocks, indent=2, ensure_ascii=False))
    
    # Create a complete post structure
    post_data = {
        "_type": "post",
        "title": "Teste de Conversão de Links",
        "slug": {
            "_type": "slug",
            "current": "teste-conversao-links"
        },
        "publishedAt": datetime.utcnow().isoformat() + "Z",
        "excerpt": "Post de teste para verificar conversão de links markdown",
        "content": sanity_blocks,
        "author": {
            "_type": "reference",
            "_ref": "crypto-frontier"
        }
    }
    
    # Ensure all arrays have keys
    print("\n🔑 Validando chaves _key...")
    ensure_array_keys(post_data)
    
    print("\n📦 Estrutura completa do post:")
    print(json.dumps(post_data, indent=2, ensure_ascii=False))
    
    # Save test post
    test_file = "test_post_with_links.json"
    with open(test_file, 'w', encoding='utf-8') as f:
        json.dump(post_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Post salvo em: {test_file}")
    
    # Ask if user wants to publish
    print("\n❓ Deseja publicar este post de teste no Sanity? (s/n): ", end='', flush=True)
    
    return post_data

if __name__ == "__main__":
    test_post = test_link_conversion()
    
    # Check if user wants to publish
    response = input().strip().lower()
    if response == 's':
        print("\n📤 Publicando no Sanity...")
        try:
            result = publish_to_sanity_enhanced(test_post)
            if result.get('success'):
                print(f"✅ Post publicado com sucesso! ID: {result.get('_id')}")
                print(f"🔗 URL: https://thecryptofrontier.com/post/{test_post['slug']['current']}")
            else:
                print(f"❌ Erro ao publicar: {result.get('error')}")
        except Exception as e:
            print(f"❌ Erro: {str(e)}")
    else:
        print("\n⏭️  Publicação cancelada")