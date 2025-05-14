#!/usr/bin/env python3
"""
Script para enfileirar artigos de demonstração
Enfileira um artigo de exemplo na fila Redis para demonstração
"""

import os
import sys
import json
import time
import logging
import argparse
from pathlib import Path
from typing import List, Optional
import traceback

from redis_tools import RedisArticleQueue, redis_client, get_redis_client

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler("enqueue.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("enqueue_demo_article")

def check_redis_connection():
    """Verifica se o Redis está disponível"""
    try:
        client = get_redis_client()
        client.ping()
        logger.info("✅ Conexão com Redis estabelecida com sucesso!")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao conectar com Redis: {str(e)}")
        return False

def load_article_data(filepath: str) -> Optional[dict]:
    """
    Carrega e valida dados de um artigo de um arquivo JSON
    
    Args:
        filepath: Caminho para o arquivo JSON
        
    Returns:
        Dicionário com os dados do artigo ou None se houver erro
    """
    try:
        # Verificar se o arquivo existe
        if not os.path.exists(filepath):
            logger.error(f"Arquivo não encontrado: {filepath}")
            return None
            
        # Carregar o arquivo JSON
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                article_data = json.load(f)
            except json.JSONDecodeError as e:
                logger.error(f"Erro ao decodificar JSON do arquivo {filepath}: {str(e)}")
                return None
        
        # Validação básica dos dados
        if not isinstance(article_data, dict):
            logger.error(f"Arquivo {filepath} não contém um objeto JSON válido")
            return None
            
        # Se o artigo não tiver título, tentar encontrar
        if "title" not in article_data:
            if "frontmatter_original" in article_data and "title" in article_data["frontmatter_original"]:
                article_data["title"] = article_data["frontmatter_original"]["title"]
                logger.debug(f"Título extraído de frontmatter_original: {article_data['title']}")
            else:
                # Usar nome do arquivo como título
                filename = os.path.basename(filepath)
                article_data["title"] = f"Artigo sem título ({filename})"
                logger.warning(f"Artigo sem título. Usando: {article_data['title']}")
        
        # Adicionar um ID e link para processamento (se ainda não existirem)
        if "id" not in article_data:
            article_data["id"] = f"demo_article_{int(time.time())}"
            logger.debug(f"ID gerado automaticamente: {article_data['id']}")
        
        # Adicionar link se disponível no frontmatter
        if "link" not in article_data:
            if "frontmatter_original" in article_data and "original_link" in article_data["frontmatter_original"]:
                article_data["link"] = article_data["frontmatter_original"]["original_link"]
                logger.debug(f"Link extraído de frontmatter_original: {article_data['link']}")
            elif "url" in article_data:
                article_data["link"] = article_data["url"]
                logger.debug(f"Link extraído do campo url: {article_data['link']}")
        
        # Adicionar timestamp
        article_data["enqueued_at"] = time.time()
        article_data["enqueued_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        article_data["source_file"] = filepath
        
        return article_data
        
    except Exception as e:
        logger.error(f"Erro ao processar arquivo {filepath}: {str(e)}")
        logger.debug(traceback.format_exc())
        return None

def create_demo_article(index=0):
    """
    Cria um artigo de demonstração sem usar arquivo
    
    Args:
        index: Índice para diferenciar artigos em lote
        
    Returns:
        Dicionário com os dados do artigo
    """
    # Artigo de demonstração
    if index == 0:
        # Usar o artigo principal para o primeiro
        demo_article = {
            "title": "Bitcoin Alcança $60.000: O Que Isso Significa para o Mercado de Criptomoedas em 2024",
            "slug": "bitcoin-alcanca-60000-o-que-isso-significa-para-o-mercado-de-criptomoedas-em-2024",
            "excerpt": "O Bitcoin ultrapassou a marca de $60.000 pela primeira vez em 2024, sinalizando uma renovada confiança dos investidores e potencialmente abrindo caminho para novos recordes de preço.",
            "author": "TheCryptoFrontier",
            "date": "2024-05-14T10:00:00Z",
            "tags": ["Bitcoin", "Mercado de Criptomoedas", "Investimentos", "Análise de Preço", "Tendências 2024"],
            "categories": ["Criptomoedas", "Blockchain", "Análise de Mercado"],
            "featuredImage": "https://example.com/images/bitcoin-60k.jpg",
            "content": [
                {
                    "_type": "block",
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "text": "O mercado de criptomoedas celebra um marco significativo nesta semana, com o Bitcoin ultrapassando novamente a barreira dos $60.000."
                        }
                    ],
                    "markDefs": []
                }
            ]
        }
    else:
        # Gerar um título variado para diferenciar
        demo_article = {
            "title": f"Artigo de Demonstração #{index}",
            "slug": f"artigo-de-demonstracao-{index}",
            "excerpt": f"Este é um artigo de demonstração #{index} para testar o processamento em lote.",
            "author": "Sistema Automático",
            "date": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "tags": ["Demo", "Teste", f"Número-{index}"],
            "categories": ["Teste"]
        }
    
    # Adicionar metadados
    demo_article["id"] = f"demo_article_{int(time.time())}_{index}"
    demo_article["enqueued_at"] = time.time()
    demo_article["enqueued_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
    demo_article["source"] = "demo_generator"
    
    return demo_article

def enqueue_article(article_data: dict) -> bool:
    """
    Enfileira um artigo na fila Redis
    
    Args:
        article_data: Dicionário com os dados do artigo
        
    Returns:
        True se o artigo foi enfileirado com sucesso, False caso contrário
    """
    queue = RedisArticleQueue()
    
    try:
        title = article_data.get("title", "Sem título")
        logger.info(f"📰 Enfileirando artigo: {title}")
        
        # Enfileirar o artigo
        if queue.queue_article(article_data):
            logger.info(f"✅ Artigo enfileirado com sucesso: {title}")
            return True
        else:
            logger.error(f"❌ Falha ao enfileirar artigo: {title}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erro ao enfileirar artigo: {str(e)}")
        logger.debug(traceback.format_exc())
        return False

def find_json_files(directory: str, pattern: str = "*.json") -> List[str]:
    """
    Encontra arquivos JSON em um diretório
    
    Args:
        directory: Diretório onde procurar
        pattern: Padrão glob para filtrar arquivos
        
    Returns:
        Lista de caminhos de arquivos encontrados
    """
    if not os.path.exists(directory):
        logger.error(f"Diretório não encontrado: {directory}")
        return []
        
    if not os.path.isdir(directory):
        logger.error(f"{directory} não é um diretório")
        return []
    
    try:
        dir_path = Path(directory)
        files = list(dir_path.glob(pattern))
        
        # Converter para strings absolutas
        file_paths = [str(f.absolute()) for f in files]
        
        logger.info(f"Encontrados {len(file_paths)} arquivos em {directory} com padrão {pattern}")
        
        if not file_paths:
            logger.warning(f"Nenhum arquivo encontrado em {directory} com padrão {pattern}")
            
        return file_paths
    except Exception as e:
        logger.error(f"Erro ao buscar arquivos em {directory}: {str(e)}")
        logger.debug(traceback.format_exc())
        return []

def display_queue_stats():
    """Exibe estatísticas da fila Redis"""
    try:
        queue = RedisArticleQueue()
        stats = queue.get_queue_stats()
        
        # Nova função retorna também erros
        logger.info(f"📊 Estatísticas da fila: "
                   f"{stats['pending']} pendentes, "
                   f"{stats['processing']} em processamento, "
                   f"{stats['completed']} concluídos, "
                   f"{stats.get('error', 0)} com erro")
                   
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas da fila: {str(e)}")

def parse_arguments():
    """Parse os argumentos da linha de comando"""
    parser = argparse.ArgumentParser(description="Enfileira artigos de demonstração para processamento")
    
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument('-f', '--file', type=str, 
                       help="Caminho para um arquivo JSON específico para enfileirar")
    group.add_argument('-d', '--dir', type=str, default="posts_para_traduzir",
                       help="Diretório contendo arquivos JSON para enfileirar (padrão: posts_para_traduzir)")
    group.add_argument('-g', '--generate', type=int, default=1,
                       help="Gerar N artigos de demonstração (padrão: 1)")
    
    parser.add_argument('-a', '--all', action='store_true',
                        help="Enfileirar todos os arquivos do diretório (padrão: apenas o primeiro)")
    parser.add_argument('-p', '--pattern', type=str, default="*.json",
                        help="Padrão glob para filtrar arquivos (padrão: *.json)")
    parser.add_argument('-v', '--verbose', action='store_true',
                        help="Habilitar logs detalhados (DEBUG)")
    
    return parser.parse_args()

def main():
    """Função principal"""
    # Parse argumentos
    args = parse_arguments()
    
    # Configurar nível de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)
        logger.debug("Modo verbose ativado")
    
    # Verificar conexão Redis
    if not check_redis_connection():
        logger.error("❌ Sem conexão com Redis. Impossível continuar.")
        sys.exit(1)
    
    # Exibir estatísticas iniciais
    display_queue_stats()
    
    enqueued_count = 0
    error_count = 0
    
    # Processar arquivo específico, diretório ou gerar artigos demo
    if args.file:
        # Enfileirar um arquivo específico
        article_data = load_article_data(args.file)
        if article_data and enqueue_article(article_data):
            enqueued_count += 1
        else:
            error_count += 1
    elif args.generate:
        # Gerar e enfileirar artigos de demonstração
        num_articles = args.generate
        logger.info(f"Gerando {num_articles} artigos de demonstração")
        
        for i in range(num_articles):
            article_data = create_demo_article(i)
            if enqueue_article(article_data):
                enqueued_count += 1
            else:
                error_count += 1
    else:
        # Buscar arquivos no diretório
        file_paths = find_json_files(args.dir, args.pattern)
        
        if not file_paths:
            logger.error(f"❌ Nenhum arquivo encontrado em {args.dir} com padrão {args.pattern}")
            sys.exit(1)
        
        # Determinar quais arquivos processar
        if args.all:
            files_to_process = file_paths
            logger.info(f"Processando todos os {len(files_to_process)} arquivos encontrados")
        else:
            files_to_process = [file_paths[0]]
            logger.info(f"Processando apenas o primeiro arquivo: {os.path.basename(files_to_process[0])}")
        
        # Processar cada arquivo
        for filepath in files_to_process:
            article_data = load_article_data(filepath)
            if article_data and enqueue_article(article_data):
                enqueued_count += 1
            else:
                error_count += 1
    
    # Resumo final
    logger.info(f"✅ Enfileirados {enqueued_count} artigos")
    if error_count > 0:
        logger.error(f"❌ {error_count} artigos não puderam ser enfileirados")
    
    # Exibir estatísticas finais
    display_queue_stats()
    
    logger.info("✨ Concluído! Execute 'python process_article_queue.py' para processar a fila.")

if __name__ == "__main__":
    main()