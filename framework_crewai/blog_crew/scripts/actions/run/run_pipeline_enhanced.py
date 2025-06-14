#!/usr/bin/env python3
"""
Pipeline Enhanced - Versão com todas as melhorias implementadas
"""
import os
import sys
import argparse
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict

# Adicionar diretório ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar módulos de melhoria
from monitoring.health_checker import HealthChecker, ServiceStatus
from monitoring.metrics_dashboard import MetricsCollector, MetricsDashboard
from utils.structured_logger import LoggerFactory, log_execution
from utils.retry_decorator import retry_with_backoff, PersistentJobQueue
from utils.parallel_processor import ParallelProcessor, ImageCache
from utils.security_validator import FeedSecurityValidator

# Importar crew e ferramentas
from crew import BlogCrew

# Configurar logging
LoggerFactory.configure_all(level="INFO", log_dir="logs")
logger = LoggerFactory.get_logger("blog_crew.pipeline")

class EnhancedPipeline:
    """Pipeline com todas as melhorias integradas"""
    
    def __init__(self):
        self.health_checker = HealthChecker()
        self.metrics_collector = MetricsCollector()
        self.feed_validator = FeedSecurityValidator()
        self.job_queue = PersistentJobQueue("job_queue.json")
        self.parallel_processor = ParallelProcessor(max_workers=5)
        self.crew = BlogCrew()
        
        # Configurar contexto de logging
        logger.set_context(
            pipeline_version="2.0",
            features=["health_check", "retry", "parallel", "security", "metrics"]
        )
    
    async def pre_flight_checks(self) -> bool:
        """Executa verificações antes de iniciar pipeline"""
        logger.info("Starting pre-flight checks")
        
        # Health checks
        health_results = await self.health_checker.check_all_services()
        
        all_healthy = True
        for result in health_results:
            if result.status != ServiceStatus.HEALTHY:
                logger.error(
                    f"Service unhealthy: {result.service}",
                    service=result.service,
                    status=result.status.value,
                    error=result.error
                )
                all_healthy = False
            else:
                logger.info(
                    f"Service healthy: {result.service}",
                    service=result.service,
                    response_time=result.response_time
                )
        
        # Verificar quotas de API
        quotas = await self.health_checker.check_api_quotas()
        for quota in quotas:
            if quota.percentage_used > 80:
                logger.warning(
                    f"API quota warning",
                    service=quota.service,
                    percentage_used=quota.percentage_used
                )
        
        return all_healthy
    
    @retry_with_backoff(max_retries=3, service_name="rss_feed")
    def fetch_articles(self, limit: int = 3) -> List[Dict]:
        """Busca artigos com validação de segurança"""
        logger.info(f"Fetching {limit} articles from RSS feeds")
        
        # Importar ferramenta RSS
        from tools.rss_tools import get_latest_crypto_news
        
        articles = get_latest_crypto_news(limit=limit)
        validated_articles = []
        
        for article in articles:
            # Validar e sanitizar artigo
            validation_result = self.feed_validator.validate_and_sanitize_article(article)
            
            if validation_result.is_valid:
                validated_articles.append(validation_result.sanitized_data)
                logger.info(
                    "Article validated",
                    article_id=article.get('link', 'unknown'),
                    risk_score=validation_result.risk_score
                )
            else:
                logger.warning(
                    "Article validation failed",
                    article_id=article.get('link', 'unknown'),
                    errors=validation_result.errors
                )
        
        return validated_articles
    
    async def process_articles_parallel(self, articles: List[Dict]) -> List[Dict]:
        """Processa artigos em paralelo"""
        logger.info(f"Processing {len(articles)} articles in parallel")
        
        # Pipeline de processamento
        pipeline = [
            ("translate", self._translate_article),
            ("format", self._format_article),
            ("generate_image", self._generate_image)
        ]
        
        results = await self.parallel_processor.process_with_pipeline(
            articles,
            pipeline,
            stop_on_error=False
        )
        
        # Coletar artigos processados com sucesso
        processed_articles = []
        for stage_name, stage_results in results.items():
            logger.info(
                f"Stage completed: {stage_name}",
                stage=stage_name,
                successful=sum(1 for r in stage_results if r.success),
                total=len(stage_results)
            )
        
        # Pegar resultados finais
        if "generate_image" in results:
            for result in results["generate_image"]:
                if result.success and result.result:
                    processed_articles.append(result.result)
                    
                    # Registrar métricas
                    self.metrics_collector.record_article_processing(
                        article_id=result.article_id,
                        stage="complete",
                        success=True,
                        processing_time=result.processing_time
                    )
        
        return processed_articles
    
    @retry_with_backoff(max_retries=3, service_name="google_ai")
    def _translate_article(self, article: Dict) -> Dict:
        """Traduz artigo com retry e logging"""
        start_time = datetime.now()
        
        try:
            # Usar ferramenta de tradução
            from tools.translator import translate_to_portuguese
            
            translated_content = translate_to_portuguese(article['content'])
            translated_title = translate_to_portuguese(article['title'])
            
            article['content'] = translated_content
            article['title'] = translated_title
            article['translated'] = True
            
            duration = (datetime.now() - start_time).total_seconds()
            
            logger.log_performance(
                "article_translation",
                duration,
                article_id=article.get('link', 'unknown')
            )
            
            return article
            
        except Exception as e:
            logger.error(
                "Translation failed",
                exception=e,
                article_id=article.get('link', 'unknown')
            )
            raise
    
    def _format_article(self, article: Dict) -> Dict:
        """Formata artigo"""
        # Usar agente formatador
        from agents.formatter_agent import FormatterAgent
        
        formatter = FormatterAgent()
        formatted = formatter.format_article_enhanced(article)
        
        return formatted
    
    @retry_with_backoff(max_retries=2, service_name="openai")
    def _generate_image(self, article: Dict) -> Dict:
        """Gera imagem com cache"""
        # Verificar cache primeiro
        image_cache = self.parallel_processor.image_cache
        
        prompt = article.get('image_prompt', article['title'])
        cached_image = image_cache.get_cached_image(prompt)
        
        if cached_image:
            article['main_image'] = cached_image['url']
            logger.info("Using cached image", article_id=article.get('link'))
            return article
        
        # Gerar nova imagem
        from tools.image_generation_tools_unified import generate_image_for_post
        
        try:
            result = generate_image_for_post(json.dumps(article))
            
            if "error" not in result:
                # Salvar no cache
                image_cache.save_to_cache(
                    prompt,
                    result.get('local_path', ''),
                    result.get('url', '')
                )
            
            return article
            
        except Exception as e:
            logger.error("Image generation failed", exception=e)
            # Continuar sem imagem
            return article
    
    async def publish_articles(self, articles: List[Dict]) -> List[Dict]:
        """Publica artigos no Strapi"""
        logger.info(f"Publishing {len(articles)} articles to Strapi")
        
        # Usar publicação em batch se muitos artigos
        if len(articles) > 5:
            from utils.parallel_processor import BatchstrapiOperations
            
            batch_ops = BatchstrapiOperations(
                project_id=os.getenv("strapi_PROJECT_ID"),
                dataset=os.getenv("strapi_DATASET"),
                token=os.getenv("strapi_API_TOKEN")
            )
            
            results = await batch_ops.publish_documents_batch(articles)
            logger.info(f"Batch publish completed: {len(results)} batches")
            
        else:
            # Publicar individualmente
            from tools.strapi_tools_enhanced import publish_to_strapi_enhanced
            
            for article in articles:
                try:
                    result = publish_to_strapi_enhanced(json.dumps(article))
                    logger.info(
                        "Article published",
                        article_id=article.get('slug'),
                        success=True
                    )
                except Exception as e:
                    logger.error(
                        "Publish failed",
                        exception=e,
                        article_id=article.get('slug')
                    )
                    
                    # Adicionar à fila de retry
                    self.job_queue.add_job(
                        job_type="publish_article",
                        data=article,
                        priority=1
                    )
        
        return articles
    
    async def process_failed_jobs(self):
        """Processa jobs falhados da fila"""
        logger.info("Processing failed jobs queue")
        
        stats = self.job_queue.get_stats()
        logger.info(f"Queue stats", **stats)
        
        while True:
            job = self.job_queue.get_next_job()
            if not job:
                break
            
            try:
                if job["type"] == "publish_article":
                    await self.publish_articles([job["data"]])
                
                self.job_queue.complete_job(job["id"])
                
            except Exception as e:
                self.job_queue.fail_job(job["id"], str(e))
    
    async def run(self, limit: int = 3, process_failed: bool = True):
        """Executa pipeline completo"""
        start_time = datetime.now()
        
        try:
            # Pre-flight checks
            if not await self.pre_flight_checks():
                logger.error("Pre-flight checks failed. Aborting pipeline.")
                return
            
            # Buscar artigos
            articles = self.fetch_articles(limit)
            
            if not articles:
                logger.warning("No articles found to process")
                return
            
            # Processar em paralelo
            processed_articles = await self.process_articles_parallel(articles)
            
            # Publicar
            await self.publish_articles(processed_articles)
            
            # Processar jobs falhados
            if process_failed:
                await self.process_failed_jobs()
            
            # Gerar dashboard
            dashboard = MetricsDashboard(self.metrics_collector)
            dashboard.generate_html_report()
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Pipeline completed successfully",
                duration_seconds=duration,
                articles_processed=len(processed_articles)
            )
            
        except Exception as e:
            logger.error("Pipeline failed", exception=e)
            raise
        
        finally:
            # Cleanup
            self.parallel_processor.cleanup()
            
            # Salvar métricas
            self.health_checker.save_metrics()
            
            # Limpar jobs antigos
            self.job_queue.cleanup_old_jobs(days=7)

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description="Blog Crew Enhanced Pipeline")
    parser.add_argument("--limit", type=int, default=3, help="Número de artigos")
    parser.add_argument("--skip-failed", action="store_true", help="Pular jobs falhados")
    parser.add_argument("--health-only", action="store_true", help="Apenas health check")
    
    args = parser.parse_args()
    
    # Criar pipeline
    pipeline = EnhancedPipeline()
    
    if args.health_only:
        # Apenas health check
        async def health_check():
            await pipeline.pre_flight_checks()
            
            # Gerar resumo
            summary = pipeline.health_checker.get_health_summary()
            print(json.dumps(summary, indent=2))
        
        asyncio.run(health_check())
    else:
        # Executar pipeline completo
        asyncio.run(
            pipeline.run(
                limit=args.limit,
                process_failed=not args.skip_failed
            )
        )

if __name__ == "__main__":
    import json
    main()