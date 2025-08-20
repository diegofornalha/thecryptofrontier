#!/usr/bin/env python3
"""
Teste com conteúdo específico para cada idioma
"""

from strapi_integration_i18n import StrapiI18nIntegration
import datetime

def test_idiomas_corretos():
    """Testa criação com conteúdo específico para cada idioma"""
    
    client = StrapiI18nIntegration()
    
    # Timestamp para evitar slugs duplicados
    timestamp = datetime.datetime.now().strftime("%H%M%S")
    
    # Posts REALMENTE em idiomas diferentes
    posts_multilingual = [
        {
            'locale': 'pt-BR',
            'title': f'🇧🇷 Notícias de Criptomoedas em Português - {timestamp}',
            'content': '''## Bem-vindo ao The Crypto Frontier! 🇧🇷

### 📈 Mercado Brasileiro
O **mercado de criptomoedas brasileiro** está em constante crescimento:

- **Bitcoin (BTC)** continua sendo a moeda mais negociada
- **Ethereum (ETH)** ganha força com contratos inteligentes
- **Regulamentação no Brasil** avança positivamente

### 🚀 Tecnologia Blockchain
A tecnologia blockchain está **revolucionando** diversos setores:
- Finanças descentralizadas (DeFi)
- Tokens não fungíveis (NFTs)
- Contratos inteligentes

**Mantenha-se atualizado** com as últimas tendências do mercado cripto brasileiro!''',
            'excerpt': 'Últimas notícias sobre criptomoedas e blockchain no Brasil'
        },
        {
            'locale': 'en',
            'title': f'🇺🇸 Cryptocurrency News in English - {timestamp}',
            'content': '''## Welcome to The Crypto Frontier! 🇺🇸

### 📊 Global Market Analysis
The **global cryptocurrency market** shows remarkable trends:

- **Bitcoin (BTC)** remains the market leader
- **Ethereum (ETH)** powers decentralized applications
- **Institutional adoption** continues growing

### 🌐 Blockchain Innovation
Blockchain technology is **transforming** multiple industries:
- Decentralized Finance (DeFi)
- Non-Fungible Tokens (NFTs)
- Smart Contracts

**Stay informed** about the latest developments in the crypto ecosystem!''',
            'excerpt': 'Latest cryptocurrency and blockchain news in English'
        },
        {
            'locale': 'es', 
            'title': f'🇪🇸 Noticias de Criptomonedas en Español - {timestamp}',
            'content': '''## ¡Bienvenido a The Crypto Frontier! 🇪🇸

### 💰 Análisis del Mercado Latino
El **mercado de criptomonedas latino** presenta oportunidades únicas:

- **Bitcoin (BTC)** lidera las transacciones regionales
- **Ethereum (ETH)** impulsa la innovación financiera
- **Regulación en Latinoamérica** evoluciona favorablemente

### 🔗 Innovación Blockchain
La tecnología blockchain está **transformando** sectores clave:
- Finanzas descentralizadas (DeFi)
- Tokens no fungibles (NFTs)
- Contratos inteligentes

**Mantente al día** con las últimas tendencias del ecosistema cripto latino!''',
            'excerpt': 'Últimas noticias sobre criptomonedas y blockchain en español'
        }
    ]
    
    print('🌐 TESTE: CONTEÚDO ESPECÍFICO PARA CADA IDIOMA')
    print('=' * 55)
    
    results = []
    
    for post in posts_multilingual:
        print(f'\n🗣️ Idioma: {post["locale"]}')
        print(f'   📝 Título: {post["title"]}')
        print(f'   📄 Resumo: {post["excerpt"]}')
        
        result = client.create_post(post, post['locale'])
        results.append(result)
        
        if result['success']:
            print(f'   ✅ SUCESSO - ID: {result["id"]}')
            print(f'   🔗 URL: {result["url"]}')
            print(f'   🏷️ Slug: {result["slug"]}')
        else:
            print(f'   ❌ ERRO: {result["error"]}')
    
    success_count = sum(1 for r in results if r['success'])
    
    print(f'\n📊 RESULTADO FINAL:')
    print(f'   🇧🇷 Português: {"✅" if results[0]["success"] else "❌"}')
    print(f'   🇺🇸 English: {"✅" if results[1]["success"] else "❌"}')
    print(f'   🇪🇸 Español: {"✅" if results[2]["success"] else "❌"}')
    print(f'   📈 Taxa de sucesso: {success_count}/3')
    
    if success_count == 3:
        print(f'\n🎉 PERFEITO! Todos os idiomas publicados corretamente!')
        print(f'   🌐 Sistema multilíngue 100% funcional!')
        
        # URLs para verificação
        print(f'\n🔗 Verificar no frontend:')
        for i, result in enumerate(results):
            if result['success']:
                lang_names = ['Português 🇧🇷', 'English 🇺🇸', 'Español 🇪🇸']
                base_url = 'https://thecryptofrontier.agentesintegrados.com'
                print(f'   {lang_names[i]}: {base_url}{result["url"]}')
    else:
        print(f'\n⚠️ Alguns posts falharam - verificar erros acima.')
    
    client.show_stats()

if __name__ == '__main__':
    test_idiomas_corretos()
