#!/usr/bin/env python3
"""
Pipeline sem geração de imagens - apenas RSS, tradução, formatação e publicação
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime

# Adicionar diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar o crew sem imagens
from crew_no_images import get_crew

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)
logger = logging.getLogger("pipeline")

def verify_environment():
    """Verifica apenas as variáveis essenciais (sem OpenAI)"""
    required_vars = {
        "GOOGLE_API_KEY": "Para tradução com Gemini",
        "STRAPI_PROJECT_ID": "Para publicação no Strapi",
        "strapi_API_TOKEN": "Para autenticação no Strapi"
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.environ.get(var):
            missing_vars.append(f"{var} - {description}")
    
    if missing_vars:
        logger.warning("Algumas variáveis não estão configuradas:")
        for var in missing_vars:
            logger.warning(f"  ⚠️  {var}")
        # Continuar mesmo assim
    
    logger.info("✅ Continuando sem geração de imagens...")
    return True

def run_pipeline(limit: int = 3, clean: bool = False):
    """Executa o pipeline sem geração de imagens"""
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║            PIPELINE SEM IMAGENS - BLOG CREW                  ║
║                                                              ║
║   📰 RSS → 🌐 Tradução → 📝 Formatação → 📤 Publicação       ║
║                                                              ║
║   Processando {limit} artigos...                             ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar ambiente (mas não falhar)
    verify_environment()
    
    try:
        # Limpar arquivos antigos se solicitado
        if clean:
            logger.info("🧹 Limpando arquivos antigos...")
            clear_old_files()
        
        # Criar instância do crew
        crew = get_crew()
        
        # Preparar inputs
        inputs = {
            "limit": limit,
            "skip_images": True,  # IMPORTANTE: Pular geração de imagens
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Executar o pipeline
        logger.info("🚀 Iniciando execução do pipeline...")
        start_time = datetime.now()
        
        result = crew.kickoff(inputs=inputs)
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✅ PIPELINE CONCLUÍDO!                     ║
║                                                              ║
║   Tempo de execução: {duration}                              
║                                                              ║
║   Posts processados SEM imagens!                             ║
║   Acesse o Strapi Studio para visualizar!                    ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Erro durante execução: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def clear_old_files():
    """Limpa arquivos antigos"""
    directories = [
        "posts_para_traduzir",
        "posts_traduzidos", 
        "posts_formatados",
        "posts_publicados"
    ]
    
    for dir_name in directories:
        dir_path = Path(dir_name)
        if dir_path.exists():
            for file in dir_path.glob("*.json"):
                try:
                    file.unlink()
                    logger.debug(f"Removido: {file}")
                except Exception as e:
                    logger.warning(f"Erro ao remover {file}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Pipeline Blog Crew SEM geração de imagens")
    parser.add_argument("--limit", type=int, default=3, help="Número de artigos para processar")
    parser.add_argument("--clean", action="store_true", help="Limpar arquivos antigos antes de executar")
    
    args = parser.parse_args()
    
    try:
        run_pipeline(limit=args.limit, clean=args.clean)
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Pipeline interrompido pelo usuário")
    except Exception as e:
        logger.error(f"\n❌ Erro fatal: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()