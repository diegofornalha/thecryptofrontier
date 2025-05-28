#!/usr/bin/env python3
"""
Script de teste para validar a geração de imagens com DALL-E
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório atual ao path
sys.path.append(str(Path(__file__).parent))

# Importar as ferramentas
from tools.openai_image_tools import generate_blog_image, upload_image_to_sanity, generate_and_upload_blog_image

def test_image_generation():
    """Testa a geração de imagem"""
    print("=== Teste de Geração de Imagem com DALL-E ===\n")
    
    # Verificar se a API key está configurada
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print("✅ OPENAI_API_KEY está configurada")
    else:
        print("❌ OPENAI_API_KEY não está configurada no .env")
        return
    
    # Teste 1: Gerar imagem para um artigo sobre Bitcoin
    print("\n1. Testando geração de imagem sobre Bitcoin...")
    result = generate_blog_image(
        title="Bitcoin ultrapassa $100,000 pela primeira vez na história",
        description="Análise do momento histórico do mercado de criptomoedas com Bitcoin atingindo seis dígitos"
    )
    
    if result["success"]:
        print(f"✅ Imagem gerada com sucesso!")
        print(f"   - Arquivo local: {result['local_path']}")
        print(f"   - Tamanho: {result['size']}")
        print(f"   - Qualidade: {result['quality']}")
        print(f"   - Prompt usado: {result['revised_prompt'][:100]}...")
    else:
        print(f"❌ Erro ao gerar imagem: {result['error']}")
        return
    
    # Teste 2: Fazer upload para o Sanity (opcional)
    print("\n2. Testando upload para Sanity...")
    sanity_token = os.getenv("SANITY_API_TOKEN")
    project_id = os.getenv("SANITY_PROJECT_ID")
    
    if sanity_token and project_id:
        print("✅ Credenciais do Sanity configuradas")
        
        upload_result = upload_image_to_sanity(
            image_path=result["local_path"],
            title="Bitcoin $100k",
            alt_text="Bitcoin ultrapassa $100,000 - marco histórico"
        )
        
        if upload_result["success"]:
            print(f"✅ Upload realizado com sucesso!")
            print(f"   - Asset ID: {upload_result['asset_id']}")
            print(f"   - URL: {upload_result['url']}")
        else:
            print(f"❌ Erro no upload: {upload_result['error']}")
    else:
        print("⚠️  Credenciais do Sanity não configuradas - pulando teste de upload")
    
    # Teste 3: Função combinada
    print("\n3. Testando função combinada (gerar + upload)...")
    combined_result = generate_and_upload_blog_image(
        title="Ethereum 2.0: A nova era das criptomoedas sustentáveis",
        description="Como a transição para Proof of Stake está revolucionando o mercado",
        upload_to_sanity=bool(sanity_token and project_id)
    )
    
    if combined_result["success"]:
        print(f"✅ Processo completo executado com sucesso!")
        if "sanity_asset" in combined_result:
            print(f"   - Asset pronto para usar no Sanity")
    else:
        print(f"❌ Erro no processo: {combined_result.get('error', 'Erro desconhecido')}")
    
    print("\n=== Teste Concluído ===")

if __name__ == "__main__":
    # Carregar variáveis de ambiente
    from dotenv import load_dotenv
    load_dotenv()
    
    test_image_generation()