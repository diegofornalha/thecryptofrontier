#!/usr/bin/env python3
"""
Pipeline unificado para execução completa do blog crew
Substitui a necessidade de executar múltiplos scripts separados
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

def save_crew_results(result) -> int:
    """
    Salva os resultados do CrewAI em arquivos
    
    CORREÇÃO: O CrewAI não salva arquivos automaticamente,
    precisamos extrair os dados e salvar manualmente
    """
    saved_count = 0
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    try:
        # Verificar se o resultado contém dados
        if hasattr(result, 'tasks_output'):
            # Processar cada tarefa
            for i, task_output in enumerate(result.tasks_output):
                if hasattr(task_output, 'raw') and task_output.raw:
                    # Salvar conteúdo baseado no tipo de tarefa
                    content = task_output.raw
                    
                    # Tentar parsear como JSON
                    try:
                        data = json.loads(content) if isinstance(content, str) else content
                        
                        # Determinar diretório baseado no conteúdo
                        if 'translated_content' in str(data):
                            save_dir = Path("posts_traduzidos")
                        elif 'formatted_content' in str(data):
                            save_dir = Path("posts_formatados")
                        elif 'image_url' in str(data) or 'main_image' in str(data):
                            save_dir = Path("posts_com_imagem")
                        elif 'published' in str(data) or 'strapi_id' in str(data):
                            save_dir = Path("posts_publicados")
                        else:
                            save_dir = Path("posts_para_traduzir")
                        
                        # Criar diretório se não existir
                        save_dir.mkdir(exist_ok=True)
                        
                        # Salvar arquivo
                        filename = f"post_{timestamp}_{i}.json"
                        filepath = save_dir / filename
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        
                        logger.info(f"✅ Arquivo salvo: {filepath}")
                        saved_count += 1
                        
                    except json.JSONDecodeError:
                        # Se não for JSON, salvar como texto
                        save_dir = Path("posts_para_traduzir")
                        save_dir.mkdir(exist_ok=True)
                        
                        filename = f"post_{timestamp}_{i}.txt"
                        filepath = save_dir / filename
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(str(content))
                        
                        logger.info(f"✅ Arquivo texto salvo: {filepath}")
                        saved_count += 1
        
        # Se não houver tasks_output, tentar salvar o resultado direto
        elif result:
            save_dir = Path("posts_publicados")
            save_dir.mkdir(exist_ok=True)
            
            filename = f"result_{timestamp}.json"
            filepath = save_dir / filename
            
            # Tentar salvar como JSON
            try:
                data = result if isinstance(result, dict) else {"result": str(result)}
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"✅ Resultado salvo: {filepath}")
                saved_count = 1
            except Exception as e:
                logger.error(f"Erro ao salvar resultado: {e}")
    
    except Exception as e:
        logger.error(f"Erro ao processar resultados do CrewAI: {e}")
    
    return saved_count

def verify_environment():
    """Verifica se todas as variáveis de ambiente necessárias estão configuradas"""
    required_vars = {
        "OPENAI_API_KEY": "Para geração de imagens com DALL-E",
        "GOOGLE_API_KEY": "Para tradução com Gemini",
        "STRAPI_PROJECT_ID": "Para publicação no Strapi",
        "strapi_API_TOKEN": "Para autenticação no Strapi"
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
        
        # CORREÇÃO: Forçar salvamento dos arquivos após execução
        # O CrewAI não salva automaticamente, precisamos fazer isso
        logger.info("💾 Salvando resultados em arquivos...")
        success_count = save_crew_results(result)
        
        # Verificar resultados salvos
        published_dir = Path("posts_publicados")
        if published_dir.exists():
            published_files = list(published_dir.glob("*.json"))
            actual_count = len(published_files)
            if actual_count > success_count:
                success_count = actual_count
        
        # Exibir resumo
        logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✅ PIPELINE CONCLUÍDO!                     ║
║                                                              ║
║   Tempo de execução: {duration}                              
║   Artigos publicados: {success_count}                        
║                                                              ║
║   Acesse o Strapi Studio para visualizar os posts!          ║
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