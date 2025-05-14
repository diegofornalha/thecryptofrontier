#!/usr/bin/env python3
"""
Script para gerar um artigo de demonstração formatado para o Sanity CMS
e colocá-lo na fila de processamento.
"""

import json
import time
import logging
import argparse
from datetime import datetime
import os
from backup_legado_aprendizados.redis_tools import RedisArticleQueue, get_redis_client

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("demo_article_for_sanity")

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

def create_formatted_demo_article():
    """
    Cria um artigo de demonstração formatado para o Sanity CMS
    
    Returns:
        Dicionário com os dados do artigo
    """
    # ID único baseado no timestamp
    article_id = f"demo_article_{int(time.time())}"
    
    # Conteúdo para tradução (simula artigo já traduzido)
    content_text_traduzido = """# Bitcoin Alcança $60.000: O Que Isso Significa para o Mercado de Criptomoedas em 2024

O mercado de criptomoedas celebra um marco significativo nesta semana, com o Bitcoin ultrapassando novamente a barreira dos $60.000.

## Fatores por Trás da Alta

Diversos fatores contribuíram para este momento de crescimento:

1. A crescente adoção institucional, com mais empresas adicionando Bitcoin aos seus balanços patrimoniais.
2. O interesse renovado dos investidores de varejo após o período de consolidação.
3. A redução da inflação em economias importantes, tornando ativos alternativos mais atrativos.

## Impacto no Mercado Mais Amplo

O movimento de alta do Bitcoin tipicamente impulsiona todo o mercado de criptomoedas. Altcoins como Ethereum, Solana e Cardano também apresentaram ganhos significativos nas últimas sessões.

### Perspectivas para o Restante de 2024

Analistas permanecem otimistas quanto às perspectivas do Bitcoin para o restante do ano. Com o próximo halving programado e a crescente integração da tecnologia blockchain em serviços financeiros tradicionais, muitos especialistas preveem que o Bitcoin pode testar novos máximos históricos antes do final de 2024.

> "Este é apenas o começo de um novo ciclo de alta. Com a redução da oferta após o halving e a crescente demanda institucional, $100.000 é um alvo realista para o Bitcoin em 2024." - Maria Silva, Analista de Criptomoedas

Investidores agora observam atentamente os próximos níveis de resistência, com $65.000 e $69.000 sendo pontos críticos a serem superados antes que o Bitcoin possa atingir novos máximos históricos."""

    # Criação do frontmatter_traduzido (metadados do artigo traduzido)
    frontmatter_traduzido = {
        "title": "Bitcoin Alcança $60.000: O Que Isso Significa para o Mercado de Criptomoedas em 2024",
        "slug": "bitcoin-alcanca-60000-o-que-isso-significa-para-o-mercado-de-criptomoedas-em-2024",
        "published_date": datetime.now().isoformat(),
        "excerpt": "O Bitcoin ultrapassou a marca de $60.000 pela primeira vez em 2024, sinalizando uma renovada confiança dos investidores e potencialmente abrindo caminho para novos recordes de preço.",
        "author": "João Silva",
        "tags": ["Bitcoin", "Mercado de Criptomoedas", "Investimentos", "Análise de Preço", "Tendências 2024"],
        "category": "Análise de Mercado",
        "seo_meta_description": "Análise do impacto da valorização do Bitcoin acima de $60.000 em 2024 e as perspectivas para o mercado de criptomoedas no restante do ano."
    }
    
    # Criação do frontmatter_original (simula dados do artigo original)
    frontmatter_original = {
        "title": "Bitcoin Reaches $60,000: What It Means for the Crypto Market in 2024",
        "url": "https://example.com/bitcoin-60k-analysis",
        "site": "Crypto Market Insights",
        "original_link": "https://example.com/bitcoin-60k-analysis",
        "date_published": "2024-05-14T08:30:00Z"
    }
    
    # Montar artigo completo
    demo_article = {
        "id": article_id,
        "title": frontmatter_traduzido["title"],
        "content_text_traduzido": content_text_traduzido,
        "frontmatter_traduzido": frontmatter_traduzido,
        "frontmatter_original": frontmatter_original,
        "enqueued_at": time.time(),
        "enqueued_timestamp": datetime.now().isoformat(),
        "source": "sanity_demo_generator"
    }
    
    return demo_article

def enqueue_article(article_data):
    """
    Enfileira o artigo para processamento
    
    Args:
        article_data: Dicionário com os dados do artigo
        
    Returns:
        True se enfileirado com sucesso, False caso contrário
    """
    queue = RedisArticleQueue()
    
    try:
        title = article_data.get("title", "Sem título")
        logger.info(f"📰 Enfileirando artigo formatado para Sanity: {title}")
        
        # Enfileirar o artigo
        if queue.queue_article(article_data):
            logger.info(f"✅ Artigo enfileirado com sucesso: {title}")
            return True
        else:
            logger.error(f"❌ Falha ao enfileirar artigo: {title}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erro ao enfileirar artigo: {str(e)}")
        import traceback
        logger.debug(traceback.format_exc())
        return False

def display_queue_stats():
    """Exibe estatísticas da fila Redis"""
    try:
        queue = RedisArticleQueue()
        stats = queue.get_queue_stats()
        
        logger.info(f"📊 Estatísticas da fila: "
                   f"{stats['pending']} pendentes, "
                   f"{stats['processing']} em processamento, "
                   f"{stats['completed']} concluídos, "
                   f"{stats.get('error', 0)} com erro")
                   
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas da fila: {str(e)}")

def save_to_file(article_data, output_dir="posts_para_traduzir"):
    """
    Salva o artigo em um arquivo JSON
    
    Args:
        article_data: Dicionário com os dados do artigo
        output_dir: Diretório onde salvar o arquivo
        
    Returns:
        Caminho do arquivo salvo ou None se falhar
    """
    try:
        # Criar diretório se não existir
        os.makedirs(output_dir, exist_ok=True)
        
        # Gerar nome de arquivo baseado no título
        title_slug = article_data["frontmatter_traduzido"]["slug"]
        filename = f"demo_sanity_article_{int(time.time())}_{title_slug[:30]}.json"
        filepath = os.path.join(output_dir, filename)
        
        # Salvar como JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(article_data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"📄 Artigo salvo em: {filepath}")
        return filepath
        
    except Exception as e:
        logger.error(f"❌ Erro ao salvar artigo: {str(e)}")
        import traceback
        logger.debug(traceback.format_exc())
        return None

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description="Gera e enfileira um artigo de demonstração formatado para o Sanity")
    parser.add_argument('--save', '-s', action='store_true', help="Também salva o artigo em arquivo")
    parser.add_argument('--queue', '-q', action='store_true', help="Apenas enfileira o artigo (sem salvar)")
    args = parser.parse_args()
    
    # Verificar conexão Redis
    if not check_redis_connection():
        logger.error("❌ Sem conexão com Redis. Impossível continuar.")
        return False
    
    # Exibir estatísticas iniciais
    display_queue_stats()
    
    # Criar artigo de demonstração
    logger.info("🔄 Criando artigo de demonstração formatado para Sanity...")
    article_data = create_formatted_demo_article()
    
    # Salvar em arquivo se solicitado
    if args.save or not args.queue:
        filepath = save_to_file(article_data)
        
        if filepath:
            logger.info(f"✅ Artigo salvo com sucesso em {filepath}")
            
            # Se não quiser enfileirar, terminar aqui
            if not args.queue:
                logger.info("ℹ️ Artigo não foi enfileirado (apenas salvo)")
                return True
    
    # Enfileirar o artigo
    success = enqueue_article(article_data)
    
    if success:
        # Exibir estatísticas finais
        display_queue_stats()
        logger.info("✨ Concluído! Execute 'python process_article_queue.py' para processar a fila.")
        return True
    else:
        logger.error("❌ Falha ao enfileirar o artigo.")
        return False

if __name__ == "__main__":
    main()