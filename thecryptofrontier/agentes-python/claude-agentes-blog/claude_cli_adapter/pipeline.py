"""
Pipeline Simplificado usando Claude CLI
RSS → Tradução → Formatação → Publicação
"""

import os
import json
import logging
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

from .claude_agent import ClaudeAgent
from .tools.rss_reader import RSSReader
from .tools.file_manager import FileManager
from .tools.publisher import StrapiPublisher

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)


class SimplePipeline:
    """
    Pipeline simplificado para processar artigos de RSS
    usando Claude CLI para tradução e processamento
    """
    
    def __init__(self, 
                 rss_feed: str,
                 strapi_url: Optional[str] = None,
                 strapi_token: Optional[str] = None,
                 work_dir: Optional[Path] = None):
        """
        Inicializa o pipeline
        
        Args:
            rss_feed: URL do feed RSS
            strapi_url: URL do Strapi (opcional)
            strapi_token: Token de API do Strapi (opcional)
            work_dir: Diretório de trabalho
        """
        self.rss_feed = rss_feed
        self.work_dir = work_dir or Path("pipeline_data")
        
        # Criar diretórios de trabalho
        self._setup_directories()
        
        # Inicializar componentes
        self.claude_agent = ClaudeAgent()
        self.rss_reader = RSSReader(rss_feed)
        self.file_manager = FileManager(self.work_dir)
        
        # Publisher é opcional (pode não querer publicar automaticamente)
        self.publisher = None
        if strapi_url:
            self.publisher = StrapiPublisher(strapi_url, strapi_token)
        
        # Arquivo de controle de artigos processados
        self.processed_file = self.work_dir / "processed_articles.json"
        self.processed_ids = self._load_processed_ids()
    
    def _setup_directories(self):
        """Cria estrutura de diretórios necessária"""
        dirs = [
            self.work_dir,
            self.work_dir / "raw_articles",
            self.work_dir / "translated",
            self.work_dir / "formatted",
            self.work_dir / "published"
        ]
        
        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def _load_processed_ids(self) -> set:
        """Carrega IDs de artigos já processados"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r') as f:
                data = json.load(f)
                return set(data.get('ids', []))
        return set()
    
    def _save_processed_ids(self):
        """Salva IDs de artigos processados"""
        with open(self.processed_file, 'w') as f:
            json.dump({
                'ids': list(self.processed_ids),
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)
    
    def run(self, limit: int = 5, publish: bool = True) -> Dict:
        """
        Executa o pipeline completo
        
        Args:
            limit: Número máximo de artigos para processar
            publish: Se deve publicar automaticamente no Strapi
            
        Returns:
            Relatório de execução
        """
        logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║           PIPELINE CLAUDE CLI - BLOG AUTOMATION              ║
║                                                              ║
║   RSS → Claude Translation → Formatting → Publishing         ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        start_time = time.time()
        report = {
            'processed': 0,
            'translated': 0,
            'published': 0,
            'errors': [],
            'articles': []
        }
        
        try:
            # 1. Buscar artigos do RSS
            logger.info(f"📡 Buscando artigos de {self.rss_feed}...")
            articles = self.rss_reader.fetch_articles(limit=limit * 2)  # Buscar mais para filtrar
            logger.info(f"Encontrados {len(articles)} artigos")
            
            # 2. Filtrar artigos não processados
            new_articles = [a for a in articles if a['id'] not in self.processed_ids]
            logger.info(f"📋 {len(new_articles)} artigos novos para processar")
            
            # Limitar ao número solicitado
            articles_to_process = new_articles[:limit]
            
            # 3. Processar cada artigo
            for idx, article in enumerate(articles_to_process, 1):
                logger.info(f"\n{'='*60}")
                logger.info(f"Processando artigo {idx}/{len(articles_to_process)}")
                logger.info(f"Título: {article['title'][:80]}...")
                
                try:
                    # Salvar artigo original
                    raw_file = self.file_manager.save_article(
                        article, 
                        self.work_dir / "raw_articles",
                        prefix="raw"
                    )
                    
                    # Traduzir
                    logger.info("🌐 Traduzindo com Claude CLI...")
                    translated = self.claude_agent.translate_article(article)
                    
                    trans_file = self.file_manager.save_article(
                        translated,
                        self.work_dir / "translated",
                        prefix="translated"
                    )
                    report['translated'] += 1
                    
                    # Formatar para Strapi
                    logger.info("📝 Formatando para publicação...")
                    formatted = self.claude_agent.format_for_strapi(translated)
                    
                    format_file = self.file_manager.save_article(
                        formatted,
                        self.work_dir / "formatted",
                        prefix="formatted"
                    )
                    
                    # Publicar (se habilitado)
                    if publish and self.publisher:
                        logger.info("📤 Publicando no Strapi...")
                        success = self.publisher.publish(formatted)
                        
                        if success:
                            report['published'] += 1
                            # Mover para publicados
                            self.file_manager.move_to_published(
                                format_file,
                                self.work_dir / "published"
                            )
                            logger.info("✅ Publicado com sucesso!")
                        else:
                            logger.warning("⚠️ Falha na publicação")
                    
                    # Marcar como processado
                    self.processed_ids.add(article['id'])
                    report['processed'] += 1
                    
                    # Adicionar ao relatório
                    report['articles'].append({
                        'title': article['title'],
                        'title_pt': translated.get('title_pt', ''),
                        'status': 'published' if publish and self.publisher else 'formatted',
                        'files': {
                            'raw': str(raw_file),
                            'translated': str(trans_file),
                            'formatted': str(format_file)
                        }
                    })
                    
                    # Salvar progresso
                    self._save_processed_ids()
                    
                    # Delay entre artigos
                    if idx < len(articles_to_process):
                        time.sleep(3)
                    
                except Exception as e:
                    logger.error(f"❌ Erro ao processar artigo: {e}")
                    report['errors'].append({
                        'article': article['title'],
                        'error': str(e)
                    })
            
        except Exception as e:
            logger.error(f"❌ Erro fatal no pipeline: {e}")
            report['errors'].append({
                'type': 'fatal',
                'error': str(e)
            })
        
        # Relatório final
        elapsed_time = time.time() - start_time
        logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                     PIPELINE CONCLUÍDO                       ║
╠══════════════════════════════════════════════════════════════╣
║ Artigos processados: {report['processed']:>3}/{len(articles_to_process):<3}                              ║
║ Artigos traduzidos:  {report['translated']:>3}                                  ║
║ Artigos publicados:  {report['published']:>3}                                  ║
║ Erros encontrados:   {len(report['errors']):>3}                                  ║
║ Tempo de execução:   {elapsed_time:.1f}s                              ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        return report
    
    def process_single_article(self, article_file: Path) -> Dict:
        """
        Processa um único artigo a partir de arquivo JSON
        
        Args:
            article_file: Caminho para arquivo JSON do artigo
            
        Returns:
            Resultado do processamento
        """
        logger.info(f"Processando artigo de {article_file}")
        
        # Carregar artigo
        article = self.file_manager.load_article(article_file)
        
        # Traduzir
        translated = self.claude_agent.translate_article(article)
        
        # Formatar
        formatted = self.claude_agent.format_for_strapi(translated)
        
        # Salvar resultado
        output_file = self.work_dir / "formatted" / f"formatted_{article_file.name}"
        self.file_manager.save_article(formatted, output_file.parent, prefix="")
        
        return {
            'success': True,
            'input': str(article_file),
            'output': str(output_file),
            'article': formatted
        }


def main():
    """Função principal para execução via CLI"""
    import argparse
    from dotenv import load_dotenv
    
    # Carregar variáveis de ambiente
    load_dotenv()
    
    parser = argparse.ArgumentParser(
        description="Pipeline simplificado para blog usando Claude CLI"
    )
    
    parser.add_argument(
        "--feed",
        default="https://thecryptobasic.com/feed/",
        help="URL do feed RSS"
    )
    
    parser.add_argument(
        "--limit",
        type=int,
        default=3,
        help="Número de artigos para processar"
    )
    
    parser.add_argument(
        "--no-publish",
        action="store_true",
        help="Não publicar automaticamente (apenas processar)"
    )
    
    parser.add_argument(
        "--work-dir",
        type=Path,
        default=Path("pipeline_data"),
        help="Diretório de trabalho"
    )
    
    parser.add_argument(
        "--strapi-url",
        default=os.getenv("STRAPI_URL", "http://localhost:1337"),
        help="URL do Strapi"
    )
    
    parser.add_argument(
        "--strapi-token",
        default=os.getenv("STRAPI_API_TOKEN"),
        help="Token de API do Strapi"
    )
    
    args = parser.parse_args()
    
    # Criar e executar pipeline
    pipeline = SimplePipeline(
        rss_feed=args.feed,
        strapi_url=args.strapi_url if not args.no_publish else None,
        strapi_token=args.strapi_token if not args.no_publish else None,
        work_dir=args.work_dir
    )
    
    report = pipeline.run(
        limit=args.limit,
        publish=not args.no_publish
    )
    
    # Mostrar erros se houver
    if report['errors']:
        logger.warning("\n⚠️ Erros encontrados:")
        for error in report['errors']:
            logger.warning(f"  - {error}")
    
    return 0 if report['processed'] > 0 else 1


if __name__ == "__main__":
    exit(main())