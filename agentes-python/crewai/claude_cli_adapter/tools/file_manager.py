"""
Gerenciador de arquivos para o pipeline
Responsável por salvar, carregar e organizar arquivos JSON
"""

import json
import shutil
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import re

logger = logging.getLogger(__name__)


class FileManager:
    """
    Gerencia arquivos do pipeline (salvar, carregar, mover)
    """
    
    def __init__(self, base_dir: Path):
        """
        Inicializa o gerenciador
        
        Args:
            base_dir: Diretório base para operações
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
    
    def _create_safe_filename(self, title: str, prefix: str = "") -> str:
        """
        Cria nome de arquivo seguro a partir do título
        
        Args:
            title: Título do artigo
            prefix: Prefixo opcional
            
        Returns:
            Nome de arquivo seguro
        """
        # Remover caracteres especiais
        safe_title = re.sub(r'[^\w\s-]', '', title.lower())
        safe_title = re.sub(r'[-\s]+', '-', safe_title)
        safe_title = safe_title[:50]  # Limitar tamanho
        
        # Adicionar timestamp
        timestamp = int(datetime.now().timestamp())
        
        if prefix:
            return f"{prefix}_{timestamp}_{safe_title}.json"
        else:
            return f"{timestamp}_{safe_title}.json"
    
    def save_article(self, article: Dict, directory: Path, prefix: str = "") -> Path:
        """
        Salva artigo em arquivo JSON
        
        Args:
            article: Dados do artigo
            directory: Diretório onde salvar
            prefix: Prefixo para o nome do arquivo
            
        Returns:
            Caminho do arquivo salvo
        """
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        
        # Criar nome do arquivo
        title = article.get('title_pt', article.get('title', 'sem-titulo'))
        filename = self._create_safe_filename(title, prefix)
        filepath = directory / filename
        
        # Salvar JSON
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Arquivo salvo: {filepath.name}")
            return filepath
            
        except Exception as e:
            logger.error(f"Erro ao salvar arquivo: {e}")
            raise
    
    def load_article(self, filepath: Path) -> Dict:
        """
        Carrega artigo de arquivo JSON
        
        Args:
            filepath: Caminho do arquivo
            
        Returns:
            Dados do artigo
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar arquivo {filepath}: {e}")
            raise
    
    def list_articles(self, directory: Path, pattern: str = "*.json") -> List[Path]:
        """
        Lista arquivos de artigos em um diretório
        
        Args:
            directory: Diretório para listar
            pattern: Padrão de busca (glob)
            
        Returns:
            Lista de caminhos de arquivos
        """
        directory = Path(directory)
        if not directory.exists():
            return []
        
        files = list(directory.glob(pattern))
        return sorted(files, key=lambda f: f.stat().st_mtime, reverse=True)
    
    def move_to_published(self, filepath: Path, published_dir: Path) -> Path:
        """
        Move arquivo para diretório de publicados
        
        Args:
            filepath: Arquivo para mover
            published_dir: Diretório de destino
            
        Returns:
            Novo caminho do arquivo
        """
        published_dir = Path(published_dir)
        published_dir.mkdir(exist_ok=True)
        
        # Novo nome com prefixo
        new_filename = f"published_{filepath.name}"
        new_path = published_dir / new_filename
        
        try:
            shutil.move(str(filepath), str(new_path))
            logger.info(f"Arquivo movido para publicados: {new_filename}")
            return new_path
        except Exception as e:
            logger.error(f"Erro ao mover arquivo: {e}")
            raise
    
    def cleanup_old_files(self, directory: Path, days: int = 7):
        """
        Remove arquivos antigos de um diretório
        
        Args:
            directory: Diretório para limpar
            days: Arquivos mais antigos que X dias serão removidos
        """
        directory = Path(directory)
        if not directory.exists():
            return
        
        cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
        removed_count = 0
        
        for filepath in directory.glob("*.json"):
            if filepath.stat().st_mtime < cutoff_time:
                try:
                    filepath.unlink()
                    removed_count += 1
                except Exception as e:
                    logger.error(f"Erro ao remover arquivo {filepath}: {e}")
        
        if removed_count > 0:
            logger.info(f"Removidos {removed_count} arquivos antigos de {directory.name}")
    
    def get_article_stats(self, article: Dict) -> Dict:
        """
        Calcula estatísticas de um artigo
        
        Args:
            article: Dados do artigo
            
        Returns:
            Estatísticas (contagem de palavras, etc)
        """
        content = article.get('content_pt', article.get('content', ''))
        
        # Contar palavras
        words = content.split()
        
        return {
            'word_count': len(words),
            'char_count': len(content),
            'has_translation': 'content_pt' in article,
            'has_original': 'content' in article,
            'title_length': len(article.get('title', ''))
        }