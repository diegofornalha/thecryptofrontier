#!/usr/bin/env python3
"""
Processador de Fila de Artigos
Fornece funções para processar artigos da fila Redis
"""

import json
import time
import logging
from pathlib import Path
from datetime import datetime
import traceback

from .redis_tools import RedisArticleQueue
from .sanity_tools import SanityPublishTool

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler("queue_processor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("process_queue")

def publish_to_sanity(article_data):
    """
    Publica um artigo no Sanity usando a ferramenta SanityPublishTool
    Se falhar, salva o artigo localmente em formato JSON
    """
    logger.info(f"📝 Publicando artigo: {article_data.get('title', 'Sem título')}")
    
    try:
        # Usar a ferramenta de publicação
        sanity_publisher = SanityPublishTool()
        
        # Verificar se o artigo já está no formato correto para o Sanity
        # ou se precisa ser convertido
        if '_type' not in article_data:
            logger.info("Convertendo artigo para formato Sanity antes de publicar...")
            # A ferramenta SanityPublishTool já tem a lógica para isso
        
        # Publicar no Sanity
        result = sanity_publisher._run(json_content=article_data)
        
        if result.get('success'):
            logger.info(f"✅ Artigo publicado com sucesso no Sanity! ID: {result.get('document_id')}")
            # Adicionar informações de publicação
            article_data['sanity_document_id'] = result.get('document_id')
            article_data['sanity_published_at'] = datetime.now().isoformat()
            article_data['sanity_publish_result'] = result
            
            # Salvar também localmente para referência
            _save_for_later_publish(article_data, published=True)
            return True
        else:
            logger.error(f"❌ Falha ao publicar no Sanity: {result.get('error')}")
            article_data['publish_error'] = result.get('error')
            article_data['publish_error_details'] = result.get('details', '')
            _save_for_later_publish(article_data, has_error=True)
            return False
    
    except Exception as e:
        logger.error(f"❌ Erro ao publicar no Sanity: {str(e)}")
        logger.debug(traceback.format_exc())
        article_data['publish_error'] = str(e)
        _save_for_later_publish(article_data, has_error=True)
        return False

def _save_for_later_publish(article_data, published=False, has_error=False):
    """
    Salva o artigo localmente para publicação posterior ou para registro
    
    Args:
        article_data: Dados do artigo
        published: Se True, indica que o artigo foi publicado com sucesso
        has_error: Se True, indica que houve erro na publicação
    """
    # Definir diretório de saída adequado
    if published:
        output_dir = Path("output/published")
    elif has_error:
        output_dir = Path("output/errors")
    else:
        output_dir = Path("output/pending")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Gerar nome de arquivo baseado no título ou ID
    title_slug = ""
    if 'title' in article_data:
        title = article_data['title']
        title_slug = "".join(c if c.isalnum() else "_" for c in title.lower())[:50]
    
    article_id = article_data.get('id', f"article_{int(time.time())}")
    filename = f"{article_id}_{title_slug}.json"
    
    output_file = output_dir / filename
    
    # Adicionar metadados
    article_data["saved_at"] = time.time()
    article_data["saved_timestamp"] = datetime.now().isoformat()
    
    # Salvar o artigo
    with open(output_file, 'w') as f:
        json.dump(article_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Artigo salvo em: {output_file}")
    
    # Também registrar em um arquivo consolidado se for publicado com sucesso
    if published:
        consolidated_file = Path("output/published_articles.json")
        
        # Carrega o arquivo existente ou cria um novo
        if consolidated_file.exists():
            with open(consolidated_file, 'r') as f:
                try:
                    all_published = json.load(f)
                except json.JSONDecodeError:
                    all_published = []
        else:
            all_published = []
        
        # Adiciona o artigo à lista de publicados
        all_published.append(article_data)
        
        # Salva a lista atualizada
        with open(consolidated_file, 'w') as f:
            json.dump(all_published, f, indent=2, ensure_ascii=False)
    
    return True

def process_queue(max_articles=None, interval=5, recover_stalled=True, max_processing_time=3600):
    """
    Processa artigos da fila
    
    Args:
        max_articles: Número máximo de artigos a processar (None = ilimitado)
        interval: Intervalo em segundos entre processamentos
        recover_stalled: Se True, tenta recuperar artigos presos na fila de processamento
        max_processing_time: Tempo máximo (segundos) que um artigo pode ficar em processamento
    """
    queue = RedisArticleQueue()
    processed = 0
    errors = 0
    
    logger.info("🔄 Iniciando processador de fila de artigos...")
    logger.info(f"⏱️ Verificando a cada {interval} segundos")
    
    # Recuperar artigos presos
    if recover_stalled:
        recovered = queue.recover_stalled_articles(max_processing_time)
        if recovered > 0:
            logger.info(f"🔄 Recuperados {recovered} artigos presos na fila de processamento")
    
    # Se max_articles é 1, só processa um artigo e termina
    if max_articles == 1:
        # Busca o próximo artigo
        article = queue.get_next_article()
        if not article:
            logger.info("💤 Nenhum artigo na fila para processar.")
            return 0
        
        try:
            # Processa o artigo
            logger.info(f"⚙️ Processando artigo: {article.get('title', 'Sem título')}")
            
            # Tenta publicar no Sanity
            success = publish_to_sanity(article)
            
            if success:
                # Marca como concluído
                queue.mark_completed(article)
                processed += 1
                logger.info(f"✅ Artigo processado com sucesso!")
            else:
                # Registra erro
                error_msg = f"Falha ao processar artigo: {article.get('title', 'Sem título')}"
                logger.error(f"❌ {error_msg}")
                queue.mark_error(article, error_msg)
                errors += 1
        
        except Exception as e:
            error_msg = f"Erro ao processar artigo: {str(e)}"
            logger.error(f"❌ {error_msg}")
            logger.debug(traceback.format_exc())
            
            # Tenta marcar como erro
            try:
                queue.mark_error(article, error_msg)
            except Exception as e2:
                logger.error(f"Erro ao marcar artigo com erro: {str(e2)}")
            
            errors += 1
        
        # Retorna número de artigos processados
        return processed
    
    # Se max_articles é None ou maior que 1, entra em loop
    while True:
        # Verifica se atingimos o limite
        if max_articles is not None and processed >= max_articles:
            logger.info(f"✅ Processamento concluído: {processed} artigos processados com sucesso, {errors} com erro")
            break
        
        # Busca o próximo artigo
        article = queue.get_next_article()
        if not article:
            logger.info("💤 Nenhum artigo na fila. Aguardando...")
            time.sleep(interval)
            continue
        
        try:
            # Processa o artigo
            logger.info(f"⚙️ Processando artigo: {article.get('title', 'Sem título')}")
            
            # Tenta publicar no Sanity
            success = publish_to_sanity(article)
            
            if success:
                # Marca como concluído
                queue.mark_completed(article)
                processed += 1
                logger.info(f"✅ Artigo processado com sucesso! Total: {processed}")
            else:
                # Registra erro
                error_msg = f"Falha ao processar artigo: {article.get('title', 'Sem título')}"
                logger.error(f"❌ {error_msg}")
                queue.mark_error(article, error_msg)
                errors += 1
                
        except Exception as e:
            error_msg = f"Erro ao processar artigo: {str(e)}"
            logger.error(f"❌ {error_msg}")
            logger.debug(traceback.format_exc())
            
            # Tenta marcar como erro
            try:
                queue.mark_error(article, error_msg)
            except Exception as e2:
                logger.error(f"Erro ao marcar artigo com erro: {str(e2)}")
            
            errors += 1
        
        # Pausa entre processamentos
        time.sleep(interval)
    
    return processed