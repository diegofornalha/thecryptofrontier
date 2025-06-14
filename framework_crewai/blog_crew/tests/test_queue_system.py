#!/usr/bin/env python3
"""
Script de teste para verificar o sistema de fila com apenas 1 artigo
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

# Adicionar diretório ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

def create_test_post():
    """Cria um post de teste para processar"""
    test_post = {
        "title": "Bitcoin atinge nova máxima histórica em dezembro de 2024",
        "slug": {
            "_type": "slug", 
            "current": "bitcoin-atinge-nova-maxima-historica-dezembro-2024-test"
        },
        "publishedAt": datetime.now().isoformat(),
        "content": [
            {
                "_type": "block",
                "style": "normal",
                "children": [
                    {
                        "_type": "span",
                        "text": "O Bitcoin atingiu uma nova máxima histórica hoje, superando a marca dos $100.000 pela primeira vez em sua história."
                    }
                ]
            }
        ],
        "excerpt": "Bitcoin supera $100k em marco histórico para criptomoedas"
    }
    
    # Salvar em posts_formatados
    os.makedirs("posts_formatados", exist_ok=True)
    test_file = Path("posts_formatados/test_post_queue.json")
    
    with open(test_file, 'w', encoding='utf-8') as f:
        json.dump(test_post, f, ensure_ascii=False, indent=2)
        
    logger.info(f"✅ Post de teste criado: {test_file}")
    return str(test_file)

def main():
    logger.info("🧪 TESTE DO SISTEMA DE FILA DE IMAGENS")
    logger.info("="*50)
    
    # Verificar variáveis
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("❌ OPENAI_API_KEY não configurada!")
        logger.info("Carregando do .env...")
        
        env_file = Path("/home/strapi/thecryptofrontier/.env")
        if env_file.exists():
            from dotenv import load_dotenv
            load_dotenv(env_file)
            logger.info("✅ Variáveis carregadas")
    
    # 1. Criar post de teste
    logger.info("\n1️⃣ Criando post de teste...")
    test_file = create_test_post()
    
    # 2. Adicionar à fila
    logger.info("\n2️⃣ Adicionando à fila de imagens...")
    try:
        from tools.image_generation_queue import queue_manager, get_queue_status
        
        # Limpar filas anteriores para teste limpo
        for file in ['image_generation_queue.json', 'image_generation_processed.json', 'image_generation_failed.json']:
            if Path(file).exists():
                Path(file).unlink()
                logger.info(f"   Limpando {file}")
        
        # Adicionar à fila
        queue_manager.add_to_queue(test_file, priority=10)  # Alta prioridade
        
        # Verificar status
        status = get_queue_status()
        logger.info(f"✅ Status da fila:")
        logger.info(f"   - Pendentes: {status['pending']}")
        logger.info(f"   - Na fila: {status['details']['next_batch']}")
        
    except Exception as e:
        logger.error(f"❌ Erro ao adicionar à fila: {str(e)}")
        return
        
    # 3. Processar a fila
    logger.info("\n3️⃣ Processando fila (apenas 1 imagem)...")
    try:
        # Importar e processar diretamente
        from tools.image_generation_unified import generate_image_for_post
        
        logger.info("🎨 Gerando imagem para o post de teste...")
        result = generate_image_for_post(test_file)
        
        logger.info(f"\n📊 Resultado do processamento:")
        logger.info(f"   - Sucesso: {result.get('success', False)}")
        logger.info(f"   - Mensagem: {result.get('message', 'Sem mensagem')}")
        if result.get('asset_id'):
            logger.info(f"   - Asset ID: {result['asset_id']}")
                
    except Exception as e:
        logger.error(f"❌ Erro ao processar: {str(e)}")
        import traceback
        traceback.print_exc()
        return
        
    # 4. Verificar resultado
    logger.info("\n4️⃣ Verificando resultado...")
    
    # Ver se foi criado em posts_com_imagem
    output_dir = Path("posts_com_imagem")
    if output_dir.exists():
        files = list(output_dir.glob("*.json"))
        logger.info(f"✅ Arquivos em posts_com_imagem: {len(files)}")
        for file in files:
            logger.info(f"   - {file.name}")
            
    # Ver se a imagem foi salva
    img_dir = Path("posts_imagens")
    if img_dir.exists():
        imgs = list(img_dir.glob("*.png"))
        logger.info(f"✅ Imagens salvas: {len(imgs)}")
        for img in imgs:
            logger.info(f"   - {img.name}")
            
    # Status final da fila
    status = get_queue_status()
    logger.info(f"\n📊 Status final da fila:")
    logger.info(f"   - Pendentes: {status['pending']}")
    logger.info(f"   - Processados: {status['processed']}")
    logger.info(f"   - Falhas: {status['failed']}")
    
    logger.info("\n✅ Teste concluído!")

if __name__ == "__main__":
    main()