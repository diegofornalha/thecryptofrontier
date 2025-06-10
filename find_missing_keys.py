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

def find_missing_keys():
    """Busca por arrays que não possuem _key em todos os documentos"""
    print('🔍 Buscando arrays sem _key...')
    
    # Query mais ampla para encontrar problemas
    query = '''
    *[_type in ["header", "footer", "siteConfig"]] {
      _id,
      _type,
      title,
      copyrightText,
      navLinks,
      socialLinks,
      navColumns
    }
    '''
    
    url = f'https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}'
    headers = {'Authorization': f'Bearer {api_token}'}
    params = {'query': query}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            documents = result.get('result', [])
            
            print(f'📊 Analisando {len(documents)} documentos de configuração')
            
            for doc in documents:
                doc_type = doc.get('_type', 'unknown')
                title = doc.get('title') or doc.get('copyrightText', 'Sem título')
                
                print(f'\n📝 {doc_type.capitalize()}: {title[:50]}...')
                
                # Verificar diferentes tipos de arrays
                arrays_to_check = ['navLinks', 'socialLinks', 'navColumns']
                
                for array_name in arrays_to_check:
                    array_data = doc.get(array_name)
                    
                    if array_data and isinstance(array_data, list):
                        print(f'   🔍 Verificando {array_name} ({len(array_data)} itens)')
                        
                        for i, item in enumerate(array_data):
                            if isinstance(item, dict):
                                if '_key' not in item:
                                    print(f'   ❌ {array_name}[{i}] não possui _key')
                                    print(f'      Conteúdo: {json.dumps(item, indent=6, ensure_ascii=False)[:200]}...')
                                
                                # Verificar arrays aninhados
                                for nested_key, nested_value in item.items():
                                    if isinstance(nested_value, list) and nested_key != '_key':
                                        for j, nested_item in enumerate(nested_value):
                                            if isinstance(nested_item, dict) and '_key' not in nested_item:
                                                print(f'   ❌ {array_name}[{i}].{nested_key}[{j}] não possui _key')
                                                print(f'      Conteúdo: {json.dumps(nested_item, indent=8, ensure_ascii=False)[:200]}...')
                    elif array_data:
                        print(f'   ⚠️  {array_name} não é um array: {type(array_data)}')
        else:
            print(f'❌ Erro na requisição: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

def search_all_arrays():
    """Busca todos os arrays em todos os documentos"""
    print('\n🔍 Buscando todos os arrays no Sanity...')
    
    query = '''
    *[_type match "*" && count(*[_type == ^._type]) < 50] {
      _id,
      _type,
      title
    }
    '''
    
    url = f'https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}'
    headers = {'Authorization': f'Bearer {api_token}'}
    params = {'query': query}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            documents = result.get('result', [])
            
            doc_types = {}
            for doc in documents:
                doc_type = doc.get('_type')
                if doc_type not in doc_types:
                    doc_types[doc_type] = 0
                doc_types[doc_type] += 1
            
            print('📊 Tipos de documentos encontrados:')
            for doc_type, count in doc_types.items():
                print(f'   - {doc_type}: {count} documentos')
        else:
            print(f'❌ Erro na requisição: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

# Executar verificações
find_missing_keys()
search_all_arrays()

print('\n✅ Verificação concluída!') 