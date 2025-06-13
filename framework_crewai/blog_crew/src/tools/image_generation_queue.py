"""
Sistema de fila para geração de imagens com rate limiting
Evita travamentos e respeita limites da API DALL-E
"""

import os
import json
import time
import openai
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from crewai.tools import tool
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configurações de rate limiting
RATE_LIMIT_CONFIG = {
    "max_requests_per_minute": 5,  # DALL-E 3 tem limite baixo
    "delay_between_requests": 15,  # 15 segundos entre requisições
    "max_retries": 3,
    "retry_delay": 30,  # 30 segundos entre tentativas
    "batch_size": 3,  # Processar 3 por vez
    "batch_delay": 60  # 1 minuto entre lotes
}

class ImageGenerationQueue:
    """Gerenciador de fila para geração de imagens"""
    
    def __init__(self):
        self.queue_file = Path("image_generation_queue.json")
        self.processed_file = Path("image_generation_processed.json")
        self.failed_file = Path("image_generation_failed.json")
        
    def add_to_queue(self, post_file: str, priority: int = 5):
        """Adiciona um post à fila de processamento"""
        queue = self.load_queue()
        
        # Evitar duplicatas
        if any(item['file'] == post_file for item in queue):
            logger.info(f"Post já está na fila: {post_file}")
            return
            
        queue.append({
            'file': post_file,
            'priority': priority,
            'added_at': datetime.now().isoformat(),
            'attempts': 0,
            'status': 'pending'
        })
        
        # Ordenar por prioridade
        queue.sort(key=lambda x: x['priority'], reverse=True)
        self.save_queue(queue)
        logger.info(f"✅ Adicionado à fila: {post_file}")
        
    def load_queue(self) -> List[Dict]:
        """Carrega a fila do arquivo"""
        if self.queue_file.exists():
            with open(self.queue_file, 'r') as f:
                return json.load(f)
        return []
        
    def save_queue(self, queue: List[Dict]):
        """Salva a fila no arquivo"""
        with open(self.queue_file, 'w') as f:
            json.dump(queue, f, indent=2)
            
    def get_next_batch(self, size: int = 3) -> List[Dict]:
        """Pega o próximo lote para processar"""
        queue = self.load_queue()
        pending = [item for item in queue if item['status'] == 'pending']
        return pending[:size]
        
    def mark_as_processed(self, post_file: str, result: Dict):
        """Marca um item como processado"""
        queue = self.load_queue()
        processed = self.load_processed()
        
        # Remover da fila
        queue = [item for item in queue if item['file'] != post_file]
        self.save_queue(queue)
        
        # Adicionar aos processados
        processed.append({
            'file': post_file,
            'processed_at': datetime.now().isoformat(),
            'result': result
        })
        self.save_processed(processed)
        
    def mark_as_failed(self, post_file: str, error: str):
        """Marca um item como falho"""
        queue = self.load_queue()
        
        # Atualizar tentativas
        for item in queue:
            if item['file'] == post_file:
                item['attempts'] += 1
                item['last_error'] = error
                item['last_attempt'] = datetime.now().isoformat()
                
                # Se excedeu tentativas, mover para falhos
                if item['attempts'] >= RATE_LIMIT_CONFIG['max_retries']:
                    item['status'] = 'failed'
                    self.add_to_failed(item)
                    queue = [i for i in queue if i['file'] != post_file]
                break
                
        self.save_queue(queue)
        
    def add_to_failed(self, item: Dict):
        """Adiciona aos falhos permanentemente"""
        failed = self.load_failed()
        failed.append(item)
        self.save_failed(failed)
        
    def load_processed(self) -> List[Dict]:
        """Carrega lista de processados"""
        if self.processed_file.exists():
            with open(self.processed_file, 'r') as f:
                return json.load(f)
        return []
        
    def save_processed(self, processed: List[Dict]):
        """Salva lista de processados"""
        with open(self.processed_file, 'w') as f:
            json.dump(processed, f, indent=2)
            
    def load_failed(self) -> List[Dict]:
        """Carrega lista de falhos"""
        if self.failed_file.exists():
            with open(self.failed_file, 'r') as f:
                return json.load(f)
        return []
        
    def save_failed(self, failed: List[Dict]):
        """Salva lista de falhos"""
        with open(self.failed_file, 'w') as f:
            json.dump(failed, f, indent=2)

# Instância global
queue_manager = ImageGenerationQueue()

@tool
def add_posts_to_image_queue() -> dict:
    """
    Adiciona todos os posts formatados à fila de geração de imagens
    
    Returns:
        dict: Estatísticas da operação
    """
    try:
        input_dir = Path("posts_formatados")
        if not input_dir.exists():
            return {"success": False, "message": "Diretório posts_formatados não encontrado"}
            
        added = 0
        skipped = 0
        
        for post_file in sorted(input_dir.glob("*.json")):
            # Verificar se já tem imagem
            with open(post_file, 'r', encoding='utf-8') as f:
                post = json.load(f)
                
            if post.get('mainImage'):
                skipped += 1
                continue
                
            queue_manager.add_to_queue(str(post_file))
            added += 1
            
        return {
            "success": True,
            "added_to_queue": added,
            "skipped": skipped,
            "message": f"Adicionados {added} posts à fila, {skipped} já tinham imagem"
        }
        
    except Exception as e:
        logger.error(f"Erro ao adicionar à fila: {str(e)}")
        return {"success": False, "message": str(e)}

@tool
def process_image_queue_batch(batch_size: int = 3) -> dict:
    """
    Processa um lote da fila de imagens com rate limiting
    
    Args:
        batch_size: Número de imagens para processar
        
    Returns:
        dict: Estatísticas do processamento
    """
    try:
        batch = queue_manager.get_next_batch(batch_size)
        if not batch:
            return {
                "success": True,
                "message": "Fila vazia",
                "processed": 0
            }
            
        results = {
            "processed": 0,
            "success": 0,
            "failed": 0,
            "details": []
        }
        
        logger.info(f"🎯 Processando lote de {len(batch)} imagens...")
        
        for idx, item in enumerate(batch):
            post_file = item['file']
            logger.info(f"\n[{idx+1}/{len(batch)}] Processando: {Path(post_file).name}")
            
            try:
                # Importar a função de geração
                from .image_generation_unified import generate_image_for_post
                
                # Gerar imagem
                result = generate_image_for_post(post_file)
                
                if result['success']:
                    queue_manager.mark_as_processed(post_file, result)
                    results['success'] += 1
                    results['details'].append(f"✅ {Path(post_file).name}")
                else:
                    queue_manager.mark_as_failed(post_file, result.get('message', 'Erro desconhecido'))
                    results['failed'] += 1
                    results['details'].append(f"❌ {Path(post_file).name}: {result.get('message')}")
                    
                results['processed'] += 1
                
                # Delay entre requisições
                if idx < len(batch) - 1:
                    delay = RATE_LIMIT_CONFIG['delay_between_requests']
                    logger.info(f"⏳ Aguardando {delay}s antes da próxima...")
                    time.sleep(delay)
                    
            except Exception as e:
                logger.error(f"Erro ao processar {post_file}: {str(e)}")
                queue_manager.mark_as_failed(post_file, str(e))
                results['failed'] += 1
                results['details'].append(f"❌ {Path(post_file).name}: {str(e)}")
                
        logger.info(f"\n📊 Lote concluído: {results['success']} sucessos, {results['failed']} falhas")
        return results
        
    except Exception as e:
        logger.error(f"Erro crítico no processamento: {str(e)}")
        return {"success": False, "message": str(e)}

@tool
def get_queue_status() -> dict:
    """
    Retorna o status atual da fila de geração de imagens
    
    Returns:
        dict: Estatísticas da fila
    """
    try:
        queue = queue_manager.load_queue()
        processed = queue_manager.load_processed()
        failed = queue_manager.load_failed()
        
        pending = [item for item in queue if item['status'] == 'pending']
        
        return {
            "success": True,
            "queue_size": len(queue),
            "pending": len(pending),
            "processed": len(processed),
            "failed": len(failed),
            "details": {
                "next_batch": [Path(item['file']).name for item in pending[:3]],
                "estimated_time": f"{len(pending) * 15 / 60:.1f} minutos"
            }
        }
        
    except Exception as e:
        return {"success": False, "message": str(e)}

@tool 
def retry_failed_images() -> dict:
    """
    Recoloca imagens falhas de volta na fila para nova tentativa
    
    Returns:
        dict: Número de imagens readicionadas
    """
    try:
        failed = queue_manager.load_failed()
        queue_manager.save_failed([])  # Limpar falhas
        
        readded = 0
        for item in failed:
            if item['attempts'] < RATE_LIMIT_CONFIG['max_retries']:
                item['status'] = 'pending'
                item['attempts'] = 0
                queue = queue_manager.load_queue()
                queue.append(item)
                queue_manager.save_queue(queue)
                readded += 1
                
        return {
            "success": True,
            "readded": readded,
            "message": f"{readded} imagens readicionadas à fila"
        }
        
    except Exception as e:
        return {"success": False, "message": str(e)}