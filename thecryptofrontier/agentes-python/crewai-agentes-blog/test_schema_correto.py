#!/usr/bin/env python3
"""
Teste com schema correto - apenas campos que existem
"""

from strapi_integration_i18n import StrapiI18nIntegration

def test_schema_compliance():
    """Testa criação com schema correto"""
    
    client = StrapiI18nIntegration()
    
    # Posts de teste nos 3 idiomas - APENAS campos do schema
    posts_test = [
        {
            'locale': 'pt-BR',
            'title': '🇧🇷 Schema Correto - Sistema Funcionando',
            'content': '''## Schema Alinhado! 🎯

O sistema agora está **perfeitamente alinhado** com o schema do Strapi:

### ✅ Campos utilizados:
- **title** - Título obrigatório
- **content** - Conteúdo rico 
- **slug** - Gerado automaticamente
- **excerpt** - Resumo opcional
- **locale** - Idioma (pt-BR)

### 🚀 Sistema operacional:
**Todos os campos estão em conformidade com o schema do Strapi!**

Agora as publicações funcionam sem erros.''',
            'excerpt': 'Sistema corrigido com schema alinhado ao Strapi'
        },
        {
            'locale': 'en',
            'title': '🇺🇸 Correct Schema - System Working',
            'content': '''## Schema Aligned! 🎯

The system is now **perfectly aligned** with Strapi schema:

### ✅ Fields used:
- **title** - Required title
- **content** - Rich content
- **slug** - Auto-generated
- **excerpt** - Optional summary
- **locale** - Language (en)

### 🚀 System operational:
**All fields comply with Strapi schema!**

Now publishing works without errors.''',
            'excerpt': 'System fixed with schema aligned to Strapi'
        },
        {
            'locale': 'es', 
            'title': '🇪🇸 Schema Correcto - Sistema Funcionando',
            'content': '''## ¡Schema Alineado! 🎯

El sistema ahora está **perfectamente alineado** con el schema de Strapi:

### ✅ Campos utilizados:
- **title** - Título obligatorio
- **content** - Contenido rico
- **slug** - Generado automáticamente  
- **excerpt** - Resumen opcional
- **locale** - Idioma (es)

### 🚀 Sistema operacional:
**¡Todos los campos cumplen con el schema de Strapi!**

Ahora las publicaciones funcionan sin errores.''',
            'excerpt': 'Sistema corregido con schema alineado a Strapi'
        }
    ]
    
    print('🔧 TESTE: SCHEMA CORRETO NOS 3 IDIOMAS')
    print('=' * 50)
    
    results = []
    
    for post in posts_test:
        print(f'\n🌐 Testando {post["locale"]}:')
        print(f'   Título: {post["title"]}')
        
        result = client.create_post(post, post['locale'])
        results.append(result)
        
        if result['success']:
            print(f'   ✅ Sucesso - ID: {result["id"]}')
            if 'url' in result:
                print(f'   🔗 URL: {result["url"]}')
        else:
            print(f'   ❌ Erro: {result["error"]}')
    
    success_count = sum(1 for r in results if r['success'])
    
    print(f'\n📊 RESULTADO FINAL:')
    print(f'   ✅ Sucessos: {success_count}/3')
    print(f'   ❌ Falhas: {3 - success_count}/3')
    
    if success_count == 3:
        print(f'\n🎉 PERFEITO! Schema corrigido - sistema funcionando nos 3 idiomas!')
        print(f'   🇧🇷 Português ✅')
        print(f'   🇺🇸 English ✅') 
        print(f'   🇪🇸 Español ✅')
    else:
        print(f'\n⚠️  Alguns testes falharam - verificar erros acima.')

if __name__ == '__main__':
    test_schema_compliance()
