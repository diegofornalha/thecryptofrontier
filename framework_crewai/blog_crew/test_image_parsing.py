#!/usr/bin/env python3
"""
Teste de parsing de imagens do conteúdo
"""

from bs4 import BeautifulSoup
import re

# Conteúdo de exemplo com imagem
content = """
<p>Circle's recent IPO on June 5 made a significant impact on the public market.</p>

<figure class="wp-caption alignnone" id="attachment_127722" style="width: 799px;">
<img alt="Presto Research" class="size-full wp-image-127722" height="618" src="https://thecryptobasic.com/wp-content/uploads/2025/06/Presto-Research.png" title="Presto Research" width="799" />
<figcaption>Presto Research Analysis</figcaption>
</figure>

<p>Unlike Coinbase, Circle's revenue model is more dependent on stock.</p>
"""

print("🔍 Testando parsing de conteúdo com imagens...\n")

# Parse HTML
soup = BeautifulSoup(content, 'html.parser')

# Processar elementos
for element in soup.find_all(['p', 'img', 'figure']):
    if element.name == 'p':
        text = element.get_text(strip=True)
        if text:
            print(f"📝 Parágrafo: {text[:60]}...")
            
    elif element.name in ['img', 'figure']:
        img_tag = element if element.name == 'img' else element.find('img')
        if img_tag and img_tag.get('src'):
            img_url = img_tag.get('src')
            img_alt = img_tag.get('alt', '')
            caption = element.find('figcaption')
            
            print(f"🖼️  Imagem encontrada:")
            print(f"   URL: {img_url}")
            print(f"   Alt: {img_alt}")
            if caption:
                print(f"   Caption: {caption.get_text(strip=True)}")
            print()

print("\n✅ Teste concluído!")