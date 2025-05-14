#!/usr/bin/env python3
"""
Ferramentas Redis para integração com CrewAI
Fornece funcionalidades de cache, memória e filas para os agentes
"""

import json
import time
import logging
from typing import Any, Dict, List, Optional, Union
import feedparser
from redis import Redis
from redis.exceptions import ConnectionError, TimeoutError, RedisError
import os
import socket
from datetime import datetime
import backoff

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler("redis_operations.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("redis_tools")

# Configuração dinâmica do Redis
# Verifica se estamos executando em um ambiente Docker (vários métodos)
def is_running_in_docker():
    """Verifica se está rodando dentro de um container Docker usando múltiplos métodos"""
    # Método 1: Verificar existência do arquivo /.dockerenv
    if os.path.exists('/.dockerenv'):
        return True
    
    # Método 2: Verificar se cgroup contém docker
    try:
        with open('/proc/self/cgroup', 'r') as f:
            return 'docker' in f.read()
    except:
        pass
    
    # Método 3: Verificar variável de ambiente definida pelo Docker
    if os.environ.get('DOCKER_CONTAINER', ''):
        return True
        
    return False

IN_DOCKER = is_running_in_docker()
logger.info(f"Ambiente detectado: {'Docker' if IN_DOCKER else 'Host local'}")

# Se estiver no Docker, usa o nome do serviço, senão usa localhost
REDIS_HOST = os.environ.get('REDIS_HOST', 'redis' if IN_DOCKER else 'localhost')
REDIS_PORT = int(os.environ.get('REDIS_PORT', '6379'))
REDIS_DB = int(os.environ.get('REDIS_DB', '0'))
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', None)
REDIS_SOCKET_TIMEOUT = int(os.environ.get('REDIS_SOCKET_TIMEOUT', '5'))
REDIS_RETRY_MAX_ATTEMPTS = int(os.environ.get('REDIS_RETRY_MAX_ATTEMPTS', '5'))

# Exponential backoff para operações Redis
def backoff_hdlr(details):
    logger.warning(
        f"Tentativa de reconexão ao Redis: {details['tries']}/{REDIS_RETRY_MAX_ATTEMPTS} após {details['wait']:.2f} segundos"
    )

@backoff.on_exception(
    backoff.expo, 
    (ConnectionError, TimeoutError, socket.timeout), 
    max_tries=REDIS_RETRY_MAX_ATTEMPTS,
    on_backoff=backoff_hdlr
)
def get_redis_client():
    """Cria e testa uma conexão com o Redis com retry em caso de falha."""
    client = Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=REDIS_PASSWORD,
        socket_timeout=REDIS_SOCKET_TIMEOUT,
        decode_responses=True
    )
    # Teste de ping para garantir que a conexão funciona
    client.ping()
    return client

# Inicializar cliente Redis com tratamento de exceções
try:
    redis_client = get_redis_client()
    logger.info(f"Conexão estabelecida com Redis em {REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}")
except Exception as e:
    logger.error(f"Falha ao conectar ao Redis: {str(e)}")
    logger.warning("Inicializando com cliente Redis inativo - operações falharão silenciosamente")
    redis_client = None

class RedisMemoryTool:
    """Ferramenta para armazenar e recuperar contexto dos agentes no Redis"""
    
    def __init__(self, redis_client=redis_client, prefix="agent_memory"):
        self.redis = redis_client
        self.prefix = prefix
        self.logger = logging.getLogger(f"{__name__}.RedisMemoryTool")
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def save_context(self, agent_id: str, key: str, data: Any) -> bool:
        """Salva dados de contexto para um agente específico"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para salvar contexto")
            return False
            
        full_key = f"{self.prefix}:{agent_id}:{key}"
        try:
            serialized_data = json.dumps(data)
            self.redis.set(full_key, serialized_data)
            self.logger.debug(f"Contexto salvo com sucesso: {full_key} ({len(serialized_data)} bytes)")
            return True
        except Exception as e:
            self.logger.error(f"Erro ao salvar contexto para {full_key}: {str(e)}")
            return False
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def get_context(self, agent_id: str, key: str) -> Optional[Any]:
        """Recupera dados de contexto para um agente específico"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para recuperar contexto")
            return None
            
        full_key = f"{self.prefix}:{agent_id}:{key}"
        try:
            data = self.redis.get(full_key)
            if data:
                result = json.loads(data)
                self.logger.debug(f"Contexto recuperado com sucesso: {full_key}")
                return result
            else:
                self.logger.debug(f"Contexto não encontrado: {full_key}")
                return None
        except json.JSONDecodeError as e:
            self.logger.error(f"Erro ao decodificar JSON para {full_key}: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Erro ao recuperar contexto para {full_key}: {str(e)}")
            return None
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def delete_context(self, agent_id: str, key: str) -> bool:
        """Remove dados de contexto para um agente específico"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para deletar contexto")
            return False
            
        full_key = f"{self.prefix}:{agent_id}:{key}"
        try:
            result = self.redis.delete(full_key)
            if result > 0:
                self.logger.debug(f"Contexto deletado com sucesso: {full_key}")
                return True
            else:
                self.logger.debug(f"Contexto não encontrado para deletar: {full_key}")
                return False
        except Exception as e:
            self.logger.error(f"Erro ao deletar contexto para {full_key}: {str(e)}")
            return False
    
    def list_contexts(self, agent_id: str = None) -> List[str]:
        """Lista todas as chaves de contexto para um agente específico ou todos os agentes"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para listar contextos")
            return []
            
        pattern = f"{self.prefix}:{agent_id}:*" if agent_id else f"{self.prefix}:*"
        try:
            keys = self.redis.keys(pattern)
            return keys
        except Exception as e:
            self.logger.error(f"Erro ao listar contextos com padrão {pattern}: {str(e)}")
            return []

class RedisFeedCache:
    """Cache para feeds RSS"""
    
    def __init__(self, redis_client=redis_client, ttl=3600):
        """
        Inicializa o cache de feeds
        
        :param redis_client: Cliente Redis
        :param ttl: Tempo de vida do cache em segundos (1 hora por padrão)
        """
        self.redis = redis_client
        self.ttl = ttl
        self.prefix = "rss_feed"
        self.logger = logging.getLogger(f"{__name__}.RedisFeedCache")
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def fetch_feed(self, url: str) -> Dict:
        """
        Busca um feed RSS com cache
        
        :param url: URL do feed RSS
        :return: Feed parseado (do cache ou buscado em tempo real)
        """
        if not self.redis:
            self.logger.warning(f"Cliente Redis não disponível para cache - buscando feed {url} diretamente")
            return self._fetch_feed_direct(url)
            
        cache_key = f"{self.prefix}:{url}"
        
        # Tenta buscar do cache
        try:
            cached = self.redis.get(cache_key)
            if cached:
                try:
                    cached_data = json.loads(cached)
                    self.logger.debug(f"Feed {url} obtido do cache (TTL: {self.ttl}s)")
                    # Adiciona metadados de cache para rastreamento
                    cached_data["_cache"] = {
                        "hit": True,
                        "source": "redis",
                        "timestamp": time.time()
                    }
                    return cached_data
                except json.JSONDecodeError as e:
                    self.logger.warning(f"Erro ao decodificar JSON do cache para {url}: {str(e)}")
                    # Se houver erro no parse, ignora o cache
            
            # Se não encontrou no cache ou houve erro, busca em tempo real
            self.logger.debug(f"Cache miss para {url} - buscando feed diretamente")
            feed_data = self._fetch_feed_direct(url)
            
            # Adiciona metadados de cache
            feed_data["_cache"] = {
                "hit": False,
                "source": "direct",
                "timestamp": time.time()
            }
            
            # Salva no cache se tiver entradas
            if feed_data.get("entries"):
                self.redis.setex(cache_key, self.ttl, json.dumps(feed_data))
                self.logger.debug(f"Feed {url} salvo no cache (TTL: {self.ttl}s, entradas: {len(feed_data['entries'])})")
            else:
                self.logger.warning(f"Feed {url} não possui entradas, não será cacheado")
                
            return feed_data
            
        except Exception as e:
            self.logger.error(f"Erro ao processar cache para feed {url}: {str(e)}")
            # Em caso de erro no cache, tenta buscar diretamente
            return self._fetch_feed_direct(url)
    
    def _fetch_feed_direct(self, url: str) -> Dict:
        """
        Busca um feed RSS diretamente, sem usar cache
        
        :param url: URL do feed RSS
        :return: Feed parseado
        """
        try:
            self.logger.debug(f"Buscando feed diretamente: {url}")
            
            feed_data = feedparser.parse(url)
            
            # Verifica se obteve dados com sucesso
            if hasattr(feed_data, 'status') and feed_data.status >= 400:
                self.logger.error(f"Erro HTTP {feed_data.status} ao buscar feed {url}")
                return {"feed": {}, "entries": [], "error": f"HTTP {feed_data.status}"}
                
            # Verifica se o feed está vazio
            if not hasattr(feed_data, 'entries') or not feed_data.entries:
                self.logger.warning(f"Feed {url} não possui entradas")
                return {"feed": {}, "entries": []}
                
            # Converte para um formato serializável
            serializable_data = {
                "feed": {
                    "title": feed_data.feed.get("title", ""),
                    "link": feed_data.feed.get("link", ""),
                    "description": feed_data.feed.get("description", ""),
                    "language": feed_data.feed.get("language", ""),
                },
                "entries": [
                    {
                        "title": entry.get("title", ""),
                        "link": entry.get("link", ""),
                        "published": entry.get("published", ""),
                        "summary": entry.get("summary", ""),
                        "author": entry.get("author", ""),
                        "id": entry.get("id", ""),
                        "tags": [tag.get("term", "") for tag in entry.get("tags", [])]
                    }
                    for entry in feed_data.entries[:10]  # Limita aos 10 primeiros
                ]
            }
            
            self.logger.debug(f"Feed {url} obtido com sucesso: {len(serializable_data['entries'])} entradas")
            return serializable_data
            
        except Exception as e:
            self.logger.error(f"Erro ao buscar feed {url}: {str(e)}")
            return {"feed": {}, "entries": [], "error": str(e)}

class RedisArticleQueue:
    """Fila para processamento de artigos"""
    
    def __init__(self, redis_client=redis_client):
        self.redis = redis_client
        self.queue_key = "articles_to_process"
        self.processing_key = "articles_processing"
        self.completed_key = "articles_completed"
        self.error_key = "articles_error"
        self.logger = logging.getLogger(f"{__name__}.RedisArticleQueue")
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def queue_article(self, article_data: Dict) -> bool:
        """Adiciona um artigo à fila de processamento"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para enfileirar artigo")
            return False
            
        try:
            # Adiciona ID único e timestamp se não existirem
            if "id" not in article_data:
                # Utiliza um UUID para evitar colisões na hash
                article_data["id"] = f"article_{int(time.time())}_{hash(article_data.get('link', ''))}"
                
            # Adiciona metadados
            article_data["queued_at"] = time.time()
            article_data["queue_timestamp"] = datetime.fromtimestamp(time.time()).isoformat()
            
            # Verificar se é duplicata antes de enfileirar
            if self._is_duplicate(article_data):
                self.logger.warning(f"Artigo duplicado não enfileirado: {article_data.get('title', 'Sem título')}")
                return False
                
            serialized = json.dumps(article_data)
            self.redis.lpush(self.queue_key, serialized)
            self.logger.info(f"Artigo enfileirado: {article_data.get('title', 'Sem título')} (ID: {article_data['id']})")
            return True
        except Exception as e:
            self.logger.error(f"Erro ao enfileirar artigo: {str(e)}")
            return False
    
    def _is_duplicate(self, article_data: Dict) -> bool:
        """
        Verifica se um artigo já está em alguma das filas (pendente, processando, concluído)
        
        Critérios para duplicata:
        1. ID exato (se o artigo já tiver um ID)
        2. URL/link exato
        """
        if not self.redis:
            return False
            
        try:
            article_id = article_data.get("id")
            article_link = article_data.get("link")
            
            # Se não tiver ID nem link, não pode verificar duplicidade
            if not article_id and not article_link:
                return False
                
            # Verificar todas as filas
            all_queues = [self.queue_key, self.processing_key, self.completed_key, self.error_key]
            
            for queue in all_queues:
                all_items = self.redis.lrange(queue, 0, -1)
                
                for item_json in all_items:
                    try:
                        item = json.loads(item_json)
                        
                        # Verificar ID
                        if article_id and item.get("id") == article_id:
                            self.logger.debug(f"Duplicata detectada por ID: {article_id} na fila {queue}")
                            return True
                            
                        # Verificar link
                        if article_link and item.get("link") == article_link:
                            self.logger.debug(f"Duplicata detectada por link: {article_link} na fila {queue}")
                            return True
                    except json.JSONDecodeError:
                        # Ignorar itens inválidos na fila
                        pass
            
            return False
        except Exception as e:
            self.logger.error(f"Erro ao verificar duplicatas: {str(e)}")
            return False
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def get_next_article(self) -> Optional[Dict]:
        """
        Remove e retorna o próximo artigo da fila
        Também o move para a lista de processamento
        """
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para obter próximo artigo")
            return None
            
        try:
            # Usa BRPOPLPUSH para obter da fila e adicionar aos em processamento
            # O timeout 1 significa esperar 1 segundo
            article_json = self.redis.brpoplpush(self.queue_key, self.processing_key, timeout=1)
            if not article_json:
                return None
            
            try:    
                article_data = json.loads(article_json)
                # Adiciona timestamp de início de processamento
                article_data["processing_started_at"] = time.time()
                # Atualiza o artigo na fila de processamento
                self.redis.lrem(self.processing_key, 1, article_json)
                self.redis.lpush(self.processing_key, json.dumps(article_data))
                
                self.logger.info(f"Artigo obtido da fila: {article_data.get('title', 'Sem título')} (ID: {article_data.get('id', 'Sem ID')})")
                return article_data
            except json.JSONDecodeError as e:
                self.logger.error(f"Erro ao decodificar JSON de artigo: {str(e)}")
                # Move artigo inválido para a fila de erros
                self.redis.lrem(self.processing_key, 1, article_json)
                self.redis.lpush(self.error_key, article_json)
                return None
        except Exception as e:
            self.logger.error(f"Erro ao obter próximo artigo: {str(e)}")
            return None
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def mark_completed(self, article_data: Dict) -> bool:
        """Marca um artigo como processado com sucesso"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para marcar artigo como concluído")
            return False
            
        try:
            # Garantir que temos um objeto e não uma string serializada
            if isinstance(article_data, str):
                try:
                    article_data = json.loads(article_data)
                except json.JSONDecodeError:
                    self.logger.error("Impossível marcar como concluído: artigo não é um JSON válido")
                    return False
                    
            article_id = article_data.get("id")
            if not article_id:
                self.logger.error("Impossível marcar como concluído: artigo não possui ID")
                return False
            
            # Buscar o artigo exato na fila de processamento
            found = False
            articles_processing = self.redis.lrange(self.processing_key, 0, -1)
            
            for article_json in articles_processing:
                try:
                    current = json.loads(article_json)
                    if current.get("id") == article_id:
                        # Remove da fila de processamento
                        self.redis.lrem(self.processing_key, 1, article_json)
                        found = True
                        break
                except json.JSONDecodeError:
                    # Ignorar artigos com formato inválido
                    pass
            
            if not found:
                self.logger.warning(f"Artigo ID {article_id} não encontrado na fila de processamento")
                
            # Adiciona à lista de concluídos (mesmo que não tenha encontrado na fila de processamento)
            article_data["completed_at"] = time.time()
            article_data["completion_timestamp"] = datetime.fromtimestamp(time.time()).isoformat()
            article_data["status"] = "completed"
            
            self.redis.lpush(self.completed_key, json.dumps(article_data))
            self.logger.info(f"Artigo marcado como concluído: {article_data.get('title', 'Sem título')} (ID: {article_id})")
            return True
        except Exception as e:
            self.logger.error(f"Erro ao marcar artigo como concluído: {str(e)}")
            return False
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def mark_error(self, article_data: Dict, error_message: str) -> bool:
        """Marca um artigo como processado com erro"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para marcar artigo com erro")
            return False
            
        try:
            # Garantir que temos um objeto e não uma string serializada
            if isinstance(article_data, str):
                try:
                    article_data = json.loads(article_data)
                except json.JSONDecodeError:
                    self.logger.error("Impossível marcar com erro: artigo não é um JSON válido")
                    return False
            
            article_id = article_data.get("id")
            if not article_id:
                self.logger.error("Impossível marcar com erro: artigo não possui ID")
                return False
            
            # Remove da fila de processamento (usando o ID para encontrar o item exato)
            found = False
            articles_processing = self.redis.lrange(self.processing_key, 0, -1)
            
            for article_json in articles_processing:
                try:
                    current = json.loads(article_json)
                    if current.get("id") == article_id:
                        # Remove da fila de processamento
                        self.redis.lrem(self.processing_key, 1, article_json)
                        found = True
                        break
                except json.JSONDecodeError:
                    # Ignorar artigos com formato inválido
                    pass
            
            if not found:
                self.logger.warning(f"Artigo ID {article_id} não encontrado na fila de processamento para marcar erro")
            
            # Adiciona à lista de erros
            article_data["error_at"] = time.time()
            article_data["error_timestamp"] = datetime.fromtimestamp(time.time()).isoformat()
            article_data["error_message"] = error_message
            article_data["status"] = "error"
            
            self.redis.lpush(self.error_key, json.dumps(article_data))
            self.logger.info(f"Artigo marcado com erro: {article_data.get('title', 'Sem título')} (ID: {article_id})")
            self.logger.debug(f"Mensagem de erro: {error_message}")
            return True
        except Exception as e:
            self.logger.error(f"Erro ao marcar artigo com erro: {str(e)}")
            return False
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def get_queue_stats(self) -> Dict[str, int]:
        """Retorna estatísticas das filas"""
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para obter estatísticas")
            return {"pending": 0, "processing": 0, "completed": 0, "error": 0}
            
        try:
            stats = {
                "pending": self.redis.llen(self.queue_key),
                "processing": self.redis.llen(self.processing_key),
                "completed": self.redis.llen(self.completed_key),
                "error": self.redis.llen(self.error_key)
            }
            return stats
        except Exception as e:
            self.logger.error(f"Erro ao obter estatísticas da fila: {str(e)}")
            return {"pending": 0, "processing": 0, "completed": 0, "error": 0, "error_message": str(e)}
    
    @backoff.on_exception(
        backoff.expo, 
        (ConnectionError, TimeoutError, socket.timeout, RedisError), 
        max_tries=REDIS_RETRY_MAX_ATTEMPTS,
        on_backoff=backoff_hdlr
    )
    def recover_stalled_articles(self, max_processing_time: int = 3600) -> int:
        """
        Recupera artigos que estão presos na fila de processamento há muito tempo
        
        Args:
            max_processing_time: Tempo máximo em segundos que um artigo pode ficar em processamento
            
        Returns:
            Número de artigos recuperados
        """
        if not self.redis:
            self.logger.error("Cliente Redis não disponível para recuperar artigos")
            return 0
            
        try:
            recovered = 0
            current_time = time.time()
            articles_processing = self.redis.lrange(self.processing_key, 0, -1)
            
            for article_json in articles_processing:
                try:
                    article = json.loads(article_json)
                    processing_started = article.get("processing_started_at", 0)
                    
                    # Se o artigo está em processamento há muito tempo
                    if processing_started > 0 and (current_time - processing_started) > max_processing_time:
                        # Remove da fila de processamento
                        self.redis.lrem(self.processing_key, 1, article_json)
                        
                        # Adiciona mensagem de erro
                        article["recovered_at"] = current_time
                        article["recovery_timestamp"] = datetime.fromtimestamp(current_time).isoformat()
                        article["error_message"] = f"Processamento excedeu {max_processing_time} segundos e foi recuperado automaticamente"
                        
                        # Devolve à fila principal
                        self.redis.lpush(self.queue_key, json.dumps(article))
                        
                        self.logger.info(f"Artigo recuperado: {article.get('title', 'Sem título')} (ID: {article.get('id', 'Sem ID')})")
                        recovered += 1
                except json.JSONDecodeError:
                    # Artigo com formato inválido na fila - mover para fila de erros
                    self.redis.lrem(self.processing_key, 1, article_json)
                    self.redis.lpush(self.error_key, article_json)
                    self.logger.warning(f"Artigo com formato inválido movido para fila de erros")
                    recovered += 1
            
            if recovered > 0:
                self.logger.info(f"Total de {recovered} artigos recuperados da fila de processamento")
                
            return recovered
        except Exception as e:
            self.logger.error(f"Erro ao recuperar artigos: {str(e)}")
            return 0

# Instâncias globais para uso fácil
memory_tool = RedisMemoryTool()
feed_cache = RedisFeedCache()
article_queue = RedisArticleQueue()

if __name__ == "__main__":
    # Código de teste
    print("Testando conexão com Redis...")
    try:
        redis_client.ping()
        print("Conexão com Redis estabelecida com sucesso!")
    except Exception as e:
        print(f"Erro ao conectar com Redis: {str(e)}")