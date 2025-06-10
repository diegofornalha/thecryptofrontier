#!/usr/bin/env python3
"""
Ferramenta de tradução para o CrewAI usando a biblioteca deep-translator.
Permite que os agentes traduzam textos diretamente como parte de suas tarefas.
"""

import logging
import time
import re
from typing import Dict, Optional, Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from deep_translator import GoogleTranslator

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("translation_tool")

# Constantes
MAX_CHARS_PER_REQUEST = 4900  # Limite do GoogleTranslator
RATE_LIMIT_DELAY = 1  # Delay em segundos para respeitar limites de API

# Schema para os argumentos da ferramenta
class TranslationInput(BaseModel):
    """Schema de entrada para a ferramenta de tradução."""
    text: str = Field(..., description="Texto a ser traduzido")
    target_language: str = Field(default="pt", description="Código do idioma de destino (padrão: 'pt' - português)")
    source_language: str = Field(default="en", description="Código do idioma de origem (padrão: 'en' - inglês)")

class GoogleTranslateTool(BaseTool):
    """Ferramenta oficial do CrewAI para traduzir textos usando o Google Translate."""
    
    name: str = "Google Translate Tool"
    description: str = "Traduz texto de um idioma para outro usando o Google Translate"
    args_schema: Type[BaseModel] = TranslationInput
    
    def _run(self, text: str, target_language: str = "pt", source_language: str = "en") -> Dict:
        """Executa a tradução do texto."""
        if not text or len(text.strip()) == 0:
            return {"translated_text": text, "error": "Texto vazio ou nulo"}
        
        try:
            # Se o texto for menor que o limite, traduzir diretamente
            if len(text) <= MAX_CHARS_PER_REQUEST:
                translator = GoogleTranslator(source=source_language, target=target_language)
                translated = translator.translate(text)
                return {
                    "translated_text": translated,
                    "source_language": source_language,
                    "target_language": target_language
                }
            
            # Caso contrário, dividir o texto em partes menores
            chunks = self._split_text(text, MAX_CHARS_PER_REQUEST)
            translated_chunks = []
            
            for i, chunk in enumerate(chunks):
                logger.info(f"Traduzindo parte {i+1} de {len(chunks)}")
                translator = GoogleTranslator(source=source_language, target=target_language)
                translated_chunk = translator.translate(chunk)
                translated_chunks.append(translated_chunk)
                
                # Respeitar limites de taxa da API
                if i < len(chunks) - 1:
                    time.sleep(RATE_LIMIT_DELAY)
            
            # Juntar as partes traduzidas
            result = " ".join(translated_chunks)
            return {
                "translated_text": result,
                "source_language": source_language,
                "target_language": target_language,
                "chunks_count": len(chunks)
            }
        
        except Exception as e:
            logger.error(f"Erro ao traduzir texto: {str(e)}")
            return {
                "error": f"Erro na tradução: {str(e)}",
                "translated_text": text  # Retorna o texto original em caso de erro
            }
    
    def _split_text(self, text: str, max_length: int) -> list:
        """
        Divide um texto em partes menores, tentando preservar parágrafos e sentenças.
        
        Args:
            text (str): Texto a ser dividido
            max_length (int): Tamanho máximo de cada parte
            
        Returns:
            list: Lista com as partes do texto
        """
        # Se o texto for menor que o limite, retornar como está
        if len(text) <= max_length:
            return [text]
        
        # Dividir o texto em parágrafos
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            # Se o parágrafo é maior que o limite, dividir em sentenças
            if len(paragraph) > max_length:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    # Se a sentença é maior que o limite, dividir em palavras
                    if len(sentence) > max_length:
                        words = sentence.split(' ')
                        for word in words:
                            if len(current_chunk) + len(word) + 1 > max_length:
                                chunks.append(current_chunk)
                                current_chunk = word + " "
                            else:
                                current_chunk += word + " "
                    # Se a sentença cabe na parte atual
                    elif len(current_chunk) + len(sentence) + 1 > max_length:
                        chunks.append(current_chunk)
                        current_chunk = sentence + " "
                    else:
                        current_chunk += sentence + " "
            # Se o parágrafo cabe na parte atual
            elif len(current_chunk) + len(paragraph) + 2 > max_length:
                chunks.append(current_chunk)
                current_chunk = paragraph + "\n\n"
            else:
                current_chunk += paragraph + "\n\n"
        
        # Adicionar a última parte, se não estiver vazia
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def cache_function(self, arguments: Dict, result: Dict) -> bool:
        """Define estratégia de cache personalizada.
        
        Armazena em cache os resultados se:
        1. A tradução foi bem-sucedida (sem erros)
        2. O texto não é muito longo (para evitar armazenar grandes trechos de texto)
        """
        if isinstance(result, dict) and "translated_text" in result and "error" not in result:
            # Cachear apenas se o texto for menor que 1000 caracteres
            if len(arguments.get("text", "")) < 1000:
                return True
        return False

class ArticleTranslatorTool(BaseTool):
    """Ferramenta do CrewAI para traduzir artigos completos."""
    
    name: str = "Article Translator Tool"
    description: str = "Traduz um artigo completo (título, resumo e conteúdo) de um idioma para outro"
    
    def __init__(self):
        super().__init__()
        self.translate_tool = GoogleTranslateTool()
    
    def _run(self, article: Dict, target_language: str = "pt", source_language: str = "en") -> Dict:
        """Traduz um artigo completo."""
        logger.info("Traduzindo artigo usando a ferramenta do CrewAI...")
        
        # Criar uma cópia do artigo para não modificar o original
        translated = article.copy()
        
        # Primeiro limpar as tags HTML do resumo e conteúdo
        summary = self._clean_html(article.get("summary", ""))
        content = self._clean_html(article.get("content", ""))
        
        # Traduzir o título
        if "title" in article and article["title"]:
            logger.info(f"Traduzindo título: {article['title']}")
            result = self.translate_tool._run(article["title"], target_language, source_language)
            translated["title"] = result.get("translated_text", article["title"])
            logger.info(f"Título traduzido: {translated['title']}")
        
        # Traduzir o resumo
        if summary:
            logger.info("Traduzindo resumo...")
            result = self.translate_tool._run(summary, target_language, source_language)
            translated["summary"] = result.get("translated_text", summary)
        
        # Traduzir o conteúdo
        if content:
            logger.info("Traduzindo conteúdo...")
            result = self.translate_tool._run(content, target_language, source_language)
            translated["content"] = result.get("translated_text", content)
        
        # Adicionar metadados da tradução
        translated["original_title"] = article.get("title", "")
        
        logger.info("Tradução do artigo concluída com sucesso!")
        return translated
    
    def _clean_html(self, text: str) -> str:
        """
        Remove todas as tags HTML de um texto.
        
        Args:
            text (str): Texto com tags HTML
            
        Returns:
            str: Texto sem tags HTML
        """
        # Remover tags <a>
        text = re.sub(r'<a\s+[^>]*>(.*?)</a>', r'\1', text)
        # Remover todas as outras tags HTML
        text = re.sub(r'<[^>]*>', '', text)
        return text

# Exportar as ferramentas
__all__ = ['GoogleTranslateTool', 'ArticleTranslatorTool']

# Função para testar o módulo
if __name__ == "__main__":
    # Exemplo de uso
    translator_tool = GoogleTranslateTool()
    sample_text = "This is a test of the translation tool. It should translate this text from English to Portuguese."
    result = translator_tool._run(sample_text)
    print(f"Original: {sample_text}")
    print(f"Traduzido: {result.get('translated_text', 'Erro na tradução')}")