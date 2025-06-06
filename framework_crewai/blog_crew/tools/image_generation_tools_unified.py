"""
Ferramenta unificada para geração de imagens com DALL-E e upload para Sanity
Substitui todas as implementações duplicadas
"""

import os
import json
import logging
import openai
import requests
from datetime import datetime
from crewai.tools import tool
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger("image_generation_tools")

# Importar configurações visuais centralizadas
try:
    from ..config.visual_config import BRAND_STYLE, CRYPTO_VISUALS, PROMPT_TEMPLATES
except ImportError:
    logger.warning("Não foi possível importar configurações visuais, usando valores padrão")
    BRAND_STYLE = {
        "style": "3D photorealistic cryptocurrency rendering",
        "background": "Pure black (#000000) with subtle blue tech grid",
        "lighting": "Blue rim lighting (#003366) with top-down key light",
        "effects": "Circular cyan energy waves radiating from center",
        "quality": "ultra high definition, sharp details, professional rendering"
    }

# Mapeamento de criptomoedas
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
    }
}

def detect_crypto_in_text(text: str) -> List[str]:
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
        "pepe": ["pepe"]
    }
    
    for crypto, keywords in crypto_keywords.items():
        for keyword in keywords:
            if keyword in text_lower and crypto not in detected:
                detected.append(crypto)
                break
    
    return detected

def build_crypto_prompt(cryptos: List[str], title: str) -> str:
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

def generate_image_with_dalle(title: str, excerpt: str) -> Dict:
    """Gera imagem com DALL-E 3"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {"error": "OPENAI_API_KEY não configurada"}
        
        client = openai.OpenAI(api_key=api_key)
        
        # Detectar criptomoedas
        full_text = f"{title} {excerpt}"
        detected_cryptos = detect_crypto_in_text(full_text)
        
        # Construir prompt
        prompt = build_crypto_prompt(detected_cryptos, title)
        
        logger.info(f"Gerando imagem para: {title[:50]}...")
        
        # Gerar imagem
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Criar diretório para imagens
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
            
            # Gerar alt text
            if detected_cryptos:
                crypto_names = [CRYPTO_TEMPLATES.get(c, {"symbol": c})["symbol"].split()[0] for c in detected_cryptos]
                alt_text = f"Logo 3D de {' e '.join(crypto_names)}"
            else:
                alt_text = "Ilustração 3D de criptomoedas"
            
            return {
                "success": True,
                "image_path": str(filepath),
                "alt_text": alt_text,
                "detected_cryptos": detected_cryptos
            }
        else:
            return {"error": f"Erro ao baixar imagem: {img_response.status_code}"}
            
    except Exception as e:
        logger.error(f"Erro ao gerar imagem: {str(e)}")
        return {"error": str(e)}

def upload_to_sanity(image_path: str, alt_text: str) -> Dict:
    """Faz upload de uma imagem para o Sanity"""
    try:
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("SANITY_DATASET", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not all([project_id, api_token]):
            return {"error": "Credenciais do Sanity não configuradas"}
        
        # URL para upload
        upload_url = f"https://{project_id}.api.sanity.io/v2021-06-07/assets/images/{dataset}"
        
        headers = {
            "Authorization": f"Bearer {api_token}"
        }
        
        # Upload do arquivo
        with open(image_path, 'rb') as f:
            filename = Path(image_path).name
            content_type = 'image/png' if filename.endswith('.png') else 'image/jpeg'
            
            response = requests.post(
                upload_url,
                headers=headers,
                files={'file': (filename, f, content_type)}
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                asset_id = result.get('document', {}).get('_id')
                
                if asset_id:
                    return {
                        "success": True,
                        "asset_id": asset_id,
                        "mainImage": {
                            "_type": "image",
                            "asset": {
                                "_type": "reference",
                                "_ref": asset_id
                            },
                            "alt": alt_text,
                            "caption": f"Imagem gerada automaticamente - {alt_text}"
                        }
                    }
                else:
                    return {"error": "Asset ID não encontrado na resposta"}
            else:
                return {"error": f"Erro no upload: {response.status_code} - {response.text}"}
                
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {str(e)}")
        return {"error": str(e)}

@tool("Generate image for single post")
def generate_image_for_post(post_data: str) -> str:
    """
    Gera e faz upload de imagem para um único post
    
    Args:
        post_data: JSON string com dados do post (title, excerpt)
    
    Returns:
        JSON com mainImage reference ou erro
    """
    try:
        # Parse dos dados
        if isinstance(post_data, str):
            data = json.loads(post_data)
        else:
            data = post_data
            
        title = data.get("title", "")
        excerpt = data.get("excerpt", "")
        
        if not title:
            return json.dumps({"error": "Título é obrigatório"})
        
        # Gerar imagem
        image_result = generate_image_with_dalle(title, excerpt)
        
        if not image_result.get("success"):
            return json.dumps(image_result)
        
        # Upload para Sanity
        upload_result = upload_to_sanity(
            image_result["image_path"],
            image_result["alt_text"]
        )
        
        # Limpar arquivo local após upload
        if upload_result.get("success"):
            try:
                Path(image_result["image_path"]).unlink()
            except:
                pass
                
        return json.dumps(upload_result)
        
    except Exception as e:
        return json.dumps({"error": str(e)})

@tool("Process all posts with images")
def process_all_posts_with_images() -> str:
    """
    Processa TODOS os posts formatados, gerando imagens e fazendo upload para o Sanity.
    Lê arquivos de 'posts_formatados' e salva com imagens em 'posts_com_imagem'.
    
    Returns:
        Relatório completo do processamento
    """
    try:
        formatted_dir = Path("posts_formatados")
        output_dir = Path("posts_com_imagem")
        
        # Criar diretório de saída
        output_dir.mkdir(exist_ok=True)
        
        # Listar arquivos
        json_files = list(formatted_dir.glob("*.json"))
        
        if not json_files:
            return json.dumps({
                "success": False,
                "error": "Nenhum arquivo encontrado em posts_formatados"
            })
        
        results = {
            "total": len(json_files),
            "processed": 0,
            "success": 0,
            "failed": 0,
            "details": []
        }
        
        logger.info(f"Processando {len(json_files)} posts...")
        
        for json_file in json_files:
            try:
                # Ler post
                with open(json_file, 'r', encoding='utf-8') as f:
                    post_data = json.load(f)
                
                title = post_data.get("title", "")
                excerpt = post_data.get("excerpt", "")
                
                logger.info(f"Processando: {title[:50]}...")
                
                # Pular se já tem imagem
                if post_data.get("mainImage") and post_data["mainImage"].get("asset"):
                    logger.info("Post já possui imagem, pulando...")
                    results["details"].append({
                        "file": json_file.name,
                        "status": "skipped",
                        "message": "Já possui imagem"
                    })
                    continue
                
                # Gerar imagem
                image_result = generate_image_with_dalle(title, excerpt)
                
                if image_result.get("success"):
                    # Upload para Sanity
                    upload_result = upload_to_sanity(
                        image_result["image_path"],
                        image_result["alt_text"]
                    )
                    
                    if upload_result.get("success"):
                        # Atualizar post com mainImage
                        post_data["mainImage"] = upload_result["mainImage"]
                        
                        # Salvar post atualizado
                        output_file = output_dir / json_file.name.replace("formatado_", "com_imagem_")
                        with open(output_file, 'w', encoding='utf-8') as f:
                            json.dump(post_data, f, ensure_ascii=False, indent=2)
                        
                        results["success"] += 1
                        results["details"].append({
                            "file": json_file.name,
                            "status": "success",
                            "asset_id": upload_result["asset_id"],
                            "output_file": output_file.name
                        })
                        
                        # Limpar arquivo temporário
                        try:
                            Path(image_result["image_path"]).unlink()
                        except:
                            pass
                    else:
                        results["failed"] += 1
                        results["details"].append({
                            "file": json_file.name,
                            "status": "failed",
                            "error": upload_result.get("error", "Upload falhou")
                        })
                else:
                    results["failed"] += 1
                    results["details"].append({
                        "file": json_file.name,
                        "status": "failed",
                        "error": image_result.get("error", "Geração falhou")
                    })
                
                results["processed"] += 1
                
            except Exception as e:
                results["failed"] += 1
                results["details"].append({
                    "file": json_file.name,
                    "status": "failed",
                    "error": str(e)
                })
        
        # Resumo final
        results["summary"] = f"Processados: {results['processed']}/{results['total']}, Sucesso: {results['success']}, Falhas: {results['failed']}"
        
        return json.dumps(results, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Erro no processamento: {str(e)}"
        })

# Exportar apenas as ferramentas necessárias
__all__ = ['generate_image_for_post', 'process_all_posts_with_images']