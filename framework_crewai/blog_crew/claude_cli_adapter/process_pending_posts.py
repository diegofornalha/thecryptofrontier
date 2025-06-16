#!/usr/bin/env python3
"""
Processa posts pendentes salvos pelo webhook
Solução imediata enquanto resolvemos as permissões
"""
import json
import os
from pathlib import Path
from datetime import datetime

print("📦 Processando posts pendentes...\n")

# Diretório de posts pendentes (dentro do container webhook)
pending_dir = "/tmp/pending_posts"

# Verificar se estamos no container ou host
if not os.path.exists(pending_dir):
    print("⚠️  Diretório local não encontrado. Tentando via Docker...")
    
    # Listar posts pendentes via Docker
    import subprocess
    
    try:
        # Listar arquivos
        result = subprocess.run(
            ["docker", "exec", "crewai-webhook-server", "ls", "-la", "/tmp/pending_posts/"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("📁 Posts pendentes no container:")
            print(result.stdout)
            
            # Copiar arquivos do container
            files = [line.split()[-1] for line in result.stdout.strip().split('\n')[2:] if line and '.json' in line]
            
            local_pending = Path("./pending_posts")
            local_pending.mkdir(exist_ok=True)
            
            for file in files:
                print(f"\n📥 Copiando {file}...")
                subprocess.run([
                    "docker", "cp",
                    f"crewai-webhook-server:/tmp/pending_posts/{file}",
                    f"./pending_posts/{file}"
                ])
            
            pending_dir = "./pending_posts"
            
    except Exception as e:
        print(f"❌ Erro ao acessar container: {e}")
        exit(1)

# Processar posts
pending_path = Path(pending_dir)
if not pending_path.exists():
    print("❌ Nenhum post pendente encontrado")
    exit(0)

json_files = list(pending_path.glob("*.json"))
print(f"\n📊 Encontrados {len(json_files)} posts pendentes")

for json_file in json_files:
    print(f"\n{'='*60}")
    print(f"📄 Processando: {json_file.name}")
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        article = data.get('article', {})
        error_info = data.get('error', {})
        
        print(f"\n📝 Título: {article.get('title', 'Sem título')}")
        print(f"🔗 Slug: {article.get('slug', 'sem-slug')}")
        print(f"📅 Timestamp: {data.get('timestamp', 'N/A')}")
        print(f"❌ Erro original: {error_info.get('status')} - {error_info.get('message', '')[:100]}")
        
        # Opções de processamento
        print("\n🔧 OPÇÕES DE PROCESSAMENTO:")
        
        print("\n1. COPIAR PARA ÁREA DE STAGING:")
        staging_dir = Path("./staging_posts")
        staging_dir.mkdir(exist_ok=True)
        
        # Criar arquivo markdown
        md_file = staging_dir / f"{article.get('slug', 'post')}.md"
        with open(md_file, 'w') as f:
            f.write(f"---\n")
            f.write(f"title: {article.get('title', '')}\n")
            f.write(f"slug: {article.get('slug', '')}\n")
            f.write(f"excerpt: {article.get('excerpt', '')}\n")
            f.write(f"tags: {', '.join(article.get('tags', []))}\n")
            f.write(f"categories: {', '.join(article.get('categories', []))}\n")
            f.write(f"publishedAt: {article.get('publishedAt', datetime.now().isoformat())}\n")
            f.write(f"seo:\n")
            seo = article.get('seo', {})
            f.write(f"  metaTitle: {seo.get('metaTitle', '')}\n")
            f.write(f"  metaDescription: {seo.get('metaDescription', '')}\n")
            f.write(f"  keywords: {', '.join(seo.get('keywords', []))}\n")
            f.write(f"---\n\n")
            f.write(article.get('content', ''))
        
        print(f"   ✅ Salvo em: {md_file}")
        
        # Criar arquivo JSON limpo
        json_clean = staging_dir / f"{article.get('slug', 'post')}.json"
        with open(json_clean, 'w') as f:
            json.dump(article, f, indent=2, ensure_ascii=False)
        
        print(f"   ✅ JSON em: {json_clean}")
        
    except Exception as e:
        print(f"❌ Erro ao processar {json_file}: {e}")

print(f"\n{'='*60}")
print("📋 RESUMO")
print(f"{'='*60}")

print(f"\n✅ Posts processados: {len(json_files)}")
print(f"📁 Posts salvos em: ./staging_posts/")

print("\n🚀 PRÓXIMOS PASSOS:")
print("\n1. IMPORTAR MANUALMENTE:")
print("   - Copie o conteúdo dos arquivos .md")
print("   - Cole no editor do Strapi admin")

print("\n2. USAR SCRIPT JWT:")
print("   - Configure um usuário no Strapi")
print("   - Use create_posts_with_jwt.py")

print("\n3. IMPORTAÇÃO EM MASSA:")
print("   - Use os arquivos JSON em ./staging_posts/")
print("   - Crie um script de importação com JWT")

print("\n4. SOLUÇÃO DEFINITIVA:")
print("   - Configure as permissões corretas no Strapi")
print("   - Ou use autenticação JWT permanente")

# Criar script de importação
import_script = Path("./import_staging_posts.py")
with open(import_script, 'w') as f:
    f.write('''#!/usr/bin/env python3
"""
Importa posts do staging usando JWT
"""
import requests
import json
from pathlib import Path

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

# Ler JWT salvo (execute create_posts_with_jwt.py primeiro)
try:
    with open('.jwt_token', 'r') as f:
        JWT_TOKEN = f.read().strip()
except:
    print("❌ JWT não encontrado. Execute create_posts_with_jwt.py primeiro!")
    exit(1)

headers = {
    'Authorization': f'Bearer {JWT_TOKEN}',
    'Content-Type': 'application/json'
}

# Importar todos os JSONs do staging
staging_dir = Path('./staging_posts')
for json_file in staging_dir.glob('*.json'):
    print(f"\\n📤 Importando {json_file.name}...")
    
    with open(json_file, 'r') as f:
        article = json.load(f)
    
    post_data = {"data": article}
    
    resp = requests.post(
        f"{STRAPI_URL}/api/posts",
        headers=headers,
        json=post_data
    )
    
    if resp.status_code in [200, 201]:
        print(f"✅ Sucesso! ID: {resp.json().get('data', {}).get('id')}")
    else:
        print(f"❌ Erro: {resp.status_code}")
''')

print(f"\n💾 Script de importação criado: {import_script}")
os.chmod(import_script, 0o755)