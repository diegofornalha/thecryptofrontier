# translator.py
import requests
import json
import google.generativeai as genai
import re

# Carrega configurações
import config

# Inicializa a API do Gemini
genai.configure(api_key=config.GEMINI_API_KEY)

def remove_links(html_content):
    """Remove links (hrefs) do conteúdo HTML mantendo o texto.
    
    Substitui tags <a href="...">texto</a> por apenas o texto contido,
    mas preserva links de imagens e as próprias tags de imagem.
    """
    try:
        # Garantir que html_content seja uma string
        if not isinstance(html_content, str):
            print(f"remove_links: conteúdo não é string! Tipo: {type(html_content)}")
            if isinstance(html_content, list):
                print(f"remove_links: convertendo lista para string, tamanho: {len(html_content)}")
                html_content = "\n".join(html_content)
            else:
                html_content = str(html_content)
                
        # Padrão para encontrar tags de âncora completas e capturar o texto interno
        # Excluindo links que contêm imagens
        pattern = r'<a\s+[^>]*>(?!<img[^>]*>)([^<]+)</a>'
        
        # Substitui as tags de âncora pelo texto capturado
        return re.sub(pattern, r'\1', html_content)
    except Exception as e:
        print(f"Erro em remove_links: {e}")
        return html_content if isinstance(html_content, str) else ""

def extract_images(html_content):
    """Extrai as URLs das imagens de um conteúdo HTML.
    
    Args:
        html_content: Conteúdo HTML que pode conter tags de imagem.
        
    Returns:
        Lista de URLs de imagens encontradas no HTML.
    """
    try:
        # Garantir que html_content seja uma string
        if not isinstance(html_content, str):
            print(f"extract_images: conteúdo não é string! Tipo: {type(html_content)}")
            if isinstance(html_content, list):
                print(f"extract_images: convertendo lista para string, tamanho: {len(html_content)}")
                html_content = "\n".join(html_content)
            else:
                html_content = str(html_content)
                
        # Padrão para encontrar tags de imagem e capturar o atributo src
        pattern = r'<img[^>]*\ssrc=["\'](https?://[^"\']+)["\'][^>]*>'
        
        # Encontra todas as ocorrências no texto
        images = re.findall(pattern, html_content)
        return images
    except Exception as e:
        print(f"Erro em extract_images: {e}")
        return []

def translate_text_via_mcp(text_to_translate, target_language=config.TARGET_LANGUAGE, remove_hrefs=True):
   """Traduz texto usando a API do Gemini.
   
   Esta função faz uma requisição para a API do Gemini com instruções
   para traduzir o texto fornecido para o idioma alvo.
   
   Args:
       text_to_translate: Texto para traduzir
       target_language: Idioma alvo para tradução
       remove_hrefs: Se True, remove links do texto antes da tradução
   """
   if not text_to_translate:
       return ""
   
   # Extrai informações de imagens antes de qualquer modificação
   images = extract_images(text_to_translate)
   if images:
       print(f"Encontradas {len(images)} imagens no conteúdo.")
   
   # Remove links se necessário, mas preserva imagens
   if remove_hrefs:
       text_to_translate = remove_links(text_to_translate)
       
   print(f"Tentando traduzir para {target_language}: '{text_to_translate[:50]}...' via Gemini.")
   
   try:
       # Configurando o modelo
       model = genai.GenerativeModel(config.GEMINI_MODEL)
       
       # Criando o prompt para tradução
       prompt = f"""
       Traduza o seguinte texto para {target_language}, 
       mantendo a formatação HTML intacta e preservando todas as tags.
       Apenas traduza o texto dentro das tags HTML.
       Preserve todas as URLs e imagens.
       Não adicione nenhum texto explicativo, apenas retorne o texto traduzido.
       
       TEXTO PARA TRADUZIR:
       {text_to_translate}
       """
       
       # Gerando a resposta
       response = model.generate_content(prompt)
       
       # Extraindo o texto traduzido
       translated_text = response.text.strip()
       
       # Verificar se o resultado é uma lista e converter para string
       if isinstance(translated_text, list):
           print(f"Resposta da API Gemini é uma lista com {len(translated_text)} itens, convertendo para string")
           translated_text = "\n".join(translated_text)
       
       # Se não for string depois da verificação, forçar conversão
       if not isinstance(translated_text, str):
           print(f"A resposta da API não é uma string. Tipo: {type(translated_text)}")
           translated_text = str(translated_text)
       
       print(f"Texto traduzido pelo Gemini: '{translated_text[:50]}...'")
       return translated_text
   
   except Exception as e:
       print(f"Erro na chamada da API do Gemini: {e}")
       # Em caso de erro, retorna o texto original com uma mensagem
       return f"[ERRO DE TRADUÇÃO] {text_to_translate}"

# Versão mock para testes (mantida como backup)
def mock_translate_text(text_to_translate, target_language=config.TARGET_LANGUAGE):
   """Simula a tradução de texto (versão mock).
   
   Por enquanto, esta é uma implementação mock que apenas adiciona um prefixo.
   """
   if not text_to_translate:
       return ""
   
   # Simplesmente adiciona um prefixo para indicar que foi "traduzido"
   mock_translated_text = f"[TRADUZIDO PT-BR] {text_to_translate}"
   print(f"Texto mock traduzido: '{mock_translated_text[:50]}...'")
   return mock_translated_text

def generate_tags_for_content(title, content, max_tags=3):
   """Gera tags relevantes para o conteúdo usando a API do Gemini.
   
   Args:
      title: Título do artigo
      content: Conteúdo do artigo
      max_tags: Número máximo de tags a serem geradas
      
   Returns:
      Lista de até max_tags strings representando as tags geradas
   """
   if not title and not content:
      print("Não é possível gerar tags: título e conteúdo vazios")
      return []
      
   try:
      # Configurando o modelo
      model = genai.GenerativeModel(config.GEMINI_MODEL)
      
      # Extrair um resumo do conteúdo (primeiros paragrafos) para não sobrecarregar o prompt
      summary = content[:1000] if content else ""
      
      # Criando o prompt para geração de tags
      prompt = f"""
      Analise o título e conteúdo abaixo e gere exatamente {max_tags} tags relevantes para o artigo.
      As tags devem ser curtas (1-2 palavras), em português, minúsculas, e relacionadas a criptomoedas e blockchain.
      Retorne somente as tags separadas por vírgula, sem informações adicionais.
      
      TÍTULO:
      {title}
      
      CONTEÚDO (RESUMO):
      {summary}
      """
      
      # Gerando a resposta
      response = model.generate_content(prompt)
      
      # Extraindo as tags
      tags_text = response.text.strip()
      
      # Limpar possíveis artefatos de formatação
      tags_text = tags_text.replace('*', '').replace('#', '').replace('- ', '')
      
      # Dividir por vírgula e limpar espaços
      tags = [tag.strip().lower() for tag in tags_text.split(',')]
      
      # Filtrar tags vazias e limitar ao número máximo
      tags = [tag for tag in tags if tag][:max_tags]
      
      print(f"Tags geradas pelo Gemini: {', '.join(tags)}")
      return tags
      
   except Exception as e:
      print(f"Erro ao gerar tags com Gemini: {e}")
      return []

if __name__ == "__main__":
   print("Testando translator.py...")
   
   # Texto de exemplo com links e imagens
   original_title = "Hello World"
   original_content = """
   This is a test content with <a href='https://example.com'>link</a> and 
   <a href='#'>another link</a>.
   
   <figure>
     <img src="https://example.com/image.jpg" alt="Example Image" />
     <figcaption>This is an example image</figcaption>
   </figure>
   """
   
   # Teste de extração de imagens
   print("\nTeste de extração de imagens:")
   found_images = extract_images(original_content)
   print(f"Imagens encontradas: {found_images}")
   
   # Teste de remoção de links
   print("\nTeste de remoção de links:")
   content_without_links = remove_links(original_content)
   print(f"Original: {original_content}")
   print(f"Sem links: {content_without_links}")
   
   # Teste de tradução completa
   translated_title = translate_text_via_mcp(original_title)
   translated_content = translate_text_via_mcp(original_content)
  
   print(f"\nTítulo Original: {original_title}")
   print(f"Título Traduzido: {translated_title}")
  
   print(f"\nConteúdo Original: {original_content}")
   print(f"Conteúdo Traduzido: {translated_content}")

   # Teste com texto vazio
   empty_text = ""
   translated_empty = translate_text_via_mcp(empty_text)
   print(f"\nTraduzindo texto vazio: '{translated_empty}' (esperado: '')") 