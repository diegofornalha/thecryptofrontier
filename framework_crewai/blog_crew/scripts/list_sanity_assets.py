#!/usr/bin/env python3
"""
Script para listar todos os Asset IDs (imagens) no Sanity
Lista detalhes como ID, URL, tamanho, formato e data de upload
"""

import os
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
# from tabulate import tabulate  # Removido para evitar dependência

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("list_assets")

# Sanity config
SANITY_PROJECT_ID = os.environ.get("SANITY_PROJECT_ID", "uvuq2a47")
SANITY_DATASET = "production"
SANITY_API_TOKEN = os.environ.get("SANITY_API_TOKEN")
SANITY_API_VERSION = "2023-05-03"

def get_api_url():
    """Retorna URL da API do Sanity para queries"""
    return f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"

def get_headers():
    """Retorna headers para requisição"""
    headers = {"Content-Type": "application/json"}
    if SANITY_API_TOKEN:
        headers["Authorization"] = f"Bearer {SANITY_API_TOKEN}"
    return headers

def format_size(size_bytes):
    """Formata tamanho em bytes para formato legível"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def list_all_assets(limit=100):
    """Lista todos os assets de imagem no Sanity"""
    logger.info(f"Buscando assets no projeto {SANITY_PROJECT_ID}...")
    
    # Query para buscar todos os image assets
    query = f'''*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0..{limit-1}]{{
        _id,
        _createdAt,
        _updatedAt,
        url,
        originalFilename,
        size,
        metadata {{
            dimensions {{
                width,
                height
            }},
            lqip
        }},
        extension,
        mimeType
    }}'''
    
    url = f"{get_api_url()}?query={query}"
    
    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        
        data = response.json()
        assets = data.get("result", [])
        
        if not assets:
            logger.info("Nenhum asset encontrado")
            return []
        
        logger.info(f"Encontrados {len(assets)} assets")
        return assets
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Erro ao buscar assets: {e}")
        return []
    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar resposta: {e}")
        return []

def find_assets_usage(asset_ids):
    """Busca onde cada asset está sendo usado"""
    usage = {}
    
    # Query para buscar posts que usam os assets
    for asset_id in asset_ids[:10]:  # Limitar para não fazer muitas queries
        query = f'''*[_type == "post" && mainImage.asset._ref == "{asset_id}"]{{
            _id,
            title,
            publishedAt
        }}'''
        
        url = f"{get_api_url()}?query={query}"
        
        try:
            response = requests.get(url, headers=get_headers())
            if response.status_code == 200:
                data = response.json()
                posts = data.get("result", [])
                if posts:
                    usage[asset_id] = posts[0].get("title", "Sem título")
        except:
            pass
    
    return usage

def display_assets(assets):
    """Exibe os assets em formato tabular simples"""
    
    print("\n" + "="*120)
    print(f"{'Asset ID':<35} {'Nome do Arquivo':<40} {'Tamanho':<10} {'Dimensões':<12} {'Formato':<8} {'Data Upload':<16}")
    print("="*120)
    
    for asset in assets:
        try:
            created_at = datetime.fromisoformat(asset.get("_createdAt", "").replace("Z", "+00:00"))
            created_str = created_at.strftime("%Y-%m-%d %H:%M")
        except:
            created_str = "N/A"
            
        dimensions = asset.get("metadata", {}).get("dimensions", {})
        
        asset_id = asset.get("_id", "")[:33] + ".." if len(asset.get("_id", "")) > 35 else asset.get("_id", "")
        filename = asset.get("originalFilename", "N/A")[:38] + ".." if len(asset.get("originalFilename", "N/A")) > 40 else asset.get("originalFilename", "N/A")
        size = format_size(asset.get("size", 0))
        dims = f"{dimensions.get('width', 0)}x{dimensions.get('height', 0)}"
        ext = asset.get("extension", "N/A").upper()
        
        print(f"{asset_id:<35} {filename:<40} {size:<10} {dims:<12} {ext:<8} {created_str:<16}")
    
    print("="*120)
    
    # Estatísticas
    total_size = sum(asset.get("size", 0) for asset in assets)
    print(f"\n📊 Estatísticas:")
    print(f"   Total de assets: {len(assets)}")
    print(f"   Tamanho total: {format_size(total_size)}")
    print(f"   Formatos: {', '.join(set(asset.get('extension', 'N/A').upper() for asset in assets))}")

def export_to_json(assets, filename="sanity_assets.json"):
    """Exporta lista de assets para JSON"""
    output_path = Path(filename)
    
    # Preparar dados simplificados
    export_data = []
    for asset in assets:
        export_data.append({
            "id": asset.get("_id"),
            "filename": asset.get("originalFilename"),
            "url": asset.get("url"),
            "size": asset.get("size"),
            "dimensions": asset.get("metadata", {}).get("dimensions", {}),
            "created": asset.get("_createdAt"),
            "format": asset.get("extension")
        })
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✅ Assets exportados para {output_path}")

def main():
    """Função principal"""
    print("\n" + "="*60)
    print("       LISTAR ASSETS DO SANITY")
    print("="*60)
    
    # Verificar credenciais
    if not SANITY_API_TOKEN:
        logger.error("❌ SANITY_API_TOKEN não configurado!")
        return
    
    # Listar assets
    assets = list_all_assets(limit=1000)  # Aumentar limite se necessário
    
    if assets:
        # Exibir assets
        display_assets(assets)
        
        # Exportar automaticamente
        export_to_json(assets)
        
        # Mostrar alguns detalhes dos primeiros assets
        print("\n📄 Detalhes dos primeiros assets:")
        for i, asset in enumerate(assets[:3]):  # Mostrar só os 3 primeiros
            asset_id = asset.get("_id", "")
            print(f"\n{i+1}. Asset ID: {asset_id}")
            print(f"   Nome: {asset.get('originalFilename', 'N/A')}")
            print(f"   URL: {asset.get('url', 'N/A')[:80]}...")
            print(f"   Tamanho: {format_size(asset.get('size', 0))}")
            dims = asset.get("metadata", {}).get("dimensions", {})
            print(f"   Dimensões: {dims.get('width', 0)}x{dims.get('height', 0)}")
            print(f"   Formato: {asset.get('mimeType', 'N/A')}")
            
            # Verificar uso
            usage = find_assets_usage([asset_id])
            if asset_id in usage:
                print(f"   ✅ Usado no post: {usage[asset_id]}")
            else:
                print("   ⚠️  Não está sendo usado em nenhum post")

if __name__ == "__main__":
    main()