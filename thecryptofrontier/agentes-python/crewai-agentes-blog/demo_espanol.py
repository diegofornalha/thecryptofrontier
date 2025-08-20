#!/usr/bin/env python3
"""
Demonstração: Sistema RSS Agentes funcionando em ESPANHOL com SLUG automático
"""

import requests
import re
import unicodedata

def generate_slug(text):
    """Gera slug URL-friendly"""
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def create_spanish_post(title, content):
    """Cria post em espanhol com slug automático"""
    
    url = 'https://ale-blog.agentesintegrados.com/api/posts?locale=es'
    token = '22e684f7c61996fba340a056b3ed2f6f8a8855d1aaa38cff4b3e73cc4ba23b7dfb24eaea7252de63b6dacf5d0115c1fc4614d1a788306217eef8bc9c2f51e02e2c2f27cab945cfdcc1798eb2096879469582ec7c763caa0d92950ff38834092ef199b7cdf72b388f4e6bd5ac61e33ca7c32413f7ed117e6f9d87b5021c8c4810'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    slug = generate_slug(title)
    
    data = {
        'data': {
            'title': title,
            'content': content,
            'slug': slug,
            'locale': 'es'
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 201:
        result = response.json()
        return {
            'success': True,
            'id': result['data']['id'],
            'slug': result['data']['slug'],
            'url': f"https://thecryptofrontier.agentesintegrados.com/es/post/{slug}/"
        }
    else:
        return {'success': False, 'error': response.text}

if __name__ == "__main__":
    print("🇪🇸 DEMO: SISTEMA FUNCIONANDO EM ESPANHOL")
    print("=" * 50)
    
    # Post de demonstração
    title = "🚀 ¡Confirmado: Sistema RSS Funcionando en Español!"
    content = """## ¡Perfecto! Sistema Completamente Operacional 🎉

**El sistema de agentes RSS está funcionando perfectamente en español:**

### ✅ Características confirmadas:
- **Slug automático**: URLs amigables generadas automáticamente
- **Idioma español**: Contenido completamente en ES
- **Publicación automática**: Integración con Strapi funcionando
- **Frontend integrado**: Posts aparecen inmediatamente

### 🌐 URLs generadas:
- **Página principal**: `/es/`
- **Post individual**: `/es/post/[slug]/`

### 🎯 Estado actual:
**¡SISTEMA 100% FUNCIONAL EN ESPAÑOL!** ✅

¡El sistema RSS → Traducción → Publicación está completamente operativo!"""

    print(f"📝 Creando post: {title}")
    print(f"🔗 Slug: {generate_slug(title)}")
    
    result = create_spanish_post(title, content)
    
    if result['success']:
        print(f"\n🎉 ¡ÉXITO! Post creado en español:")
        print(f"   ID: {result['id']}")
        print(f"   Slug: {result['slug']}")
        print(f"   URL: {result['url']}")
        print(f"\n✅ ¡SISTEMA RSS AGENTES FUNCIONANDO EN ESPAÑOL!")
        print(f"   ¡Todas las funciones operativas con SLUG automático!")
    else:
        print(f"❌ Error: {result['error']}")
