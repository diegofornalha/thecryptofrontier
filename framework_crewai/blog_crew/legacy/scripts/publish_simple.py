#!/usr/bin/env python3
"""
Script simplificado para publicar posts no Sanity - SEM TAGS
"""

import os
import sys
import json
import requests
from pathlib import Path

# Adicionar diretório ao path
sys.path.append(str(Path(__file__).parent))

# Carregar variáveis de ambiente
if Path(".env").exists():
    with open(".env", "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value

def publish_to_sanity(post_data, post_file):
    """Publica um post no Sanity sem tags"""
    try:
        # Configurações
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("SANITY_DATASET", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not all([project_id, api_token]):
            return {"success": False, "error": "Credenciais faltando"}
        
        # URL da API
        mutations_url = f"https://{project_id}.api.sanity.io/v2021-06-07/data/mutate/{dataset}"
        
        # Headers
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        # Adicionar campos necessários
        if "_id" not in post_data:
            post_data["_id"] = f"post-{post_data['slug']['current']}"
        
        # IMPORTANTE: Remover campos problemáticos
        fields_to_remove = ["tags", "categories", "author"]
        for field in fields_to_remove:
            if field in post_data:
                del post_data[field]
                print(f"   🚫 Campo '{field}' removido")
        
        # Mutation para criar ou atualizar o post
        mutation = {
            "mutations": [
                {
                    "createOrReplace": post_data
                }
            ]
        }
        
        # Enviar requisição
        response = requests.post(mutations_url, headers=headers, json=mutation)
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Post publicado com sucesso!")
            print(f"   ID: {post_data['_id']}")
            print(f"   Título: {post_data['title']}")
            
            # Mover arquivo para posts_publicados
            if post_file:
                published_dir = Path("posts_publicados")
                published_dir.mkdir(exist_ok=True)
                
                source_path = Path(post_file)
                dest_path = published_dir / source_path.name
                
                source_path.rename(dest_path)
                print(f"   📁 Movido para: {dest_path}")
            
            return {"success": True, "id": post_data['_id']}
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            print(f"❌ Erro ao publicar: {error_msg}")
            return {"success": False, "error": error_msg}
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    """Processa todos os posts disponíveis"""
    
    print("📤 PUBLICADOR SIMPLIFICADO (SEM TAGS)")
    print("=" * 60)
    
    # Verificar posts em diferentes diretórios
    # IMPORTANTE: Processar posts_com_imagem primeiro (tem prioridade)
    directories = ["posts_com_imagem", "posts_formatados", "posts_traduzidos"]
    
    # Rastrear posts já publicados para evitar duplicatas
    posts_publicados = set()
    
    for dir_name in directories:
        posts_dir = Path(dir_name)
        if not posts_dir.exists():
            continue
            
        posts = list(posts_dir.glob("*.json"))
        if not posts:
            continue
            
        print(f"\n📊 Encontrados {len(posts)} posts em {dir_name}")
        
        success_count = 0
        
        for i, post_file in enumerate(posts, 1):
            # Verificar se já foi publicado (evitar duplicatas)
            if post_file.name in posts_publicados:
                continue
                
            print(f"\n[{i}/{len(posts)}]", "=" * 50)
            
            try:
                # Carregar post
                with open(post_file, 'r', encoding='utf-8') as f:
                    post_data = json.load(f)
                
                print(f"📄 Publicando: {post_data.get('title', 'Sem título')}")
                
                # Publicar
                result = publish_to_sanity(post_data, post_file)
                
                if result.get("success"):
                    success_count += 1
                    posts_publicados.add(post_file.name)
                    
            except Exception as e:
                print(f"   ❌ Erro ao processar {post_file.name}: {str(e)}")
        
        if success_count > 0:
            print(f"\n✅ {success_count} posts publicados de {dir_name}")
    
    print("\n" + "=" * 60)
    print("📝 Posts publicados SEM tags/categorias/autor")
    print("   Para evitar erros de validação no Sanity")

if __name__ == "__main__":
    main()