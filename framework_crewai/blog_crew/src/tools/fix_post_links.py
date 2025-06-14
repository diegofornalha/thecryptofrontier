#!/usr/bin/env python3
"""
Script para corrigir links markdown em posts já publicados no Strapi
"""

import os
import sys
import re
import uuid

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar o cliente Strapi do projeto
try:
    from logic.strapi_client import client
except:
    # Fallback para importação direta
    from strapi_client import get_strapi_client
    client = get_strapi_client()

def convert_markdown_links_in_text(text):
    """Detecta e marca posições de links markdown no texto"""
    link_pattern = r'\[([^\]]+)\]\((https?://[^\s)]+)\)'
    matches = list(re.finditer(link_pattern, text))
    
    links_info = []
    for match in matches:
        links_info.append({
            'start': match.start(),
            'end': match.end(),
            'text': match.group(1),
            'url': match.group(2)
        })
    
    return links_info

def convert_block_with_markdown_links(block):
    """Converte um bloco que contém links markdown para formato Strapi com markDefs"""
    if block.get('_type') != 'block':
        return block
    
    # Reconstruir o texto completo do bloco
    full_text = ''
    for child in block.get('children', []):
        full_text += child.get('text', '')
    
    # Detectar links markdown
    links_info = convert_markdown_links_in_text(full_text)
    
    if not links_info:
        return block  # Sem links, retorna como está
    
    # Criar novo bloco com links convertidos
    new_block = {
        '_type': 'block',
        '_key': block.get('_key', str(uuid.uuid4())[:8]),
        'style': block.get('style', 'normal'),
        'children': [],
        'markDefs': []
    }
    
    last_pos = 0
    
    for link in links_info:
        # Adicionar texto antes do link
        if link['start'] > last_pos:
            text_before = full_text[last_pos:link['start']]
            if text_before:
                new_block['children'].append({
                    '_type': 'span',
                    '_key': str(uuid.uuid4())[:8],
                    'text': text_before
                })
        
        # Criar definição do link
        link_key = str(uuid.uuid4())[:8]
        new_block['markDefs'].append({
            '_type': 'link',
            '_key': link_key,
            'href': link['url'],
            'target': '_blank'
        })
        
        # Adicionar span com o link
        new_block['children'].append({
            '_type': 'span',
            '_key': str(uuid.uuid4())[:8],
            'text': link['text'],
            'marks': [link_key]
        })
        
        last_pos = link['end']
    
    # Adicionar texto após o último link
    if last_pos < len(full_text):
        text_after = full_text[last_pos:]
        if text_after:
            new_block['children'].append({
                '_type': 'span',
                '_key': str(uuid.uuid4())[:8],
                'text': text_after
            })
    
    return new_block

def fix_post_links(slug):
    """Corrige links markdown em um post específico"""
    # Buscar o post
    query = f'*[_type == "post" && slug.current == "{slug}"][0]'
    post = client.fetch(query)
    
    if not post:
        print(f"Post com slug '{slug}' não encontrado")
        return False
    
    print(f"Post encontrado: {post.get('title')}")
    
    # Processar o conteúdo
    content = post.get('content', [])
    new_content = []
    links_fixed = 0
    
    for block in content:
        if block.get('_type') == 'block':
            # Verificar se há links markdown no texto
            full_text = ''
            for child in block.get('children', []):
                full_text += child.get('text', '')
            
            if '[' in full_text and '](' in full_text:
                # Possível link markdown
                new_block = convert_block_with_markdown_links(block)
                if new_block.get('markDefs'):
                    links_fixed += len(new_block['markDefs'])
                    print(f"  ✅ Corrigido bloco com {len(new_block['markDefs'])} link(s)")
                new_content.append(new_block)
            else:
                new_content.append(block)
        else:
            new_content.append(block)
    
    if links_fixed > 0:
        # Atualizar o post
        try:
            result = client.patch(post['_id']).set({'content': new_content}).commit()
            print(f"\n✅ Post atualizado com sucesso! {links_fixed} links corrigidos.")
            return True
        except Exception as e:
            print(f"\n❌ Erro ao atualizar post: {e}")
            return False
    else:
        print("\n📝 Nenhum link markdown encontrado para corrigir.")
        return True

if __name__ == '__main__':
    # Slug do post a corrigir
    slug = 'xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos'
    
    print(f"🔧 Corrigindo links no post: {slug}")
    print("="*50)
    
    if fix_post_links(slug):
        print("\n✅ Processo concluído com sucesso!")
    else:
        print("\n❌ Falha no processo de correção.")