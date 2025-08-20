#!/usr/bin/env python3
"""
Script para atualizar as configurações das ferramentas de integração com Algolia.
Usado para definir valores padrão de configuração em todos os scripts relacionados.
"""

import os
import sys
import re
import glob

# Definições das configurações do Algolia
ALGOLIA_CONFIG = {
    'ALGOLIA_APP_ID': '42TZWHW8UP',
    'ALGOLIA_ADMIN_API_KEY': 'd0cb55ec8f07832bc5f57da0bd25c535',  # Admin API Key
    'ALGOLIA_INDEX_NAME': 'development_mcpx_content',
    'ALGOLIA_SEARCH_API_KEY': 'b32edbeb383fc3d1279658e7c3661843',
}

# Padrões para localizar as configurações nos arquivos
CONFIG_PATTERN = r'(?:# Configurações do Algolia\s+)?ALGOLIA_APP_ID\s*=\s*os\.environ\.get\([\'"]ALGOLIA_APP_ID[\'"](?:,\s*[\'"].*?[\'"]\s*)?\)[\r\n]+ALGOLIA_ADMIN_API_KEY\s*=\s*os\.environ\.get\([\'"]ALGOLIA_ADMIN_API_KEY[\'"](?:,\s*[\'"].*?[\'"]\s*)?\)[\r\n]+ALGOLIA_INDEX_NAME\s*=\s*os\.environ\.get\([\'"]ALGOLIA_INDEX_NAME[\'"](?:,\s*[\'"].*?[\'"]\s*)?\)'

# Diretórios para procurar arquivos Python
DIRS_TO_SEARCH = [
    os.path.join(os.getcwd()),
    os.path.join(os.getcwd(), 'tools')
]

def update_algolia_config_in_file(file_path):
    """
    Atualiza as configurações do Algolia em um arquivo específico.
    
    Args:
        file_path: Caminho do arquivo para atualizar
    
    Returns:
        bool: True se o arquivo foi atualizado, False caso contrário
    """
    try:
        # Ler o arquivo
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Procurar pelo padrão de configuração
        match = re.search(CONFIG_PATTERN, content)
        if not match:
            print(f"❌ Padrão de configuração não encontrado em {file_path}")
            return False
        
        # Texto de substituição
        replacement = f"""# Configurações do Algolia
ALGOLIA_APP_ID = os.environ.get("ALGOLIA_APP_ID", "{ALGOLIA_CONFIG['ALGOLIA_APP_ID']}")
ALGOLIA_ADMIN_API_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY", "{ALGOLIA_CONFIG['ALGOLIA_ADMIN_API_KEY']}")  # Admin API Key
ALGOLIA_INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", "{ALGOLIA_CONFIG['ALGOLIA_INDEX_NAME']}")"""
        
        # Substituir a configuração
        updated_content = content.replace(match.group(0), replacement)
        
        # Escrever o arquivo atualizado
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print(f"✅ Configurações atualizadas em {file_path}")
        return True
    
    except Exception as e:
        print(f"❌ Erro ao atualizar {file_path}: {str(e)}")
        return False

def update_algolia_tool(file_path):
    """
    Atualiza as configurações na ferramenta CrewAI para Algolia.
    
    Args:
        file_path: Caminho do arquivo de ferramentas Algolia
    
    Returns:
        bool: True se o arquivo foi atualizado, False caso contrário
    """
    try:
        # Ler o arquivo
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Padrão para configurações de credenciais dentro de funções
        cred_pattern = r'app_id\s*=\s*os\.environ\.get\([\'"]ALGOLIA_APP_ID[\'"]\)[\r\n]\s+api_key\s*=\s*os\.environ\.get\([\'"]ALGOLIA_ADMIN_API_KEY[\'"]\)[\r\n]\s+index_name\s*=\s*os\.environ\.get\([\'"]ALGOLIA_INDEX_NAME[\'"]\)'
        
        # Verificar se encontrou o padrão
        matches = re.findall(cred_pattern, content)
        if not matches:
            print(f"❌ Padrão de credenciais não encontrado em {file_path}")
            return False
        
        # Texto de substituição para credenciais dentro de funções
        replacement = f"""app_id = os.environ.get('ALGOLIA_APP_ID', '{ALGOLIA_CONFIG['ALGOLIA_APP_ID']}')
        api_key = os.environ.get('ALGOLIA_ADMIN_API_KEY', '{ALGOLIA_CONFIG['ALGOLIA_ADMIN_API_KEY']}')
        index_name = os.environ.get('ALGOLIA_INDEX_NAME', '{ALGOLIA_CONFIG['ALGOLIA_INDEX_NAME']}')"""
        
        # Substituir todas as ocorrências
        updated_content = content
        for match in matches:
            updated_content = updated_content.replace(match, replacement)
        
        # Escrever o arquivo atualizado
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print(f"✅ Credenciais dentro de funções atualizadas em {file_path}")
        return True
    
    except Exception as e:
        print(f"❌ Erro ao atualizar credenciais em {file_path}: {str(e)}")
        return False

def main():
    """Função principal para atualizar configurações."""
    updated_files = []
    
    # Procurar e atualizar arquivos
    for dir_path in DIRS_TO_SEARCH:
        python_files = glob.glob(os.path.join(dir_path, "*.py"))
        for file_path in python_files:
            filename = os.path.basename(file_path)
            if "algolia" in filename.lower():
                print(f"🔍 Processando arquivo: {file_path}")
                
                # Atualizar as configurações principais
                if update_algolia_config_in_file(file_path):
                    updated_files.append(file_path)
                
                # Para ferramentas CrewAI, atualizar também as credenciais dentro das funções
                if "tools" in file_path:
                    update_algolia_tool(file_path)
    
    # Mostrar resumo
    if updated_files:
        print(f"\n✅ Foram atualizados {len(updated_files)} arquivos:")
        for file in updated_files:
            print(f"  - {file}")
    else:
        print("\n❌ Nenhum arquivo foi atualizado.")
    
    print("\n⚙️ Configurações do Algolia definidas:")
    for key, value in ALGOLIA_CONFIG.items():
        print(f"  {key}: {value}")

if __name__ == "__main__":
    main()