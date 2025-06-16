#!/usr/bin/env python3
"""
Configura permissões do Strapi v5 para acesso público aos content-types
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

STRAPI_URL = os.getenv('STRAPI_URL', 'http://localhost:1338')
STRAPI_API_TOKEN = os.getenv('STRAPI_API_TOKEN')

def setup_permissions():
    """Configura permissões para acesso público aos content-types"""
    print("🔧 Configurando permissões do Strapi v5...")
    
    headers = {
        'Authorization': f'Bearer {STRAPI_API_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    # Content-types para configurar
    content_types = ['post', 'author', 'page']
    actions = ['find', 'findOne']
    
    try:
        # Primeiro, obter o ID do papel público
        roles_response = requests.get(
            f"{STRAPI_URL}/api/users-permissions/roles",
            headers=headers
        )
        
        if roles_response.status_code != 200:
            print(f"❌ Erro ao buscar roles: {roles_response.status_code}")
            return False
            
        roles = roles_response.json()
        public_role = next((role for role in roles.get('roles', []) if role['type'] == 'public'), None)
        
        if not public_role:
            print("❌ Role público não encontrado")
            return False
            
        print(f"✅ Role público encontrado: ID {public_role['id']}")
        
        # Atualizar permissões
        permissions = {}
        for content_type in content_types:
            permissions[f'api::{content_type}'] = {
                'controllers': {
                    content_type: actions
                }
            }
        
        update_response = requests.put(
            f"{STRAPI_URL}/api/users-permissions/roles/{public_role['id']}",
            headers=headers,
            json={
                'permissions': permissions
            }
        )
        
        if update_response.status_code == 200:
            print("✅ Permissões configuradas com sucesso!")
            return True
        else:
            print(f"❌ Erro ao atualizar permissões: {update_response.status_code}")
            print(update_response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return False

if __name__ == "__main__":
    setup_permissions()