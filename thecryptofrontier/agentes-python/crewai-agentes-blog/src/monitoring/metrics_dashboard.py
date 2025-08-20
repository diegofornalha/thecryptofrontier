"""
Dashboard de Métricas e Estatísticas
"""
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path
import sqlite3
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class MetricsSummary:
    total_articles_processed: int = 0
    successful_articles: int = 0
    failed_articles: int = 0
    total_images_generated: int = 0
    average_processing_time: float = 0.0
    api_calls: Dict[str, int] = None
    errors_by_type: Dict[str, int] = None
    processing_times_by_stage: Dict[str, float] = None
    
    def __post_init__(self):
        if self.api_calls is None:
            self.api_calls = {}
        if self.errors_by_type is None:
            self.errors_by_type = {}
        if self.processing_times_by_stage is None:
            self.processing_times_by_stage = {}

class MetricsCollector:
    """Coletor de métricas do sistema"""
    
    def __init__(self, db_path: str = "metrics.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Inicializa banco de dados de métricas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabela de processamento de artigos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS article_processing (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id TEXT,
                stage TEXT,
                success BOOLEAN,
                processing_time REAL,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de chamadas de API
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS api_calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service TEXT,
                endpoint TEXT,
                status_code INTEGER,
                response_time REAL,
                error TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de uso de recursos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resource_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpu_percent REAL,
                memory_percent REAL,
                disk_usage_percent REAL,
                active_threads INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def record_article_processing(
        self,
        article_id: str,
        stage: str,
        success: bool,
        processing_time: float,
        error_message: Optional[str] = None
    ):
        """Registra processamento de artigo"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO article_processing 
            (article_id, stage, success, processing_time, error_message)
            VALUES (?, ?, ?, ?, ?)
        """, (article_id, stage, success, processing_time, error_message))
        
        conn.commit()
        conn.close()
    
    def record_api_call(
        self,
        service: str,
        endpoint: str,
        status_code: int,
        response_time: float,
        error: Optional[str] = None
    ):
        """Registra chamada de API"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO api_calls 
            (service, endpoint, status_code, response_time, error)
            VALUES (?, ?, ?, ?, ?)
        """, (service, endpoint, status_code, response_time, error))
        
        conn.commit()
        conn.close()
    
    def record_resource_usage(self):
        """Registra uso de recursos do sistema"""
        import psutil
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        disk_usage_percent = psutil.disk_usage('/').percent
        active_threads = len(psutil.Process().threads())
        
        cursor.execute("""
            INSERT INTO resource_usage 
            (cpu_percent, memory_percent, disk_usage_percent, active_threads)
            VALUES (?, ?, ?, ?)
        """, (cpu_percent, memory_percent, disk_usage_percent, active_threads))
        
        conn.commit()
        conn.close()
    
    def get_metrics_summary(self, hours: int = 24) -> MetricsSummary:
        """Obtém resumo das métricas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Total de artigos processados
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT article_id) as total,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
                AVG(processing_time) as avg_time
            FROM article_processing
            WHERE timestamp > ?
        """, (cutoff_time,))
        
        result = cursor.fetchone()
        summary = MetricsSummary(
            total_articles_processed=result[0] or 0,
            successful_articles=result[1] or 0,
            failed_articles=result[2] or 0,
            average_processing_time=result[3] or 0.0
        )
        
        # Tempos por estágio
        cursor.execute("""
            SELECT stage, AVG(processing_time) as avg_time
            FROM article_processing
            WHERE timestamp > ? AND success = 1
            GROUP BY stage
        """, (cutoff_time,))
        
        for row in cursor.fetchall():
            summary.processing_times_by_stage[row[0]] = row[1]
        
        # Chamadas de API
        cursor.execute("""
            SELECT service, COUNT(*) as count
            FROM api_calls
            WHERE timestamp > ?
            GROUP BY service
        """, (cutoff_time,))
        
        for row in cursor.fetchall():
            summary.api_calls[row[0]] = row[1]
        
        # Erros por tipo
        cursor.execute("""
            SELECT error_message, COUNT(*) as count
            FROM article_processing
            WHERE timestamp > ? AND success = 0 AND error_message IS NOT NULL
            GROUP BY error_message
            ORDER BY count DESC
            LIMIT 10
        """, (cutoff_time,))
        
        for row in cursor.fetchall():
            error_type = row[0][:50]  # Truncar mensagens longas
            summary.errors_by_type[error_type] = row[1]
        
        conn.close()
        return summary

class MetricsDashboard:
    """Dashboard HTML para visualização de métricas"""
    
    def __init__(self, collector: MetricsCollector):
        self.collector = collector
    
    def generate_html_report(self, output_path: str = "metrics_dashboard.html"):
        """Gera relatório HTML com métricas"""
        summary = self.collector.get_metrics_summary(hours=24)
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Blog Crew - Dashboard de Métricas</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        h1 {{
            color: #333;
            margin-bottom: 30px;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .metric-card {{
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .metric-value {{
            font-size: 36px;
            font-weight: bold;
            color: #2196F3;
            margin: 10px 0;
        }}
        .metric-label {{
            color: #666;
            font-size: 14px;
        }}
        .success-rate {{
            color: #4CAF50;
        }}
        .error-rate {{
            color: #f44336;
        }}
        .chart-container {{
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{
            background-color: #f8f9fa;
            font-weight: 600;
        }}
        .timestamp {{
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }}
        .progress-bar {{
            background-color: #e0e0e0;
            border-radius: 4px;
            height: 20px;
            overflow: hidden;
            margin: 5px 0;
        }}
        .progress-fill {{
            background-color: #4CAF50;
            height: 100%;
            transition: width 0.3s ease;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Blog Crew - Dashboard de Métricas</h1>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total de Artigos</div>
                <div class="metric-value">{summary.total_articles_processed}</div>
                <div class="metric-label">Últimas 24 horas</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Taxa de Sucesso</div>
                <div class="metric-value success-rate">
                    {self._calculate_success_rate(summary):.1f}%
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {self._calculate_success_rate(summary)}%"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Artigos com Erro</div>
                <div class="metric-value error-rate">{summary.failed_articles}</div>
                <div class="metric-label">{self._calculate_error_rate(summary):.1f}% do total</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Tempo Médio</div>
                <div class="metric-value">{summary.average_processing_time:.1f}s</div>
                <div class="metric-label">Por artigo</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h2>⏱️ Tempo de Processamento por Etapa</h2>
            <table>
                <thead>
                    <tr>
                        <th>Etapa</th>
                        <th>Tempo Médio (s)</th>
                        <th>Visualização</th>
                    </tr>
                </thead>
                <tbody>
                    {self._generate_stage_times_rows(summary)}
                </tbody>
            </table>
        </div>
        
        <div class="chart-container">
            <h2>🔌 Chamadas de API</h2>
            <table>
                <thead>
                    <tr>
                        <th>Serviço</th>
                        <th>Total de Chamadas</th>
                        <th>Média por Artigo</th>
                    </tr>
                </thead>
                <tbody>
                    {self._generate_api_calls_rows(summary)}
                </tbody>
            </table>
        </div>
        
        <div class="chart-container">
            <h2>❌ Principais Erros</h2>
            <table>
                <thead>
                    <tr>
                        <th>Tipo de Erro</th>
                        <th>Ocorrências</th>
                    </tr>
                </thead>
                <tbody>
                    {self._generate_error_rows(summary)}
                </tbody>
            </table>
        </div>
        
        <div class="timestamp">
            Atualizado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
        </div>
    </div>
</body>
</html>
        """
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        logger.info(f"Dashboard HTML gerado em: {output_path}")
    
    def _calculate_success_rate(self, summary: MetricsSummary) -> float:
        """Calcula taxa de sucesso"""
        total = summary.successful_articles + summary.failed_articles
        if total == 0:
            return 0.0
        return (summary.successful_articles / total) * 100
    
    def _calculate_error_rate(self, summary: MetricsSummary) -> float:
        """Calcula taxa de erro"""
        total = summary.successful_articles + summary.failed_articles
        if total == 0:
            return 0.0
        return (summary.failed_articles / total) * 100
    
    def _generate_stage_times_rows(self, summary: MetricsSummary) -> str:
        """Gera linhas da tabela de tempos por etapa"""
        rows = []
        max_time = max(summary.processing_times_by_stage.values()) if summary.processing_times_by_stage else 1
        
        for stage, time in sorted(summary.processing_times_by_stage.items()):
            bar_width = int((time / max_time) * 100)
            rows.append(f"""
                <tr>
                    <td>{stage}</td>
                    <td>{time:.2f}</td>
                    <td>
                        <div class="progress-bar" style="width: 200px;">
                            <div class="progress-fill" style="width: {bar_width}%"></div>
                        </div>
                    </td>
                </tr>
            """)
        
        return ''.join(rows) if rows else '<tr><td colspan="3">Sem dados</td></tr>'
    
    def _generate_api_calls_rows(self, summary: MetricsSummary) -> str:
        """Gera linhas da tabela de chamadas de API"""
        rows = []
        total_articles = summary.total_articles_processed or 1
        
        for service, count in sorted(summary.api_calls.items()):
            avg_per_article = count / total_articles
            rows.append(f"""
                <tr>
                    <td>{service}</td>
                    <td>{count}</td>
                    <td>{avg_per_article:.1f}</td>
                </tr>
            """)
        
        return ''.join(rows) if rows else '<tr><td colspan="3">Sem dados</td></tr>'
    
    def _generate_error_rows(self, summary: MetricsSummary) -> str:
        """Gera linhas da tabela de erros"""
        rows = []
        
        for error, count in sorted(summary.errors_by_type.items(), key=lambda x: x[1], reverse=True):
            rows.append(f"""
                <tr>
                    <td>{error}</td>
                    <td>{count}</td>
                </tr>
            """)
        
        return ''.join(rows) if rows else '<tr><td colspan="2">Sem erros</td></tr>'
    
    def generate_json_report(self) -> Dict:
        """Gera relatório JSON com métricas"""
        summary = self.collector.get_metrics_summary(hours=24)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "metrics": {
                "total_articles": summary.total_articles_processed,
                "successful": summary.successful_articles,
                "failed": summary.failed_articles,
                "success_rate": self._calculate_success_rate(summary),
                "average_processing_time": summary.average_processing_time
            },
            "processing_times": summary.processing_times_by_stage,
            "api_calls": summary.api_calls,
            "errors": summary.errors_by_type
        }

# CLI para gerar dashboard
if __name__ == "__main__":
    collector = MetricsCollector()
    dashboard = MetricsDashboard(collector)
    
    # Gerar dashboard HTML
    dashboard.generate_html_report()
    print("✅ Dashboard HTML gerado: metrics_dashboard.html")
    
    # Gerar relatório JSON
    json_report = dashboard.generate_json_report()
    with open("metrics_report.json", "w") as f:
        json.dump(json_report, f, indent=2)
    print("✅ Relatório JSON gerado: metrics_report.json")