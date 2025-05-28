#!/usr/bin/env python3
"""
Teste de upload com JPEG
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

image_path = "generated_images/test_bitcoin_100k_20250528_030420.jpg"
project_id = os.getenv("SANITY_PROJECT_ID", "brby2yrg")
token = os.getenv("SANITY_API_TOKEN")

endpoint = f"https://{project_id}.api.sanity.io/v2021-10-21/assets/images/production"

print(f"Fazendo upload de JPEG: {image_path}")

with open(image_path, "rb") as f:
    response = requests.post(
        endpoint,
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("test_image.jpg", f, "image/jpeg")}
    )

print(f"Status: {response.status_code}")
if response.status_code in [200, 201]:
    print("✅ Upload realizado com sucesso!")
    result = response.json()
    print(f"Asset ID: {result['document']['_id']}")
    print(f"URL: {result['document']['url']}")
else:
    print(f"❌ Erro: {response.text}")