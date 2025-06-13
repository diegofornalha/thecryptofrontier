#!/usr/bin/env python3
"""
Teste simples e direto da geração de imagem
"""

import os
import sys
import json
from openai import OpenAI
import requests
import time
from pathlib import Path
from datetime import datetime

# Configurar logging
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
env_files = [
    Path(".env"),  # Local
    Path("/home/sanity/thecryptofrontier/framework_crewai/blog_crew/.env"),  # Absoluto
]

for env_file in env_files:
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        logger.info(f"✅ Variáveis carregadas de {env_file}")
        break

# Configurar cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Configurações Sanity
SANITY_PROJECT_ID = os.getenv("SANITY_PROJECT_ID", "z4sx85c6")
SANITY_DATASET = os.getenv("SANITY_DATASET", "production")
SANITY_API_TOKEN = os.getenv("SANITY_API_TOKEN")

def test_image_generation():
    """Testa geração de imagem diretamente"""
    
    logger.info("🧪 TESTE DIRETO DE GERAÇÃO DE IMAGEM")
    logger.info("="*50)
    
    # 1. Criar/ler post de teste
    test_file = Path("posts_formatados/test_post_queue.json")
    if test_file.exists():
        with open(test_file, 'r', encoding='utf-8') as f:
            post = json.load(f)
        logger.info(f"✅ Post carregado: {post['title']}")
    else:
        logger.error("❌ Post de teste não encontrado!")
        return
        
    # 2. Gerar prompt
    title = post['title']
    prompt = f"""
    Bitcoin logo 3D volumétrico dourado brilhante,
    Pure black background (#000000) with subtle blue tech grid pattern,
    Blue rim lighting (#003366) with strong top-down key light,
    Circular cyan energy waves radiating from center,
    Ultra high definition, sharp details, professional 3D rendering,
    No text, no words, no letters
    """
    
    logger.info("\n🎨 Gerando imagem com DALL-E 3...")
    logger.info(f"   Título: {title}")
    
    try:
        # 3. Gerar imagem
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        logger.info(f"✅ Imagem gerada com sucesso!")
        logger.info(f"   URL: {image_url[:100]}...")
        
        # 4. Baixar imagem
        logger.info("\n📥 Baixando imagem...")
        img_response = requests.get(image_url)
        
        # Salvar localmente
        os.makedirs("posts_imagens", exist_ok=True)
        img_path = Path(f"posts_imagens/bitcoin-test-{int(time.time())}.png")
        
        with open(img_path, 'wb') as f:
            f.write(img_response.content)
        logger.info(f"✅ Imagem salva em: {img_path}")
        
        # 5. Upload para Sanity
        logger.info("\n📤 Fazendo upload para Sanity...")
        
        upload_url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v2021-03-25/assets/images/{SANITY_DATASET}"
        headers = {
            "Authorization": f"Bearer {SANITY_API_TOKEN}",
            "Content-Type": "image/png"
        }
        
        upload_response = requests.post(
            upload_url,
            headers=headers,
            data=img_response.content,
            params={"filename": f"bitcoin-test-{int(time.time())}.png"}
        )
        
        if upload_response.status_code == 200:
            result = upload_response.json()
            asset_id = result["document"]["_id"]
            logger.info(f"✅ Upload bem sucedido!")
            logger.info(f"   Asset ID: {asset_id}")
            
            # 6. Atualizar post
            post['mainImage'] = {
                'asset': {
                    '_type': 'reference',
                    '_ref': asset_id
                },
                'alt': f"Imagem ilustrativa: {title}"
            }
            
            # Salvar em posts_com_imagem
            os.makedirs("posts_com_imagem", exist_ok=True)
            output_file = Path("posts_com_imagem") / test_file.name
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(post, f, ensure_ascii=False, indent=2)
                
            logger.info(f"✅ Post atualizado salvo em: {output_file}")
            
        else:
            logger.error(f"❌ Erro no upload: {upload_response.status_code}")
            logger.error(f"   Resposta: {upload_response.text}")
            
    except Exception as e:
        logger.error(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        
    logger.info("\n✅ Teste concluído!")

if __name__ == "__main__":
    test_image_generation()