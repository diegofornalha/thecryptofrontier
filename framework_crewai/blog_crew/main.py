#!/usr/bin/env python3
"""
Blog Crew - Ponto de Entrada Principal

Uso:
    python main.py <comando> [opções]

Comandos disponíveis:
    run-crew            Executar crew completo
    run-pipeline        Executar pipeline padrão
    simple-pipeline     Executar pipeline simplificado
    monitor-rss         Monitorar feeds RSS
    publish-posts       Publicar posts pendentes
    sync-algolia        Sincronizar com Algolia
    
Exemplos:
    python main.py run-crew
    python main.py simple-pipeline --limit 5
    python main.py monitor-rss --continuous
"""

import sys
import os
import argparse
from pathlib import Path

# Adicionar src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Importar configuração de logs
from utils.log_config import setup_logger

logger = setup_logger("main", "main.log")


def run_crew(args):
    """Executar crew completo"""
    logger.info("Executando crew completo...")
    from scripts.actions.run.run_crew import main as run_crew_main
    run_crew_main()


def run_pipeline(args):
    """Executar pipeline padrão"""
    logger.info(f"Executando pipeline com limite: {args.limit}")
    os.environ["ARTICLE_LIMIT"] = str(args.limit)
    from scripts.actions.run.run_pipeline import run_pipeline as pipeline_main
    pipeline_main()


def simple_pipeline(args):
    """Executar pipeline simplificado"""
    logger.info(f"Executando pipeline simples com limite: {args.limit}")
    os.environ["ARTICLE_LIMIT"] = str(args.limit)
    os.environ["GENERATE_IMAGES"] = "true" if args.with_images else "false"
    
    # Importar e executar
    from src.pipelines.simple.strapi_pipeline import main as simple_main
    simple_main()


def monitor_rss(args):
    """Monitorar feeds RSS"""
    logger.info("Iniciando monitoramento RSS...")
    from scripts.monitoring.rss_monitor import main as monitor_main
    monitor_main()


def publish_posts(args):
    """Publicar posts pendentes"""
    logger.info("Publicando posts...")
    if args.with_images:
        from scripts.actions.publish.publish_all_with_images import main as publish_main
    else:
        from scripts.actions.publish.publish_direct import main as publish_main
    publish_main()


def sync_algolia(args):
    """Sincronizar com Algolia"""
    logger.info("Sincronizando com Algolia...")
    from src.tools.sync_direct_algolia import main as sync_main
    sync_main()


def sync_strapi_duplicates(args):
    """Deletar duplicatas no Strapi"""
    logger.info("Deletando duplicatas no Strapi...")
    from src.tools.delete_strapi_duplicates import main as delete_strapi_main
    delete_strapi_main()


def sync_algolia_duplicates(args):
    """Deletar duplicatas no Algolia"""
    logger.info("Deletando duplicatas no Algolia...")
    from src.tools.delete_algolia_duplicates import main as delete_algolia_main
    delete_algolia_main()


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Blog Crew - Sistema de Automação de Blog",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    # Subcomandos
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponíveis")
    
    # run-crew
    parser_crew = subparsers.add_parser("run-crew", help="Executar crew completo")
    parser_crew.set_defaults(func=run_crew)
    
    # run-pipeline
    parser_pipeline = subparsers.add_parser("run-pipeline", help="Executar pipeline padrão")
    parser_pipeline.add_argument("--limit", type=int, default=3, help="Número de artigos")
    parser_pipeline.set_defaults(func=run_pipeline)
    
    # simple-pipeline
    parser_simple = subparsers.add_parser("simple-pipeline", help="Pipeline simplificado")
    parser_simple.add_argument("--limit", type=int, default=3, help="Número de artigos")
    parser_simple.add_argument("--with-images", action="store_true", help="Gerar imagens")
    parser_simple.set_defaults(func=simple_pipeline)
    
    # monitor-rss
    parser_monitor = subparsers.add_parser("monitor-rss", help="Monitorar RSS")
    parser_monitor.add_argument("--continuous", action="store_true", help="Modo contínuo")
    parser_monitor.set_defaults(func=monitor_rss)
    
    # publish-posts
    parser_publish = subparsers.add_parser("publish-posts", help="Publicar posts")
    parser_publish.add_argument("--with-images", action="store_true", help="Com imagens")
    parser_publish.set_defaults(func=publish_posts)
    
    # sync-algolia
    parser_sync = subparsers.add_parser("sync-algolia", help="Sincronizar Algolia")
    parser_sync.set_defaults(func=sync_algolia)

    # sync-strapi-duplicates
    parser_sync_strapi = subparsers.add_parser("sync-strapi-duplicates", help="Deletar duplicatas no Strapi")
    parser_sync_strapi.set_defaults(func=sync_strapi_duplicates)

    # sync-algolia-duplicates
    parser_sync_algolia = subparsers.add_parser("sync-algolia-duplicates", help="Deletar duplicatas no Algolia")
    parser_sync_algolia.set_defaults(func=sync_algolia_duplicates)
    
    # Parse argumentos
    args = parser.parse_args()
    
    # Se nenhum comando, mostrar ajuda
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Executar comando
    try:
        args.func(args)
        logger.info(f"Comando '{args.command}' executado com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao executar '{args.command}': {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()