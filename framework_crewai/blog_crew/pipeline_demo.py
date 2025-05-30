#!/usr/bin/env python3
"""
Pipeline de demonstração - Simula tradução quando não há API key
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

class DemoPipeline:
    """Pipeline de demonstração que simula tradução"""
    
    def __init__(self, limit: int = 3):
        self.limit = limit
        self.ensure_directories()
        
    def ensure_directories(self):
        """Garante que os diretórios existem"""
        dirs = [
            "posts_para_traduzir",
            "posts_traduzidos", 
            "posts_formatados"
        ]
        for d in dirs:
            Path(d).mkdir(exist_ok=True)
            
    def simulate_translation(self, text):
        """Simula tradução adicionando [PT-BR] no início"""
        translations = {
            "Bitcoin": "Bitcoin",
            "Ethereum": "Ethereum", 
            "Cardano": "Cardano",
            "price": "preço",
            "market": "mercado",
            "crypto": "cripto",
            "cryptocurrency": "criptomoeda",
            "rally": "alta",
            "analyst": "analista",
            "DeFi": "DeFi",
            "blockchain": "blockchain"
        }
        
        result = text
        for en, pt in translations.items():
            result = result.replace(en, pt)
            
        return f"{result}"
        
    def run(self):
        """Executa pipeline de demonstração"""
        print("""
╔══════════════════════════════════════════════════════════════╗
║              PIPELINE DE DEMONSTRAÇÃO                         ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        # Verificar se há posts para processar
        source_dir = Path("posts_para_traduzir")
        files = list(source_dir.glob("*.json"))
        
        if not files:
            print("❌ Nenhum post encontrado em posts_para_traduzir")
            return
            
        print(f"\n✅ Encontrados {len(files)} posts para processar")
        
        # Processar cada arquivo
        for file in files[:self.limit]:
            print(f"\n📄 Processando: {file.name}")
            
            # Ler arquivo
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # ETAPA 1: Simular tradução
            print("   🌐 Simulando tradução...")
            translated = {
                "title": self.simulate_translation(data.get('title', '')),
                "link": data.get('link', ''),
                "summary": self.simulate_translation(data.get('summary', '')),
                "published": data.get('published', ''),
                "content": self.simulate_translation(data.get('content', '')),
                "source": data.get('source', ''),
                "original_title": data.get('title', '')
            }
            
            # Salvar tradução
            trans_file = Path("posts_traduzidos") / f"traduzido_{file.name}"
            with open(trans_file, 'w', encoding='utf-8') as f:
                json.dump(translated, f, ensure_ascii=False, indent=2)
            print(f"   ✅ Traduzido: {trans_file}")
            
            # ETAPA 2: Formatar para Sanity
            print("   📝 Formatando para Sanity...")
            
            from tools.formatter_tools import create_slug_simple
            
            formatted = {
                "_type": "post",
                "title": translated['title'],
                "slug": {
                    "_type": "slug",
                    "current": create_slug_simple(translated['title'])
                },
                "publishedAt": datetime.now().isoformat() + "Z",
                "excerpt": translated['summary'][:200],
                "content": [
                    {
                        "_type": "block",
                        "_key": "block1",
                        "style": "normal",
                        "children": [
                            {
                                "_type": "span",
                                "_key": "span1",
                                "text": translated['content']
                            }
                        ]
                    }
                ],
                "originalSource": {
                    "url": translated['link'],
                    "title": translated.get('original_title', ''),
                    "site": translated['source']
                }
            }
            
            # Salvar formatado
            format_file = Path("posts_formatados") / f"formatado_{file.name}"
            with open(format_file, 'w', encoding='utf-8') as f:
                json.dump(formatted, f, ensure_ascii=False, indent=2)
            print(f"   ✅ Formatado: {format_file}")
            
        # Resumo
        formatted_files = list(Path("posts_formatados").glob("*.json"))
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    ✅ DEMONSTRAÇÃO CONCLUÍDA                  ║
║                                                              ║
║   {len(formatted_files)} posts prontos para imagens          ║
║                                                              ║
║   Próximos passos:                                           ║
║   1. python process_images_working.py                        ║
║   2. python publish_simple.py                                ║
╚══════════════════════════════════════════════════════════════╝
        """)

if __name__ == "__main__":
    pipeline = DemoPipeline()
    pipeline.run()