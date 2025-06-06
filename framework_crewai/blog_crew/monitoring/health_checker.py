"""
Sistema de Health Checks para APIs externas
"""
import asyncio
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import requests
import openai
import google.generativeai as genai
from dataclasses import dataclass, field
import json
import os
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ServiceStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"

@dataclass
class HealthCheckResult:
    service: str
    status: ServiceStatus
    response_time: float
    error: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    details: Dict = field(default_factory=dict)

@dataclass
class APIQuota:
    service: str
    used: int
    limit: int
    reset_time: Optional[datetime] = None
    percentage_used: float = 0.0
    
    def __post_init__(self):
        self.percentage_used = (self.used / self.limit * 100) if self.limit > 0 else 0

class HealthChecker:
    def __init__(self, alert_threshold: float = 80.0):
        self.alert_threshold = alert_threshold
        self.health_history: List[HealthCheckResult] = []
        self.quota_history: List[APIQuota] = []
        self.alerts: List[Dict] = []
        
    async def check_openai_health(self) -> HealthCheckResult:
        """Verifica saúde da API OpenAI"""
        start_time = time.time()
        
        try:
            client = openai.OpenAI()
            # Pequena requisição de teste
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": "test"}],
                    max_tokens=1
                )
            )
            
            response_time = time.time() - start_time
            
            return HealthCheckResult(
                service="OpenAI",
                status=ServiceStatus.HEALTHY,
                response_time=response_time,
                details={"model": "gpt-3.5-turbo"}
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"OpenAI health check failed: {e}")
            
            return HealthCheckResult(
                service="OpenAI",
                status=ServiceStatus.UNHEALTHY,
                response_time=response_time,
                error=str(e)
            )
    
    async def check_google_ai_health(self) -> HealthCheckResult:
        """Verifica saúde da API Google AI"""
        start_time = time.time()
        
        try:
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            model = genai.GenerativeModel('gemini-pro')
            
            # Pequena requisição de teste
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: model.generate_content("test")
            )
            
            response_time = time.time() - start_time
            
            return HealthCheckResult(
                service="Google AI",
                status=ServiceStatus.HEALTHY,
                response_time=response_time,
                details={"model": "gemini-pro"}
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Google AI health check failed: {e}")
            
            return HealthCheckResult(
                service="Google AI",
                status=ServiceStatus.UNHEALTHY,
                response_time=response_time,
                error=str(e)
            )
    
    async def check_sanity_health(self) -> HealthCheckResult:
        """Verifica saúde do Sanity CMS"""
        start_time = time.time()
        
        try:
            project_id = os.getenv("SANITY_PROJECT_ID")
            dataset = os.getenv("SANITY_DATASET", "production")
            
            response = requests.get(
                f"https://{project_id}.api.sanity.io/v2021-10-21/data/query/{dataset}",
                params={"query": "*[_type == 'post'][0]"},
                headers={
                    "Authorization": f"Bearer {os.getenv('SANITY_API_TOKEN')}"
                },
                timeout=5
            )
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                status = ServiceStatus.HEALTHY
                error = None
            else:
                status = ServiceStatus.DEGRADED
                error = f"HTTP {response.status_code}"
            
            return HealthCheckResult(
                service="Sanity CMS",
                status=status,
                response_time=response_time,
                error=error,
                details={"status_code": response.status_code}
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Sanity health check failed: {e}")
            
            return HealthCheckResult(
                service="Sanity CMS",
                status=ServiceStatus.UNHEALTHY,
                response_time=response_time,
                error=str(e)
            )
    
    async def check_redis_health(self, host: str = "localhost", port: int = 6379) -> HealthCheckResult:
        """Verifica saúde do Redis"""
        start_time = time.time()
        
        try:
            import redis
            r = redis.Redis(host=host, port=port, socket_connect_timeout=2)
            r.ping()
            
            response_time = time.time() - start_time
            
            # Obter informações do Redis
            info = r.info()
            memory_used = info.get('used_memory_human', 'unknown')
            
            return HealthCheckResult(
                service="Redis",
                status=ServiceStatus.HEALTHY,
                response_time=response_time,
                details={"memory_used": memory_used}
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(f"Redis health check failed: {e}")
            
            return HealthCheckResult(
                service="Redis",
                status=ServiceStatus.UNHEALTHY,
                response_time=response_time,
                error=str(e)
            )
    
    async def check_all_services(self) -> List[HealthCheckResult]:
        """Executa health check em todos os serviços"""
        tasks = [
            self.check_openai_health(),
            self.check_google_ai_health(),
            self.check_sanity_health(),
            self.check_redis_health()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Processar resultados e exceções
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                service_names = ["OpenAI", "Google AI", "Sanity CMS", "Redis"]
                processed_results.append(
                    HealthCheckResult(
                        service=service_names[i],
                        status=ServiceStatus.UNKNOWN,
                        response_time=0,
                        error=str(result)
                    )
                )
            else:
                processed_results.append(result)
        
        # Armazenar no histórico
        self.health_history.extend(processed_results)
        
        # Verificar alertas
        self._check_alerts(processed_results)
        
        return processed_results
    
    def _check_alerts(self, results: List[HealthCheckResult]):
        """Verifica se deve gerar alertas"""
        for result in results:
            if result.status in [ServiceStatus.UNHEALTHY, ServiceStatus.DEGRADED]:
                alert = {
                    "timestamp": datetime.now(),
                    "service": result.service,
                    "status": result.status.value,
                    "error": result.error,
                    "type": "service_health"
                }
                self.alerts.append(alert)
                logger.warning(f"Alert: {result.service} is {result.status.value}")
    
    async def check_api_quotas(self) -> List[APIQuota]:
        """Verifica quotas das APIs"""
        quotas = []
        
        # OpenAI quota (simulada - OpenAI não fornece quota via API)
        # Em produção, você rastrearia uso real
        openai_quota = APIQuota(
            service="OpenAI",
            used=self._get_openai_usage(),
            limit=1000000,  # Exemplo: 1M tokens
            reset_time=datetime.now() + timedelta(days=1)
        )
        quotas.append(openai_quota)
        
        # Google AI quota
        google_quota = APIQuota(
            service="Google AI", 
            used=self._get_google_usage(),
            limit=60,  # 60 requests per minute for free tier
            reset_time=datetime.now() + timedelta(minutes=1)
        )
        quotas.append(google_quota)
        
        # Verificar alertas de quota
        for quota in quotas:
            if quota.percentage_used >= self.alert_threshold:
                alert = {
                    "timestamp": datetime.now(),
                    "service": quota.service,
                    "percentage_used": quota.percentage_used,
                    "type": "quota_warning"
                }
                self.alerts.append(alert)
                logger.warning(
                    f"Quota Alert: {quota.service} at {quota.percentage_used:.1f}% "
                    f"({quota.used}/{quota.limit})"
                )
        
        self.quota_history.extend(quotas)
        return quotas
    
    def _get_openai_usage(self) -> int:
        """Obtém uso atual da OpenAI (implementar rastreamento real)"""
        # Em produção, rastrear tokens usados
        return 450000  # Exemplo
    
    def _get_google_usage(self) -> int:
        """Obtém uso atual do Google AI (implementar rastreamento real)"""
        # Em produção, rastrear requisições
        return 45  # Exemplo
    
    def get_health_summary(self) -> Dict:
        """Retorna resumo do estado de saúde"""
        recent_checks = self.health_history[-20:] if self.health_history else []
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "services": {},
            "overall_status": ServiceStatus.HEALTHY.value,
            "alerts": self.alerts[-10:]  # Últimos 10 alertas
        }
        
        # Agrupar por serviço
        for check in recent_checks:
            if check.service not in summary["services"]:
                summary["services"][check.service] = {
                    "status": check.status.value,
                    "last_check": check.timestamp.isoformat(),
                    "avg_response_time": check.response_time
                }
            
            # Determinar status geral
            if check.status == ServiceStatus.UNHEALTHY:
                summary["overall_status"] = ServiceStatus.UNHEALTHY.value
            elif check.status == ServiceStatus.DEGRADED and summary["overall_status"] != ServiceStatus.UNHEALTHY.value:
                summary["overall_status"] = ServiceStatus.DEGRADED.value
        
        return summary
    
    def save_metrics(self, filepath: str = "health_metrics.json"):
        """Salva métricas em arquivo"""
        metrics = {
            "health_checks": [
                {
                    "service": h.service,
                    "status": h.status.value,
                    "response_time": h.response_time,
                    "timestamp": h.timestamp.isoformat(),
                    "error": h.error
                }
                for h in self.health_history[-100:]  # Últimos 100 checks
            ],
            "quotas": [
                {
                    "service": q.service,
                    "used": q.used,
                    "limit": q.limit,
                    "percentage_used": q.percentage_used,
                    "reset_time": q.reset_time.isoformat() if q.reset_time else None
                }
                for q in self.quota_history[-50:]  # Últimas 50 verificações
            ],
            "alerts": self.alerts[-50:]  # Últimos 50 alertas
        }
        
        with open(filepath, 'w') as f:
            json.dump(metrics, f, indent=2)
    
    async def start_continuous_monitoring(self, interval_seconds: int = 300):
        """Inicia monitoramento contínuo"""
        logger.info(f"Starting continuous health monitoring (interval: {interval_seconds}s)")
        
        while True:
            try:
                # Health checks
                await self.check_all_services()
                
                # Quota checks
                await self.check_api_quotas()
                
                # Salvar métricas
                self.save_metrics()
                
                # Log resumo
                summary = self.get_health_summary()
                logger.info(f"Health check completed. Overall status: {summary['overall_status']}")
                
            except Exception as e:
                logger.error(f"Error in continuous monitoring: {e}")
            
            await asyncio.sleep(interval_seconds)


# CLI para testes
if __name__ == "__main__":
    import asyncio
    
    async def main():
        checker = HealthChecker()
        
        print("🏥 Executando Health Checks...")
        results = await checker.check_all_services()
        
        print("\n📊 Resultados:")
        for result in results:
            status_emoji = "✅" if result.status == ServiceStatus.HEALTHY else "❌"
            print(f"{status_emoji} {result.service}: {result.status.value} ({result.response_time:.2f}s)")
            if result.error:
                print(f"   Erro: {result.error}")
        
        print("\n📈 Verificando Quotas...")
        quotas = await checker.check_api_quotas()
        
        for quota in quotas:
            bar_length = 20
            filled = int(bar_length * quota.percentage_used / 100)
            bar = "█" * filled + "░" * (bar_length - filled)
            print(f"{quota.service}: [{bar}] {quota.percentage_used:.1f}% ({quota.used}/{quota.limit})")
        
        print("\n📋 Resumo Geral:")
        summary = checker.get_health_summary()
        print(f"Status Geral: {summary['overall_status']}")
        print(f"Alertas Ativos: {len(summary['alerts'])}")
    
    asyncio.run(main())