"""
Ferramentas para geração de imagens com DALL-E e upload para Sanity
"""

import os
import logging
import openai
import requests
from datetime import datetime
from crewai.tools import tool
from pathlib import Path

logger = logging.getLogger("image_generation_tools")

# Importar configurações visuais centralizadas
try:
    from ..config.visual_config import BRAND_STYLE, CRYPTO_VISUALS, PROMPT_TEMPLATES
except ImportError:
    # Fallback se não conseguir importar
    logger.warning("Não foi possível importar configurações visuais, usando valores padrão")
    BRAND_STYLE = {
        "style": "3D photorealistic cryptocurrency rendering",
        "background": "Pure black (#000000) with subtle blue tech grid",
        "lighting": "Blue rim lighting (#003366) with top-down key light",
        "effects": "Circular cyan energy waves radiating from center",
        "quality": "ultra high definition, sharp details, professional rendering"
    }

# Mapear CRYPTO_VISUALS para CRYPTO_TEMPLATES se importado com sucesso
try:
    CRYPTO_TEMPLATES = {k: {"symbol": v["symbol"], "color": v["color"]} for k, v in CRYPTO_VISUALS.items()}
except NameError:
    # Definir localmente se não conseguiu importar
    CRYPTO_TEMPLATES = {
    "bitcoin": {
        "symbol": "Bitcoin logo 3D volumetric orange coin with B symbol",
        "color": "golden orange metallic"
    },
    "ethereum": {
        "symbol": "Ethereum logo 3D volumetric diamond shape",
        "color": "silver and blue metallic"
    },
    "xrp": {
        "symbol": "XRP logo 3D volumetric black sphere with white X",
        "color": "black and white contrast"
    },
    "bnb": {
        "symbol": "BNB logo 3D volumetric golden diamond",
        "color": "golden yellow metallic"
    },
    "dogecoin": {
        "symbol": "Dogecoin logo 3D volumetric coin with Shiba Inu",
        "color": "golden yellow with brown accents"
    },
    "solana": {
        "symbol": "Solana logo 3D volumetric three angular bars",
        "color": "purple to turquoise gradient metallic"
    },
    "chainlink": {
        "symbol": "Chainlink logo 3D volumetric blue hexagon",
        "color": "deep blue with white center"
    },
    "shiba": {
        "symbol": "Shiba Inu logo 3D volumetric red coin",
        "color": "red and orange metallic"
    },
    "sui": {
        "symbol": "Sui logo 3D volumetric water drop",
        "color": "light blue translucent"
    },
    "usdt": {
        "symbol": "Tether USDT logo 3D volumetric hexagon with T",
        "color": "teal and white"
    },
    "tron": {
        "symbol": "Tron TRX logo 3D volumetric angular design",
        "color": "red geometric metallic"
    },
    "pepe": {
        "symbol": "PEPE logo 3D volumetric green frog face",
        "color": "green with orange accents"
    },
    "mastercard": {
        "symbol": "MasterCard logo 3D volumetric two intersecting circles",
        "color": "red and yellow circles"
    },
    "airdrop": {
        "symbol": "Parachute with golden coins 3D volumetric",
        "color": "blue parachute with golden coins"
    },
    "kraken": {
        "symbol": "Kraken logo 3D volumetric purple octopus",
        "color": "purple tentacles"
    }
}

def detect_crypto_in_text(text):
    """Detecta criptomoedas mencionadas no texto"""
    text_lower = text.lower()
    detected = []
    
    # Mapeamento de palavras-chave para criptos
    crypto_keywords = {
        "bitcoin": ["bitcoin", "btc"],
        "ethereum": ["ethereum", "eth"],
        "xrp": ["xrp", "ripple"],
        "bnb": ["bnb", "binance"],
        "dogecoin": ["dogecoin", "doge"],
        "solana": ["solana", "sol"],
        "chainlink": ["chainlink", "link"],
        "shiba": ["shiba", "shib"],
        "sui": ["sui"],
        "usdt": ["usdt", "tether"],
        "tron": ["tron", "trx"],
        "pepe": ["pepe"],
        "mastercard": ["mastercard"],
        "airdrop": ["airdrop"],
        "kraken": ["kraken"]
    }
    
    for crypto, keywords in crypto_keywords.items():
        for keyword in keywords:
            if keyword in text_lower and crypto not in detected:
                detected.append(crypto)
                break
    
    return detected

def build_crypto_prompt(cryptos, title):
    """Constrói prompt otimizado para criptomoedas detectadas"""
    if not cryptos:
        # Prompt genérico se nenhuma crypto específica for detectada
        return f"""
        Multiple cryptocurrency logos floating in 3D space
        Visual style: {BRAND_STYLE['style']}
        Background: {BRAND_STYLE['background']}
        Lighting: {BRAND_STYLE['lighting']}
        Effects: {BRAND_STYLE['effects']}
        Composition: Various crypto symbols arranged dynamically
        Format: 1792x1024 landscape with 20% margin safety zone
        Quality: {BRAND_STYLE['quality']}
        """
    
    if len(cryptos) == 1:
        # Uma única crypto
        crypto_info = CRYPTO_TEMPLATES.get(cryptos[0], CRYPTO_TEMPLATES["bitcoin"])
        return f"""
        {crypto_info['symbol']} centered and floating
        Visual style: {BRAND_STYLE['style']}
        Color: {crypto_info['color']}
        Background: {BRAND_STYLE['background']}
        Lighting: {BRAND_STYLE['lighting']}
        Effects: {BRAND_STYLE['effects']}
        Composition: Logo centered, floating with volumetric 3D appearance
        Format: 1792x1024 landscape with 20% margin safety zone
        Quality: {BRAND_STYLE['quality']}
        """
    
    else:
        # Múltiplas cryptos (pega as duas primeiras)
        main_crypto = CRYPTO_TEMPLATES.get(cryptos[0], CRYPTO_TEMPLATES["bitcoin"])
        secondary_crypto = CRYPTO_TEMPLATES.get(cryptos[1], CRYPTO_TEMPLATES["ethereum"])
        
        return f"""
        {main_crypto['symbol']} and {secondary_crypto['symbol']} in dynamic composition
        Visual style: {BRAND_STYLE['style']}
        Main element: {main_crypto['symbol']} with {main_crypto['color']}
        Secondary element: {secondary_crypto['symbol']} with {secondary_crypto['color']}
        Background: {BRAND_STYLE['background']}
        Lighting: {BRAND_STYLE['lighting']}
        Effects: Energy connection between logos, {BRAND_STYLE['effects']}
        Composition: Two logos in balanced arrangement, connected by energy streams
        Format: 1792x1024 landscape with 20% margin safety zone
        Quality: {BRAND_STYLE['quality']}
        """

@tool("Generate crypto image with DALL-E")
def generate_crypto_image(title: str, excerpt: str) -> dict:
    """
    Gera uma imagem profissional relacionada ao artigo usando DALL-E 3
    
    Args:
        title: Título do artigo
        excerpt: Resumo/excerpt do artigo
        
    Returns:
        dict com image_path, image_url e alt_text
    """
    try:
        # Verificar API key
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OPENAI_API_KEY não configurada")
            return {"error": "API key não configurada"}
        
        client = openai.OpenAI(api_key=api_key)
        
        # Detectar criptomoedas no texto
        full_text = f"{title} {excerpt}"
        detected_cryptos = detect_crypto_in_text(full_text)
        
        logger.info(f"Criptomoedas detectadas: {detected_cryptos}")
        
        # Construir prompt
        prompt = build_crypto_prompt(detected_cryptos, title)
        
        logger.info("Gerando imagem com DALL-E 3...")
        
        # Gerar imagem
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Criar diretório para imagens se não existir
        images_dir = Path("posts_imagens")
        images_dir.mkdir(exist_ok=True)
        
        # Download da imagem
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"crypto_image_{timestamp}.png"
        filepath = images_dir / filename
        
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            logger.info(f"Imagem salva em: {filepath}")
            
            # Gerar alt text
            if detected_cryptos:
                crypto_names = [CRYPTO_TEMPLATES.get(c, {"symbol": c})["symbol"].split()[0] for c in detected_cryptos]
                alt_text = f"Logo 3D de {' e '.join(crypto_names)}"
            else:
                alt_text = "Ilustração 3D de criptomoedas"
            
            return {
                "success": True,
                "image_path": str(filepath),
                "image_url": image_url,
                "alt_text": alt_text,
                "detected_cryptos": detected_cryptos
            }
        else:
            logger.error(f"Erro ao baixar imagem: {img_response.status_code}")
            return {"error": "Erro ao baixar imagem"}
            
    except Exception as e:
        logger.error(f"Erro ao gerar imagem: {str(e)}")
        return {"error": str(e)}

@tool("Upload image to Sanity CMS")
def upload_image_to_sanity(image_path: str, alt_text: str) -> dict:
    """
    Faz upload de uma imagem para o Sanity CMS usando a API REST
    
    Args:
        image_path: Caminho local da imagem
        alt_text: Texto alternativo para acessibilidade
        
    Returns:
        dict com asset reference do Sanity
    """
    try:
        # Configurações do Sanity
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("SANITY_DATASET", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not all([project_id, api_token]):
            logger.error("Credenciais do Sanity não configuradas")
            return {"error": "Credenciais do Sanity não configuradas"}
        
        # URL para upload de assets - usando v2021-10-21 (versão mais recente e estável)
        upload_url = f"https://{project_id}.api.sanity.io/v2021-10-21/assets/images/{dataset}"
        
        # Headers
        headers = {
            "Authorization": f"Bearer {api_token}"
        }
        
        # Fazer upload
        with open(image_path, 'rb') as f:
            files = {'file': (Path(image_path).name, f, 'image/png')}
            
            logger.info("Fazendo upload da imagem para Sanity...")
            logger.info(f"URL: {upload_url}")
            
            response = requests.post(upload_url, headers=headers, files=files)
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                # O retorno pode variar dependendo da versão da API
                # Vamos tentar múltiplos caminhos para o asset ID
                asset_id = None
                if 'document' in result and '_id' in result['document']:
                    asset_id = result['document']['_id']
                elif '_id' in result:
                    asset_id = result['_id']
                else:
                    logger.error(f"Estrutura de resposta inesperada: {result}")
                    return {"error": "Não foi possível extrair o ID do asset"}
                
                logger.info(f"Upload concluído! Asset ID: {asset_id}")
                
                # Retornar referência no formato esperado pelo Sanity
                return {
                    "success": True,
                    "mainImage": {
                        "_type": "image",
                        "asset": {
                            "_type": "reference",
                            "_ref": asset_id
                        },
                        "alt": alt_text,
                        "caption": f"Imagem gerada automaticamente - {alt_text}",
                        "attribution": "Gerado por DALL-E 3"
                    }
                }
            else:
                logger.error(f"Erro no upload: {response.status_code}")
                logger.error(f"Resposta: {response.text}")
                return {"error": f"Erro no upload: {response.status_code} - {response.text}"}
                
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {str(e)}")
        return {"error": str(e)}

@tool("Generate and upload crypto image")
def generate_and_upload_image(title: str, excerpt: str) -> dict:
    """
    Gera uma imagem com DALL-E e faz upload para o Sanity em um único passo
    
    Args:
        title: Título do artigo
        excerpt: Resumo do artigo
        
    Returns:
        dict com mainImage reference para o Sanity
    """
    try:
        # Gerar imagem
        generation_result = generate_crypto_image(title, excerpt)
        
        if not generation_result.get("success"):
            return generation_result
        
        # Fazer upload
        upload_result = upload_image_to_sanity(
            generation_result["image_path"],
            generation_result["alt_text"]
        )
        
        if upload_result.get("success"):
            # Adicionar informações da geração ao resultado
            upload_result["detected_cryptos"] = generation_result.get("detected_cryptos", [])
            upload_result["local_path"] = generation_result["image_path"]
            
            # Limpar arquivo temporário após upload bem-sucedido
            try:
                Path(generation_result["image_path"]).unlink()
                logger.info(f"Arquivo temporário removido: {generation_result['image_path']}")
            except Exception as e:
                logger.warning(f"Não foi possível remover arquivo temporário: {e}")
        
        return upload_result
        
    except Exception as e:
        logger.error(f"Erro no processo completo: {str(e)}")
        return {"error": str(e)}