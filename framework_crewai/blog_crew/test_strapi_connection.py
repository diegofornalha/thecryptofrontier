#!/usr/bin/env python3
"""
Teste de conexão com Strapi v5
"""
import os
import requests
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

STRAPI_URL = os.getenv('STRAPI_URL', 'http://localhost:1338')
STRAPI_API_TOKEN = os.getenv('STRAPI_API_TOKEN')

def test_strapi_connection():
    """Testa a conexão com o Strapi"""
    print(f"🔍 Testando conexão com Strapi...")
    print(f"URL: {STRAPI_URL}")
    print(f"Token: {STRAPI_API_TOKEN[:20]}...") # Mostra apenas início do token
    
    headers = {
        'Authorization': f'Bearer {STRAPI_API_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Testa endpoint de posts
        response = requests.get(f"{STRAPI_URL}/api/posts", headers=headers)
        
        if response.status_code == 200:
            print("✅ Conexão com Strapi estabelecida com sucesso!")
            data = response.json()
            print(f"📊 Posts encontrados: {data.get('meta', {}).get('pagination', {}).get('total', 0)}")
            return True
        else:
            print(f"❌ Erro na conexão: Status {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao Strapi")
        print("Verifique se o Strapi está rodando na porta 1338")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        return False

if __name__ == "__main__":
    test_strapi_connection()