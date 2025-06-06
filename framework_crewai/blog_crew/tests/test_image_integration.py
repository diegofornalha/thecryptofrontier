#!/usr/bin/env python3
"""
Script para testar a integração do ImageGeneratorAgent
"""

import os
import json
from pathlib import Path
from tools.image_generation_unified import process_all_posts_with_images, generate_image_for_post

def test_image_generation():
    """Testa o fluxo de geração de imagens"""
    
    print("🧪 Testando integração de geração de imagens...\n")
    
    # 1. Verificar se há posts formatados
    formatted_dir = Path("posts_formatados")
    if not formatted_dir.exists():
        print("❌ Diretório 'posts_formatados' não encontrado!")
        return
    
    post_files = list(formatted_dir.glob("*.json"))
    print(f"📁 Encontrados {len(post_files)} posts em 'posts_formatados'\n")
    
    if not post_files:
        print("❌ Nenhum post encontrado para processar!")
        return
    
    # 2. Testar com um único post primeiro
    test_file = post_files[0]
    print(f"🎯 Testando com arquivo: {test_file.name}")
    
    try:
        # Ler o post
        with open(test_file, 'r', encoding='utf-8') as f:
            post = json.load(f)
        
        print(f"📄 Título: {post.get('title', 'Sem título')}")
        print(f"🖼️  Tem imagem? {'Sim' if post.get('mainImage') else 'Não'}\n")
        
        # 3. Testar geração individual
        print("🎨 Testando geração individual...")
        result = generate_image_for_post(str(test_file))
        
        if result["success"]:
            print(f"✅ Sucesso: {result['message']}")
            if result.get("asset_id"):
                print(f"📎 Asset ID: {result['asset_id']}")
        else:
            print(f"❌ Falha: {result['message']}")
        
    except Exception as e:
        print(f"❌ Erro no teste individual: {str(e)}")
    
    # 4. Perguntar se deve processar todos
    print("\n" + "="*50)
    response = input("\n🤔 Testar processamento em lote de TODOS os posts? (s/n): ")
    
    if response.lower() == 's':
        print("\n🚀 Iniciando processamento em lote...")
        
        try:
            results = process_all_posts_with_images()
            
            print("\n📊 Resultados:")
            print(f"  - Total processados: {results['processed']}")
            print(f"  - Sucesso: {results['success']}")
            print(f"  - Falhas: {results['failed']}")
            
            if results.get('details'):
                print("\n📋 Detalhes:")
                for detail in results['details'][:5]:  # Mostrar apenas os 5 primeiros
                    print(f"  {detail}")
                
                if len(results['details']) > 5:
                    print(f"  ... e mais {len(results['details']) - 5} entradas")
                    
        except Exception as e:
            print(f"❌ Erro no processamento em lote: {str(e)}")
    
    # 5. Verificar resultados
    print("\n🔍 Verificando resultados finais...")
    
    output_dir = Path("posts_com_imagem")
    if output_dir.exists():
        output_files = list(output_dir.glob("*.json"))
        print(f"✅ {len(output_files)} posts salvos em 'posts_com_imagem'")
    else:
        print("❌ Diretório 'posts_com_imagem' não foi criado")
    
    img_dir = Path("posts_imagens")
    if img_dir.exists():
        img_files = list(img_dir.glob("*.png"))
        print(f"✅ {len(img_files)} imagens salvas em 'posts_imagens'")
    else:
        print("❌ Diretório 'posts_imagens' não foi criado")

if __name__ == "__main__":
    # Verificar variáveis de ambiente
    required_env = ["OPENAI_API_KEY", "SANITY_API_TOKEN"]
    missing = [var for var in required_env if not os.getenv(var)]
    
    if missing:
        print(f"❌ Variáveis de ambiente faltando: {', '.join(missing)}")
        print("Configure as variáveis antes de executar o teste.")
    else:
        test_image_generation()