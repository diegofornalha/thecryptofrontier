#!/usr/bin/env python
# Arquivo para testar o funcionamento básico do sistema

import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Adicionar diretórios necessários ao PATH
sys.path.append(os.path.abspath('.'))

# Importar módulos necessários
from agentes_backup_legado.db_manager import init_db, save_processed_post, get_all_processed_posts

def main():
    """Função principal para testar a funcionalidade do sistema."""
    # Mostrar versão do Python
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    
    # Inicializar banco de dados
    print("Inicializando banco de dados...")
    init_db()
    
    # Verificar posts processados
    posts = get_all_processed_posts()
    print(f"Total de posts processados: {len(posts)}")
    
    # Inserir post de teste
    print("Inserindo post de teste...")
    result = save_processed_post(
        guid=f"test-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        title="Post de teste para verificar funcionamento",
        content="Este é um conteúdo de teste para o post.",
        link="https://example.com/test",
        output_file="test.json"
    )
    
    # Verificar novamente
    posts = get_all_processed_posts()
    print(f"Total de posts após inserção: {len(posts)}")
    
    # Listar últimos 3 posts
    print("\nÚltimos posts processados:")
    for i, post in enumerate(posts[:3]):
        print(f"{i+1}. {post['title']} - {post['processed_date']}")
    
    print("\nTeste concluído!")

if __name__ == "__main__":
    main() 