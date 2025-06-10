"""
Script de teste para verificar a conversão de markdown para objetos Sanity
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import re
import uuid

def convert_markdown_to_sanity_objects_direct(content_text):
    """
    Versão direta da função sem o decorator do CrewAI para teste
    """
    try:
        if content_text is None or not isinstance(content_text, str):
            return {"success": False, "error": "Conteúdo não fornecido"}
        
        # Lista para armazenar os blocos processados
        processed_blocks = []
        
        # Dividir o conteúdo em parágrafos
        paragraphs = [p.strip() for p in content_text.split('\n\n') if p.strip()]
        if not paragraphs:
            paragraphs = [p.strip() for p in content_text.split('\n') if p.strip()]
        if not paragraphs:
            paragraphs = [content_text.strip()]
        
        for paragraph in paragraphs:
            # Detectar qualquer link markdown primeiro
            link_match = re.search(r'\[([^\]]*)\]\((https?://[^\s)]+)\)', paragraph)
            
            if link_match:
                link_text = link_match.group(1)
                link_url = link_match.group(2)
                
                # Verificar se é uma imagem (extensões tradicionais ou URLs de imagem conhecidas)
                is_image = (
                    # Extensões de arquivo tradicionais
                    re.search(r'\.(jpg|jpeg|png|gif|webp|svg)(\?[^)]*)?$', link_url, re.IGNORECASE) or
                    # URLs do Twitter media
                    'pbs.twimg.com/media' in link_url or
                    # Outros serviços de imagem conhecidos
                    'imgur.com' in link_url or
                    'i.redd.it' in link_url or
                    'format=jpg' in link_url or 
                    'format=png' in link_url or
                    'format=jpeg' in link_url or
                    'format=gif' in link_url or
                    'format=webp' in link_url
                )
                
                # Verificar se é um link do Twitter/X (posts, não imagens)
                is_twitter = (
                    ('twitter.com' in link_url or 'x.com' in link_url) and
                    '/status/' in link_url and
                    'pbs.twimg.com' not in link_url  # Excluir imagens do Twitter
                )
                
                if is_image:
                    # Criar objeto de imagem para Sanity
                    image_block = {
                        "_type": "image",
                        "_key": str(uuid.uuid4())[:8],
                        "asset": {
                            "_type": "reference",
                            "_ref": f"image-{str(uuid.uuid4())[:8]}-{link_url.split('/')[-1].split('?')[0]}"
                        },
                        "alt": link_text,
                        "caption": link_text,
                        "url": link_url  # Incluindo URL para processamento posterior
                    }
                    processed_blocks.append(image_block)
                    continue
                    
                elif is_twitter:
                    # Criar objeto de embed do Twitter para Sanity
                    twitter_block = {
                        "_type": "embedBlock",
                        "_key": str(uuid.uuid4())[:8],
                        "embedType": "twitter",
                        "url": link_url,
                        "caption": link_text
                    }
                    processed_blocks.append(twitter_block)
                    continue
                    
                else:
                    # Processar como link normal em um bloco de texto
                    text_block = process_paragraph_with_links_direct(paragraph)
                    processed_blocks.append(text_block)
                    continue
            
            # Processar como parágrafo normal
            if paragraph.startswith('# '):
                text_block = {
                    "_type": "block",
                    "_key": str(uuid.uuid4())[:8],
                    "style": "h1",
                    "children": [{
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph[2:].strip()
                    }]
                }
            elif paragraph.startswith('## '):
                text_block = {
                    "_type": "block",
                    "_key": str(uuid.uuid4())[:8],
                    "style": "h2",
                    "children": [{
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph[3:].strip()
                    }]
                }
            elif paragraph.startswith('### '):
                text_block = {
                    "_type": "block",
                    "_key": str(uuid.uuid4())[:8],
                    "style": "h3",
                    "children": [{
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph[4:].strip()
                    }]
                }
            elif paragraph.startswith('**') and paragraph.endswith('**'):
                text_block = {
                    "_type": "block",
                    "_key": str(uuid.uuid4())[:8],
                    "style": "h2",
                    "children": [{
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph[2:-2].strip()
                    }]
                }
            else:
                text_block = {
                    "_type": "block",
                    "_key": str(uuid.uuid4())[:8],
                    "style": "normal",
                    "children": [{
                        "_type": "span",
                        "_key": str(uuid.uuid4())[:8],
                        "text": paragraph
                    }]
                }
            
            processed_blocks.append(text_block)
        
        return {"success": True, "blocks": processed_blocks}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def process_paragraph_with_links_direct(paragraph):
    """
    Processa um parágrafo que contém links markdown, convertendo para formato Sanity.
    """
    children = []
    markDefs = []
    
    # Encontrar todos os links no parágrafo
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    last_end = 0
    
    for match in re.finditer(link_pattern, paragraph):
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

def test_image_conversion():
    """Testa a conversão de imagens markdown para objetos Sanity"""
    
    print("🧪 Testando conversão de imagens...")
    
    content_with_image = """
Este é um parágrafo normal.

[Imagem mostrando os multiplicadores](https://pbs.twimg.com/media/Gs7ldW9WsAAnJLq?format=jpg&name=large)

Outro parágrafo após a imagem.
"""
    
    result = convert_markdown_to_sanity_objects_direct(content_with_image)
    
    if result["success"]:
        print("✅ Conversão de imagem bem-sucedida!")
        print(f"📊 Número de blocos gerados: {len(result['blocks'])}")
        
        for i, block in enumerate(result['blocks']):
            print(f"  Bloco {i+1}: {block['_type']}")
            if block['_type'] == 'image':
                print(f"    - Alt: {block.get('alt', 'N/A')}")
                print(f"    - Caption: {block.get('caption', 'N/A')}")
                print(f"    - URL: {block.get('url', 'N/A')}")
    else:
        print("❌ Erro na conversão de imagem:")
        print(f"  {result['error']}")

def test_twitter_conversion():
    """Testa a conversão de embeds do Twitter para objetos Sanity"""
    
    print("\n🧪 Testando conversão de embeds do Twitter...")
    
    content_with_twitter = """
Este artigo foi mencionado [em 8 de junho](https://x.com/ChadSteingraber/status/1931733903523381637) por um analista importante.

O tweet gerou muito debate na comunidade.
"""
    
    result = convert_markdown_to_sanity_objects_direct(content_with_twitter)
    
    if result["success"]:
        print("✅ Conversão de Twitter bem-sucedida!")
        print(f"📊 Número de blocos gerados: {len(result['blocks'])}")
        
        for i, block in enumerate(result['blocks']):
            print(f"  Bloco {i+1}: {block['_type']}")
            if block['_type'] == 'embedBlock':
                print(f"    - Tipo: {block.get('embedType', 'N/A')}")
                print(f"    - URL: {block.get('url', 'N/A')}")
                print(f"    - Caption: {block.get('caption', 'N/A')}")
    else:
        print("❌ Erro na conversão de Twitter:")
        print(f"  {result['error']}")

def test_mixed_content():
    """Testa conteúdo misto com imagem, Twitter e texto normal"""
    
    print("\n🧪 Testando conteúdo misto...")
    
    mixed_content = """
## XRP: Alta de 647% no Market Cap de Apenas US$ 17 Milhões

O XRP experimentou uma valorização impressionante nos últimos dias, com o market cap subindo astronomicamente.

[Imagem mostrando os multiplicadores](https://pbs.twimg.com/media/Gs7ldW9WsAAnJLq?format=jpg&name=large)

### Análise do Movimento

Esta alta foi comentada [em 8 de junho](https://x.com/ChadSteingraber/status/1931733903523381637) por especialistas do mercado.

**Principais fatores:**
- Aprovação de novos produtos financeiros
- Maior adoção institucional  
- Desenvolvimentos técnicos importantes
"""
    
    result = convert_markdown_to_sanity_objects_direct(mixed_content)
    
    if result["success"]:
        print("✅ Conversão de conteúdo misto bem-sucedida!")
        print(f"📊 Número de blocos gerados: {len(result['blocks'])}")
        
        block_types = {}
        for block in result['blocks']:
            block_type = block['_type']
            block_types[block_type] = block_types.get(block_type, 0) + 1
        
        print("📈 Distribuição de tipos de bloco:")
        for block_type, count in block_types.items():
            print(f"  - {block_type}: {count}")
            
        # Mostrar detalhes dos blocos especiais
        for i, block in enumerate(result['blocks']):
            if block['_type'] in ['image', 'embedBlock']:
                print(f"\n🔍 Detalhes do bloco {i+1} ({block['_type']}):")
                if block['_type'] == 'image':
                    print(f"  - Alt: {block.get('alt', 'N/A')}")
                    print(f"  - Caption: {block.get('caption', 'N/A')}")
                elif block['_type'] == 'embedBlock':
                    print(f"  - Tipo: {block.get('embedType', 'N/A')}")
                    print(f"  - URL: {block.get('url', 'N/A')}")
                    print(f"  - Caption: {block.get('caption', 'N/A')}")
    else:
        print("❌ Erro na conversão de conteúdo misto:")
        print(f"  {result['error']}")

if __name__ == "__main__":
    print("🚀 Iniciando testes de conversão markdown → Sanity\n")
    
    test_image_conversion()
    test_twitter_conversion() 
    test_mixed_content()
    
    print("\n✨ Testes concluídos!") 