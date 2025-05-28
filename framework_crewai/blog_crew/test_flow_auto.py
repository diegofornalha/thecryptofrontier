#!/usr/bin/env python3
"""
Script automático de teste do fluxo completo
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

print("🧪 TESTE AUTOMÁTICO DO FLUXO COMPLETO")
print("=" * 50)

# 1. Criar artigo de teste
print("\n📝 Criando artigo de teste...")
Path("posts_formatados").mkdir(exist_ok=True)
Path("posts_com_imagem").mkdir(exist_ok=True)
Path("posts_imagens").mkdir(exist_ok=True)

test_article = {
    "title": "Bitcoin ultrapassa $100,000 em movimento histórico",
    "slug": "bitcoin-100k-historico-test",
    "excerpt": "Bitcoin atinge marca histórica de seis dígitos",
    "content": [
        {
            "_type": "block",
            "children": [
                {
                    "_type": "span",
                    "text": "O Bitcoin ultrapassou $100,000 hoje, marcando um momento histórico para as criptomoedas."
                }
            ]
        }
    ]
}

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
input_file = f"posts_formatados/test_bitcoin_{timestamp}.json"

with open(input_file, "w") as f:
    json.dump(test_article, f, indent=2)

print(f"✅ Artigo criado: {input_file}")

# 2. Executar pipeline de geração de imagem
print("\n🎨 Executando pipeline de geração de imagem...")

try:
    # Importar e executar
    from tools.image_generation_tools import generate_and_upload_image
    
    # Chamar a função interna diretamente
    result = generate_and_upload_image._run(
        title=test_article["title"],
        excerpt=test_article["excerpt"]
    )
    
    print("\n📊 Resultado:")
    print(json.dumps(result, indent=2, default=str))
    
    # Salvar resultado
    if "error" not in result:
        # Adicionar mainImage ao artigo
        if "asset" in result:
            test_article["mainImage"] = result["asset"]
        
        output_file = f"posts_com_imagem/test_bitcoin_{timestamp}.json"
        with open(output_file, "w") as f:
            json.dump(test_article, f, indent=2)
        
        print(f"\n✅ Arquivo com imagem salvo: {output_file}")
        
        # Verificar se a imagem foi salva
        if "image_path" in result:
            print(f"✅ Imagem local: {result['image_path']}")
    else:
        print(f"\n❌ Erro: {result['error']}")
        
        # Salvar sem imagem (fallback)
        output_file = f"posts_com_imagem/test_bitcoin_{timestamp}.json"
        with open(output_file, "w") as f:
            json.dump(test_article, f, indent=2)
        
        print(f"⚠️ Arquivo salvo SEM imagem (fallback): {output_file}")
        
except Exception as e:
    print(f"\n❌ Erro ao executar pipeline: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n✨ Teste finalizado!")