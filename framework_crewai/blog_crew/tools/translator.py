#!/usr/bin/env python3
"""
Módulo de tradução que utiliza a biblioteca deep-translator
para traduzir textos de inglês para português de alta qualidade.
"""

import logging
import time
import re
from deep_translator import GoogleTranslator

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("translator")

# Constantes
MAX_CHARS_PER_REQUEST = 4900  # Limite do GoogleTranslator (deep-translator)
RATE_LIMIT_DELAY = 1  # Delay em segundos para respeitar limites de API
MAX_TITLE_LENGTH = 99  # Limite máximo de caracteres para títulos

def truncate_title(title, max_length=MAX_TITLE_LENGTH):
    """
    Trunca um título para o número máximo de caracteres, 
    preservando palavras completas e adicionando reticências se necessário.
    
    Args:
        title (str): Título a ser truncado
        max_length (int): Comprimento máximo (padrão: MAX_TITLE_LENGTH)
        
    Returns:
        str: Título truncado
    """
    if not title or len(title) <= max_length:
        return title
        
    # Truncar preservando palavras completas
    truncated = title[:max_length]
    
    # Encontrar último espaço antes do limite
    last_space = truncated.rfind(' ')
    if last_space > 0:
        truncated = truncated[:last_space]
    
    # Adicionar reticências se truncamos o título
    if len(truncated) < len(title):
        # Verifica se há espaço para reticências
        if len(truncated) <= max_length - 3:
            truncated += "..."
        else:
            # Se não há espaço, corta mais para adicionar reticências
            truncated = truncated[:max_length - 3] + "..."
    
    return truncated

def translate_text(text, source_lang="en", target_lang="pt"):
    """
    Traduz um texto respeitando o limite de caracteres da API.
    
    Args:
        text (str): Texto a ser traduzido
        source_lang (str): Idioma de origem (padrão: 'en' - inglês)
        target_lang (str): Idioma de destino (padrão: 'pt' - português)
        
    Returns:
        str: Texto traduzido
    """
    if not text or len(text.strip()) == 0:
        return text
    
    try:
        # Se o texto for menor que o limite, traduzir diretamente
        if len(text) <= MAX_CHARS_PER_REQUEST:
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated = translator.translate(text)
            return translated
        
        # Caso contrário, dividir o texto em partes menores
        chunks = split_text(text, MAX_CHARS_PER_REQUEST)
        translated_chunks = []
        
        for i, chunk in enumerate(chunks):
            logger.info(f"Traduzindo parte {i+1} de {len(chunks)}")
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated_chunk = translator.translate(chunk)
            translated_chunks.append(translated_chunk)
            
            # Respeitar limites de taxa da API
            if i < len(chunks) - 1:
                time.sleep(RATE_LIMIT_DELAY)
        
        # Juntar as partes traduzidas
        return " ".join(translated_chunks)
    
    except Exception as e:
        logger.error(f"Erro ao traduzir texto: {str(e)}")
        # Em caso de erro, retornar o texto original
        return text

def split_text(text, max_length):
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

def translate_article(article):
    """
    Traduz um artigo completo (título, resumo e conteúdo).
    
    Args:
        article (dict): Dicionário com os dados do artigo
        
    Returns:
        dict: Dicionário com os dados do artigo traduzidos
    """
    logger.info("Traduzindo artigo usando deep-translator...")
    
    # Criar uma cópia do artigo para não modificar o original
    translated = article.copy()
    
    # Primeiro limpar as tags HTML do resumo e conteúdo
    summary = article.get("summary", "")
    content = article.get("content", "")
    
    if summary:
        summary = clean_html(summary)
    
    if content:
        content = clean_html(content)
    
    # Traduzir o título
    if "title" in article and article["title"]:
        logger.info(f"Traduzindo título: {article['title']}")
        translated_title = translate_text(article["title"])
        
        # Limitar o título traduzido a MAX_TITLE_LENGTH caracteres
        if len(translated_title) > MAX_TITLE_LENGTH:
            original_length = len(translated_title)
            translated_title = truncate_title(translated_title)
            logger.info(f"Título truncado de {original_length} para {len(translated_title)} caracteres")
        
        translated["title"] = translated_title
        logger.info(f"Título traduzido: {translated['title']}")
    
    # Traduzir o resumo
    if summary:
        logger.info("Traduzindo resumo...")
        translated["summary"] = translate_text(summary)
    
    # Traduzir o conteúdo
    if content:
        logger.info("Traduzindo conteúdo...")
        translated["content"] = translate_text(content)
    
    # Adicionar metadados da tradução
    translated["original_title"] = article.get("title", "")
    
    logger.info("Tradução do artigo concluída com sucesso!")
    return translated

def clean_html(text):
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

# Função para testar o módulo
if __name__ == "__main__":
    # Exemplo de uso
    sample_text = "This is a test of the translation module. It should translate this text from English to Portuguese using deep-translator."
    translated = translate_text(sample_text)
    print(f"Original: {sample_text}")
    print(f"Traduzido: {translated}")
    
    # Testar truncamento de título
    long_title = "Este é um título muito longo que certamente excederá o limite de 99 caracteres e precisará ser truncado de maneira adequada para caber no limite estabelecido"
    truncated = truncate_title(long_title)
    print(f"Título original ({len(long_title)} caracteres): {long_title}")
    print(f"Título truncado ({len(truncated)} caracteres): {truncated}")