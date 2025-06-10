#!/usr/bin/env python3
"""
Verify which project the token belongs to
"""

import requests

# The admin token you provided
SANITY_API_TOKEN = "sk02r4goMTy2MoCnt5i4nbLBvI0yX6IjvhXTwTCH1LOIDrkhIUktdhzLiHd9e4BhFhuH0lO3JlnpWINrgL8oelrWQdmkiI393pBDk2oH5pyDbq4ZzraOLbedW3gyYKIC6U0byjN5XHkaLlDAI4RUii8HcNsD76qVp4Ce9aUgnkjazMz7FAgd"

def test_token(project_id, dataset="production"):
    """Test token with a specific project"""
    print(f"\n🔍 Testing token with project: {project_id}")
    
    # Simple query to test authentication
    query = '*[_type == "post"][0]'
    url = f"https://{project_id}.api.sanity.io/v2023-05-03/data/query/{dataset}?query={query}"
    
    headers = {
        "Authorization": f"Bearer {SANITY_API_TOKEN}"
    }
    
    response = requests.get(url, headers=headers)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Token is valid for this project!")
        result = response.json()
        if result.get('result'):
            print(f"Found data: {type(result['result'])}")
        return True
    else:
        print(f"❌ Error: {response.text[:200]}")
        return False

print("=" * 60)
print("TOKEN VERIFICATION")
print("=" * 60)
print(f"Token: {SANITY_API_TOKEN[:20]}...{SANITY_API_TOKEN[-10:]}")
print(f"Token length: {len(SANITY_API_TOKEN)}")

# Test with both projects
print("\n1️⃣ Testing with OLD project (brby2yrg):")
old_valid = test_token("brby2yrg")

print("\n2️⃣ Testing with NEW project (uvuq2a47):")
new_valid = test_token("uvuq2a47")

print("\n" + "=" * 60)
print("RESULTADO:")
if old_valid and not new_valid:
    print("⚠️  Este token pertence ao projeto ANTIGO (brby2yrg)")
    print("❌ Não pode ser usado com o novo projeto (uvuq2a47)")
    print("\n📝 Você precisa criar um novo token em:")
    print("   https://www.sanity.io/manage/project/uvuq2a47/api")
elif new_valid:
    print("✅ Token válido para o novo projeto!")
else:
    print("❓ Token inválido ou expirado")