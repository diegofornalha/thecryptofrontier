#!/usr/bin/env python3
"""
Script para reprocessar imagens que falharam
"""

import os
import sys
import logging

# Adicionar diretório ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.image_generation_queue import retry_failed_images, get_queue_status

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

def main():
    logger.info("🔄 REPROCESSAMENTO DE IMAGENS FALHAS")
    logger.info("="*40)
    
    # Verificar status atual
    status = get_queue_status()
    logger.info(f"📊 Status atual:")
    logger.info(f"   - Falhas: {status['failed']}")
    logger.info(f"   - Na fila: {status['pending']}")
    
    if status['failed'] == 0:
        logger.info("\n✅ Não há imagens falhas para reprocessar!")
        return
        
    # Reprocessar
    result = retry_failed_images()
    
    if result['success']:
        logger.info(f"\n✅ {result['readded']} imagens readicionadas à fila")
        logger.info("\nExecute 'python process_image_queue.py' para processar")
    else:
        logger.error(f"\n❌ Erro: {result['message']}")

if __name__ == "__main__":
    main()