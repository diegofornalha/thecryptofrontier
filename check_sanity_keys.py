import os
import requests
import json

# Configurações do Sanity
project_id = os.environ.get('SANITY_PROJECT_ID', 'brby2yrg')
dataset = 'production'
api_version = '2023-05-03'
api_token = os.environ.get('SANITY_API_TOKEN')

if not api_token:
    print('❌ Token de API do Sanity não configurado')
    exit(1)

def check_document_arrays(doc_type, additional_fields=""):
    """Verifica arrays em documentos de um tipo específico"""
    print(f'\n🔍 Verificando {doc_type}...')
    
    query = f'''
    *[_type == "{doc_type}"] {{
      _id,
      title,
      "hasContentArray": defined(content) && length(content) > 0,
      "contentItems": content[]{{
        _type,
        _key,
        "hasKey": defined(_key),
        "children": children[]{{
          _type,
          _key,
          "hasKey": defined(_key)
        }}
      }},
      {additional_fields}
    }}[0...5]
    '''
    
    url = f'https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}'
    headers = {'Authorization': f'Bearer {api_token}'}
    params = {'query': query}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            documents = result.get('result', [])
            
            print(f'📊 Encontrados {len(documents)} documentos de {doc_type}')
            
            for doc in documents:
                print(f'\n📝 {doc_type.capitalize()}: {doc.get("title", "Sem título")}')
                
                if not doc.get('hasContentArray'):
                    print('   ⚠️  Sem array de conteúdo')
                    continue
                    
                content_items = doc.get('contentItems', [])
                problems = []
                
                for i, item in enumerate(content_items):
                    if not item.get('hasKey'):
                        problems.append(f'Item {i} sem _key')
                    
                    children = item.get('children', [])
                    for j, child in enumerate(children):
                        if not child.get('hasKey'):
                            problems.append(f'Child {j} do item {i} sem _key')
                
                if problems:
                    print('   ❌ Problemas encontrados:')
                    for problem in problems:
                        print(f'      - {problem}')
                else:
                    print('   ✅ Sem problemas de _key detectados')
        else:
            print(f'❌ Erro na requisição: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

def check_other_arrays():
    """Verifica outros arrays que podem ter problemas de _key"""
    print(f'\n🔍 Verificando outros arrays...')
    
    query = '''
    *[_type in ["header", "footer"]] {
      _id,
      _type,
      title,
      "navLinks": navLinks[]{
        _key,
        "hasKey": defined(_key),
        label
      },
      "socialLinks": socialLinks[]{
        _key,
        "hasKey": defined(_key),
        platform
      },
      "navColumns": navColumns[]{
        _key,
        "hasKey": defined(_key),
        title,
        "links": links[]{
          _key,
          "hasKey": defined(_key),
          label
        }
      }
    }[0...5]
    '''
    
    url = f'https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}'
    headers = {'Authorization': f'Bearer {api_token}'}
    params = {'query': query}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            documents = result.get('result', [])
            
            print(f'📊 Encontrados {len(documents)} documentos de configuração')
            
            for doc in documents:
                print(f'\n📝 {doc.get("_type", "").capitalize()}: {doc.get("title", "Sem título")}')
                
                problems = []
                
                # Verificar navLinks
                nav_links = doc.get('navLinks', [])
                for i, link in enumerate(nav_links):
                    if not link.get('hasKey'):
                        problems.append(f'NavLink {i} sem _key')
                
                # Verificar socialLinks
                social_links = doc.get('socialLinks', [])
                for i, link in enumerate(social_links):
                    if not link.get('hasKey'):
                        problems.append(f'SocialLink {i} sem _key')
                
                # Verificar navColumns
                nav_columns = doc.get('navColumns', [])
                for i, column in enumerate(nav_columns):
                    if not column.get('hasKey'):
                        problems.append(f'NavColumn {i} sem _key')
                    
                    # Verificar links dentro das colunas
                    links = column.get('links', [])
                    for j, link in enumerate(links):
                        if not link.get('hasKey'):
                            problems.append(f'Link {j} da coluna {i} sem _key')
                
                if problems:
                    print('   ❌ Problemas encontrados:')
                    for problem in problems:
                        print(f'      - {problem}')
                else:
                    print('   ✅ Sem problemas de _key detectados')
        else:
            print(f'❌ Erro na requisão: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

# Executar verificações
print('🔍 Verificando problemas de _key no Sanity...')

# Verificar posts
check_document_arrays("post")

# Verificar páginas
check_document_arrays("page")

# Verificar autores
check_document_arrays("author", '"bio": bio[]{"hasKey": defined(_key), _key}')

# Verificar outros arrays
check_other_arrays()

print('\n✅ Verificação concluída!') 