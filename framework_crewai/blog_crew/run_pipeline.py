#!/usr/bin/env python3
"""
Pipeline unificado para execução completa do blog crew
Substitui a necessidade de executar múltiplos scripts separados
"""

import os
import sys
import logging
import argparse
from pathlib import Path
from datetime import datetime

# Adicionar diretório atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar o crew
from crew import get_crew

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    ]
)
logger = logging.getLogger("pipeline")

def clear_old_files():
    """Limpa arquivos antigos de execuções anteriores"""
    directories = [
        "posts_para_traduzir",
        "posts_traduzidos", 
        "posts_formatados",
        "posts_com_imagem",
        "posts_publicados"
    ]
    
    for dir_name in directories:
        dir_path = Path(dir_name)
        if dir_path.exists():
            # Limpar apenas arquivos JSON antigos
            for file in dir_path.glob("*.json"):
                try:
                    file.unlink()
                    logger.debug(f"Removido: {file}")
                except Exception as e:
                    logger.warning(f"Erro ao remover {file}: {e}")

def verify_environment():
    """Verifica se todas as variáveis de ambiente necessárias estão configuradas"""
    required_vars = {
        "OPENAI_API_KEY": "Para geração de imagens com DALL-E",
        "GOOGLE_API_KEY": "Para tradução com Gemini",
        "SANITY_PROJECT_ID": "Para publicação no Sanity",
        "SANITY_API_TOKEN": "Para autenticação no Sanity"
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.environ.get(var):
            missing_vars.append(f"{var} - {description}")
    
    if missing_vars:
        logger.error("Variáveis de ambiente não configuradas:")
        for var in missing_vars:
            logger.error(f"  ❌ {var}")
        logger.error("\nConfigura estas variáveis no arquivo .env ou nas variáveis de ambiente do sistema")
        return False
    
    logger.info("✅ Todas as variáveis de ambiente estão configuradas")
    return True

def run_pipeline(limit: int = 3, clean: bool = False):
    """
    Executa o pipeline completo do blog crew
    
    Args:
        limit: Número de artigos para processar
        clean: Se deve limpar arquivos antigos antes de executar
    """
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║            PIPELINE UNIFICADO BLOG CREW                      ║
║                                                              ║
║   ✨ RSS → Tradução → Formatação → Imagens → Publicação     ║
║                                                              ║
║   Processando {limit} artigos...                             ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar ambiente
    if not verify_environment():
        sys.exit(1)
    
    # Limpar arquivos antigos se solicitado
    if clean:
        logger.info("🧹 Limpando arquivos de execuções anteriores...")
        clear_old_files()
    
    try:
        # Obter o crew configurado
        logger.info("🤖 Inicializando agentes...")
        crew = get_crew()
        
        # Adicionar inputs personalizados se necessário
        inputs = {
            "max_articles": limit,
            "target_language": "pt-BR",
            "image_style": "professional_crypto"
        }
        
        # Executar o pipeline
        logger.info("🚀 Iniciando execução do pipeline...")
        start_time = datetime.now()
        
        result = crew.kickoff(inputs=inputs)
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Verificar resultados
        published_dir = Path("posts_publicados")
        if published_dir.exists():
            published_files = list(published_dir.glob("*.json"))
            success_count = len(published_files)
        else:
            success_count = 0
        
        # Exibir resumo
        logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✅ PIPELINE CONCLUÍDO!                     ║
║                                                              ║
║   Tempo de execução: {duration}                              
║   Artigos publicados: {success_count}                        
║                                                              ║
║   Acesse o Sanity Studio para visualizar os posts!          ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        # Mostrar estatísticas detalhadas
        show_statistics()
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Erro durante execução do pipeline: {str(e)}")
        raise

def show_statistics():
    """Mostra estatísticas sobre os arquivos processados"""
    stats = {}
    
    directories = {
        "posts_para_traduzir": "Artigos coletados",
        "posts_traduzidos": "Artigos traduzidos",
        "posts_formatados": "Artigos formatados",
        "posts_com_imagem": "Artigos com imagens",
        "posts_publicados": "Artigos publicados"
    }
    
    logger.info("\n📊 Estatísticas do processamento:")
    for dir_name, description in directories.items():
        dir_path = Path(dir_name)
        if dir_path.exists():
            count = len(list(dir_path.glob("*.json")))
            stats[dir_name] = count
            logger.info(f"  {description}: {count}")
        else:
            stats[dir_name] = 0
            logger.info(f"  {description}: 0")
    
    # Verificar taxa de sucesso
    if stats.get("posts_para_traduzir", 0) > 0:
        success_rate = (stats.get("posts_publicados", 0) / stats["posts_para_traduzir"]) * 100
        logger.info(f"\n  Taxa de sucesso: {success_rate:.1f}%")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Pipeline unificado do Blog Crew - Automação completa de blog sobre criptomoedas"
    )
    
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=3,
        help="Número de artigos para processar (padrão: 3)"
    )
    
    parser.add_argument(
        "--clean", "-c",
        action="store_true",
        help="Limpar arquivos de execuções anteriores"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verboso com mais detalhes"
    )
    
    args = parser.parse_args()
    
    # Configurar nível de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Executar pipeline
    try:
        run_pipeline(limit=args.limit, clean=args.clean)
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Pipeline interrompido pelo usuário")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Erro fatal: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()