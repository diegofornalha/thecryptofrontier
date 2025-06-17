"""
Sistema de Logging Estruturado para Blog Crew
"""
import logging
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import traceback
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pythonjsonlogger import jsonlogger
import os

class ContextFilter(logging.Filter):
    """Filtro para adicionar contexto aos logs"""
    
    def __init__(self):
        super().__init__()
        self.context = {}
    
    def filter(self, record):
        # Adicionar contexto ao registro
        for key, value in self.context.items():
            setattr(record, key, value)
        
        # Adicionar informações extras
        record.hostname = os.environ.get('HOSTNAME', 'unknown')
        record.environment = os.environ.get('ENVIRONMENT', 'development')
        
        return True
    
    def set_context(self, **kwargs):
        """Define contexto para logs subsequentes"""
        self.context.update(kwargs)
    
    def clear_context(self):
        """Limpa contexto"""
        self.context.clear()

class StructuredLogger:
    """Logger estruturado com suporte a JSON"""
    
    def __init__(self, name: str, log_dir: str = "logs"):
        self.name = name
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Prevenir duplicação de handlers
        if not self.logger.handlers:
            self._setup_handlers()
        
        # Adicionar filtro de contexto
        self.context_filter = ContextFilter()
        self.logger.addFilter(self.context_filter)
    
    def _setup_handlers(self):
        """Configura handlers de logging"""
        
        # Formato JSON para logs estruturados
        json_formatter = jsonlogger.JsonFormatter(
            fmt='%(timestamp)s %(level)s %(name)s %(message)s',
            rename_fields={'levelname': 'level', 'name': 'logger'},
            datefmt='%Y-%m-%dT%H:%M:%S'
        )
        
        # Formato legível para console
        console_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Handler para console (desenvolvimento)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        
        # Handler para arquivo JSON (todos os logs)
        json_file = self.log_dir / f"{self.name}.json"
        json_handler = RotatingFileHandler(
            json_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        json_handler.setLevel(logging.DEBUG)
        json_handler.setFormatter(json_formatter)
        
        # Handler para arquivo de erros
        error_file = self.log_dir / f"{self.name}_errors.log"
        error_handler = RotatingFileHandler(
            error_file,
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=3
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(console_formatter)
        
        # Handler diário para análise temporal
        daily_file = self.log_dir / f"{self.name}_daily.log"
        daily_handler = TimedRotatingFileHandler(
            daily_file,
            when='midnight',
            interval=1,
            backupCount=7
        )
        daily_handler.setLevel(logging.INFO)
        daily_handler.setFormatter(json_formatter)
        
        # Adicionar handlers
        self.logger.addHandler(console_handler)
        self.logger.addHandler(json_handler)
        self.logger.addHandler(error_handler)
        self.logger.addHandler(daily_handler)
    
    def set_context(self, **kwargs):
        """Define contexto para logs subsequentes"""
        self.context_filter.set_context(**kwargs)
    
    def clear_context(self):
        """Limpa contexto"""
        self.context_filter.clear_context()
    
    def debug(self, message: str, **kwargs):
        """Log de debug com dados estruturados"""
        self.logger.debug(message, extra=self._prepare_extra(kwargs))
    
    def info(self, message: str, **kwargs):
        """Log de info com dados estruturados"""
        self.logger.info(message, extra=self._prepare_extra(kwargs))
    
    def warning(self, message: str, **kwargs):
        """Log de warning com dados estruturados"""
        self.logger.warning(message, extra=self._prepare_extra(kwargs))
    
    def error(self, message: str, exception: Optional[Exception] = None, **kwargs):
        """Log de erro com dados estruturados e stack trace"""
        extra = self._prepare_extra(kwargs)
        
        if exception:
            extra['exception_type'] = type(exception).__name__
            extra['exception_message'] = str(exception)
            extra['stack_trace'] = traceback.format_exc()
        
        self.logger.error(message, extra=extra)
    
    def critical(self, message: str, **kwargs):
        """Log crítico com dados estruturados"""
        self.logger.critical(message, extra=self._prepare_extra(kwargs))
    
    def _prepare_extra(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepara dados extras para logging"""
        extra = {
            'timestamp': datetime.utcnow().isoformat(),
            'data': data
        }
        
        # Adicionar informações de contexto
        if hasattr(self.context_filter, 'context'):
            extra.update(self.context_filter.context)
        
        return extra
    
    def log_performance(self, operation: str, duration: float, **kwargs):
        """Log específico para métricas de performance"""
        self.info(
            f"Performance metric: {operation}",
            operation=operation,
            duration_seconds=duration,
            performance=True,
            **kwargs
        )
    
    def log_api_call(self, service: str, endpoint: str, status_code: int, 
                     response_time: float, **kwargs):
        """Log específico para chamadas de API"""
        self.info(
            f"API call to {service}",
            service=service,
            endpoint=endpoint,
            status_code=status_code,
            response_time=response_time,
            api_call=True,
            **kwargs
        )
    
    def log_article_processing(self, article_id: str, stage: str, 
                              success: bool, **kwargs):
        """Log específico para processamento de artigos"""
        level = logging.INFO if success else logging.ERROR
        
        self.logger.log(
            level,
            f"Article processing: {stage}",
            extra=self._prepare_extra({
                'article_id': article_id,
                'stage': stage,
                'success': success,
                'article_processing': True,
                **kwargs
            })
        )

class LoggerFactory:
    """Factory para criar loggers consistentes"""
    
    _loggers: Dict[str, StructuredLogger] = {}
    _log_dir: str = "logs"
    
    @classmethod
    def set_log_dir(cls, log_dir: str):
        """Define diretório de logs"""
        cls._log_dir = log_dir
    
    @classmethod
    def get_logger(cls, name: str) -> StructuredLogger:
        """Obtém ou cria logger"""
        if name not in cls._loggers:
            cls._loggers[name] = StructuredLogger(name, cls._log_dir)
        
        return cls._loggers[name]
    
    @classmethod
    def configure_all(cls, level: str = "INFO", log_dir: str = "logs"):
        """Configura todos os loggers"""
        cls._log_dir = log_dir
        
        # Configurar nível de log root
        numeric_level = getattr(logging, level.upper(), logging.INFO)
        logging.root.setLevel(numeric_level)
        
        # Desabilitar logs verbosos de bibliotecas
        logging.getLogger('urllib3').setLevel(logging.WARNING)
        logging.getLogger('requests').setLevel(logging.WARNING)
        logging.getLogger('openai').setLevel(logging.WARNING)

# Decoradores para logging automático
def log_execution(logger: StructuredLogger):
    """Decorator para logar execução de funções"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            function_name = func.__name__
            
            logger.debug(f"Starting {function_name}", function=function_name)
            
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                
                logger.info(
                    f"Completed {function_name}",
                    function=function_name,
                    duration_seconds=duration,
                    success=True
                )
                
                return result
                
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                
                logger.error(
                    f"Failed {function_name}",
                    exception=e,
                    function=function_name,
                    duration_seconds=duration,
                    success=False
                )
                raise
        
        return wrapper
    return decorator

def log_async_execution(logger: StructuredLogger):
    """Decorator para logar execução de funções assíncronas"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start_time = datetime.now()
            function_name = func.__name__
            
            logger.debug(f"Starting async {function_name}", function=function_name)
            
            try:
                result = await func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                
                logger.info(
                    f"Completed async {function_name}",
                    function=function_name,
                    duration_seconds=duration,
                    success=True
                )
                
                return result
                
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                
                logger.error(
                    f"Failed async {function_name}",
                    exception=e,
                    function=function_name,
                    duration_seconds=duration,
                    success=False
                )
                raise
        
        return wrapper
    return decorator

# Exemplo de uso
if __name__ == "__main__":
    # Configurar logging
    LoggerFactory.configure_all(level="DEBUG")
    
    # Criar logger
    logger = LoggerFactory.get_logger("blog_crew.example")
    
    # Definir contexto
    logger.set_context(
        user_id="123",
        session_id="abc-def-ghi",
        environment="development"
    )
    
    # Logs básicos
    logger.info("Sistema iniciado", version="1.0.0")
    
    # Log de performance
    logger.log_performance("article_translation", 2.5, article_id="12345")
    
    # Log de API
    logger.log_api_call(
        service="openai",
        endpoint="/v1/chat/completions",
        status_code=200,
        response_time=1.2,
        tokens_used=150
    )
    
    # Log de processamento
    logger.log_article_processing(
        article_id="12345",
        stage="translation",
        success=True,
        language="pt-BR"
    )
    
    # Log de erro
    try:
        raise ValueError("Exemplo de erro")
    except Exception as e:
        logger.error("Erro no processamento", exception=e, article_id="12345")
    
    # Função com decorator
    @log_execution(logger)
    def process_something(value: int) -> int:
        return value * 2
    
    result = process_something(21)
    print(f"Resultado: {result}")