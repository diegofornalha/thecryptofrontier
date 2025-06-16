#!/usr/bin/env python3
"""
Script para configurar autenticação JWT e publicar o artigo
"""
import requests
import json
from pathlib import Path
from datetime import datetime

print("🔐 Configuração de Autenticação JWT para Publicação Automática")
print("="*60)

STRAPI_URL = 'https://ale-blog.agentesintegrados.com'

print("\n📋 INSTRUÇÕES PARA CRIAR USUÁRIO NO STRAPI:")
print("\n1️⃣ OPÇÃO A - Via Painel Admin (Recomendado):")
print("   a) Acesse: https://ale-blog.agentesintegrados.com/admin")
print("   b) Vá em: Content Manager → User")
print("   c) Clique em: Create new entry")
print("   d) Preencha:")
print("      - Username: blog-automation")
print("      - Email: blog-automation@system.local")
print("      - Password: (escolha uma senha segura)")
print("      - Confirmed: ✅ (marque como true)")
print("      - Blocked: ❌ (deixe desmarcado)")
print("      - Role: Authenticated")
print("   e) Clique em Save")
print("   f) Depois em Publish")

print("\n2️⃣ OPÇÃO B - Via Terminal do Container (se tiver acesso SSH):")
print("   docker exec -it strapi-v5 npm run strapi admin:create-user -- \\")
print("     --email=blog-automation@system.local \\")
print("     --password=SuaSenhaSegura123! \\")
print("     --firstname=Blog \\")
print("     --lastname=Automation")

print("\n" + "-"*60)
print("\n3️⃣ APÓS CRIAR O USUÁRIO, EXECUTE ESTE SCRIPT:")

# Solicitar credenciais
print("\nDigite as credenciais do usuário criado:")
email = input("Email: ").strip()
password = input("Password: ").strip()

if not email or not password:
    print("❌ Email e senha são obrigatórios!")
    exit(1)

print("\n🔄 Fazendo login...")

# Fazer login
login_data = {
    "identifier": email,
    "password": password
}

try:
    login_resp = requests.post(
        f"{STRAPI_URL}/api/auth/local",
        json=login_data,
        timeout=10
    )
    
    if login_resp.status_code == 200:
        auth_data = login_resp.json()
        jwt_token = auth_data.get('jwt')
        user_info = auth_data.get('user', {})
        
        print(f"✅ Login bem-sucedido!")
        print(f"   Usuário: {user_info.get('username', email)}")
        print(f"   ID: {user_info.get('id')}")
        
        # Salvar JWT
        with open('.jwt_token', 'w') as f:
            f.write(jwt_token)
        print(f"💾 JWT salvo em .jwt_token")
        
        # Salvar credenciais (opcional)
        save_creds = input("\nSalvar credenciais para uso futuro? (s/n): ").lower()
        if save_creds == 's':
            creds_data = {
                "email": email,
                "jwt": jwt_token,
                "expires_in": "7d",
                "created_at": datetime.now().isoformat()
            }
            with open('.strapi_credentials.json', 'w') as f:
                json.dump(creds_data, f, indent=2)
            print("💾 Credenciais salvas em .strapi_credentials.json")
        
        print("\n📤 Publicando artigo pendente...")
        
        # Carregar artigo
        article_file = Path("staging_posts/defi-yield-farming-2025-mercado-129-bilhoes-revolucionando-financas.json")
        if article_file.exists():
            with open(article_file, 'r') as f:
                article = json.load(f)
            
            # Preparar dados
            post_data = {
                "data": {
                    "title": article['title'],
                    "slug": article['slug'],
                    "content": article['content'],
                    "excerpt": article['excerpt'],
                    "status": "published",
                    "seo": article['seo'],
                    "tags": article['tags'],
                    "categories": article['categories'],
                    "publishedAt": datetime.now().isoformat()
                }
            }
            
            # Headers com JWT
            headers = {
                'Authorization': f'Bearer {jwt_token}',
                'Content-Type': 'application/json'
            }
            
            # Criar post
            post_resp = requests.post(
                f"{STRAPI_URL}/api/posts",
                headers=headers,
                json=post_data,
                timeout=30
            )
            
            if post_resp.status_code in [200, 201]:
                print("✅ ARTIGO PUBLICADO COM SUCESSO!")
                result = post_resp.json()
                post_id = result.get('data', {}).get('id')
                
                print(f"\n📊 Detalhes:")
                print(f"   ID: {post_id}")
                print(f"   URL da API: {STRAPI_URL}/api/posts/{post_id}")
                print(f"   Admin: {STRAPI_URL}/admin/content-manager/collection-types/api::post.post/{post_id}")
                print(f"   Preview: https://ale-blog-preview.agentesintegrados.com/blog/{article['slug']}")
                
                # Criar script automatizado
                print("\n📝 Criando script de automação...")
                automation_script = f'''#!/usr/bin/env python3
"""
Script automatizado para publicar posts
Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
import requests
import json
from datetime import datetime
from pathlib import Path

STRAPI_URL = '{STRAPI_URL}'
JWT_TOKEN = '{jwt_token}'

def publish_article(article_path):
    """Publica um artigo no Strapi"""
    with open(article_path, 'r') as f:
        article = json.load(f)
    
    if 'result' in article:
        article = article['result']
    
    post_data = {{
        "data": {{
            "title": article['title'],
            "slug": article['slug'],
            "content": article['content'],
            "excerpt": article['excerpt'],
            "status": "published",
            "seo": article.get('seo', {{}}),
            "tags": article.get('tags', []),
            "categories": article.get('categories', []),
            "publishedAt": datetime.now().isoformat()
        }}
    }}
    
    headers = {{
        'Authorization': f'Bearer {{JWT_TOKEN}}',
        'Content-Type': 'application/json'
    }}
    
    resp = requests.post(
        f"{{STRAPI_URL}}/api/posts",
        headers=headers,
        json=post_data
    )
    
    if resp.status_code in [200, 201]:
        result = resp.json()
        post_id = result['data']['id']
        print(f"✅ Publicado! ID: {{post_id}}")
        return post_id
    else:
        print(f"❌ Erro: {{resp.status_code}} - {{resp.text}}")
        return None

# Publicar todos os artigos do pipeline
if __name__ == "__main__":
    outputs_dir = Path("outputs")
    
    for json_file in outputs_dir.glob("*_output.json"):
        print(f"\\n📄 Processando: {{json_file.name}}")
        try:
            publish_article(json_file)
        except Exception as e:
            print(f"❌ Erro: {{e}}")
'''
                
                with open('auto_publish.py', 'w') as f:
                    f.write(automation_script)
                
                print("✅ Script de automação criado: auto_publish.py")
                
                # Atualizar pipeline
                print("\n🔄 Atualizando pipeline...")
                pipeline_update = f'''
# Adicione ao final do run_pipeline.py:

# Publicar automaticamente
from auto_publish import publish_article
if writer_output_path:
    post_id = publish_article(writer_output_path)
    if post_id:
        print(f"✅ Artigo publicado! ID: {{post_id}}")
'''
                
                with open('pipeline_update.txt', 'w') as f:
                    f.write(pipeline_update)
                
                print("📝 Instruções salvas em: pipeline_update.txt")
                
            else:
                print(f"❌ Erro ao publicar: {post_resp.status_code}")
                print(f"Resposta: {post_resp.text[:200]}")
                
                if post_resp.status_code == 403:
                    print("\n⚠️  Permissões insuficientes!")
                    print("1. Verifique se o usuário tem role 'Authenticated'")
                    print("2. Em Settings → Roles → Authenticated")
                    print("3. Marque as permissões para Post: find, findOne, create")
        
        else:
            print("⚠️  Nenhum artigo encontrado em staging_posts/")
            
    else:
        print(f"❌ Erro no login: {login_resp.status_code}")
        print(f"Resposta: {login_resp.text[:200]}")
        
        if login_resp.status_code == 400:
            print("\n💡 Possíveis causas:")
            print("1. Email ou senha incorretos")
            print("2. Usuário não confirmado (confirmed: false)")
            print("3. Usuário bloqueado (blocked: true)")
            
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*60)
print("📋 RESUMO")
print("="*60)

print("\nPara publicação automática funcionar:")
print("1. ✅ Pipeline de geração de conteúdo")
print("2. ✅ Webhook configurado")
print("3. ✅ Preview do blog")
print("4. ⏳ Criar usuário no Strapi (faltando)")
print("5. ⏳ Executar este script com as credenciais")

print("\nDepois de configurar, o pipeline será 100% automático!")
print("RSS → Análise → Geração → Publicação 🚀")