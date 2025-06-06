#!/usr/bin/env python3
"""
Pipeline automático 100% com CrewAI + Sistema de Fila para Imagens
Este script executa o pipeline completo de forma automatizada
"""

import os
import sys
import subprocess
import time
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"pipeline_auto_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)
logger = logging.getLogger(__name__)

def run_crew_pipeline():
    """Executa o pipeline CrewAI (RSS -> Tradução -> Formatação)"""
    logger.info("\n" + "="*60)
    logger.info("ETAPA 1/3: Executando CrewAI (RSS -> Tradução -> Formatação)")
    logger.info("="*60)
    
    try:
        # Usar crewai run ao invés de executar diretamente
        result = subprocess.run(
            ["crewai", "run"],
            capture_output=True,
            text=True,
            timeout=1800  # 30 minutos de timeout
        )
        
        if result.returncode == 0:
            logger.info("✅ CrewAI executado com sucesso!")
            # Mostrar apenas resumo do output
            output_lines = result.stdout.split('\n')
            for line in output_lines[-20:]:  # Últimas 20 linhas
                if line.strip():
                    logger.info(f"   {line}")
        else:
            logger.error(f"❌ Erro ao executar CrewAI: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Timeout ao executar CrewAI (mais de 30 minutos)")
        return False
    except Exception as e:
        logger.error(f"❌ Erro ao executar CrewAI: {str(e)}")
        return False
    
    return True

def add_to_image_queue():
    """Adiciona posts formatados à fila de imagens"""
    logger.info("\n" + "="*60)
    logger.info("ETAPA 2.1/3: Adicionando posts à fila de imagens...")
    logger.info("="*60)
    
    try:
        from tools.image_generation_queue import add_posts_to_image_queue
        
        result = add_posts_to_image_queue()
        
        if result['success']:
            logger.info(f"✅ {result['added_to_queue']} posts adicionados à fila")
            logger.info(f"⏭️  {result['skipped']} posts pulados (já têm imagem)")
            return True
        else:
            logger.error(f"❌ Erro ao adicionar à fila: {result['message']}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erro ao adicionar à fila: {str(e)}")
        return False

def process_image_queue_limited():
    """Processa apenas alguns itens da fila para não travar"""
    logger.info("\n" + "="*60)
    logger.info("ETAPA 2.2/3: Processando fila de imagens (limitado)...")
    logger.info("="*60)
    
    try:
        from tools.image_generation_queue import process_image_queue_batch, get_queue_status
        
        # Verificar status
        status = get_queue_status()
        logger.info(f"📊 Imagens na fila: {status['pending']}")
        
        if status['pending'] == 0:
            logger.info("✅ Não há imagens para processar")
            return True
            
        # Processar apenas 1 lote para não demorar muito
        logger.info("🎨 Processando 1 lote de imagens (máx 3)...")
        result = process_image_queue_batch(3)
        
        logger.info(f"✅ Processadas: {result.get('success', 0)}")
        logger.info(f"❌ Falhas: {result.get('failed', 0)}")
        
        # Verificar quantas ainda restam
        status = get_queue_status()
        if status['pending'] > 0:
            logger.info(f"\n⚠️  Ainda restam {status['pending']} imagens na fila")
            logger.info("   Execute 'python process_image_queue.py' separadamente para processar todas")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar fila: {str(e)}")
        return False

def publish_posts():
    """Publica posts no Sanity (com ou sem imagens)"""
    logger.info("\n" + "="*60)
    logger.info("ETAPA 3/3: Publicando posts no Sanity...")
    logger.info("="*60)
    
    try:
        pub_result = subprocess.run(
            [sys.executable, "publish_simple.py"],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutos
        )
        
        if pub_result.returncode == 0:
            logger.info("✅ Posts publicados com sucesso!")
            # Contar quantos foram publicados
            output_lines = pub_result.stdout.split('\n')
            for line in output_lines:
                if "posts publicados" in line:
                    logger.info(f"   {line.strip()}")
        else:
            logger.error(f"❌ Erro ao publicar: {pub_result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Timeout ao publicar posts")
        return False
    except Exception as e:
        logger.error(f"❌ Erro ao publicar: {str(e)}")
        return False
        
    return True

def main():
    """Pipeline principal com sistema de fila"""
    logger.info("\n" + "="*70)
    logger.info("🚀 PIPELINE AUTOMÁTICO COM SISTEMA DE FILA DE IMAGENS")
    logger.info("="*70)
    logger.info(f"Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Verificar variáveis de ambiente
    required_vars = ["OPENAI_API_KEY", "GOOGLE_API_KEY", "SANITY_API_TOKEN"]
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        logger.error(f"❌ Variáveis de ambiente faltando: {', '.join(missing)}")
        return
        
    # Executar pipeline
    start_time = time.time()
    
    # Etapa 1: CrewAI
    if not run_crew_pipeline():
        logger.error("❌ Pipeline interrompido devido a erro no CrewAI")
        return
        
    # Aguardar um pouco
    time.sleep(2)
    
    # Etapa 2.1: Adicionar à fila
    if not add_to_image_queue():
        logger.warning("⚠️  Erro ao adicionar à fila, continuando sem imagens...")
    else:
        # Etapa 2.2: Processar algumas imagens
        time.sleep(2)
        process_image_queue_limited()
        
    # Aguardar
    time.sleep(2)
    
    # Etapa 3: Publicar
    if not publish_posts():
        logger.error("❌ Erro ao publicar posts")
        return
        
    # Resumo final
    elapsed = time.time() - start_time
    logger.info("\n" + "="*70)
    logger.info("✅ PIPELINE CONCLUÍDO COM SUCESSO!")
    logger.info(f"Tempo total: {elapsed/60:.1f} minutos")
    logger.info("="*70)
    
    # Verificar se há imagens pendentes
    try:
        from tools.image_generation_queue import get_queue_status
        status = get_queue_status()
        if status['pending'] > 0:
            logger.info(f"\n📋 IMPORTANTE: {status['pending']} imagens ainda na fila")
            logger.info("   Execute 'python process_image_queue.py' para processar")
            logger.info(f"   Tempo estimado: {status['details']['estimated_time']}")
    except:
        pass

if __name__ == "__main__":
    main()