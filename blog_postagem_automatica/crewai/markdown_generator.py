# markdown_generator.py
import os
import re
from html.parser import HTMLParser
from datetime import datetime

# Carrega configurações
import config

class HTMLToMarkdownConverter(HTMLParser):
    """
    Conversor básico de HTML para Markdown.
    Lida com elementos comuns como parágrafos, cabeçalhos, links, imagens, etc.
    """
    
    def __init__(self):
        super().__init__()
        self.reset()
        self.markdown = []
        self.current_tag = None
        self.skip_next_data = False
        self.in_blockquote = False
        self.in_list = False
        self.in_bold = False
        self.in_italic = False
        self.list_type = None
        self.list_items = []
        self.buffer = ""
        
    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        attr_dict = dict(attrs)
        
        if tag == 'h1':
            self.buffer += "# "
        elif tag == 'h2':
            self.buffer += "## "
        elif tag == 'h3':
            self.buffer += "### "
        elif tag == 'h4':
            self.buffer += "#### "
        elif tag == 'h5':
            self.buffer += "##### "
        elif tag == 'h6':
            self.buffer += "###### "
        elif tag == 'p':
            if self.buffer and not self.buffer.endswith('\n\n'):
                self.buffer += "\n\n"
        elif tag == 'a':
            self.link_url = attr_dict.get('href', '#')
            self.link_text_start = len(self.buffer)
        elif tag == 'img':
            alt_text = attr_dict.get('alt', 'Image')
            src = attr_dict.get('src', '')
            self.buffer += f"![{alt_text}]({src})\n\n"
        elif tag == 'strong' or tag == 'b':
            self.in_bold = True
            self.buffer += "**"
        elif tag == 'em' or tag == 'i':
            self.in_italic = True
            self.buffer += "_"
        elif tag == 'blockquote':
            self.in_blockquote = True
        elif tag == 'ul':
            self.in_list = True
            self.list_type = 'ul'
            self.list_items = []
        elif tag == 'ol':
            self.in_list = True
            self.list_type = 'ol'
            self.list_items = []
        elif tag == 'li' and self.in_list:
            self.list_item_start = len(self.buffer)
        elif tag == 'br':
            self.buffer += "  \n"  # Quebra de linha em Markdown
        elif tag == 'hr':
            self.buffer += "\n---\n\n"
        elif tag == 'code':
            self.buffer += "`"
        elif tag == 'pre':
            self.buffer += "\n```\n"
            
    def handle_endtag(self, tag):
        if tag == 'a':
            link_text = self.buffer[self.link_text_start:]
            self.buffer = self.buffer[:self.link_text_start] + f"[{link_text}]({self.link_url})"
        elif tag == 'strong' or tag == 'b':
            self.in_bold = False
            self.buffer += "**"
        elif tag == 'em' or tag == 'i':
            self.in_italic = False
            self.buffer += "_"
        elif tag == 'p':
            self.buffer += "\n\n"
        elif tag == 'blockquote':
            self.in_blockquote = False
            self.buffer += "\n\n"
        elif tag == 'ul' or tag == 'ol':
            self.in_list = False
            self.list_type = None
            self.buffer += "\n"
        elif tag == 'li' and self.in_list:
            if self.list_type == 'ul':
                prefix = "- "
            else:  # ol
                prefix = "1. "  # Numeração automática será feita pelo renderizador Markdown
            
            # Adiciona o prefixo no início do item da lista
            item_text = self.buffer[self.list_item_start:]
            self.buffer = self.buffer[:self.list_item_start] + prefix + item_text + "\n"
        elif tag == 'code':
            self.buffer += "`"
        elif tag == 'pre':
            self.buffer += "\n```\n\n"
            
    def handle_data(self, data):
        if self.current_tag == 'script' or self.current_tag == 'style':
            return
            
        if data.strip() or self.current_tag in ('pre', 'code'):
            if self.in_blockquote:
                # Adiciona o prefixo de blockquote para cada linha
                lines = data.split('\n')
                data = '\n> '.join(lines)
                self.buffer += "> " + data
            else:
                self.buffer += data
                
    def get_markdown(self):
        # Limpa múltiplas quebras de linha sucessivas
        markdown = re.sub(r'\n{3,}', '\n\n', self.buffer)
        # Remove espaços em branco no início e no fim
        return markdown.strip()

def html_to_markdown(html_content):
    """Converte conteúdo HTML para Markdown."""
    # Garantir que o input seja uma string
    if not isinstance(html_content, str):
        print(f"Convertendo input não-string para string. Tipo recebido: {type(html_content)}")
        if isinstance(html_content, list):
            html_content = "\n".join(html_content)
        else:
            html_content = str(html_content)
    
    converter = HTMLToMarkdownConverter()
    converter.feed(html_content)
    return converter.get_markdown()

def generate_post_markdown(title_translated, content_html, template_path=None):
    """
    Gera o Markdown final do post usando o título traduzido e convertendo 
    o conteúdo HTML para Markdown.
    """
    print(f"Gerando Markdown para o post: {title_translated[:50]}...")
    
    # Converte o conteúdo HTML para Markdown
    content_markdown = html_to_markdown(content_html)
    
    # Formato do arquivo Markdown
    markdown_content = f"""---
title: "{title_translated}"
date: {"{:%Y-%m-%d}".format(datetime.now())}
tags: {", ".join(config.DEFAULT_TAGS)}
category: {config.DEFAULT_CATEGORY}
---

# {title_translated}

{content_markdown}
"""
    
    print(f"Markdown gerado (primeiros 100 chars): {markdown_content[:100]}...")
    return markdown_content

if __name__ == "__main__":
    print("Testando markdown_generator.py...")
    
    test_title = "Este é o Título Traduzido"
    test_content = "<p>Este é o parágrafo 1 do conteúdo traduzido.</p><p>Este é o parágrafo 2 com <b>negrito</b> e um <a href=\"https://exemplo.com\">link</a>.</p><img src=\"https://exemplo.com/imagem.jpg\" alt=\"Exemplo de imagem\">"
    
    generated_markdown = generate_post_markdown(test_title, test_content)
    
    print("\n--- Markdown Gerado ---")
    print(generated_markdown)
    print("--- Fim do Markdown Gerado ---")

    if test_title in generated_markdown and "![Exemplo de imagem]" in generated_markdown:
        print("\nTeste de geração de Markdown passou: Título e elementos convertidos estão presentes.")
    else:
        print("\nTeste de geração de Markdown FALHOU.") 