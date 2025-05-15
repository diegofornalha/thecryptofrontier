#!/usr/bin/env python3
"""
Script para atualizar a configuração do Sanity com o novo token
Cria um arquivo .env.sanity que pode ser carregado pelo sistema
"""

import os
import logging
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sanity_config")

# Token do Sanity com permissões corretas
SANITY_TOKEN = "ske0xiMqVVtwL0uu1WniYKnUzLdPCGIAEZlWS6odd3c5d5pKPEUHZIbM6UIcSXF2qdHgE7vRwcFhv6Cq9KCtbNuhbTkLWYTZrSVOGcqnweIbjVuS0TasGjhiMQsbYeOWCB4HZE8rEXDXx73pXjZHdiBVKZh2GWwnT2TxRA7hR2ZB2VAuWvj6"

def update_env_file():
    """Atualiza o arquivo .env com o token do Sanity"""
    env_file = Path(".env")
    
    # Se o arquivo .env existe, lê o conteúdo atual
    if env_file.exists():
        with open(env_file, "r") as f:
            conteudo = f.read()
        
        # Verifica se já existe a variável SANITY_API_TOKEN
        if "SANITY_API_TOKEN=" in conteudo:
            # Substitui o valor da variável
            linhas = conteudo.splitlines()
            novo_conteudo = []
            
            for linha in linhas:
                if linha.startswith("SANITY_API_TOKEN="):
                    novo_conteudo.append(f"SANITY_API_TOKEN={SANITY_TOKEN}")
                else:
                    novo_conteudo.append(linha)
            
            # Escreve o novo conteúdo no arquivo
            with open(env_file, "w") as f:
                f.write("\n".join(novo_conteudo))
            
            logger.info(f"Token atualizado no arquivo {env_file}")
        else:
            # Adiciona a variável no final do arquivo
            with open(env_file, "a") as f:
                f.write(f"\nSANITY_API_TOKEN={SANITY_TOKEN}\n")
            
            logger.info(f"Token adicionado no arquivo {env_file}")
    else:
        # Cria o arquivo .env
        with open(env_file, "w") as f:
            f.write(f"SANITY_API_TOKEN={SANITY_TOKEN}\n")
        
        logger.info(f"Arquivo {env_file} criado com o token")

def update_config_file():
    """Atualiza o arquivo config/sanity_config.py com o token do Sanity"""
    config_file = Path("config/sanity_config.py")
    
    if not config_file.exists():
        logger.warning(f"Arquivo {config_file} não encontrado")
        return
    
    # Lê o conteúdo atual
    with open(config_file, "r") as f:
        conteudo = f.read()
    
    # Adiciona linha para definir o token padrão
    linhas = conteudo.splitlines()
    novo_conteudo = []
    token_adicionado = False
    
    for linha in linhas:
        novo_conteudo.append(linha)
        
        # Adiciona o token após a definição de SANITY_CONFIG
        if "SANITY_CONFIG = {" in linha and not token_adicionado:
            # Avança até o final da definição de SANITY_CONFIG
            i = linhas.index(linha)
            while i < len(linhas) and "}" not in linhas[i]:
                i += 1
            
            if i < len(linhas):
                # Adiciona o token após a definição de SANITY_CONFIG
                indice = novo_conteudo.index(linhas[i]) + 1
                novo_conteudo.insert(indice, "\n# Token padrão do Sanity com permissões corretas")
                novo_conteudo.insert(indice + 1, f"DEFAULT_SANITY_TOKEN = os.environ.get('SANITY_API_TOKEN', '{SANITY_TOKEN}')")
                token_adicionado = True
    
    # Escreve o novo conteúdo no arquivo
    with open(config_file, "w") as f:
        f.write("\n".join(novo_conteudo))
    
    logger.info(f"Token adicionado no arquivo {config_file}")

def create_test_script():
    """Cria um script de teste que será importado pela aplicação principal"""
    test_script = Path("test_sanity_integration.py")
    
    conteudo = f"""#!/usr/bin/env python3
\"\"\"
Script para testar a integração com o Sanity CMS
Este script é importado pela aplicação principal quando ela é executada
\"\"\"

import os
import logging
import requests
from datetime import datetime

# Configuração de logging
logger = logging.getLogger(__name__)

# Token do Sanity
SANITY_TOKEN = "{SANITY_TOKEN}"

def verificar_sanity():
    \"\"\"Verifica se o token do Sanity está configurado corretamente\"\"\"
    # Configurações do Sanity
    project_id = "brby2yrg"
    api_version = "2023-05-03"
    
    # URL da API do Sanity
    url = f"https://{{project_id}}.api.sanity.io/v{{api_version}}/projects/{{project_id}}"
    
    # Configuração de autenticação
    headers = {{
        "Authorization": f"Bearer {{SANITY_TOKEN}}"
    }}
    
    try:
        # Verificar conexão
        logger.info("Verificando conexão com Sanity...")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            logger.info("✅ Conexão com Sanity verificada com sucesso!")
            
            # Verificar permissão de leitura
            query_url = f"https://{{project_id}}.api.sanity.io/v{{api_version}}/data/query/production?query=*[_type==\"post\"][0...10]"
            read_response = requests.get(query_url, headers=headers, timeout=10)
            
            if read_response.status_code == 200:
                logger.info("✅ Permissão de leitura verificada com sucesso!")
                
                # Criar post de teste para verificar permissão de escrita
                titulo = f"Teste de Integração - {{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}}"
                post_data = {{
                    "_type": "post",
                    "title": titulo,
                    "slug": {{
                        "_type": "slug",
                        "current": titulo.lower().replace(" ", "-").replace(":", "").replace(".", "")
                    }},
                    "publishedAt": datetime.now().isoformat(),
                    "excerpt": "Este é um post de teste para verificar a integração com o Sanity",
                    "content": [
                        {{
                            "_type": "block",
                            "_key": "test1",
                            "style": "normal",
                            "children": [
                                {{
                                    "_type": "span",
                                    "_key": "test2",
                                    "text": "Este é um post de teste para verificar a integração com o Sanity",
                                    "marks": []
                                }}
                            ],
                            "markDefs": []
                        }}
                    ]
                }}
                
                # URL para criação de posts
                create_url = f"https://{{project_id}}.api.sanity.io/v{{api_version}}/data/mutate/production"
                
                # Preparar a mutação
                mutations = {{
                    "mutations": [
                        {{
                            "create": post_data
                        }}
                    ]
                }}
                
                # Enviar a requisição
                create_response = requests.post(create_url, headers={{"Content-Type": "application/json", "Authorization": f"Bearer {{SANITY_TOKEN}}"}}, json=mutations, timeout=30)
                
                if create_response.status_code == 200:
                    result = create_response.json()
                    document_id = result.get("results", [{{}}])[0].get("id")
                    logger.info(f"✅ Permissão de escrita verificada com sucesso! ID do post: {{document_id}}")
                    logger.info("🎉 Integração com Sanity verificada com sucesso!")
                    
                    return True, "Integração com Sanity verificada com sucesso"
                else:
                    logger.error(f"❌ Falha ao verificar permissão de escrita: {{create_response.status_code}}")
                    logger.error(create_response.text)
                    
                    return False, f"Falha ao verificar permissão de escrita: {{create_response.status_code}} - {{create_response.text}}"
            else:
                logger.error(f"❌ Falha ao verificar permissão de leitura: {{read_response.status_code}}")
                logger.error(read_response.text)
                
                return False, f"Falha ao verificar permissão de leitura: {{read_response.status_code}} - {{read_response.text}}"
        else:
            logger.error(f"❌ Falha na conexão com Sanity: {{response.status_code}}")
            logger.error(response.text)
            
            return False, f"Falha na conexão com Sanity: {{response.status_code}} - {{response.text}}"
    except Exception as e:
        logger.error(f"❌ Erro ao verificar integração com Sanity: {{str(e)}}")
        return False, f"Erro ao verificar integração com Sanity: {{str(e)}}"

if __name__ == "__main__":
    # Configuração de logging para execução direta
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    
    logger.info("Testando integração com Sanity...")
    verificar_sanity()
"""
    
    with open(test_script, "w") as f:
        f.write(conteudo)
    
    logger.info(f"Script de teste criado: {test_script}")

if __name__ == "__main__":
    logger.info("Atualizando configuração do Sanity...")
    
    # Atualiza o arquivo .env
    update_env_file()
    
    # Atualiza o arquivo config/sanity_config.py
    update_config_file()
    
    # Cria um script de teste
    create_test_script()
    
    logger.info("Configuração do Sanity atualizada com sucesso!")
    logger.info("Execute o script 'test_sanity_integration.py' para verificar a integração.") 