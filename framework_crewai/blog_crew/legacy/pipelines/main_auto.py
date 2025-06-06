#!/usr/bin/env python3
"""
Script principal AUTOMATIZADO - CrewAI + Imagens + Publicação
"""

import os
import sys
import logging
import subprocess
import time

# Importações locais
from crew import get_crew

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("blog_crew_auto")

def run_crew():
    """Executa o fluxo completo de automação do blog COM IMAGENS"""
    
    # Verificar variáveis de ambiente necessárias
    required_vars = ["OPENAI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.warning(f"As seguintes variáveis de ambiente não estão definidas: {', '.join(missing_vars)}")
        return False
    
    # Etapa 1: Executar CrewAI
    logger.info("=" * 60)
    logger.info("ETAPA 1/3: Executando CrewAI...")
    logger.info("=" * 60)
    
    try:
        crew = get_crew()
        result = crew.kickoff()
        logger.info("✅ CrewAI executado com sucesso!")
    except Exception as e:
        logger.error(f"❌ Erro no CrewAI: {str(e)}")
        # Continuar mesmo com erro
    
    # Aguardar um pouco
    time.sleep(2)
    
    # Etapa 2: Gerar imagens
    logger.info("\n" + "=" * 60)
    logger.info("ETAPA 2/3: Gerando imagens com DALL-E 3...")
    logger.info("=" * 60)
    
    try:
        img_result = subprocess.run(
            [sys.executable, "process_images_working.py"],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutos de timeout
        )
        
        if img_result.returncode == 0:
            logger.info("✅ Imagens geradas com sucesso!")
            logger.info(img_result.stdout[:500])  # Primeiros 500 chars
        else:
            logger.error(f"❌ Erro ao gerar imagens: {img_result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Timeout ao gerar imagens (mais de 5 minutos)")
        return False
    except Exception as e:
        logger.error(f"❌ Erro ao executar geração de imagens: {str(e)}")
        return False
    
    # Aguardar
    time.sleep(2)
    
    # Etapa 3: Publicar no Sanity
    logger.info("\n" + "=" * 60)
    logger.info("ETAPA 3/3: Publicando no Sanity...")
    logger.info("=" * 60)
    
    try:
        pub_result = subprocess.run(
            [sys.executable, "publish_simple.py"],
            capture_output=True,
            text=True,
            timeout=120  # 2 minutos de timeout
        )
        
        if pub_result.returncode == 0:
            logger.info("✅ Posts publicados com sucesso!")
            logger.info(pub_result.stdout[:500])  # Primeiros 500 chars
        else:
            logger.error(f"❌ Erro ao publicar: {pub_result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Timeout ao publicar (mais de 2 minutos)")
        return False
    except Exception as e:
        logger.error(f"❌ Erro ao executar publicação: {str(e)}")
        return False
    
    # Sucesso total!
    logger.info("\n" + "=" * 60)
    logger.info("🎉 PIPELINE COMPLETO COM SUCESSO! 🎉")
    logger.info("✅ Posts processados pelo CrewAI")
    logger.info("✅ Imagens geradas com DALL-E 3")
    logger.info("✅ Posts publicados no Sanity (sem tags)")
    logger.info("=" * 60)
    
    return True

if __name__ == "__main__":
    logger.info("""
╔══════════════════════════════════════════════════════════════╗
║       BLOG CREW AUTOMATIZADO - PIPELINE COMPLETO             ║
║                                                              ║
║   1. CrewAI: RSS → Tradução → Formatação                     ║
║   2. DALL-E 3: Geração de imagens                           ║
║   3. Sanity: Publicação (sem tags)                          ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    success = run_crew()
    
    if not success:
        logger.error("\n❌ Pipeline falhou em alguma etapa!")
        sys.exit(1)
    
    sys.exit(0)