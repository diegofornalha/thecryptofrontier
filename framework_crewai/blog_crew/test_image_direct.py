#!/usr/bin/env python3
"""
Script de teste direto para validar a geração de imagens com DALL-E
"""

import os
import logging
import requests
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Diretório para salvar imagens
IMAGES_DIR = Path(__file__).parent / "generated_images"
IMAGES_DIR.mkdir(exist_ok=True)

def test_openai_api():
    """Testa a API da OpenAI diretamente"""
    print("=== Teste Direto da API OpenAI DALL-E ===\n")
    
    # Verificar API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY não encontrada no .env")
        return
    
    print("✅ OPENAI_API_KEY configurada")
    
    # Headers para a requisição
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Prompt para teste
    prompt = """
    Create a professional blog header image for an article about Bitcoin reaching $100,000.
    The image should be modern, professional, and tech-focused with cryptocurrency/blockchain themes.
    Use a color palette with blues, purples, and subtle neon accents.
    Include abstract technological elements, geometric patterns, or subtle cryptocurrency symbols.
    The style should be clean, minimalist, and suitable for a professional crypto news website.
    3D photorealistic cryptocurrency rendering with pure black (#000000) background and subtle blue tech grid.
    Blue rim lighting (#003366) with top-down key light.
    Circular cyan energy waves radiating from center.
    Ultra high definition, sharp details, professional rendering.
    Avoid text in the image.
    """
    
    # Dados da requisição
    data = {
        "model": "dall-e-3",
        "prompt": prompt,
        "size": "1792x1024",
        "quality": "hd",
        "style": "vivid",
        "n": 1
    }
    
    print("\n📤 Enviando requisição para OpenAI...")
    print(f"   Modelo: {data['model']}")
    print(f"   Tamanho: {data['size']}")
    print(f"   Qualidade: {data['quality']}")
    
    try:
        # Fazer requisição
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=data,
            timeout=60
        )
        
        print(f"\n📥 Resposta recebida: Status {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            image_data = result["data"][0]
            image_url = image_data["url"]
            revised_prompt = image_data.get("revised_prompt", prompt)
            
            print("\n✅ Imagem gerada com sucesso!")
            print(f"   URL: {image_url[:100]}...")
            print(f"\n📝 Prompt revisado pelo DALL-E:")
            print(f"   {revised_prompt[:200]}...")
            
            # Baixar a imagem
            print("\n📥 Baixando imagem...")
            image_response = requests.get(image_url, timeout=30)
            
            if image_response.status_code == 200:
                # Salvar localmente
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"test_bitcoin_100k_{timestamp}.png"
                filepath = IMAGES_DIR / filename
                
                with open(filepath, "wb") as f:
                    f.write(image_response.content)
                
                print(f"✅ Imagem salva em: {filepath}")
                print(f"   Tamanho: {len(image_response.content) / 1024 / 1024:.2f} MB")
                
                return str(filepath)
            else:
                print(f"❌ Erro ao baixar imagem: {image_response.status_code}")
                
        else:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Erro desconhecido")
            print(f"❌ Erro da API: {error_msg}")
            print(f"   Resposta completa: {json.dumps(error_data, indent=2)}")
            
    except requests.exceptions.Timeout:
        print("❌ Timeout na requisição (60s)")
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()

def test_sanity_upload(image_path):
    """Testa o upload para o Sanity"""
    print("\n\n=== Teste de Upload para Sanity ===\n")
    
    if not image_path or not os.path.exists(image_path):
        print("❌ Arquivo de imagem não encontrado")
        return
    
    # Verificar credenciais
    project_id = os.getenv("SANITY_PROJECT_ID", "mcpx")
    api_token = os.getenv("SANITY_API_TOKEN")
    
    if not api_token:
        print("⚠️  SANITY_API_TOKEN não configurado - pulando teste de upload")
        return
    
    print(f"✅ Credenciais Sanity configuradas")
    print(f"   Project ID: {project_id}")
    
    # URL para upload
    dataset = "production"
    upload_url = f"https://{project_id}.api.sanity.io/v2021-10-21/assets/images/{dataset}"
    
    headers = {
        "Authorization": f"Bearer {api_token}"
    }
    
    try:
        with open(image_path, "rb") as f:
            files = {"file": (os.path.basename(image_path), f, "image/png")}
            
            print(f"\n📤 Fazendo upload para: {upload_url}")
            response = requests.post(upload_url, headers=headers, files=files)
            
            print(f"📥 Resposta: Status {response.status_code}")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print("\n✅ Upload realizado com sucesso!")
                print(f"   Resposta: {json.dumps(result, indent=2)}")
                
                # Tentar extrair o ID do asset
                asset_id = None
                if "document" in result and "_id" in result["document"]:
                    asset_id = result["document"]["_id"]
                elif "_id" in result:
                    asset_id = result["_id"]
                
                if asset_id:
                    print(f"\n📎 Asset ID: {asset_id}")
                    print(f"   Referência para usar em posts:")
                    print(f"   {{")
                    print(f'     "_type": "image",')
                    print(f'     "asset": {{')
                    print(f'       "_type": "reference",')
                    print(f'       "_ref": "{asset_id}"')
                    print(f'     }}')
                    print(f"   }}")
            else:
                print(f"❌ Erro no upload: {response.text}")
                
    except Exception as e:
        print(f"❌ Erro ao fazer upload: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Testar geração de imagem
    image_path = test_openai_api()
    
    # Se gerou com sucesso, testar upload
    if image_path:
        test_sanity_upload(image_path)
    
    print("\n\n=== Teste Concluído ===")
    print(f"📁 Imagens salvas em: {IMAGES_DIR}")