#!/usr/bin/env python3
"""
Script para processar a fila de geração de imagens de forma controlada
Evita travamentos e respeita rate limits da API DALL-E
"""

import os
import sys
import time
import logging
from datetime import datetime
from pathlib import Path

# Adicionar diretório ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.image_generation_queue import (
    queue_manager, 
    add_posts_to_image_queue,
    process_image_queue_batch,
    get_queue_status,
    RATE_LIMIT_CONFIG
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"image_queue_{datetime.now().strftime('%Y%m%d')}.log")
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Processa a fila de imagens com rate limiting"""
    
    logger.info("=" * 60)
    logger.info("🎨 PROCESSADOR DE FILA DE IMAGENS")
    logger.info("=" * 60)
    
    # Verificar variáveis de ambiente
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("❌ OPENAI_API_KEY não configurada!")
        return
        
    # 1. Adicionar posts à fila (se necessário)
    logger.info("\n📋 Verificando posts para adicionar à fila...")
    result = add_posts_to_image_queue()
    
    if result['success']:
        logger.info(f"✅ {result['added_to_queue']} posts adicionados à fila")
        logger.info(f"⏭️  {result['skipped']} posts pulados (já têm imagem)")
    else:
        logger.error(f"❌ Erro ao adicionar à fila: {result['message']}")
        
    # 2. Verificar status da fila
    status = get_queue_status()
    if not status['success']:
        logger.error("❌ Erro ao verificar status da fila")
        return
        
    logger.info(f"\n📊 Status da Fila:")
    logger.info(f"   - Pendentes: {status['pending']}")
    logger.info(f"   - Processados: {status['processed']}")
    logger.info(f"   - Falhas: {status['failed']}")
    logger.info(f"   - Tempo estimado: {status['details']['estimated_time']}")
    
    if status['pending'] == 0:
        logger.info("\n✅ Fila vazia! Nada para processar.")
        return
        
    # 3. Processar fila em lotes
    logger.info(f"\n🚀 Iniciando processamento em lotes...")
    logger.info(f"   - Tamanho do lote: {RATE_LIMIT_CONFIG['batch_size']}")
    logger.info(f"   - Delay entre imagens: {RATE_LIMIT_CONFIG['delay_between_requests']}s")
    logger.info(f"   - Delay entre lotes: {RATE_LIMIT_CONFIG['batch_delay']}s")
    
    total_processed = 0
    total_success = 0
    total_failed = 0
    batch_num = 0
    
    while True:
        batch_num += 1
        logger.info(f"\n{'='*40}")
        logger.info(f"📦 LOTE #{batch_num}")
        logger.info(f"{'='*40}")
        
        # Processar um lote
        batch_result = process_image_queue_batch(RATE_LIMIT_CONFIG['batch_size'])
        
        if not batch_result.get('processed', 0):
            logger.info("✅ Fila processada completamente!")
            break
            
        total_processed += batch_result.get('processed', 0)
        total_success += batch_result.get('success', 0)
        total_failed += batch_result.get('failed', 0)
        
        # Verificar se ainda há itens
        status = get_queue_status()
        if status['pending'] == 0:
            break
            
        # Delay entre lotes
        logger.info(f"\n⏳ Aguardando {RATE_LIMIT_CONFIG['batch_delay']}s antes do próximo lote...")
        logger.info(f"   Ainda restam {status['pending']} imagens na fila")
        time.sleep(RATE_LIMIT_CONFIG['batch_delay'])
        
    # 4. Resumo final
    logger.info("\n" + "="*60)
    logger.info("📊 RESUMO FINAL")
    logger.info("="*60)
    logger.info(f"   - Total processados: {total_processed}")
    logger.info(f"   - Sucessos: {total_success}")
    logger.info(f"   - Falhas: {total_failed}")
    
    if total_failed > 0:
        logger.info(f"\n⚠️  {total_failed} imagens falharam.")
        logger.info("   Execute 'python retry_failed_images.py' para tentar novamente")
        
    # 5. Mover posts com imagem para publicação
    if total_success > 0:
        logger.info(f"\n📤 Movendo {total_success} posts com imagem para publicação...")
        # Aqui você pode chamar o script de publicação se quiser
        
    logger.info("\n✅ Processamento concluído!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Processamento interrompido pelo usuário")
    except Exception as e:
        logger.error(f"\n❌ Erro crítico: {str(e)}")
        raise