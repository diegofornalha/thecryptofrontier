#!/usr/bin/env python3
"""
Teste direto das funções de geração de imagem
"""

import os
import sys
import json
import logging
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Adicionar ao path
sys.path.append(str(Path(__file__).parent))

# Importar configurações visuais
BRAND_STYLE = {
    "style": "3D photorealistic cryptocurrency rendering",
    "background": "Pure black (#000000) with subtle blue tech grid",
    "lighting": "Blue rim lighting (#003366) with top-down key light",
    "effects": "Circular cyan energy waves radiating from center",
    "quality": "ultra high definition, sharp details, professional rendering"
}

CRYPTO_TEMPLATES = {
    "bitcoin": {
        "symbol": "Bitcoin logo 3D volumetric orange coin with B symbol",
        "color": "golden orange metallic"
    }
}

def detect_cryptos(text):
    """Detectar criptomoedas no texto"""
    text_lower = text.lower()
    detected = []
    
    crypto_keywords = {
        "bitcoin": ["bitcoin", "btc"],
        "ethereum": ["ethereum", "eth"],
    }
    
    for crypto, keywords in crypto_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            detected.append(crypto)
    
    return detected

def generate_image_direct(title, excerpt):
    """Gerar imagem diretamente com a API OpenAI"""
    print(f"\n🎨 Gerando imagem para: {title}")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"error": "OPENAI_API_KEY não configurada"}
    
    # Detectar criptomoedas
    combined_text = f"{title} {excerpt}".lower()
    detected_cryptos = detect_cryptos(combined_text)
    print(f"   Criptomoedas detectadas: {detected_cryptos}")
    
    # Construir prompt
    base_prompt = f"Generate an image for a crypto news article: '{title}'. "
    
    if detected_cryptos:
        crypto = detected_cryptos[0]
        if crypto in CRYPTO_TEMPLATES:
            base_prompt += f"Main focus: {CRYPTO_TEMPLATES[crypto]['symbol']} in {CRYPTO_TEMPLATES[crypto]['color']}. "
    
    prompt = base_prompt + f"""
    Style: {BRAND_STYLE['style']}
    Background: {BRAND_STYLE['background']}
    Lighting: {BRAND_STYLE['lighting']}
    Effects: {BRAND_STYLE['effects']}
    Quality: {BRAND_STYLE['quality']}
    """
    
    print(f"   Prompt: {prompt[:100]}...")
    
    # Fazer requisição
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "dall-e-3",
        "prompt": prompt,
        "size": "1792x1024",
        "quality": "hd",
        "style": "vivid",
        "n": 1
    }
    
    try:
        print("   📤 Enviando requisição para OpenAI...")
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            image_url = result["data"][0]["url"]
            
            print("   ✅ Imagem gerada com sucesso!")
            
            # Baixar imagem
            image_response = requests.get(image_url)
            if image_response.status_code == 200:
                # Salvar
                Path("posts_imagens").mkdir(exist_ok=True)
                filename = f"crypto_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                filepath = Path("posts_imagens") / filename
                
                with open(filepath, "wb") as f:
                    f.write(image_response.content)
                
                print(f"   ✅ Imagem salva: {filepath}")
                
                # Gerar alt text
                alt_text = f"Imagem ilustrativa: {title}"
                if detected_cryptos:
                    alt_text = f"Logo 3D de {detected_cryptos[0].title()}"
                
                return {
                    "success": True,
                    "image_path": str(filepath),
                    "alt_text": alt_text,
                    "detected_cryptos": detected_cryptos,
                    "url": image_url
                }
        else:
            error = response.json().get("error", {}).get("message", "Erro desconhecido")
            print(f"   ❌ Erro da API: {error}")
            return {"error": error}
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        return {"error": str(e)}

def upload_to_sanity_direct(image_path, alt_text):
    """Upload direto para Sanity"""
    print(f"\n☁️ Fazendo upload para Sanity...")
    
    project_id = os.getenv("SANITY_PROJECT_ID", "brby2yrg")
    token = os.getenv("SANITY_API_TOKEN")
    
    if not token:
        return {"error": "SANITY_API_TOKEN não configurado"}
    
    url = f"https://{project_id}.api.sanity.io/v2021-10-21/assets/images/production"
    
    try:
        with open(image_path, "rb") as f:
            # Tentar com diferentes configurações
            response = requests.post(
                url,
                headers={"Authorization": f"Bearer {token}"},
                files={"file": (Path(image_path).name, f, "image/png")}
            )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            result = response.json()
            print("   ✅ Upload realizado!")
            
            # Extrair ID
            asset_id = result.get("document", {}).get("_id") or result.get("_id")
            
            return {
                "success": True,
                "asset": {
                    "_type": "image",
                    "asset": {
                        "_type": "reference",
                        "_ref": asset_id
                    },
                    "alt": alt_text
                }
            }
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
            return {"error": response.text}
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        return {"error": str(e)}

def main():
    print("🧪 TESTE DIRETO DE FUNÇÕES")
    print("=" * 50)
    
    # Criar artigo teste
    article = {
        "title": "Bitcoin ultrapassa $100,000 pela primeira vez",
        "excerpt": "Marco histórico para o Bitcoin e mercado de criptomoedas"
    }
    
    # 1. Gerar imagem
    image_result = generate_image_direct(article["title"], article["excerpt"])
    
    if "error" in image_result:
        print(f"\n❌ Falha na geração: {image_result['error']}")
        print("⚠️ Continuando sem imagem (fallback)")
    else:
        # 2. Upload para Sanity
        upload_result = upload_to_sanity_direct(
            image_result["image_path"],
            image_result["alt_text"]
        )
        
        if "asset" in upload_result:
            article["mainImage"] = upload_result["asset"]
            print("\n✅ Processo completo com sucesso!")
        else:
            print("\n⚠️ Imagem gerada mas upload falhou")
    
    # Salvar resultado
    Path("posts_com_imagem").mkdir(exist_ok=True)
    output = f"posts_com_imagem/final_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(output, "w") as f:
        json.dump(article, f, indent=2)
    
    print(f"\n📄 Arquivo final: {output}")
    print("\n📋 Estrutura final:")
    print(json.dumps(article, indent=2))

if __name__ == "__main__":
    main()