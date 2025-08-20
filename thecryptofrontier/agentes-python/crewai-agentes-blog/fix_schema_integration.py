#!/usr/bin/env python3
"""
Corrige integração Strapi para usar apenas campos do schema real
"""

import re

# Ler arquivo atual
with open('strapi_integration_i18n.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Padrão para encontrar a estrutura formatted em format_post_data
old_pattern = r'formatted = \{[^}]*\n\s*\'data\': \{[^}]*\}[^}]*\}'

# Nova estrutura apenas com campos do schema real
new_formatted = '''formatted = {
            'data': {
                'title': raw_data['title'],
                'content': raw_data['content'],
                'slug': raw_data['slug'],
                'excerpt': raw_data.get('excerpt', ''),
                'locale': target_locale
            }
        }'''

# Substituir
content = re.sub(old_pattern, new_formatted, content, flags=re.DOTALL)

# Salvar arquivo corrigido
with open('strapi_integration_i18n.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Arquivo corrigido para usar apenas campos do schema real:")
print("   - title (obrigatório)")
print("   - content") 
print("   - slug")
print("   - excerpt")
print("   - locale")
