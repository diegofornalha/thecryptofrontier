"""
Ferramenta unificada de geração de imagens para o CrewAI
Consolida todas as implementações em uma única ferramenta robusta
"""

import os
import json
import openai
import requests
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, List
from crewai.tools import tool
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configurações Sanity
SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID", "xyx45wfp")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")

# Templates de criptomoedas conhecidas
CRYPTO_TEMPLATES = {
    "bitcoin": "Bitcoin logo 3D volumétrico dourado brilhante",
    "ethereum": "Ethereum logo 3D prismático roxo e azul",
    "binance": "Binance Coin logo 3D amarelo vibrante",
    "cardano": "Cardano logo 3D azul metálico",
    "solana": "Solana logo 3D gradiente roxo-verde",
    "polkadot": "Polkadot logo 3D com pontos interconectados",
    "chainlink": "Chainlink logo 3D hexágono azul",
    "avalanche": "Avalanche logo 3D vermelho cristalino",
    "polygon": "Polygon logo 3D roxo geométrico",
    "ripple": "XRP logo 3D prata metálico",
    "dogecoin": "Dogecoin Shiba Inu 3D dourado",
    "shiba": "Shiba Inu logo 3D laranja vibrante",
    "litecoin": "Litecoin logo 3D prata e azul",
    "uniswap": "Uniswap unicórnio 3D rosa",
    "cosmos": "Cosmos logo 3D com galáxia de fundo"
}

def detect_crypto_in_title(title: str) -> Optional[str]:
    """Detecta criptomoeda mencionada no título"""
    title_lower = title.lower()
    for crypto, template in CRYPTO_TEMPLATES.items():
        if crypto in title_lower or (crypto == "ripple" and "xrp" in title_lower):
            return crypto
    return None

def generate_dalle_prompt(title: str, crypto: Optional[str] = None) -> str:
    """Gera prompt otimizado para DALL-E 3"""
    base_style = """
    Pure black background (#000000) with subtle blue tech grid pattern,
    Blue rim lighting (#003366) with strong top-down key light,
    Circular cyan energy waves radiating from center,
    Ultra high definition, sharp details, professional 3D rendering,
    No text, no words, no letters
    """
    
    if crypto and crypto in CRYPTO_TEMPLATES:
        return f"{CRYPTO_TEMPLATES[crypto]}, {base_style}"
    else:
        # Prompt genérico para crypto
        return f"""
        Abstract cryptocurrency concept, glowing blockchain network nodes,
        Digital coins floating in 3D space, holographic effect,
        {base_style}
        """

def upload_image_to_sanity(image_url: str, filename: str) -> Optional[str]:
    """Faz upload da imagem para o Sanity e retorna o asset ID"""
    try:
        # Download da imagem
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        # Upload para Sanity
        upload_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/images/{SANITY_DATASET}"
        
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}",
            "Content-Type": "image/png"
        }
        
        upload_response = requests.post(
            upload_url,
            headers=headers,
            data=response.content,
            params={"filename": filename}
        )
        
        if upload_response.status_code == 200:
            result = upload_response.json()
            asset_id = result["document"]["_id"]
            logger.info(f"✅ Imagem uploaded: {asset_id}")
            return asset_id
        else:
            logger.error(f"❌ Upload falhou: {upload_response.text}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Erro no upload: {str(e)}")
        return None

@tool
def generate_image_for_post(post_file_path: str) -> dict:
    """
    Gera e faz upload de imagem para um único post
    
    Args:
        post_file_path: Caminho completo do arquivo JSON do post
        
    Returns:
        dict: {"success": bool, "message": str, "asset_id": str opcional}
    """
    try:
        # Ler o post
        with open(post_file_path, 'r', encoding='utf-8') as f:
            post_data = json.load(f)
        
        # Verificar se já tem imagem
        if post_data.get('mainImage') and post_data['mainImage'].get('asset'):
            return {
                "success": True,
                "message": "Post já possui imagem",
                "asset_id": post_data['mainImage']['asset']['_ref']
            }
        
        title = post_data.get('title', '')
        if not title:
            return {"success": False, "message": "Post sem título"}
        
        # Detectar criptomoeda
        crypto = detect_crypto_in_title(title)
        prompt = generate_dalle_prompt(title, crypto)
        
        logger.info(f"🎨 Gerando imagem para: {title}")
        logger.info(f"📝 Crypto detectada: {crypto or 'Genérica'}")
        
        # Gerar imagem com DALL-E 3
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        
        # Upload para Sanity
        filename = f"crypto-{crypto or 'general'}-{int(time.time())}.png"
        asset_id = upload_image_to_sanity(image_url, filename)
        
        if not asset_id:
            return {"success": False, "message": "Falha no upload para Sanity"}
        
        # Atualizar post com a imagem
        post_data['mainImage'] = {
            'asset': {
                '_type': 'reference',
                '_ref': asset_id
            },
            'alt': f"Imagem ilustrativa: {title}"
        }
        
        # Salvar em posts_com_imagem
        output_dir = Path("posts_com_imagem")
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / Path(post_file_path).name
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(post_data, f, ensure_ascii=False, indent=2)
        
        # Salvar imagem localmente também
        img_dir = Path("posts_imagens")
        img_dir.mkdir(exist_ok=True)
        
        img_response = requests.get(image_url)
        img_path = img_dir / filename
        with open(img_path, 'wb') as f:
            f.write(img_response.content)
        
        return {
            "success": True,
            "message": f"Imagem gerada e uploaded com sucesso",
            "asset_id": asset_id
        }
        
    except Exception as e:
        logger.error(f"❌ Erro ao gerar imagem: {str(e)}")
        return {"success": False, "message": str(e)}

@tool
def process_all_posts_with_images() -> dict:
    """
    Processa todos os posts em posts_formatados adicionando imagens
    
    Returns:
        dict: {"processed": int, "success": int, "failed": int, "details": list}
    """
    try:
        input_dir = Path("posts_formatados")
        if not input_dir.exists():
            return {
                "processed": 0,
                "success": 0,
                "failed": 0,
                "details": ["Diretório posts_formatados não encontrado"]
            }
        
        results = {
            "processed": 0,
            "success": 0,
            "failed": 0,
            "details": []
        }
        
        # Processar cada arquivo
        for post_file in sorted(input_dir.glob("*.json")):
            results["processed"] += 1
            logger.info(f"\n📄 Processando: {post_file.name}")
            
            result = generate_image_for_post(str(post_file))
            
            if result["success"]:
                results["success"] += 1
                results["details"].append(f"✅ {post_file.name}: {result['message']}")
            else:
                results["failed"] += 1
                results["details"].append(f"❌ {post_file.name}: {result['message']}")
            
            # Delay para evitar rate limit
            time.sleep(2)
        
        # Resumo final
        logger.info(f"\n📊 Resumo Final:")
        logger.info(f"  - Total processados: {results['processed']}")
        logger.info(f"  - Sucesso: {results['success']}")
        logger.info(f"  - Falhas: {results['failed']}")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Erro crítico: {str(e)}")
        return {
            "processed": 0,
            "success": 0,
            "failed": 0,
            "details": [f"Erro crítico: {str(e)}"]
        }

@tool
def check_and_fix_missing_images() -> dict:
    """
    Verifica posts publicados sem imagem e tenta gerar
    
    Returns:
        dict: Estatísticas do processamento
    """
    try:
        published_dir = Path("posts_publicados")
        fixed = 0
        
        for post_file in published_dir.glob("*.json"):
            with open(post_file, 'r', encoding='utf-8') as f:
                post = json.load(f)
            
            if not post.get('mainImage'):
                logger.info(f"🔧 Corrigindo post sem imagem: {post_file.name}")
                result = generate_image_for_post(str(post_file))
                if result["success"]:
                    fixed += 1
        
        return {
            "success": True,
            "message": f"Corrigidos {fixed} posts sem imagem"
        }
        
    except Exception as e:
        return {"success": False, "message": str(e)}