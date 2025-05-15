#!/usr/bin/env python3
"""
Script para testar o fluxo completo de processamento de um artigo
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Adicionar diretório pai ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar modelos e conversores
from models import FeedArticle, TranslatedArticle, FormattedArticle, Post
from models import dict_to_post, post_to_sanity_format
from models.converters import fix_sanity_field_names, save_json_file

def create_directories():
    """Cria os diretórios necessários"""
    for directory in [
        "posts_para_traduzir",
        "posts_traduzidos",
        "posts_formatados",
        "posts_publicados"
    ]:
        Path(directory).mkdir(exist_ok=True)
    print("Diretórios criados com sucesso.")

def monitor_feeds():
    """Simula o monitoramento de feeds RSS"""
    print("\n1. MONITORAMENTO DE FEEDS")
    print("=========================")
    
    # Criar um artigo simulando um feed RSS
    feed_data = {
        "title": "Bitcoin Reaches New All-Time High After ETF Approval",
        "link": "https://www.coindesk.com/markets/2025/05/14/bitcoin-hits-new-all-time-high-after-etf-approval/",
        "summary": "Bitcoin hit a new all-time high after spot Bitcoin ETF approval",
        "published": datetime.now().isoformat(),
        "content": """Bitcoin has reached a new all-time high price today, surpassing its previous record. Analysts attribute this movement to the recent approval of spot Bitcoin ETFs by the SEC, which marks a historic moment for institutional adoption of cryptocurrencies.

Spot Bitcoin ETFs allow institutional and retail investors to gain exposure to Bitcoin without having to purchase and store the cryptocurrency directly. This removes a significant barrier to entry for new investors in the market.

Since the launch of ETFs in January, billions of dollars have flowed into these financial products, demonstrating strong institutional demand for Bitcoin as an asset class.

# Impact on the Market

According to Sarah Johnson, a crypto analyst at BlockResearch, the approval "represents a watershed moment for the entire crypto industry."

## Long-term Implications

Market observers believe this could lead to further mainstream adoption and potentially more regulatory clarity in the coming months.""",
        "source": "CoinDesk"
    }
    
    # Validar com Pydantic
    feed_article = FeedArticle(**feed_data)
    print(f"Artigo extraído do feed: {feed_article.title}")
    
    # Salvar no formato correto
    file_path = "posts_para_traduzir/para_traduzir_test.json"
    feed_dict = feed_article.model_dump()
    save_json_file(feed_dict, file_path)
    print(f"Artigo salvo em: {file_path}")
    
    return [file_path]

def translate_articles(file_paths):
    """Simula a tradução de artigos"""
    print("\n2. TRADUÇÃO DE ARTIGOS")
    print("======================")
    
    translated_files = []
    
    for file_path in file_paths:
        print(f"Traduzindo: {file_path}")
        
        # Ler o arquivo
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Simular tradução
        translated_data = {
            "title": "Bitcoin Atinge Nova Máxima Histórica Após Aprovação de ETFs",
            "link": data["link"],
            "summary": "Bitcoin atingiu novo recorde após aprovação de ETFs de Bitcoin à vista",
            "published": data["published"],
            "content": """O Bitcoin atingiu um novo recorde de preço hoje, superando sua máxima histórica anterior. Analistas atribuem este movimento à recente aprovação dos ETFs de Bitcoin à vista pela SEC, que marca um momento histórico para a adoção institucional de criptomoedas.

Os ETFs de Bitcoin à vista permitem que investidores institucionais e de varejo obtenham exposição ao Bitcoin sem precisar comprar e armazenar a criptomoeda diretamente. Isso remove uma barreira significativa para a entrada de novos investidores no mercado.

Desde o lançamento dos ETFs em janeiro, bilhões de dólares têm fluído para esses produtos financeiros, demonstrando forte demanda institucional pelo Bitcoin como classe de ativo.

# Impacto no Mercado

De acordo com Sarah Johnson, analista de criptomoedas da BlockResearch, a aprovação "representa um momento decisivo para toda a indústria cripto".

## Implicações de Longo Prazo

Observadores do mercado acreditam que isso pode levar a uma maior adoção mainstream e potencialmente mais clareza regulatória nos próximos meses.""",
            "source": data["source"],
            "original_title": data["title"]
        }
        
        # Validar com Pydantic
        translated_article = TranslatedArticle(**translated_data)
        print(f"Artigo traduzido: {translated_article.title}")
        
        # Salvar no formato correto
        base_name = os.path.basename(file_path)
        translated_file_path = f"posts_traduzidos/traduzido_{base_name}"
        translated_dict = translated_article.model_dump()
        save_json_file(translated_dict, translated_file_path)
        print(f"Tradução salva em: {translated_file_path}")
        
        translated_files.append(translated_file_path)
    
    return translated_files

def format_articles(file_paths):
    """Simula a formatação de artigos para o Sanity"""
    print("\n3. FORMATAÇÃO DE ARTIGOS")
    print("========================")
    
    formatted_files = []
    
    for file_path in file_paths:
        print(f"Formatando: {file_path}")
        
        # Ler o arquivo
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Processar o conteúdo para blocos Portable Text
        # Dividir o conteúdo em parágrafos
        paragraphs = [p.strip() for p in data["content"].split('\n\n') if p.strip()]
        blocks = []
        
        for p in paragraphs:
            # Detectar cabeçalhos
            if p.startswith('# '):
                blocks.append({
                    "_type": "block",
                    "_key": str(hash(p))[:8],
                    "style": "h1",
                    "children": [
                        {
                            "_type": "span",
                            "_key": str(hash(p + "_span"))[:8],
                            "text": p[2:].strip()
                        }
                    ]
                })
            elif p.startswith('## '):
                blocks.append({
                    "_type": "block",
                    "_key": str(hash(p))[:8],
                    "style": "h2",
                    "children": [
                        {
                            "_type": "span",
                            "_key": str(hash(p + "_span"))[:8],
                            "text": p[3:].strip()
                        }
                    ]
                })
            else:
                blocks.append({
                    "_type": "block",
                    "_key": str(hash(p))[:8],
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "_key": str(hash(p + "_span"))[:8],
                            "text": p
                        }
                    ]
                })
        
        # Criar artigo formatado
        formatted_data = {
            "_type": "post",
            "title": data["title"],
            "slug": {
                "_type": "slug",
                "current": data["title"].lower().replace(" ", "-").replace("á", "a").replace("ã", "a").replace("ç", "c").replace("ó", "o").replace("é", "e").replace("í", "i")
            },
            "publishedAt": data["published"],
            "excerpt": data["summary"],
            "content": blocks,
            "originalSource": {
                "url": data["link"],
                "title": data["original_title"],
                "site": data["source"]
            }
        }
        
        # Validar com Pydantic
        formatted_article = FormattedArticle(**formatted_data)
        print(f"Artigo formatado: {formatted_article.title}")
        
        # Salvar no formato correto
        base_name = os.path.basename(file_path).replace("traduzido_", "")
        formatted_file_path = f"posts_formatados/formatado_{base_name}"
        formatted_dict = formatted_article.model_dump()
        save_json_file(formatted_dict, formatted_file_path)
        print(f"Formatação salva em: {formatted_file_path}")
        
        formatted_files.append(formatted_file_path)
    
    return formatted_files

def publish_articles(file_paths):
    """Simula a publicação de artigos no Sanity"""
    print("\n4. PUBLICAÇÃO DE ARTIGOS")
    print("========================")
    
    published_files = []
    
    for file_path in file_paths:
        print(f"Publicando: {file_path}")
        
        # Ler o arquivo
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Converter para modelo Pydantic Post
        post_model = dict_to_post(data)
        print(f"Validação com modelo Post: OK")
        
        # Converter para formato Sanity
        sanity_post = post_to_sanity_format(post_model)
        
        # Em um cenário real, aqui chamaria a API do Sanity
        # Simular publicação bem-sucedida
        post_id = "generated_id_" + str(hash(post_model.title))[:8]
        print(f"Publicado no Sanity com ID: {post_id}")
        
        # Mover para pasta de publicados
        base_name = os.path.basename(file_path).replace("formatado_", "")
        published_file_path = f"posts_publicados/publicado_{base_name}"
        save_json_file(sanity_post, published_file_path)
        print(f"Arquivo movido para: {published_file_path}")
        
        published_files.append(published_file_path)
    
    return published_files

def run_full_flow():
    """Executa o fluxo completo"""
    # Criar diretórios
    create_directories()
    
    # 1. Monitorar feeds
    feed_files = monitor_feeds()
    
    # 2. Traduzir artigos
    translated_files = translate_articles(feed_files)
    
    # 3. Formatar artigos
    formatted_files = format_articles(translated_files)
    
    # 4. Publicar artigos
    published_files = publish_articles(formatted_files)
    
    # Mostrar resultado final
    print("\nRESULTADO FINAL")
    print("===============")
    print(f"Total de artigos processados: {len(published_files)}")
    print(f"Arquivos publicados: {published_files}")
    
    # Mostrar exemplo do artigo final
    if published_files:
        with open(published_files[0], 'r') as f:
            final_post = json.load(f)
        
        print("\nEXEMPLO DE ARTIGO FINAL (pronto para o Sanity):")
        print(json.dumps(final_post, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run_full_flow()