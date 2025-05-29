#!/usr/bin/env python3
"""
Processador de imagens CORRIGIDO - upload binário direto
Baseado na documentação oficial do Sanity
"""

import os
import sys
import json
import logging
import openai
import requests
from datetime import datetime
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("process_images")

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

# Configurações visuais
BRAND_STYLE = {
    "style": "3D photorealistic cryptocurrency rendering",
    "background": "Pure black (#000000) with subtle blue tech grid",
    "lighting": "Blue rim lighting (#003366) with top-down key light",
    "effects": "Circular cyan energy waves radiating from center",
    "quality": "ultra high definition, sharp details, professional rendering"
}

# Templates para criptomoedas
CRYPTO_TEMPLATES = {
    "bitcoin": {
        "symbol": "Bitcoin logo 3D volumetric orange coin with B symbol",
        "color": "golden orange metallic"
    },
    "ethereum": {
        "symbol": "Ethereum logo 3D volumetric diamond shape",
        "color": "silver and blue metallic"
    },
    "crypto": {  # Genérico
        "symbol": "Multiple 3D cryptocurrency coins floating",
        "color": "mixed metallic colors (gold, silver, bronze)"
    }
}

def detect_crypto(text):
    """Detecta criptomoedas no texto"""
    text_lower = text.lower()
    
    crypto_keywords = {
        "bitcoin": ["bitcoin", "btc"],
        "ethereum": ["ethereum", "eth", "ether"],
    }
    
    for crypto, keywords in crypto_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                return crypto
    
    return "crypto"

def generate_crypto_prompt(crypto, title):
    """Gera prompt para DALL-E"""
    template = CRYPTO_TEMPLATES.get(crypto, CRYPTO_TEMPLATES["crypto"])
    
    prompt = f"""
    {template['symbol']}
    Visual style: {BRAND_STYLE['style']}
    Color: {template['color']}
    Background: {BRAND_STYLE['background']}
    Lighting: {BRAND_STYLE['lighting']}
    Effects: {BRAND_STYLE['effects']}
    Format: 1792x1024 landscape
    Quality: {BRAND_STYLE['quality']}
    Context: {title[:100]}
    """
    
    return prompt

def upload_image_to_sanity_binary(image_path, alt_text):
    """Upload binário direto para Sanity (método correto da documentação)"""
    try:
        # Configurações
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = os.environ.get("SANITY_DATASET", "production")
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not all([project_id, api_token]):
            return {"success": False, "error": "Credenciais faltando"}
        
        # URL da API - usando v2021-06-07 como na documentação
        upload_url = f"https://{project_id}.api.sanity.io/v2021-06-07/assets/images/{dataset}"
        
        # Detectar tipo MIME baseado na extensão
        ext = Path(image_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        }
        content_type = mime_types.get(ext, 'image/png')
        
        print(f"   📤 Fazendo upload binário para Sanity...")
        print(f"   📋 Content-Type: {content_type}")
        
        # Headers
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": content_type
        }
        
        # Upload binário direto
        with open(image_path, 'rb') as f:
            response = requests.post(upload_url, headers=headers, data=f)
        
        if response.status_code in [200, 201]:
            result = response.json()
            asset_id = result.get('document', {}).get('_id') or result.get('_id')
            
            if asset_id:
                print(f"   ✅ Upload OK! Asset ID: {asset_id}")
                
                return {
                    "success": True,
                    "asset_id": asset_id,
                    "mainImage": {
                        "_type": "mainImage",
                        "asset": {
                            "_type": "reference",
                            "_ref": asset_id
                        },
                        "alt": alt_text
                    }
                }
            else:
                return {"success": False, "error": "Asset ID não encontrado na resposta"}
        else:
            error_msg = f"HTTP {response.status_code}: {response.text}"
            return {"success": False, "error": error_msg}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def process_post(post_data, post_file):
    """Processa um único post"""
    
    title = post_data.get("title", "")
    excerpt = post_data.get("excerpt", "")
    
    print(f"\n📄 Processando: {title[:60]}...")
    
    # Verificar se já tem imagem
    if post_data.get("mainImage"):
        print("   ⏭️  Post já tem imagem, pulando...")
        return None
    
    # Verificar API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("   ❌ OPENAI_API_KEY não configurada")
        return None
    
    client = openai.OpenAI(api_key=api_key)
    
    # Detectar criptomoeda
    crypto = detect_crypto(f"{title} {excerpt}")
    print(f"   🪙 Crypto: {crypto}")
    
    # Gerar prompt
    prompt = generate_crypto_prompt(crypto, title)
    
    try:
        # Gerar imagem
        print("   🎨 Gerando imagem com DALL-E 3...")
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",
            quality="hd",
            n=1
        )
        
        image_url = response.data[0].url
        print("   ✅ Imagem gerada!")
        
        # Baixar imagem
        print("   📥 Baixando imagem...")
        img_response = requests.get(image_url, timeout=30)
        
        if img_response.status_code == 200:
            # Criar diretório temporário
            temp_dir = Path("temp_images")
            temp_dir.mkdir(exist_ok=True)
            
            # Salvar como PNG
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            temp_file = temp_dir / f"crypto_{crypto}_{timestamp}.png"
            
            with open(temp_file, 'wb') as f:
                f.write(img_response.content)
            
            print(f"   💾 Imagem temporária: {temp_file}")
            
            # Upload para Sanity
            alt_text = f"Imagem ilustrativa sobre {title[:100]}"
            upload_result = upload_image_to_sanity_binary(str(temp_file), alt_text)
            
            if upload_result.get("success"):
                # Adicionar mainImage ao post
                post_data["mainImage"] = upload_result["mainImage"]
                
                # Salvar em posts_com_imagem
                output_dir = Path("posts_com_imagem")
                output_dir.mkdir(exist_ok=True)
                
                output_file = output_dir / Path(post_file).name
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(post_data, f, ensure_ascii=False, indent=2)
                
                print(f"   ✅ Post salvo: {output_file}")
                
                # Limpar arquivo temporário
                temp_file.unlink()
                
                # Salvar imagem permanente
                perm_dir = Path("posts_imagens")
                perm_dir.mkdir(exist_ok=True)
                perm_file = perm_dir / f"{Path(post_file).stem}.png"
                
                # Baixar novamente para arquivo permanente
                img_response2 = requests.get(image_url, timeout=30)
                if img_response2.status_code == 200:
                    with open(perm_file, 'wb') as f:
                        f.write(img_response2.content)
                    print(f"   💾 Imagem permanente: {perm_file}")
                
                return {
                    "success": True,
                    "asset_id": upload_result["asset_id"],
                    "file": str(output_file)
                }
            else:
                print(f"   ❌ Upload falhou: {upload_result.get('error')}")
                # Limpar arquivo temporário
                if temp_file.exists():
                    temp_file.unlink()
                
        else:
            print(f"   ❌ Erro ao baixar: HTTP {img_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return None

def main():
    """Processa todos os posts formatados"""
    
    print("🎨 PROCESSADOR DE IMAGENS - VERSÃO FINAL CORRIGIDA")
    print("=" * 60)
    print("Upload binário direto conforme documentação Sanity")
    print("=" * 60)
    
    # Verificar configurações
    required_vars = ["OPENAI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
    missing = [v for v in required_vars if not os.getenv(v)]
    
    if missing:
        print(f"\n❌ Variáveis faltando: {', '.join(missing)}")
        return
    
    print("✅ Configurações OK")
    
    # Verificar posts formatados
    posts_dir = Path("posts_formatados")
    if not posts_dir.exists():
        print("\n❌ Diretório 'posts_formatados' não encontrado!")
        return
    
    posts = list(posts_dir.glob("*.json"))
    if not posts:
        print("\n❌ Nenhum post formatado encontrado!")
        return
    
    print(f"\n📊 Encontrados {len(posts)} posts")
    
    # Limpar diretório temporário
    temp_dir = Path("temp_images")
    if temp_dir.exists():
        for f in temp_dir.glob("*"):
            f.unlink()
    
    # Processar posts
    success_count = 0
    
    for i, post_file in enumerate(posts, 1):
        print(f"\n[{i}/{len(posts)}]", "=" * 50)
        
        try:
            with open(post_file, 'r', encoding='utf-8') as f:
                post_data = json.load(f)
            
            result = process_post(post_data, post_file)
            
            if result and result.get("success"):
                success_count += 1
                
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
    
    # Limpar diretório temporário
    if temp_dir.exists():
        for f in temp_dir.glob("*"):
            f.unlink()
        temp_dir.rmdir()
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO:")
    print(f"   • Total: {len(posts)}")
    print(f"   • ✅ Com imagem: {success_count}")
    print(f"   • ❌ Sem imagem: {len(posts) - success_count}")
    
    if success_count > 0:
        print(f"\n🎉 SUCESSO! {success_count} posts prontos!")
        print("   📁 Posts com imagem: posts_com_imagem/")
        print("   🖼️  Imagens salvas: posts_imagens/")
        print("\n   Próximo passo: publicar no Sanity")

if __name__ == "__main__":
    main()