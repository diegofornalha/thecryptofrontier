#!/usr/bin/env python
import json
import uuid
from pathlib import Path
from datetime import datetime

def formatar_conteudo_em_blocos(conteudo):
    if not conteudo:
        return []
    
    paragrafos = conteudo.split('\n\n')
    blocos = []
    
    for paragrafo in paragrafos:
        paragrafo_limpo = paragrafo.strip()
        if not paragrafo_limpo:
            continue
        
        bloco_id = str(uuid.uuid4()).replace('-', '')
        estilo = 'normal'
        texto = paragrafo_limpo
        
        if paragrafo_limpo.startswith('# '):
            estilo = 'h1'
            texto = paragrafo_limpo[2:].strip()
        elif paragrafo_limpo.startswith('## '):
            estilo = 'h2'
            texto = paragrafo_limpo[3:].strip()
        elif paragrafo_limpo.startswith('### '):
            estilo = 'h3'
            texto = paragrafo_limpo[4:].strip()
        
        blocos.append({
            '_key': bloco_id,
            '_type': 'block',
            'style': estilo,
            'children': [
                {
                    '_key': str(uuid.uuid4()).replace('-', ''),
                    '_type': 'span',
                    'marks': [],
                    'text': texto
                }
            ],
            'markDefs': []
        })
    
    return blocos

def criar_slug(titulo):
    import re
    from unicodedata import normalize
    
    slug = normalize('NFKD', titulo).encode('ASCII', 'ignore').decode('utf-8')
    slug = slug.lower()
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    slug = re.sub(r'\-+', '-', slug)
    slug = slug[:80]
    
    return slug

def formatar_documento_sanity(caminho_arquivo_json):
    with open(caminho_arquivo_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    content_text = data.get('content_text_traduzido', '')
    frontmatter_traduzido = data.get('frontmatter_traduzido', {})
    frontmatter_original = data.get('frontmatter_original', {})
    
    titulo = frontmatter_traduzido.get('title', '')
    if not titulo:
        return {"error": "Título não encontrado"}
    
    slug = frontmatter_traduzido.get('slug', '')
    if not slug:
        slug = criar_slug(titulo)
    
    data_publicacao = frontmatter_traduzido.get('published_date', datetime.now().isoformat())
    
    excerpt = ''
    if content_text:
        primeiro_paragrafo = content_text.split('\n\n')[0].strip()
        excerpt = primeiro_paragrafo[:300]
    
    blocos_conteudo = formatar_conteudo_em_blocos(content_text)
    
    autor_ref = "ca38a3d5-cba1-47a0-aa29-4af17a15e17c"
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    documento_sanity = {
        '_type': 'post',
        '_id': f'drafts.post-{timestamp}',
        'title': titulo,
        'slug': {
            '_type': 'slug',
            'current': slug
        },
        'publishedAt': data_publicacao,
        'excerpt': excerpt,
        'content': blocos_conteudo,
        'author': {
            '_type': 'reference',
            '_ref': autor_ref
        },
        'originalSource': {
            'url': frontmatter_original.get('url', ''),
            'title': frontmatter_original.get('title', ''),
            'site': frontmatter_original.get('source', '')
        }
    }
    
    # Categorias
    categorias = []
    if 'category' in frontmatter_traduzido:
        categoria = frontmatter_traduzido['category']
        categorias.append({
            '_type': 'reference',
            '_key': str(uuid.uuid4()).replace('-', ''),
            '_ref': categoria
        })
    documento_sanity['categories'] = categorias
    
    # Tags
    tags = []
    if 'tags' in frontmatter_traduzido:
        for tag in frontmatter_traduzido['tags']:
            tags.append({
                '_type': 'reference',
                '_key': str(uuid.uuid4()).replace('-', ''),
                '_ref': tag
            })
    documento_sanity['tags'] = tags
    
    # SEO
    if 'seo_meta_description' in frontmatter_traduzido:
        documento_sanity['seo'] = {
            'meta_title': titulo,
            'meta_description': frontmatter_traduzido['seo_meta_description']
        }
    
    # Salvar arquivo formatado
    arquivo_origem = Path(caminho_arquivo_json)
    nome_formatado = arquivo_origem.name.replace('traduzido_', 'formatado_')
    
    dir_formatados = arquivo_origem.parent.parent / "posts_formatados"
    dir_formatados.mkdir(parents=True, exist_ok=True)
    
    caminho_arquivo_formatado = dir_formatados / nome_formatado
    
    with open(caminho_arquivo_formatado, 'w', encoding='utf-8') as f:
        json.dump(documento_sanity, f, ensure_ascii=False, indent=2)
    
    return {
        'success': True,
        'arquivo_formatado': str(caminho_arquivo_formatado),
        'documento': documento_sanity
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python simple_demo.py <caminho_arquivo_json>")
        sys.exit(1)
    
    caminho_arquivo = sys.argv[1]
    resultado = formatar_documento_sanity(caminho_arquivo)
    
    if resultado.get('success'):
        print(f"Arquivo formatado salvo em: {resultado['arquivo_formatado']}")
    else:
        print(f"Erro: {resultado.get('error')}") 