"""
Sistema de Processamento Paralelo para Múltiplos Artigos
"""
import asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from typing import List, Dict, Any, Callable, Optional, Tuple
import logging
from dataclasses import dataclass
from datetime import datetime
import time
import json
import os
from pathlib import Path
import hashlib
from functools import lru_cache

logger = logging.getLogger(__name__)

@dataclass
class ProcessingResult:
    article_id: str
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    processing_time: float = 0.0
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class ImageCache:
    """Cache para evitar regeneração de imagens similares"""
    
    def __init__(self, cache_dir: str = "image_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.cache_index_file = self.cache_dir / "cache_index.json"
        self.cache_index = self._load_cache_index()
    
    def _load_cache_index(self) -> Dict:
        """Carrega índice do cache"""
        if self.cache_index_file.exists():
            try:
                with open(self.cache_index_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_cache_index(self):
        """Salva índice do cache"""
        with open(self.cache_index_file, 'w') as f:
            json.dump(self.cache_index, f, indent=2)
    
    def get_cache_key(self, prompt: str, style: str = "default") -> str:
        """Gera chave única para o cache baseada no prompt"""
        content = f"{prompt}:{style}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def get_cached_image(self, prompt: str, style: str = "default") -> Optional[Dict]:
        """Busca imagem no cache"""
        cache_key = self.get_cache_key(prompt, style)
        
        if cache_key in self.cache_index:
            cache_entry = self.cache_index[cache_key]
            image_path = self.cache_dir / cache_entry["filename"]
            
            if image_path.exists():
                logger.info(f"Cache hit for image: {cache_key}")
                return {
                    "path": str(image_path),
                    "url": cache_entry.get("url"),
                    "created_at": cache_entry.get("created_at"),
                    "prompt": prompt
                }
        
        return None
    
    def save_to_cache(self, prompt: str, image_path: str, url: str = None, style: str = "default"):
        """Salva imagem no cache"""
        cache_key = self.get_cache_key(prompt, style)
        
        # Copiar imagem para cache
        source_path = Path(image_path)
        if source_path.exists():
            cache_filename = f"{cache_key}_{source_path.name}"
            cache_path = self.cache_dir / cache_filename
            
            # Se já existe no cache, não duplicar
            if not cache_path.exists():
                import shutil
                shutil.copy2(source_path, cache_path)
            
            # Atualizar índice
            self.cache_index[cache_key] = {
                "filename": cache_filename,
                "url": url,
                "prompt": prompt,
                "style": style,
                "created_at": datetime.now().isoformat(),
                "original_path": str(image_path)
            }
            
            self._save_cache_index()
            logger.info(f"Image cached: {cache_key}")

class ParallelProcessor:
    """Processador paralelo para múltiplos artigos"""
    
    def __init__(self, max_workers: int = 5, use_processes: bool = False):
        self.max_workers = max_workers
        self.use_processes = use_processes
        self.image_cache = ImageCache()
        
        # Escolher executor baseado na configuração
        if use_processes:
            self.executor = ProcessPoolExecutor(max_workers=max_workers)
        else:
            self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    async def process_articles_batch(
        self,
        articles: List[Dict],
        process_func: Callable,
        batch_size: Optional[int] = None
    ) -> List[ProcessingResult]:
        """
        Processa artigos em paralelo
        
        Args:
            articles: Lista de artigos para processar
            process_func: Função que processa um artigo
            batch_size: Tamanho do batch (None = processar todos juntos)
        """
        if batch_size is None:
            batch_size = len(articles)
        
        all_results = []
        
        # Processar em batches
        for i in range(0, len(articles), batch_size):
            batch = articles[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1} with {len(batch)} articles")
            
            # Criar tasks assíncronas
            tasks = []
            for article in batch:
                task = asyncio.create_task(
                    self._process_single_article(article, process_func)
                )
                tasks.append(task)
            
            # Aguardar conclusão do batch
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Processar resultados
            for article, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    all_results.append(
                        ProcessingResult(
                            article_id=article.get("id", "unknown"),
                            success=False,
                            error=str(result)
                        )
                    )
                else:
                    all_results.append(result)
        
        return all_results
    
    async def _process_single_article(
        self,
        article: Dict,
        process_func: Callable
    ) -> ProcessingResult:
        """Processa um único artigo"""
        start_time = time.time()
        article_id = article.get("id", article.get("link", "unknown"))
        
        try:
            # Executar em thread/process pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                process_func,
                article
            )
            
            processing_time = time.time() - start_time
            
            return ProcessingResult(
                article_id=article_id,
                success=True,
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"Error processing article {article_id}: {e}")
            
            return ProcessingResult(
                article_id=article_id,
                success=False,
                error=str(e),
                processing_time=processing_time
            )
    
    async def process_with_pipeline(
        self,
        articles: List[Dict],
        pipeline: List[Tuple[str, Callable]],
        stop_on_error: bool = False
    ) -> Dict[str, List[ProcessingResult]]:
        """
        Processa artigos através de um pipeline de etapas
        
        Args:
            articles: Lista de artigos
            pipeline: Lista de tuplas (nome_etapa, função)
            stop_on_error: Se deve parar o pipeline em caso de erro
        """
        results = {}
        current_articles = articles
        
        for stage_name, stage_func in pipeline:
            logger.info(f"Starting pipeline stage: {stage_name}")
            
            # Processar etapa atual
            stage_results = await self.process_articles_batch(
                current_articles,
                stage_func
            )
            
            results[stage_name] = stage_results
            
            # Filtrar artigos bem-sucedidos para próxima etapa
            if stop_on_error:
                successful_results = [r for r in stage_results if r.success]
                
                if not successful_results:
                    logger.warning(f"No successful articles after {stage_name}. Stopping pipeline.")
                    break
                
                # Extrair artigos processados com sucesso
                current_articles = [r.result for r in successful_results if r.result]
            else:
                # Continuar com todos os artigos, marcando falhas
                current_articles = []
                for i, result in enumerate(stage_results):
                    if result.success and result.result:
                        current_articles.append(result.result)
                    else:
                        # Manter artigo original se falhou
                        if i < len(articles):
                            current_articles.append(articles[i])
        
        return results
    
    def cleanup(self):
        """Limpa recursos"""
        self.executor.shutdown(wait=True)

class BatchSanityOperations:
    """Operações em batch para Sanity CMS"""
    
    def __init__(self, project_id: str, dataset: str, token: str):
        self.project_id = project_id
        self.dataset = dataset
        self.token = token
        self.api_url = f"https://{project_id}.api.sanity.io/v2021-10-21"
    
    def create_batch_mutations(self, documents: List[Dict], batch_size: int = 100) -> List[List[Dict]]:
        """Cria batches de mutações para Sanity"""
        mutations = []
        
        for doc in documents:
            mutation = {
                "createOrReplace": {
                    "_id": doc.get("_id", f"drafts.{doc.get('slug', '')}"),
                    "_type": doc.get("_type", "post"),
                    **doc
                }
            }
            mutations.append(mutation)
        
        # Dividir em batches
        batches = []
        for i in range(0, len(mutations), batch_size):
            batches.append(mutations[i:i + batch_size])
        
        return batches
    
    async def execute_batch_mutations(self, mutations: List[Dict]) -> Dict:
        """Executa mutações em batch no Sanity"""
        import aiohttp
        
        url = f"{self.api_url}/data/mutate/{self.dataset}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "mutations": mutations,
            "returnIds": True,
            "returnDocuments": True
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"Batch mutation failed: {error_text}")
    
    async def publish_documents_batch(self, documents: List[Dict]) -> List[Dict]:
        """Publica múltiplos documentos no Sanity"""
        batches = self.create_batch_mutations(documents)
        results = []
        
        for i, batch in enumerate(batches):
            logger.info(f"Publishing batch {i+1}/{len(batches)} with {len(batch)} documents")
            
            try:
                result = await self.execute_batch_mutations(batch)
                results.append(result)
            except Exception as e:
                logger.error(f"Batch {i+1} failed: {e}")
                results.append({"error": str(e)})
        
        return results

# Funções auxiliares para processamento paralelo
def process_article_wrapper(article: Dict) -> Dict:
    """Wrapper para processar artigo em process pool"""
    # Importar aqui para evitar problemas de serialização
    from agents.translator_agent import TranslatorAgent
    from agents.formatter_agent import FormatterAgent
    
    try:
        # Traduzir
        translator = TranslatorAgent()
        translated = translator.translate_article(article)
        
        # Formatar
        formatter = FormatterAgent()
        formatted = formatter.format_article(translated)
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error in process_article_wrapper: {e}")
        raise

# Exemplo de uso
async def example_usage():
    """Exemplo de processamento paralelo"""
    
    # Artigos de exemplo
    articles = [
        {"id": "1", "title": "Article 1", "content": "Content 1"},
        {"id": "2", "title": "Article 2", "content": "Content 2"},
        {"id": "3", "title": "Article 3", "content": "Content 3"},
    ]
    
    # Criar processador
    processor = ParallelProcessor(max_workers=3)
    
    # Processar em paralelo
    results = await processor.process_articles_batch(
        articles,
        process_article_wrapper
    )
    
    # Mostrar resultados
    for result in results:
        if result.success:
            print(f"✅ {result.article_id}: Processed in {result.processing_time:.2f}s")
        else:
            print(f"❌ {result.article_id}: Failed - {result.error}")
    
    # Pipeline de processamento
    pipeline = [
        ("translate", lambda x: {"translated": True, **x}),
        ("format", lambda x: {"formatted": True, **x}),
        ("generate_image", lambda x: {"has_image": True, **x})
    ]
    
    pipeline_results = await processor.process_with_pipeline(
        articles,
        pipeline,
        stop_on_error=False
    )
    
    # Mostrar resultados do pipeline
    for stage, results in pipeline_results.items():
        successful = sum(1 for r in results if r.success)
        print(f"{stage}: {successful}/{len(results)} successful")
    
    # Cleanup
    processor.cleanup()

if __name__ == "__main__":
    asyncio.run(example_usage())