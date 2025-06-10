"""
Sistema de Validação de Segurança para Feeds RSS
"""
import re
import bleach
from urllib.parse import urlparse, urljoin
from typing import Dict, List, Optional, Tuple
import feedparser
import requests
from bs4 import BeautifulSoup
import logging
from dataclasses import dataclass
from datetime import datetime
import hashlib
import json

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    sanitized_data: Optional[Dict] = None
    risk_score: float = 0.0

class FeedSecurityValidator:
    """Validador de segurança para feeds RSS"""
    
    # Domínios confiáveis
    TRUSTED_DOMAINS = [
        'coindesk.com',
        'cointelegraph.com',
        'cryptonews.com',
        'bitcoinmagazine.com',
        'decrypt.co',
        'theblock.co',
        'coinbase.com',
        'binance.com'
    ]
    
    # Padrões suspeitos
    SUSPICIOUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # Scripts inline
        r'javascript:',                  # Links JavaScript
        r'data:text/html',              # Data URIs HTML
        r'vbscript:',                   # VBScript
        r'on\w+\s*=',                   # Event handlers
        r'<iframe',                     # iFrames
        r'<object',                     # Objects embarcados
        r'<embed',                      # Embeds
        r'<form',                       # Formulários
        r'\.exe|\.bat|\.cmd|\.com',     # Executáveis
    ]
    
    # Tags HTML permitidas
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img', 'figure', 'figcaption'
    ]
    
    # Atributos permitidos
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'blockquote': ['cite']
    }
    
    def __init__(self):
        self.validation_cache = {}
    
    def validate_feed_url(self, feed_url: str) -> ValidationResult:
        """Valida URL do feed"""
        errors = []
        warnings = []
        
        # Verificar formato da URL
        try:
            parsed = urlparse(feed_url)
            
            # Deve ser HTTP/HTTPS
            if parsed.scheme not in ['http', 'https']:
                errors.append(f"Esquema de URL inválido: {parsed.scheme}")
            
            # Verificar domínio
            domain = parsed.netloc.lower()
            if not domain:
                errors.append("URL sem domínio")
            
            # Verificar se é domínio confiável
            is_trusted = any(trusted in domain for trusted in self.TRUSTED_DOMAINS)
            if not is_trusted:
                warnings.append(f"Domínio não está na lista de confiáveis: {domain}")
            
            # Verificar porta suspeita
            if parsed.port and parsed.port not in [80, 443, 8080]:
                warnings.append(f"Porta não padrão: {parsed.port}")
            
        except Exception as e:
            errors.append(f"URL inválida: {str(e)}")
        
        risk_score = len(errors) * 0.5 + len(warnings) * 0.2
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            risk_score=min(risk_score, 1.0)
        )
    
    def validate_feed_content(self, feed_data: feedparser.FeedParserDict) -> ValidationResult:
        """Valida conteúdo do feed"""
        errors = []
        warnings = []
        
        # Verificar estrutura básica
        if not hasattr(feed_data, 'entries'):
            errors.append("Feed sem entradas")
            return ValidationResult(is_valid=False, errors=errors, warnings=warnings)
        
        # Verificar cada entrada
        for i, entry in enumerate(feed_data.entries[:10]):  # Verificar primeiras 10
            entry_errors, entry_warnings = self._validate_entry(entry, i)
            errors.extend(entry_errors)
            warnings.extend(entry_warnings)
        
        # Verificar metadados do feed
        if hasattr(feed_data, 'feed'):
            feed_meta = feed_data.feed
            
            # Verificar título
            if hasattr(feed_meta, 'title'):
                if self._contains_suspicious_content(feed_meta.title):
                    warnings.append("Título do feed contém conteúdo suspeito")
            
            # Verificar descrição
            if hasattr(feed_meta, 'description'):
                if self._contains_suspicious_content(feed_meta.description):
                    warnings.append("Descrição do feed contém conteúdo suspeito")
        
        risk_score = min(len(errors) * 0.3 + len(warnings) * 0.1, 1.0)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            risk_score=risk_score
        )
    
    def _validate_entry(self, entry: Dict, index: int) -> Tuple[List[str], List[str]]:
        """Valida uma entrada do feed"""
        errors = []
        warnings = []
        
        # Verificar campos obrigatórios
        if not hasattr(entry, 'title') or not entry.title:
            errors.append(f"Entrada {index}: sem título")
        
        if not hasattr(entry, 'link') or not entry.link:
            errors.append(f"Entrada {index}: sem link")
        else:
            # Validar URL do artigo
            link_result = self.validate_url(entry.link)
            if not link_result.is_valid:
                errors.extend([f"Entrada {index}: {e}" for e in link_result.errors])
        
        # Verificar conteúdo
        content = ""
        if hasattr(entry, 'content'):
            content = entry.content[0].value if entry.content else ""
        elif hasattr(entry, 'summary'):
            content = entry.summary
        
        if content:
            # Verificar padrões suspeitos
            if self._contains_suspicious_content(content):
                warnings.append(f"Entrada {index}: conteúdo potencialmente suspeito")
            
            # Verificar tamanho
            if len(content) > 100000:
                warnings.append(f"Entrada {index}: conteúdo muito grande ({len(content)} chars)")
        
        return errors, warnings
    
    def _contains_suspicious_content(self, content: str) -> bool:
        """Verifica se conteúdo contém padrões suspeitos"""
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                return True
        return False
    
    def sanitize_content(self, content: str) -> str:
        """Sanitiza conteúdo HTML"""
        # Usar bleach para limpar HTML
        cleaned = bleach.clean(
            content,
            tags=self.ALLOWED_TAGS,
            attributes=self.ALLOWED_ATTRIBUTES,
            strip=True
        )
        
        # Remover múltiplos espaços/quebras
        cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned)
        cleaned = re.sub(r' +', ' ', cleaned)
        
        return cleaned.strip()
    
    def validate_url(self, url: str) -> ValidationResult:
        """Valida URL individual"""
        errors = []
        warnings = []
        
        try:
            parsed = urlparse(url)
            
            # Verificar esquema
            if parsed.scheme not in ['http', 'https']:
                errors.append(f"Esquema inválido: {parsed.scheme}")
            
            # Verificar caracteres suspeitos
            if any(char in url for char in ['<', '>', '"', '{', '}']):
                errors.append("URL contém caracteres inválidos")
            
            # Verificar comprimento
            if len(url) > 2048:
                warnings.append("URL muito longa")
            
        except Exception as e:
            errors.append(f"URL inválida: {str(e)}")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
    
    def validate_image_url(self, image_url: str) -> ValidationResult:
        """Valida URL de imagem"""
        # Primeiro validar como URL normal
        result = self.validate_url(image_url)
        
        if result.is_valid:
            # Verificar extensão
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
            has_valid_ext = any(image_url.lower().endswith(ext) for ext in valid_extensions)
            
            if not has_valid_ext:
                # Tentar verificar Content-Type
                try:
                    response = requests.head(image_url, timeout=5)
                    content_type = response.headers.get('Content-Type', '')
                    
                    if not content_type.startswith('image/'):
                        result.errors.append(f"Content-Type inválido: {content_type}")
                        result.is_valid = False
                except:
                    result.warnings.append("Não foi possível verificar tipo da imagem")
        
        return result
    
    def calculate_content_hash(self, content: str) -> str:
        """Calcula hash do conteúdo para detectar duplicatas"""
        # Normalizar conteúdo
        normalized = re.sub(r'\s+', ' ', content.lower().strip())
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]
    
    def validate_and_sanitize_article(self, article: Dict) -> ValidationResult:
        """Valida e sanitiza artigo completo"""
        errors = []
        warnings = []
        sanitized = {}
        
        # Validar título
        if 'title' in article:
            sanitized['title'] = bleach.clean(article['title'], tags=[], strip=True)
            if len(sanitized['title']) > 200:
                warnings.append("Título muito longo")
                sanitized['title'] = sanitized['title'][:200] + '...'
        else:
            errors.append("Artigo sem título")
        
        # Validar e sanitizar conteúdo
        if 'content' in article:
            sanitized['content'] = self.sanitize_content(article['content'])
            
            # Verificar conteúdo mínimo
            if len(sanitized['content']) < 100:
                warnings.append("Conteúdo muito curto")
        else:
            errors.append("Artigo sem conteúdo")
        
        # Validar link
        if 'link' in article:
            link_result = self.validate_url(article['link'])
            if link_result.is_valid:
                sanitized['link'] = article['link']
            else:
                errors.extend(link_result.errors)
        else:
            errors.append("Artigo sem link")
        
        # Validar data
        if 'published' in article:
            try:
                # Tentar parsear data
                if isinstance(article['published'], str):
                    pub_date = datetime.fromisoformat(article['published'])
                else:
                    pub_date = article['published']
                
                sanitized['published'] = pub_date.isoformat()
            except:
                warnings.append("Data de publicação inválida")
        
        # Validar imagem se presente
        if 'image' in article and article['image']:
            img_result = self.validate_image_url(article['image'])
            if img_result.is_valid:
                sanitized['image'] = article['image']
            else:
                warnings.extend(img_result.warnings)
        
        # Calcular hash para detecção de duplicatas
        if 'content' in sanitized:
            sanitized['content_hash'] = self.calculate_content_hash(sanitized['content'])
        
        risk_score = min(len(errors) * 0.4 + len(warnings) * 0.15, 1.0)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            sanitized_data=sanitized if len(errors) == 0 else None,
            risk_score=risk_score
        )

class APIKeyRotator:
    """Sistema de rotação de chaves de API"""
    
    def __init__(self, keys_file: str = "api_keys.json"):
        self.keys_file = keys_file
        self.keys = self._load_keys()
        self.usage = {}
    
    def _load_keys(self) -> Dict[str, List[Dict]]:
        """Carrega chaves do arquivo"""
        if Path(self.keys_file).exists():
            try:
                with open(self.keys_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_keys(self):
        """Salva chaves no arquivo"""
        with open(self.keys_file, 'w') as f:
            json.dump(self.keys, f, indent=2)
    
    def add_key(self, service: str, key: str, daily_limit: int = 1000):
        """Adiciona nova chave de API"""
        if service not in self.keys:
            self.keys[service] = []
        
        key_entry = {
            "key": key,
            "daily_limit": daily_limit,
            "created_at": datetime.now().isoformat(),
            "active": True
        }
        
        self.keys[service].append(key_entry)
        self._save_keys()
    
    def get_active_key(self, service: str) -> Optional[str]:
        """Obtém chave ativa com menor uso"""
        if service not in self.keys:
            return None
        
        active_keys = [k for k in self.keys[service] if k.get("active", True)]
        
        if not active_keys:
            return None
        
        # Selecionar chave com menor uso hoje
        today = datetime.now().date().isoformat()
        
        best_key = None
        min_usage = float('inf')
        
        for key_entry in active_keys:
            key_id = key_entry["key"][:8]  # Primeiros 8 chars como ID
            usage_key = f"{service}:{key_id}:{today}"
            
            current_usage = self.usage.get(usage_key, 0)
            
            if current_usage < key_entry["daily_limit"] and current_usage < min_usage:
                best_key = key_entry["key"]
                min_usage = current_usage
        
        return best_key
    
    def record_usage(self, service: str, key: str):
        """Registra uso de uma chave"""
        today = datetime.now().date().isoformat()
        key_id = key[:8]
        usage_key = f"{service}:{key_id}:{today}"
        
        self.usage[usage_key] = self.usage.get(usage_key, 0) + 1
        
        # Log se próximo do limite
        for key_entry in self.keys.get(service, []):
            if key_entry["key"] == key:
                usage_percent = (self.usage[usage_key] / key_entry["daily_limit"]) * 100
                if usage_percent > 80:
                    logger.warning(f"API key for {service} at {usage_percent:.1f}% of daily limit")
                break

# Exemplo de uso
if __name__ == "__main__":
    # Testar validador
    validator = FeedSecurityValidator()
    
    # Validar URL
    url_result = validator.validate_feed_url("https://cointelegraph.com/rss")
    print(f"URL válida: {url_result.is_valid}")
    print(f"Erros: {url_result.errors}")
    print(f"Avisos: {url_result.warnings}")
    
    # Testar sanitização
    malicious_content = """
    <p>Bitcoin price <script>alert('xss')</script></p>
    <a href="javascript:void(0)" onclick="hack()">Click here</a>
    <iframe src="evil.com"></iframe>
    """
    
    clean_content = validator.sanitize_content(malicious_content)
    print(f"\nConteúdo limpo: {clean_content}")
    
    # Testar rotação de chaves
    rotator = APIKeyRotator()
    rotator.add_key("openai", "sk-test123", daily_limit=100)
    
    key = rotator.get_active_key("openai")
    print(f"\nChave ativa: {key[:10]}...")
    
    rotator.record_usage("openai", key)