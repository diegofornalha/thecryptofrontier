#!/usr/bin/env python3
"""
Pipeline manual que simula o CrewAI mas garante salvamento de arquivos
"""

import os
import json
import sys
import time
import feedparser
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Carregar .env
load_dotenv()

# Configurar Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class ManualPipeline:
    """Pipeline manual que garante o salvamento de arquivos"""
    
    def __init__(self, limit: int = 3):
        self.limit = limit
        self.ensure_directories()
        
    def ensure_directories(self):
        """Garante que os diretórios existem"""
        dirs = [
            "posts_para_traduzir",
            "posts_traduzidos", 
            "posts_formatados",
            "posts_com_imagem",
            "posts_publicados"
        ]
        for d in dirs:
            Path(d).mkdir(exist_ok=True)
            print(f"✅ Diretório {d} verificado")
            
    def step1_monitor_rss(self) -> List[str]:
        """Etapa 1: Monitorar RSS e salvar artigos"""
        print("\n" + "="*60)
        print("ETAPA 1: Monitorando feeds RSS...")
        print("="*60)
        
        # Ler feeds.json
        with open('feeds.json', 'r') as f:
            feeds_config = json.load(f)
            
        articles = []
        
        # Processar cada feed
        for feed_info in feeds_config.get('feeds', []):
            feed_url = feed_info.get('url')
            feed_name = feed_info.get('name', 'Unknown')
            
            print(f"\n📡 Lendo feed: {feed_name}")
            
            try:
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:self.limit]:
                    article = {
                        "title": entry.get('title', ''),
                        "link": entry.get('link', ''),
                        "summary": entry.get('summary', ''),
                        "published": entry.get('published', ''),
                        "content": entry.get('summary', ''),  # Usar summary como content
                        "source": feed_name
                    }
                    
                    # Verificar se não é spam
                    blacklist = ["LiteFinance", "Partner Application", "Sponsored"]
                    if any(word in article['title'] for word in blacklist):
                        print(f"   ❌ Ignorado (blacklist): {article['title'][:50]}...")
                        continue
                        
                    articles.append(article)
                    print(f"   ✅ Coletado: {article['title'][:50]}...")
                    
                    if len(articles) >= self.limit:
                        break
                        
            except Exception as e:
                print(f"   ❌ Erro ao ler feed: {e}")
                
            if len(articles) >= self.limit:
                break
                
        # Salvar artigos
        saved_files = []
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        for i, article in enumerate(articles[:self.limit]):
            filename = f"para_traduzir_{timestamp}_{i}.json"
            filepath = Path("posts_para_traduzir") / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
                
            saved_files.append(filename)
            print(f"\n💾 Salvo: {filepath}")
            
        print(f"\n✅ Total: {len(saved_files)} artigos salvos")
        return saved_files
        
    def step2_translate(self, files: List[str]) -> List[str]:
        """Etapa 2: Traduzir artigos"""
        print("\n" + "="*60)
        print("ETAPA 2: Traduzindo artigos...")
        print("="*60)
        
        saved_files = []
        
        for filename in files:
            filepath = Path("posts_para_traduzir") / filename
            
            if not filepath.exists():
                print(f"❌ Arquivo não encontrado: {filepath}")
                continue
                
            print(f"\n🌐 Traduzindo: {filename}")
            
            # Ler arquivo
            with open(filepath, 'r', encoding='utf-8') as f:
                article = json.load(f)
                
            try:
                # Traduzir com Gemini
                prompt = f"""
                Traduza o seguinte artigo de criptomoedas para português brasileiro.
                Mantenha termos técnicos em inglês quando apropriado.
                
                Título: {article['title']}
                
                Conteúdo: {article['content'][:1000]}
                
                Retorne APENAS um JSON válido (sem markdown ou explicações) com:
                {{"title": "título traduzido", "content": "conteúdo traduzido", "summary": "resumo traduzido (máximo 200 caracteres)"}}
                """
                
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                
                # Extrair JSON da resposta
                response_text = response.text.strip()
                # Remover possíveis marcadores de código
                if response_text.startswith("```"):
                    response_text = response_text.split("```")[1]
                    if response_text.startswith("json"):
                        response_text = response_text[4:]
                
                translation = json.loads(response_text.strip())
                
                # Criar artigo traduzido
                translated_article = {
                    "title": translation.get('title', article['title']),
                    "link": article['link'],
                    "summary": translation.get('summary', article['summary']),
                    "published": article['published'],
                    "content": translation.get('content', article['content']),
                    "source": article['source'],
                    "original_title": article['title']
                }
                
                # Salvar
                new_filename = f"traduzido_{filename}"
                new_filepath = Path("posts_traduzidos") / new_filename
                
                with open(new_filepath, 'w', encoding='utf-8') as f:
                    json.dump(translated_article, f, ensure_ascii=False, indent=2)
                    
                saved_files.append(new_filename)
                print(f"   ✅ Traduzido e salvo: {new_filepath}")
                
            except Exception as e:
                print(f"   ❌ Erro ao traduzir: {e}")
                
        print(f"\n✅ Total: {len(saved_files)} artigos traduzidos")
        return saved_files
        
    def step3_format(self, files: List[str]) -> List[str]:
        """Etapa 3: Formatar para Sanity"""
        print("\n" + "="*60)
        print("ETAPA 3: Formatando para Sanity...")
        print("="*60)
        
        saved_files = []
        
        for filename in files:
            filepath = Path("posts_traduzidos") / filename
            
            if not filepath.exists():
                print(f"❌ Arquivo não encontrado: {filepath}")
                continue
                
            print(f"\n📝 Formatando: {filename}")
            
            # Ler arquivo
            with open(filepath, 'r', encoding='utf-8') as f:
                article = json.load(f)
                
            # Formatar para Sanity
            from tools.formatter_tools import create_slug_simple
            
            formatted = {
                "_type": "post",
                "title": article['title'],
                "slug": {
                    "_type": "slug", 
                    "current": create_slug_simple(article['title'])
                },
                "publishedAt": datetime.now().isoformat() + "Z",
                "excerpt": article['summary'][:200],
                "content": [
                    {
                        "_type": "block",
                        "_key": f"block1",
                        "style": "normal",
                        "children": [
                            {
                                "_type": "span",
                                "_key": f"span1",
                                "text": article['content']
                            }
                        ]
                    }
                ],
                "originalSource": {
                    "url": article['link'],
                    "title": article.get('original_title', article['title']),
                    "site": article['source']
                }
            }
            
            # Salvar
            new_filename = filename.replace("traduzido_", "formatado_")
            new_filepath = Path("posts_formatados") / new_filename
            
            with open(new_filepath, 'w', encoding='utf-8') as f:
                json.dump(formatted, f, ensure_ascii=False, indent=2)
                
            saved_files.append(new_filename)
            print(f"   ✅ Formatado e salvo: {new_filepath}")
            
        print(f"\n✅ Total: {len(saved_files)} artigos formatados")
        return saved_files
        
    def run(self):
        """Executa o pipeline completo"""
        print("""
╔══════════════════════════════════════════════════════════════╗
║              PIPELINE MANUAL DE PROCESSAMENTO                 ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        # Etapa 1: Monitor RSS
        rss_files = self.step1_monitor_rss()
        
        if not rss_files:
            print("\n❌ Nenhum artigo coletado do RSS")
            return
            
        # Etapa 2: Tradução
        translated_files = self.step2_translate(rss_files)
        
        if not translated_files:
            print("\n❌ Nenhum artigo traduzido")
            return
            
        # Etapa 3: Formatação
        formatted_files = self.step3_format(translated_files)
        
        if not formatted_files:
            print("\n❌ Nenhum artigo formatado")
            return
            
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✅ PIPELINE CONCLUÍDO!                     ║
║                                                              ║
║   {len(rss_files)} artigos coletados do RSS                  ║
║   {len(translated_files)} artigos traduzidos                 ║  
║   {len(formatted_files)} artigos formatados                  ║
║                                                              ║
║   Próximos passos:                                           ║
║   1. python process_images_working.py                        ║
║   2. python publish_simple.py                                ║
╚══════════════════════════════════════════════════════════════╝
        """)

def main():
    """Função principal"""
    # Pegar limite de argumentos
    limit = 3
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except:
            pass
            
    # Executar pipeline
    pipeline = ManualPipeline(limit=limit)
    pipeline.run()

if __name__ == "__main__":
    main()