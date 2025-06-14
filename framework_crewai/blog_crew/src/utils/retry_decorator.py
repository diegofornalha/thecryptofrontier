"""
Sistema de Retry com Backoff Exponencial e Circuit Breaker
"""
import time
import logging
from functools import wraps
from typing import Callable, Type, Tuple, Optional, Any, Dict
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import json
import os

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = "closed"  # Normal operation
    OPEN = "open"      # Failing, reject calls
    HALF_OPEN = "half_open"  # Testing if service recovered

@dataclass
class CircuitBreakerStats:
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: Optional[datetime] = None
    last_success_time: Optional[datetime] = None
    state: CircuitState = CircuitState.CLOSED
    state_changed_at: datetime = field(default_factory=datetime.now)

class CircuitBreaker:
    """Circuit Breaker para prevenir sobrecarga em serviços falhos"""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: Type[Exception] = Exception
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.stats = CircuitBreakerStats()
        self._lock = asyncio.Lock() if asyncio.get_event_loop().is_running() else None
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Executa função através do circuit breaker"""
        if self.stats.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.stats.state = CircuitState.HALF_OPEN
                logger.info(f"Circuit breaker entering HALF_OPEN state")
            else:
                raise Exception(f"Circuit breaker is OPEN. Service unavailable.")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    async def async_call(self, func: Callable, *args, **kwargs) -> Any:
        """Versão assíncrona do circuit breaker"""
        async with self._lock:
            if self.stats.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.stats.state = CircuitState.HALF_OPEN
                    logger.info(f"Circuit breaker entering HALF_OPEN state")
                else:
                    raise Exception(f"Circuit breaker is OPEN. Service unavailable.")
        
        try:
            result = await func(*args, **kwargs)
            await self._async_on_success()
            return result
        except self.expected_exception as e:
            await self._async_on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Verifica se deve tentar resetar o circuit"""
        return (
            self.stats.state == CircuitState.OPEN and
            self.stats.state_changed_at + timedelta(seconds=self.recovery_timeout) <= datetime.now()
        )
    
    def _on_success(self):
        """Registra sucesso"""
        self.stats.success_count += 1
        self.stats.last_success_time = datetime.now()
        
        if self.stats.state == CircuitState.HALF_OPEN:
            self.stats.state = CircuitState.CLOSED
            self.stats.failure_count = 0
            logger.info("Circuit breaker recovered to CLOSED state")
    
    async def _async_on_success(self):
        """Versão assíncrona de _on_success"""
        async with self._lock:
            self._on_success()
    
    def _on_failure(self):
        """Registra falha"""
        self.stats.failure_count += 1
        self.stats.last_failure_time = datetime.now()
        
        if self.stats.failure_count >= self.failure_threshold:
            self.stats.state = CircuitState.OPEN
            self.stats.state_changed_at = datetime.now()
            logger.error(f"Circuit breaker opened after {self.stats.failure_count} failures")
    
    async def _async_on_failure(self):
        """Versão assíncrona de _on_failure"""
        async with self._lock:
            self._on_failure()

# Armazenar circuit breakers por serviço
circuit_breakers: Dict[str, CircuitBreaker] = {}

def get_circuit_breaker(service_name: str) -> CircuitBreaker:
    """Obtém ou cria circuit breaker para um serviço"""
    if service_name not in circuit_breakers:
        circuit_breakers[service_name] = CircuitBreaker()
    return circuit_breakers[service_name]

def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    max_delay: float = 60.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
    service_name: Optional[str] = None,
    use_circuit_breaker: bool = True
) -> Callable:
    """
    Decorator para retry com backoff exponencial
    
    Args:
        max_retries: Número máximo de tentativas
        initial_delay: Delay inicial em segundos
        backoff_factor: Fator multiplicador do delay
        max_delay: Delay máximo em segundos
        exceptions: Tupla de exceções para retry
        service_name: Nome do serviço (para circuit breaker)
        use_circuit_breaker: Se deve usar circuit breaker
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if use_circuit_breaker and service_name:
                cb = get_circuit_breaker(service_name)
            else:
                cb = None
            
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    # Usar circuit breaker se disponível
                    if cb:
                        return cb.call(func, *args, **kwargs)
                    else:
                        return func(*args, **kwargs)
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries - 1:
                        logger.error(
                            f"Failed after {max_retries} attempts. "
                            f"Function: {func.__name__}, Error: {e}"
                        )
                        raise
                    
                    # Log retry attempt
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}. "
                        f"Error: {e}. Retrying in {delay:.1f}s..."
                    )
                    
                    # Sleep with backoff
                    time.sleep(delay)
                    delay = min(delay * backoff_factor, max_delay)
            
            # Should not reach here
            raise last_exception
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if use_circuit_breaker and service_name:
                cb = get_circuit_breaker(service_name)
            else:
                cb = None
            
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    # Usar circuit breaker se disponível
                    if cb:
                        return await cb.async_call(func, *args, **kwargs)
                    else:
                        return await func(*args, **kwargs)
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries - 1:
                        logger.error(
                            f"Failed after {max_retries} attempts. "
                            f"Function: {func.__name__}, Error: {e}"
                        )
                        raise
                    
                    # Log retry attempt
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}. "
                        f"Error: {e}. Retrying in {delay:.1f}s..."
                    )
                    
                    # Async sleep with backoff
                    await asyncio.sleep(delay)
                    delay = min(delay * backoff_factor, max_delay)
            
            # Should not reach here
            raise last_exception
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Decorators específicos para cada serviço
def retry_openai(func: Callable) -> Callable:
    """Retry decorator específico para OpenAI"""
    return retry_with_backoff(
        max_retries=3,
        initial_delay=2.0,
        backoff_factor=2.0,
        exceptions=(Exception,),  # OpenAI specific exceptions
        service_name="openai"
    )(func)

def retry_google_ai(func: Callable) -> Callable:
    """Retry decorator específico para Google AI"""
    return retry_with_backoff(
        max_retries=3,
        initial_delay=1.0,
        backoff_factor=2.0,
        exceptions=(Exception,),
        service_name="google_ai"
    )(func)

def retry_strapi(func: Callable) -> Callable:
    """Retry decorator específico para Strapi"""
    return retry_with_backoff(
        max_retries=5,
        initial_delay=1.0,
        backoff_factor=1.5,
        exceptions=(Exception,),
        service_name="strapi"
    )(func)

# Queue persistente para reprocessamento
class PersistentJobQueue:
    """Fila persistente para jobs falhados"""
    
    def __init__(self, db_path: str = "job_queue.json"):
        self.db_path = db_path
        self.jobs = self._load_jobs()
    
    def _load_jobs(self) -> list:
        """Carrega jobs do arquivo"""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def _save_jobs(self):
        """Salva jobs no arquivo"""
        with open(self.db_path, 'w') as f:
            json.dump(self.jobs, f, indent=2, default=str)
    
    def add_job(self, job_type: str, data: dict, priority: int = 0):
        """Adiciona job à fila"""
        job = {
            "id": f"{job_type}_{int(time.time() * 1000)}",
            "type": job_type,
            "data": data,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "attempts": 0,
            "status": "pending",
            "last_error": None
        }
        
        self.jobs.append(job)
        self._save_jobs()
        logger.info(f"Job {job['id']} added to queue")
        
        return job["id"]
    
    def get_next_job(self, job_type: Optional[str] = None) -> Optional[dict]:
        """Obtém próximo job da fila"""
        pending_jobs = [
            j for j in self.jobs 
            if j["status"] == "pending" and (job_type is None or j["type"] == job_type)
        ]
        
        if not pending_jobs:
            return None
        
        # Ordenar por prioridade e data
        pending_jobs.sort(key=lambda x: (-x["priority"], x["created_at"]))
        
        job = pending_jobs[0]
        job["status"] = "processing"
        job["attempts"] += 1
        self._save_jobs()
        
        return job
    
    def complete_job(self, job_id: str):
        """Marca job como completo"""
        for job in self.jobs:
            if job["id"] == job_id:
                job["status"] = "completed"
                job["completed_at"] = datetime.now().isoformat()
                self._save_jobs()
                logger.info(f"Job {job_id} completed")
                break
    
    def fail_job(self, job_id: str, error: str, retry: bool = True):
        """Marca job como falho"""
        for job in self.jobs:
            if job["id"] == job_id:
                job["last_error"] = error
                
                if retry and job["attempts"] < 3:
                    job["status"] = "pending"
                    logger.warning(f"Job {job_id} failed, will retry")
                else:
                    job["status"] = "failed"
                    job["failed_at"] = datetime.now().isoformat()
                    logger.error(f"Job {job_id} permanently failed")
                
                self._save_jobs()
                break
    
    def get_stats(self) -> dict:
        """Obtém estatísticas da fila"""
        stats = {
            "total": len(self.jobs),
            "pending": len([j for j in self.jobs if j["status"] == "pending"]),
            "processing": len([j for j in self.jobs if j["status"] == "processing"]),
            "completed": len([j for j in self.jobs if j["status"] == "completed"]),
            "failed": len([j for j in self.jobs if j["status"] == "failed"])
        }
        
        return stats
    
    def cleanup_old_jobs(self, days: int = 7):
        """Remove jobs antigos"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        self.jobs = [
            j for j in self.jobs
            if (
                j["status"] in ["pending", "processing"] or
                datetime.fromisoformat(j.get("created_at", datetime.now().isoformat())) > cutoff_date
            )
        ]
        
        self._save_jobs()

# Exemplo de uso
if __name__ == "__main__":
    # Teste do retry decorator
    @retry_with_backoff(max_retries=3, initial_delay=1.0)
    def flaky_function():
        """Função que falha aleatoriamente"""
        import random
        if random.random() < 0.7:
            raise Exception("Random failure")
        return "Success!"
    
    # Teste do circuit breaker
    @retry_with_backoff(service_name="test_service", use_circuit_breaker=True)
    def protected_function():
        """Função protegida por circuit breaker"""
        raise Exception("Service failure")
    
    # Teste da fila persistente
    queue = PersistentJobQueue()
    
    # Adicionar job
    job_id = queue.add_job(
        job_type="process_article",
        data={"url": "https://example.com/article"},
        priority=1
    )
    
    # Processar job
    job = queue.get_next_job()
    if job:
        try:
            # Processar...
            queue.complete_job(job["id"])
        except Exception as e:
            queue.fail_job(job["id"], str(e))
    
    # Stats
    print(queue.get_stats())