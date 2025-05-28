#!/usr/bin/env python3
"""
Teste simplificado de upload para Sanity
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Pegar a primeira imagem gerada
images_dir = Path("generated_images")
image_files = list(images_dir.glob("*.png"))

if not image_files:
    print("Nenhuma imagem encontrada")
    exit(1)

image_path = image_files[0]
print(f"Testando upload de: {image_path}")

# Credenciais
project_id = os.getenv("SANITY_PROJECT_ID", "brby2yrg")
token = os.getenv("SANITY_API_TOKEN")

if not token:
    print("SANITY_API_TOKEN não configurado")
    exit(1)

# Testar diferentes endpoints
endpoints = [
    f"https://{project_id}.api.sanity.io/v1/assets/images/production",
    f"https://{project_id}.api.sanity.io/v2021-06-07/assets/images/production",
    f"https://{project_id}.api.sanity.io/v2021-10-21/assets/images/production",
]

for endpoint in endpoints:
    print(f"\nTestando endpoint: {endpoint}")
    
    with open(image_path, "rb") as f:
        response = requests.post(
            endpoint,
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (image_path.name, f, "image/png")}
        )
    
    print(f"Status: {response.status_code}")
    if response.status_code in [200, 201]:
        print("✅ Sucesso!")
        print(response.json())
        break
    else:
        print(f"❌ Erro: {response.text[:200]}")