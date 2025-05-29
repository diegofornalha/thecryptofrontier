#!/usr/bin/env python3
"""
Ferramentas de geração de imagem CORRIGIDAS para o CrewAI
"""

import os
import json
import openai
import requests
from datetime import datetime
from pathlib import Path
from crewai import Agent
from crewai.tools import tool

# Configurações visuais
BRAND_STYLE = {
    "style": "3D photorealistic cryptocurrency rendering",
    "background": "Pure black (#000000) with subtle blue tech grid",
    "lighting": "Blue rim lighting (#003366) with top-down key light",
    "effects": "Circular cyan energy waves radiating from center",
    "quality": "ultra high definition, sharp details, professional rendering"
}

# Templates para criptomoedas
CRYPTO_TEMPLATES = {
    "bitcoin": {
        "symbol": "Bitcoin logo 3D volumetric orange coin with B symbol",
        "color": "golden orange metallic"
    },
    "ethereum": {
        "symbol": "Ethereum logo 3D volumetric diamond shape",
        "color": "silver and blue metallic"
    },
    "crypto": {
        "symbol": "Multiple 3D cryptocurrency coins floating",
        "color": "mixed metallic colors (gold, silver, bronze)"
    }
}

def detect_crypto(text):
    """Detecta criptomoedas no texto"""
    text_lower = text.lower()
    
    crypto_keywords = {
        "bitcoin": ["bitcoin", "btc"],
        "ethereum": ["ethereum", "eth", "ether"],
    }
    
    for crypto, keywords in crypto_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                return crypto
    
    return "crypto"

def generate_crypto_prompt(crypto, title):
    """Gera prompt para DALL-E"""
    template = CRYPTO_TEMPLATES.get(crypto, CRYPTO_TEMPLATES["crypto"])
    
    prompt = f"""
    {template['symbol']}
    Visual style: {BRAND_STYLE['style']}
    Color: {template['color']}
    Background: {BRAND_STYLE['background']}
    Lighting: {BRAND_STYLE['lighting']}
    Effects: {BRAND_STYLE['effects']}
    Format: 1792x1024 landscape
    Quality: {BRAND_STYLE['quality']}
    Context: {title[:100]}
    """
    
    return prompt

def upload_image_to_sanity_binary(image_path, alt_text):
    """Upload binário direto para Sanity"""
    try:
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("SANITY_DATASET", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not all([project_id, api_token]):
            return {"success": False, "error": "Credenciais faltando"}
        
        # URL da API
        upload_url = f"https://{project_id}.api.sanity.io/v2021-06-07/assets/images/{dataset}"
        
        # Detectar tipo MIME
        ext = Path(image_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        }
        content_type = mime_types.get(ext, 'image/png')
        
        # Headers
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": content_type
        }
        
        # Upload binário direto
        with open(image_path, 'rb') as f:
            response = requests.post(upload_url, headers=headers, data=f)
        
        if response.status_code in [200, 201]:
            result = response.json()
            asset_id = result.get('document', {}).get('_id') or result.get('_id')
            
            if asset_id:
                return {
                    "success": True,
                    "asset_id": asset_id,
                    "mainImage": {
                        "_type": "mainImage",
                        "asset": {
                            "_type": "reference",
                            "_ref": asset_id
                        },
                        "alt": alt_text
                    }
                }
            else:
                return {"success": False, "error": "Asset ID não encontrado"}
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            return {"success": False, "error": error_msg}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

@tool
def generate_and_upload_image(input_file: str, output_dir: str = "posts_com_imagem") -> dict:
    """
    Gera uma imagem com DALL-E e faz upload para o Sanity
    
    Args:
        input_file: Caminho do arquivo JSON do post formatado
        output_dir: Diretório onde salvar o post com imagem
    
    Returns:
        dict: Resultado da operação com success e mensagem
    """
    try:
        # Carregar post
        with open(input_file, 'r', encoding='utf-8') as f:
            post_data = json.load(f)
        
        title = post_data.get("title", "")
        excerpt = post_data.get("excerpt", "")
        
        # Verificar se já tem imagem
        if post_data.get("mainImage"):
            return {
                "success": False,
                "message": "Post já tem imagem"
            }
        
        # Verificar API key
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {
                "success": False,
                "message": "OPENAI_API_KEY não configurada"
            }
        
        client = openai.OpenAI(api_key=api_key)
        
        # Detectar criptomoeda
        crypto = detect_crypto(f"{title} {excerpt}")
        
        # Gerar prompt
        prompt = generate_crypto_prompt(crypto, title)
        
        # Gerar imagem
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Baixar imagem
        img_response = requests.get(image_url, timeout=30)
        
        if img_response.status_code == 200:
            # Criar diretório temporário
            temp_dir = Path("temp_images")
            temp_dir.mkdir(exist_ok=True)
            
            # Salvar imagem
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            temp_file = temp_dir / f"crypto_{crypto}_{timestamp}.png"
            
            with open(temp_file, 'wb') as f:
                f.write(img_response.content)
            
            # Upload para Sanity
            alt_text = f"Imagem ilustrativa sobre {title[:100]}"
            upload_result = upload_image_to_sanity_binary(str(temp_file), alt_text)
            
            if upload_result.get("success"):
                # Adicionar mainImage ao post
                post_data["mainImage"] = upload_result["mainImage"]
                
                # Salvar em posts_com_imagem
                output_path = Path(output_dir)
                output_path.mkdir(exist_ok=True)
                
                output_file = output_path / Path(input_file).name
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(post_data, f, ensure_ascii=False, indent=2)
                
                # Limpar arquivo temporário
                temp_file.unlink()
                
                # Salvar imagem permanente
                perm_dir = Path("posts_imagens")
                perm_dir.mkdir(exist_ok=True)
                perm_file = perm_dir / f"{Path(input_file).stem}.png"
                
                # Baixar novamente para arquivo permanente
                img_response2 = requests.get(image_url, timeout=30)
                if img_response2.status_code == 200:
                    with open(perm_file, 'wb') as f:
                        f.write(img_response2.content)
                
                return {
                    "success": True,
                    "message": f"Imagem gerada e salva em {output_file}",
                    "asset_id": upload_result["asset_id"],
                    "file": str(output_file)
                }
            else:
                # Limpar arquivo temporário em caso de erro
                if temp_file.exists():
                    temp_file.unlink()
                return {
                    "success": False,
                    "message": f"Falha no upload: {upload_result.get('error')}"
                }
        else:
            return {
                "success": False,
                "message": f"Erro ao baixar imagem: HTTP {img_response.status_code}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

@tool
def process_all_formatted_posts(input_dir: str = "posts_formatados", output_dir: str = "posts_com_imagem") -> dict:
    """
    Processa todos os posts formatados gerando imagens
    
    Args:
        input_dir: Diretório com posts formatados
        output_dir: Diretório onde salvar posts com imagem
    
    Returns:
        dict: Resultado da operação com estatísticas
    """
    try:
        posts_dir = Path(input_dir)
        if not posts_dir.exists():
            return {
                "success": False,
                "message": f"Diretório '{input_dir}' não encontrado"
            }
        
        posts = list(posts_dir.glob("*.json"))
        if not posts:
            return {
                "success": False,
                "message": "Nenhum post formatado encontrado"
            }
        
        success_count = 0
        failed_count = 0
        results = []
        
        for post_file in posts:
            result = generate_and_upload_image(str(post_file), output_dir)
            
            if result.get("success"):
                success_count += 1
                results.append(f"✅ {post_file.name}")
            else:
                failed_count += 1
                results.append(f"❌ {post_file.name}: {result.get('message')}")
        
        return {
            "success": True,
            "message": f"Processados {len(posts)} posts: {success_count} com sucesso, {failed_count} falhas",
            "total": len(posts),
            "success_count": success_count,
            "failed_count": failed_count,
            "details": results
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro ao processar posts: {str(e)}"
        }