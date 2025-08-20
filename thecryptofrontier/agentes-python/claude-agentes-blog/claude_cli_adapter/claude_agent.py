"""
Agente Claude CLI - Interface para interagir com Claude via CLI
"""

import subprocess
import json
import os
import logging
from typing import Dict, List, Optional
from pathlib import Path
import tempfile

logger = logging.getLogger(__name__)


class ClaudeAgent:
    """
    Agente que usa Claude CLI para processar tarefas de IA
    Substitui OpenAI/Gemini por Claude CLI (custo zero)
    """
    
    def __init__(self, model: str = "claude-3-haiku-20240307"):
        """
        Inicializa o agente Claude
        
        Args:
            model: Modelo do Claude a usar (haiku é o mais rápido/barato)
        """
        self.model = model
        self.claude_cli_path = self._find_claude_cli()
        
    def _find_claude_cli(self) -> str:
        """Encontra o executável do Claude CLI no sistema"""
        # Tenta encontrar claude no PATH
        result = subprocess.run(["which", "claude"], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
        
        # Locais comuns onde o Claude CLI pode estar instalado
        possible_paths = [
            "/usr/local/bin/claude",
            "/usr/bin/claude",
            os.path.expanduser("~/.local/bin/claude"),
            os.path.expanduser("~/bin/claude")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return path
        
        raise RuntimeError(
            "Claude CLI não encontrado. Instale com: pip install claude-cli"
        )
    
    def _run_claude_command(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Executa comando do Claude CLI e retorna a resposta
        
        Args:
            prompt: Prompt do usuário
            system_prompt: Prompt do sistema (opcional)
            
        Returns:
            Resposta do Claude
        """
        # Preparar comando
        cmd = [self.claude_cli_path]
        
        # Adicionar model se especificado
        if self.model:
            cmd.extend(["--model", self.model])
        
        # Adicionar system prompt se fornecido
        if system_prompt:
            cmd.extend(["--system", system_prompt])
        
        # Adicionar o prompt principal
        cmd.append(prompt)
        
        try:
            # Executar comando
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            return result.stdout.strip()
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro ao executar Claude CLI: {e}")
            logger.error(f"Stderr: {e.stderr}")
            raise
    
    def translate_text(self, text: str, target_language: str = "pt-BR") -> str:
        """
        Traduz texto usando Claude CLI
        
        Args:
            text: Texto para traduzir
            target_language: Idioma alvo (padrão: português brasileiro)
            
        Returns:
            Texto traduzido
        """
        system_prompt = f"""Você é um tradutor profissional especializado em conteúdo de tecnologia e criptomoedas.
        Traduza o texto a seguir para {target_language}, mantendo:
        - Termos técnicos em inglês quando apropriado (Bitcoin, blockchain, etc)
        - Tom profissional e informativo
        - Estrutura e formatação originais"""
        
        prompt = f"Traduza o seguinte texto:\n\n{text}"
        
        return self._run_claude_command(prompt, system_prompt)
    
    def translate_article(self, article: Dict) -> Dict:
        """
        Traduz um artigo completo (título, resumo e conteúdo)
        
        Args:
            article: Dicionário com dados do artigo
            
        Returns:
            Artigo traduzido
        """
        logger.info(f"Traduzindo artigo: {article.get('title', 'Sem título')}")
        
        # Traduzir cada parte separadamente para melhor controle
        translated = article.copy()
        
        # Traduzir título
        if 'title' in article:
            logger.info("Traduzindo título...")
            translated['title_pt'] = self.translate_text(
                article['title'], 
                target_language="português brasileiro"
            )
            translated['original_title'] = article['title']
        
        # Traduzir resumo
        if 'summary' in article:
            logger.info("Traduzindo resumo...")
            translated['summary_pt'] = self.translate_text(
                article['summary'],
                target_language="português brasileiro"
            )
        
        # Traduzir conteúdo
        if 'content' in article:
            logger.info("Traduzindo conteúdo...")
            translated['content_pt'] = self.translate_text(
                article['content'],
                target_language="português brasileiro"
            )
        
        return translated
    
    def format_for_strapi(self, article: Dict) -> Dict:
        """
        Formata artigo para publicação no Strapi usando Claude
        
        Args:
            article: Artigo traduzido
            
        Returns:
            Artigo formatado para Strapi
        """
        system_prompt = """Você é um especialista em formatação de conteúdo para CMS.
        Formate o artigo fornecido para publicação no Strapi CMS, seguindo estas diretrizes:
        1. Crie um slug SEO-friendly a partir do título
        2. Estruture o conteúdo em parágrafos bem definidos
        3. Adicione metadados apropriados
        4. Mantenha a formatação limpa e profissional"""
        
        # Preparar dados do artigo
        article_json = json.dumps({
            'title': article.get('title_pt', article.get('title')),
            'content': article.get('content_pt', article.get('content')),
            'summary': article.get('summary_pt', article.get('summary'))
        }, ensure_ascii=False)
        
        prompt = f"""Formate o seguinte artigo para o Strapi CMS.
        Retorne APENAS um JSON válido com a estrutura:
        {{
            "title": "título formatado",
            "slug": "slug-do-artigo",
            "excerpt": "resumo do artigo",
            "content": "conteúdo formatado em markdown",
            "publishedAt": "data ISO atual"
        }}
        
        Artigo: {article_json}"""
        
        response = self._run_claude_command(prompt, system_prompt)
        
        # Extrair JSON da resposta
        try:
            # Tentar encontrar JSON na resposta
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                formatted = json.loads(json_match.group())
                
                # Adicionar dados originais
                formatted['originalSource'] = {
                    'url': article.get('link', ''),
                    'title': article.get('original_title', article.get('title', '')),
                    'site': article.get('source', 'Unknown')
                }
                
                return formatted
            else:
                raise ValueError("Não foi possível extrair JSON da resposta")
                
        except Exception as e:
            logger.error(f"Erro ao parsear resposta do Claude: {e}")
            logger.error(f"Resposta: {response}")
            
            # Retornar formato básico em caso de erro
            return {
                'title': article.get('title_pt', article.get('title')),
                'slug': self._create_basic_slug(article.get('title_pt', article.get('title'))),
                'excerpt': article.get('summary_pt', article.get('summary', ''))[:200],
                'content': article.get('content_pt', article.get('content')),
                'publishedAt': article.get('published', ''),
                'originalSource': {
                    'url': article.get('link', ''),
                    'title': article.get('original_title', article.get('title', '')),
                    'site': article.get('source', 'Unknown')
                }
            }
    
    def _create_basic_slug(self, title: str) -> str:
        """Cria um slug básico a partir do título"""
        import re
        import unicodedata
        
        # Normalizar e remover acentos
        nfkd = unicodedata.normalize('NFKD', title)
        slug = ''.join([c for c in nfkd if not unicodedata.combining(c)])
        
        # Converter para lowercase e substituir espaços
        slug = slug.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        
        return slug[:200]  # Limitar tamanho
    
    def analyze_content(self, content: str, task: str) -> str:
        """
        Analisa conteúdo para uma tarefa específica
        
        Args:
            content: Conteúdo para analisar
            task: Descrição da tarefa
            
        Returns:
            Resultado da análise
        """
        prompt = f"{task}\n\nConteúdo:\n{content}"
        return self._run_claude_command(prompt)