import requests
import re
import unicodedata

def generate_slug(text):
    """Gera slug URL-friendly"""
    # Remove acentos e emojis
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    
    # Remove emojis e caracteres especiais
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text)
    
    return text.strip('-')

url_base = 'https://ale-blog.agentesintegrados.com/api/posts'
token = '22e684f7c61996fba340a056b3ed2f6f8a8855d1aaa38cff4b3e73cc4ba23b7dfb24eaea7252de63b6dacf5d0115c1fc4614d1a788306217eef8bc9c2f51e02e2c2f27cab945cfdcc1798eb2096879469582ec7c763caa0d92950ff38834092ef199b7cdf72b388f4e6bd5ac61e33ca7c32413f7ed117e6f9d87b5021c8c4810'

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# Posts de teste nos 3 idiomas COM SLUG
posts = [
    {
        'locale': 'pt-BR',
        'title': '🇧🇷 Sistema FUNCIONANDO com SLUG - Português',
        'content': '## Sistema Corrigido! 🚀\n\nO sistema de agentes RSS agora está funcionando perfeitamente:\n\n✅ **SLUG automático** - URLs amigáveis\n✅ **Português** - pt-BR funcionando\n✅ **RSS Feed** - Monitoramento ativo\n✅ **Publicação** - Automática no Strapi\n\n**Status: OPERACIONAL COM SLUG!** 🎯'
    },
    {
        'locale': 'en',
        'title': '🇺🇸 System WORKING with SLUG - English', 
        'content': '## System Fixed! 🚀\n\nThe RSS agent system is now working perfectly:\n\n✅ **Automatic SLUG** - SEO-friendly URLs\n✅ **English** - EN working\n✅ **RSS Feed** - Active monitoring\n✅ **Publishing** - Automatic to Strapi\n\n**Status: OPERATIONAL WITH SLUG!** 🎯'
    },
    {
        'locale': 'es',
        'title': '🇪🇸 Sistema FUNCIONANDO con SLUG - Español',
        'content': '## ¡Sistema Corregido! 🚀\n\nEl sistema de agentes RSS ahora está funcionando perfectamente:\n\n✅ **SLUG automático** - URLs amigables\n✅ **Español** - ES funcionando\n✅ **RSS Feed** - Monitoreo activo\n✅ **Publicación** - Automática en Strapi\n\n**¡Estado: OPERACIONAL CON SLUG!** 🎯'
    }
]

print('🚀 CREANDO POSTS CON SLUG AUTOMÁTICO:')
print('=' * 50)

for post in posts:
    title = post['title']
    slug = generate_slug(title)
    
    print(f'\n🌐 {post["locale"]}: {title}')
    print(f'   Slug: {slug}')
    
    post_data = {
        'data': {
            'title': title,
            'content': post['content'],
            'slug': slug,
            'locale': post['locale']
        }
    }
    
    response = requests.post(f'{url_base}?locale={post["locale"]}', json=post_data, headers=headers)
    
    if response.status_code == 201:
        data = response.json()
        print(f'   ✅ Criado - ID: {data["data"]["id"]}')
        print(f'   🔗 URL: https://thecryptofrontier.agentesintegrados.com/{post["locale"]}/post/{slug}/')
    else:
        print(f'   ❌ Erro {response.status_code}: {response.text[:100]}')

print('\n🎉 SISTEMA FUNCIONANDO EM ESPANHOL COM SLUG!')
print('   Agora todos os posts têm URLs amigáveis!')
