import os
import requests
import json
import uuid

# Configurações do Sanity
project_id = os.environ.get('SANITY_PROJECT_ID', 'brby2yrg')
dataset = 'production'
api_version = '2023-05-03'
api_token = os.environ.get('SANITY_API_TOKEN')

if not api_token:
    print('❌ Token de API do Sanity não configurado')
    exit(1)

def generate_key():
    """Gera uma chave aleatória de 8 caracteres"""
    return str(uuid.uuid4())[:8]

def add_keys_to_array(array_data):
    """Adiciona chaves _key a itens de array que não possuem"""
    if not isinstance(array_data, list):
        return array_data
    
    modified = False
    for item in array_data:
        if isinstance(item, dict) and '_key' not in item:
            item['_key'] = generate_key()
            modified = True
            
        # Verificar arrays aninhados
        for key, value in item.items() if isinstance(item, dict) else []:
            if isinstance(value, list):
                nested_modified = add_keys_to_array(value)
                if nested_modified:
                    modified = True
    
    return modified

def fix_document_keys():
    """Encontra documentos com arrays sem _key e os corrige"""
    print('🔧 Corrigindo chaves _key faltando...')
    
    # Buscar documentos que podem ter arrays sem _key
    query = '''
    *[_type in ["header", "footer", "siteConfig"]] {
      _id,
      _type,
      ...
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
            
            print(f'📊 Analisando {len(documents)} documentos')
            
            for doc in documents:
                doc_id = doc.get('_id')
                doc_type = doc.get('_type')
                
                print(f'\n📝 Verificando {doc_type}: {doc_id}')
                
                # Criar uma cópia do documento para modificação
                modified_doc = doc.copy()
                has_changes = False
                
                # Arrays que podem precisar de _key
                array_fields = ['navLinks', 'socialLinks', 'navColumns']
                
                for field in array_fields:
                    if field in modified_doc and isinstance(modified_doc[field], list):
                        if add_keys_to_array(modified_doc[field]):
                            print(f'   ✅ Adicionadas chaves em {field}')
                            has_changes = True
                
                # Se houve modificações, atualizar o documento
                if has_changes:
                    print(f'   🔄 Atualizando documento {doc_id}...')
                    
                    # Preparar mutação
                    mutation = {
                        "mutations": [
                            {
                                "patch": {
                                    "id": doc_id,
                                    "set": {k: v for k, v in modified_doc.items() 
                                           if k in array_fields and isinstance(v, list)}
                                }
                            }
                        ]
                    }
                    
                    # Enviar mutação
                    mutation_url = f'https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}'
                    mutation_headers = {
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {api_token}'
                    }
                    
                    mutation_response = requests.post(
                        mutation_url, 
                        headers=mutation_headers, 
                        json=mutation
                    )
                    
                    if mutation_response.status_code == 200:
                        print(f'   ✅ Documento {doc_id} atualizado com sucesso')
                    else:
                        print(f'   ❌ Erro ao atualizar {doc_id}: {mutation_response.text}')
                else:
                    print(f'   ℹ️  Nenhuma correção necessária')
        else:
            print(f'❌ Erro na busca: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

def check_posts_content_keys():
    """Verifica e corrige chaves em conteúdo de posts"""
    print('\n🔧 Verificando chaves em conteúdo de posts...')
    
    query = '''
    *[_type == "post" && defined(content)] {
      _id,
      title,
      content
    }[0...3]
    '''
    
    url = f'https://{project_id}.api.sanity.io/v{api_version}/data/query/{dataset}'
    headers = {'Authorization': f'Bearer {api_token}'}
    params = {'query': query}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            result = response.json()
            posts = result.get('result', [])
            
            for post in posts:
                post_id = post.get('_id')
                title = post.get('title', 'Sem título')
                content = post.get('content', [])
                
                print(f'\n📝 Post: {title[:50]}...')
                
                has_changes = False
                modified_content = []
                
                for i, block in enumerate(content):
                    if isinstance(block, dict):
                        block_copy = block.copy()
                        
                        # Adicionar _key se não existe
                        if '_key' not in block_copy:
                            block_copy['_key'] = generate_key()
                            has_changes = True
                            print(f'   ✅ Adicionada _key ao bloco {i}')
                        
                        # Verificar children
                        if 'children' in block_copy and isinstance(block_copy['children'], list):
                            for j, child in enumerate(block_copy['children']):
                                if isinstance(child, dict) and '_key' not in child:
                                    child['_key'] = generate_key()
                                    has_changes = True
                                    print(f'   ✅ Adicionada _key ao child {j} do bloco {i}')
                        
                        modified_content.append(block_copy)
                    else:
                        modified_content.append(block)
                
                if has_changes:
                    print(f'   🔄 Atualizando conteúdo do post...')
                    
                    mutation = {
                        "mutations": [
                            {
                                "patch": {
                                    "id": post_id,
                                    "set": {
                                        "content": modified_content
                                    }
                                }
                            }
                        ]
                    }
                    
                    mutation_url = f'https://{project_id}.api.sanity.io/v{api_version}/data/mutate/{dataset}'
                    mutation_headers = {
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {api_token}'
                    }
                    
                    mutation_response = requests.post(
                        mutation_url, 
                        headers=mutation_headers, 
                        json=mutation
                    )
                    
                    if mutation_response.status_code == 200:
                        print(f'   ✅ Post atualizado com sucesso')
                    else:
                        print(f'   ❌ Erro ao atualizar post: {mutation_response.text}')
                else:
                    print(f'   ℹ️  Nenhuma correção necessária')
        else:
            print(f'❌ Erro na busca: {response.status_code}')
            print(response.text)
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')

# Executar correções
print('🔧 Iniciando correção de chaves _key...')
fix_document_keys()
check_posts_content_keys()
print('\n✅ Correção concluída!') 