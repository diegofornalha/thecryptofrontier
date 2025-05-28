#!/usr/bin/env python3
"""
Script de teste completo do fluxo de geração de imagens
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Adicionar diretório ao path
sys.path.append(str(Path(__file__).parent))

def create_test_article():
    """Criar um artigo de teste"""
    print("📝 Criando artigo de teste...")
    
    # Criar diretórios necessários
    dirs = ["posts_formatados", "posts_com_imagem", "posts_publicados", "posts_imagens"]
    for dir_name in dirs:
        Path(dir_name).mkdir(exist_ok=True)
    
    # Artigo de teste
    test_article = {
        "title": "Bitcoin ultrapassa $100,000 em movimento histórico do mercado",
        "slug": "bitcoin-ultrapassa-100k-historico",
        "excerpt": "O Bitcoin atingiu uma marca histórica ao ultrapassar os $100,000, consolidando sua posição como a principal criptomoeda do mundo.",
        "content": [
            {
                "_type": "block",
                "_key": "test123",
                "style": "normal",
                "markDefs": [],
                "children": [
                    {
                        "_type": "span",
                        "_key": "span123",
                        "text": "Em um movimento histórico, o Bitcoin ultrapassou a marca dos $100,000 pela primeira vez. Este marco representa não apenas um novo recorde de preço, mas também a crescente aceitação institucional das criptomoedas. Analistas apontam que a combinação de fatores macroeconômicos e a entrada de grandes investidores institucionais foram cruciais para este movimento.",
                        "marks": []
                    }
                ]
            }
        ],
        "author": {
            "_type": "reference",
            "_ref": "author-crypto-frontier"
        },
        "categories": [
            {
                "_type": "reference",
                "_ref": "category-bitcoin"
            }
        ],
        "tags": [
            {
                "_type": "reference",
                "_ref": "tag-bitcoin"
            },
            {
                "_type": "reference",
                "_ref": "tag-mercado"
            }
        ],
        "originalSource": {
            "url": "https://example.com/bitcoin-100k",
            "title": "Bitcoin reaches $100k",
            "site": "Crypto News Test"
        }
    }
    
    # Salvar arquivo
    filename = f"formatado_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = Path("posts_formatados") / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(test_article, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Artigo de teste criado: {filepath}")
    return filepath

def test_image_generation_flow():
    """Testar o fluxo de geração de imagem"""
    print("\n🎨 Testando geração de imagem...")
    
    # Importar as ferramentas necessárias
    try:
        from agents.image_generator_agent import ImageGeneratorAgent
        from tools import tools
        
        # Criar agente
        agent = ImageGeneratorAgent.create(tools)
        print("✅ Agente de imagem criado com sucesso")
        
        # Simular a tarefa de geração
        from tasks.image_generation_task import create_image_generation_task
        task = create_image_generation_task(agent)
        print("✅ Tarefa de geração criada")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar agente/tarefa: {str(e)}")
        return False

def test_direct_image_generation(article_path):
    """Testar geração direta de imagem"""
    print("\n🖼️ Testando geração direta de imagem...")
    
    try:
        # Ler artigo
        with open(article_path, "r", encoding="utf-8") as f:
            article = json.load(f)
        
        # Importar ferramenta
        from tools.image_generation_tools import generate_crypto_image
        
        # Gerar imagem
        print(f"📸 Gerando imagem para: {article['title']}")
        result = generate_crypto_image._run(
            title=article["title"],
            summary=article.get("excerpt", ""),
            full_text=article.get("content", "")[0]["children"][0]["text"] if article.get("content") else ""
        )
        
        if "error" in result:
            print(f"❌ Erro ao gerar imagem: {result['error']}")
            return None
        else:
            print(f"✅ Imagem gerada com sucesso!")
            print(f"   - Arquivo: {result['image_path']}")
            print(f"   - Alt text: {result['alt_text']}")
            print(f"   - Criptomoedas detectadas: {result.get('detected_cryptos', [])}")
            return result
            
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def test_sanity_upload(image_result):
    """Testar upload para Sanity"""
    print("\n☁️ Testando upload para Sanity...")
    
    if not image_result:
        print("⚠️ Sem imagem para fazer upload")
        return None
    
    try:
        from tools.image_generation_tools import upload_image_to_sanity
        
        result = upload_image_to_sanity._run(
            image_path=image_result["image_path"],
            alt_text=image_result["alt_text"]
        )
        
        if "error" in result:
            print(f"❌ Erro no upload: {result['error']}")
            return None
        else:
            print(f"✅ Upload realizado com sucesso!")
            print(f"   - Asset: {json.dumps(result['asset'], indent=2)}")
            return result
            
    except Exception as e:
        print(f"❌ Erro no upload: {str(e)}")
        return None

def test_complete_pipeline():
    """Testar pipeline completo"""
    print("\n🚀 Testando pipeline completo...")
    
    try:
        from tools.image_generation_tools import generate_and_upload_image
        
        # Criar artigo de teste
        article_path = create_test_article()
        
        # Ler artigo
        with open(article_path, "r", encoding="utf-8") as f:
            article = json.load(f)
        
        # Gerar e fazer upload
        result = generate_and_upload_image._run(
            title=article["title"],
            summary=article.get("excerpt", ""),
            full_text=article.get("content", "")[0]["children"][0]["text"] if article.get("content") else ""
        )
        
        if "error" in result:
            print(f"❌ Erro no pipeline: {result['error']}")
            
            # Criar arquivo em posts_com_imagem mesmo sem imagem (fallback)
            output_path = Path("posts_com_imagem") / f"com_imagem_{article_path.stem}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
            print(f"⚠️ Arquivo salvo sem imagem (fallback): {output_path}")
            
        else:
            print(f"✅ Pipeline completo executado com sucesso!")
            
            # Adicionar mainImage ao artigo
            if "asset" in result:
                article["mainImage"] = result["asset"]
            
            # Salvar em posts_com_imagem
            output_path = Path("posts_com_imagem") / f"com_imagem_{article_path.stem}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(article, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Arquivo salvo com imagem: {output_path}")
            
            # Mostrar estrutura do mainImage
            print("\n📋 Estrutura do mainImage:")
            print(json.dumps(article.get("mainImage", {}), indent=2))
            
    except Exception as e:
        print(f"❌ Erro no pipeline: {str(e)}")
        import traceback
        traceback.print_exc()

def check_environment():
    """Verificar configuração do ambiente"""
    print("🔍 Verificando ambiente...")
    
    checks = {
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "SANITY_PROJECT_ID": os.getenv("SANITY_PROJECT_ID"),
        "SANITY_API_TOKEN": os.getenv("SANITY_API_TOKEN"),
        "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY")
    }
    
    all_ok = True
    for key, value in checks.items():
        if value:
            print(f"✅ {key}: Configurado")
        else:
            print(f"❌ {key}: NÃO configurado")
            all_ok = False
    
    return all_ok

if __name__ == "__main__":
    print("🧪 TESTE COMPLETO DO FLUXO DE GERAÇÃO DE IMAGENS")
    print("=" * 50)
    
    # Verificar ambiente
    if not check_environment():
        print("\n⚠️ Configure as variáveis de ambiente antes de continuar!")
        sys.exit(1)
    
    # Menu de opções
    print("\nEscolha o teste:")
    print("1. Teste completo (recomendado)")
    print("2. Apenas geração de imagem")
    print("3. Apenas upload para Sanity")
    print("4. Verificar agentes e tarefas")
    
    choice = input("\nOpção (1-4): ").strip()
    
    if choice == "1":
        test_complete_pipeline()
    elif choice == "2":
        article_path = create_test_article()
        test_direct_image_generation(article_path)
    elif choice == "3":
        article_path = create_test_article()
        image_result = test_direct_image_generation(article_path)
        if image_result:
            test_sanity_upload(image_result)
    elif choice == "4":
        test_image_generation_flow()
    else:
        print("Opção inválida!")
    
    print("\n✨ Teste finalizado!")