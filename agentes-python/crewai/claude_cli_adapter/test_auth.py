#!/usr/bin/env python3
"""
Script para testar e configurar autenticação com Strapi
"""
import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# Tentar carregar .env
env_path = Path('.env')
if not env_path.exists():
    print("⚠️ Arquivo .env não encontrado. Criando com valores padrão...")
    
    # Copiar do .env.example
    if Path('.env.example').exists():
        import shutil
        shutil.copy('.env.example', '.env')
        print("✅ .env criado a partir do .env.example")
    else:
        # Criar .env básico
        with open('.env', 'w') as f:
            f.write("""# Configurações do Strapi
STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=

# Configurações de autenticação (se usar JWT)
STRAPI_EMAIL=
STRAPI_PASSWORD=
""")
        print("✅ .env básico criado")

load_dotenv()

def test_api_token():
    """Testa autenticação com API Token"""
    url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com').rstrip('/')
    token = os.getenv('STRAPI_API_TOKEN', '')
    
    print("\n🔐 Testando API Token...")
    print(f"URL: {url}")
    
    if not token:
        print("❌ API Token não configurado no .env")
        print("\n💡 Para obter um API Token:")
        print("1. Acesse o Strapi Admin")
        print("2. Vá em Settings → API Tokens")
        print("3. Crie um novo token com permissões de 'find' e 'create' para Posts")
        print("4. Adicione o token no arquivo .env")
        return False
    
    print(f"Token: {token[:20]}...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Testar GET
        print("\n📥 Testando GET /api/posts...")
        response = requests.get(f"{url}/api/posts", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ GET funcionando!")
            data = response.json()
            total = data.get('meta', {}).get('pagination', {}).get('total', 0)
            print(f"Total de posts: {total}")
        elif response.status_code == 401:
            print("❌ Token inválido ou expirado")
        elif response.status_code == 403:
            print("❌ Token sem permissão para ler posts")
        else:
            print(f"❌ Erro: {response.text[:200]}")
        
        # Testar POST (dry-run)
        print("\n📤 Testando permissão POST /api/posts...")
        test_data = {
            "data": {
                "title": "Test Post - Delete Me",
                "slug": "test-post-delete-me",
                "content": "Test content",
                "locale": "pt"
            }
        }
        
        # Usar OPTIONS para verificar se o endpoint aceita POST
        response = requests.options(f"{url}/api/posts", headers=headers)
        if response.status_code == 204:
            print("✅ Endpoint POST disponível")
        else:
            print("⚠️ Não foi possível verificar POST")
        
        return response.status_code in [200, 204]
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - verifique se o Strapi está acessível")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_jwt_auth():
    """Testa autenticação JWT (login de usuário)"""
    url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com').rstrip('/')
    email = os.getenv('STRAPI_EMAIL', '')
    password = os.getenv('STRAPI_PASSWORD', '')
    
    print("\n🔑 Testando autenticação JWT...")
    
    if not email or not password:
        print("❌ Email ou senha não configurados no .env")
        print("\n💡 JWT é usado apenas para login de usuários")
        print("Para automação, use API Tokens (recomendado)")
        return False
    
    try:
        response = requests.post(
            f"{url}/api/auth/local",
            json={
                "identifier": email,
                "password": password
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            jwt = data.get('jwt', '')
            user = data.get('user', {})
            
            print("✅ Login bem-sucedido!")
            print(f"Usuário: {user.get('username', 'N/A')}")
            print(f"Email: {user.get('email', 'N/A')}")
            print(f"JWT: {jwt[:20]}...")
            
            # Salvar JWT
            with open('.jwt_token', 'w') as f:
                f.write(jwt)
            print("✅ JWT salvo em .jwt_token")
            
            return True
        else:
            print(f"❌ Falha no login: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def check_i18n_config():
    """Verifica configuração de i18n no Strapi"""
    url = os.getenv('STRAPI_URL', 'https://ale-blog.agentesintegrados.com').rstrip('/')
    token = os.getenv('STRAPI_API_TOKEN', '')
    
    if not token:
        print("\n⚠️ Não é possível verificar i18n sem API Token")
        return
    
    print("\n🌍 Verificando configuração i18n...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Tentar buscar posts com locale
        response = requests.get(f"{url}/api/posts?locale=all", headers=headers)
        
        if response.status_code == 200:
            print("✅ i18n parece estar habilitado")
            
            # Verificar locales disponíveis
            data = response.json()
            locales_found = set()
            
            for item in data.get('data', []):
                locale = item.get('locale', 'pt')
                locales_found.add(locale)
            
            if locales_found:
                print(f"Locales encontrados: {', '.join(sorted(locales_found))}")
            else:
                print("Nenhum locale específico encontrado nos posts")
                
        else:
            print("⚠️ Não foi possível verificar i18n")
            
    except Exception as e:
        print(f"❌ Erro: {e}")

def main():
    """Executa todos os testes"""
    print("🚀 Teste de Autenticação Strapi v5")
    print("="*50)
    
    # Teste 1: API Token (recomendado)
    api_token_ok = test_api_token()
    
    # Teste 2: JWT (opcional)
    test_jwt_auth()
    
    # Teste 3: i18n
    check_i18n_config()
    
    # Resumo
    print("\n" + "="*50)
    print("📊 RESUMO:")
    
    if api_token_ok:
        print("✅ Autenticação via API Token funcionando!")
        print("   Você pode publicar posts usando o pipeline")
    else:
        print("❌ Configure o API Token no arquivo .env")
        print("   Sem ele, o pipeline não funcionará")
    
    print("\n💡 Próximos passos:")
    print("1. Configure o API Token no .env")
    print("2. Execute: python3 strapi_publisher.py --file arquivo.json")
    print("3. Para múltiplos idiomas: --locales pt,en,es")

if __name__ == "__main__":
    main()