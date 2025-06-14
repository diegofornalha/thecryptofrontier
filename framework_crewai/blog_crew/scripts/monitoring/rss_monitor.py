#!/usr/bin/env python3
"""
Monitor RSS para The Crypto Basic
Verifica novos artigos a cada 10 minutos e processa automaticamente
"""

import feedparser
import json
import time
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
import subprocess
import sys
import shutil
from typing import Dict, Set, List
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rss_monitor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class RSSMonitor:
    def __init__(self):
        self.feed_url = "https://thecryptobasic.com/feed/"
        self.processed_file = Path("processed_articles.json")
        self.processed_guids: Set[str] = set()
        self.polling_interval = 600  # 10 minutos em segundos
        self.brazil_tz_offset = timedelta(hours=-3)  # UTC-3
        
        # Cache em memória para títulos recentes (evita consultas repetidas)
        self.recent_titles_cache: Set[str] = set()
        self.cache_last_update: datetime = None
        self.cache_ttl = 300  # Cache válido por 5 minutos
        
        # Controle de limpeza de logs
        self.log_rotation_interval = 86400  # 24 horas
        self.last_log_rotation = datetime.now()
        
        # Diretórios de arquivos temporários
        self.temp_dirs = [
            Path("posts_para_traduzir"),
            Path("posts_traduzidos"), 
            Path("posts_formatados"),
            Path("posts_publicados")
        ]
        
        # Configuração de limpeza de arquivos JSON
        self.cleanup_after_days = 7  # Manter arquivos por 7 dias
        self.last_cleanup = datetime.now()
        self.cleanup_interval = 86400  # Limpeza diária
        
        # Carregar artigos já processados
        self.load_processed_articles()
    
    def load_processed_articles(self):
        """Carrega GUIDs de artigos já processados"""
        if self.processed_file.exists():
            try:
                with open(self.processed_file, 'r') as f:
                    data = json.load(f)
                    self.processed_guids = set(data.get('guids', []))
                    logger.info(f"Carregados {len(self.processed_guids)} artigos já processados")
            except Exception as e:
                logger.error(f"Erro ao carregar artigos processados: {e}")
                self.processed_guids = set()
    
    def save_processed_articles(self):
        """Salva GUIDs de artigos processados"""
        try:
            data = {
                'guids': list(self.processed_guids),
                'last_update': datetime.now().isoformat()
            }
            with open(self.processed_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar artigos processados: {e}")
    
    def parse_rss_date(self, date_str: str) -> datetime:
        """Converte data do RSS para datetime com timezone"""
        try:
            # feedparser já converte para struct_time
            return datetime.fromtimestamp(
                time.mktime(date_str),
                tz=timezone.utc
            )
        except Exception as e:
            logger.error(f"Erro ao parsear data: {e}")
            return datetime.now(timezone.utc)
    
    def convert_to_brazil_time(self, utc_time: datetime) -> datetime:
        """Converte UTC para horário de Brasília"""
        return utc_time + self.brazil_tz_offset
    
    def rotate_logs_if_needed(self):
        """Rotaciona logs se necessário (diariamente)"""
        now = datetime.now()
        if (now - self.last_log_rotation).total_seconds() > self.log_rotation_interval:
            try:
                log_file = Path('rss_monitor.log')
                if log_file.exists() and log_file.stat().st_size > 10 * 1024 * 1024:  # > 10MB
                    backup_name = f'rss_monitor_{now.strftime("%Y%m%d_%H%M%S")}.log'
                    log_file.rename(backup_name)
                    logger.info(f"Log rotacionado para: {backup_name}")
                    self.last_log_rotation = now
            except Exception as e:
                logger.error(f"Erro ao rotacionar logs: {e}")
    
    def get_recent_titles_from_strapi(self) -> Set[str]:
        """Obtém títulos recentes do Strapi com cache"""
        now = datetime.now()
        
        # Verificar se o cache ainda é válido
        if (self.cache_last_update and 
            (now - self.cache_last_update).total_seconds() < self.cache_ttl and 
            self.recent_titles_cache):
            logger.debug("Usando cache de títulos recentes")
            return self.recent_titles_cache
        
        # Buscar novos dados
        try:
            from run_pipeline import obter_artigos_publicados
            titles = obter_artigos_publicados(limite=20)  # Buscar últimos 20
            self.recent_titles_cache = titles
            self.cache_last_update = now
            logger.info(f"Cache de títulos atualizado: {len(titles)} títulos")
            return titles
        except Exception as e:
            logger.error(f"Erro ao obter títulos do Strapi: {e}")
            return self.recent_titles_cache  # Retornar cache antigo se houver erro
    
    def cleanup_old_json_files(self):
        """Limpa arquivos JSON antigos dos diretórios temporários"""
        now = datetime.now()
        if (now - self.last_cleanup).total_seconds() < self.cleanup_interval:
            return  # Ainda não é hora de limpar
        
        logger.info("Iniciando limpeza de arquivos JSON antigos...")
        total_removed = 0
        total_size_freed = 0
        
        for dir_path in self.temp_dirs:
            if not dir_path.exists():
                continue
                
            try:
                # Listar todos os arquivos JSON no diretório
                json_files = list(dir_path.glob("*.json"))
                
                for file_path in json_files:
                    # Verificar idade do arquivo
                    file_age = now - datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    if file_age.days > self.cleanup_after_days:
                        file_size = file_path.stat().st_size
                        logger.info(f"Removendo arquivo antigo: {file_path.name} ({file_age.days} dias)")
                        file_path.unlink()
                        total_removed += 1
                        total_size_freed += file_size
                        
            except Exception as e:
                logger.error(f"Erro ao limpar diretório {dir_path}: {e}")
        
        if total_removed > 0:
            size_mb = total_size_freed / (1024 * 1024)
            logger.info(f"Limpeza concluída: {total_removed} arquivos removidos, {size_mb:.2f} MB liberados")
        
        self.last_cleanup = now
    
    def cleanup_immediate_after_success(self):
        """Limpa arquivos JSON imediatamente após publicação bem-sucedida"""
        logger.info("Limpando arquivos temporários após publicação...")
        
        # Obter timestamp dos arquivos recém-processados (últimas 2 horas)
        cutoff_time = datetime.now() - timedelta(hours=2)
        cleaned_count = 0
        
        # Diretórios a limpar (incluindo posts_publicados)
        dirs_to_clean = [
            Path("posts_para_traduzir"),
            Path("posts_traduzidos"),
            Path("posts_formatados"),
            Path("posts_publicados")
        ]
        
        for dir_path in dirs_to_clean:
            if not dir_path.exists():
                continue
                
            try:
                json_files = list(dir_path.glob("*.json"))
                
                for file_path in json_files:
                    # Verificar se o arquivo foi criado recentemente
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    
                    if file_mtime > cutoff_time:
                        logger.debug(f"Removendo arquivo processado: {file_path.name}")
                        file_path.unlink()
                        cleaned_count += 1
                        
            except Exception as e:
                logger.error(f"Erro ao limpar {dir_path}: {e}")
        
        if cleaned_count > 0:
            logger.info(f"Removidos {cleaned_count} arquivos temporários após publicação")
    
    def check_new_articles(self) -> List[Dict]:
        """Verifica se há novos artigos no feed"""
        try:
            logger.info("Verificando novos artigos...")
            feed = feedparser.parse(self.feed_url)
            
            if feed.bozo:
                logger.error(f"Erro ao parsear feed: {feed.bozo_exception}")
                return []
            
            # Obter títulos recentes do Strapi para verificação adicional
            recent_strapi_titles = self.get_recent_titles_from_strapi()
            
            new_articles = []
            
            for entry in feed.entries:
                guid = entry.get('id', entry.get('link', ''))
                title = entry.get('title', '')
                
                # Verificar se já foi processado pelo GUID
                if guid and guid not in self.processed_guids:
                    # Verificação adicional: título já existe no Strapi?
                    if title.lower() in recent_strapi_titles:
                        logger.info(f"Artigo já existe no Strapi (cache): {title}")
                        # Adicionar ao processados para não verificar novamente
                        self.processed_guids.add(guid)
                        continue
                    
                    # Processar data
                    pub_date_utc = self.parse_rss_date(entry.published_parsed)
                    pub_date_br = self.convert_to_brazil_time(pub_date_utc)
                    
                    article_info = {
                        'guid': guid,
                        'title': title,
                        'link': entry.get('link', ''),
                        'published_utc': pub_date_utc.isoformat(),
                        'published_br': pub_date_br.isoformat(),
                        'summary': entry.get('summary', '')[:200] + '...'
                    }
                    
                    new_articles.append(article_info)
                    logger.info(f"Novo artigo encontrado: {article_info['title']}")
                    logger.info(f"  Publicado em: {pub_date_br.strftime('%d/%m/%Y %H:%M:%S')} (Brasília)")
            
            return new_articles
            
        except Exception as e:
            logger.error(f"Erro ao verificar feed: {e}")
            return []
    
    def process_new_articles(self, articles: List[Dict]):
        """Processa novos artigos encontrados"""
        if not articles:
            return
        
        logger.info(f"Processando {len(articles)} novos artigos...")
        
        try:
            # Executar o pipeline completo atualizado
            logger.info("Iniciando pipeline completo (RSS → Tradução → Imagens → Publicação)...")
            result = subprocess.run(
                ["python", "pipeline_completo.py", str(len(articles))],
                capture_output=True,
                text=True,
                check=True,
                timeout=900  # 15 minutos de timeout
            )
            
            logger.info("Pipeline executado com sucesso")
            logger.info(f"Saída: {result.stdout[:500]}...")
            
            # Marcar artigos como processados
            for article in articles:
                self.processed_guids.add(article['guid'])
            
            self.save_processed_articles()
            
            # Limpar arquivos temporários após sucesso
            self.cleanup_immediate_after_success()
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro ao executar pipeline: {e}")
            logger.error(f"Saída de erro: {e.stderr}")
        except Exception as e:
            logger.error(f"Erro inesperado ao processar artigos: {e}")
    
    def run(self):
        """Loop principal do monitor"""
        logger.info("Iniciando monitor RSS...")
        logger.info(f"Feed: {self.feed_url}")
        logger.info(f"Intervalo de verificação: {self.polling_interval/60} minutos")
        
        while True:
            try:
                # Rotacionar logs se necessário
                self.rotate_logs_if_needed()
                
                # Limpar arquivos JSON antigos periodicamente
                self.cleanup_old_json_files()
                
                # Verificar novos artigos
                new_articles = self.check_new_articles()
                
                if new_articles:
                    logger.info(f"Encontrados {len(new_articles)} novos artigos!")
                    self.process_new_articles(new_articles)
                    # Limpar cache após processamento bem-sucedido
                    self.recent_titles_cache.clear()
                    self.cache_last_update = None
                else:
                    logger.info("Nenhum artigo novo encontrado")
                
                # Salvar estado atualizado
                self.save_processed_articles()
                
                # Aguardar próximo ciclo
                logger.info(f"Aguardando {self.polling_interval/60} minutos para próxima verificação...")
                time.sleep(self.polling_interval)
                
            except KeyboardInterrupt:
                logger.info("Monitor interrompido pelo usuário")
                break
            except Exception as e:
                logger.error(f"Erro no loop principal: {e}")
                logger.info("Aguardando 1 minuto antes de tentar novamente...")
                time.sleep(60)

def main():
    """Função principal"""
    monitor = RSSMonitor()
    monitor.run()

if __name__ == "__main__":
    main()