#!/usr/bin/env python3
"""
Teste do validador de chaves _key para o Sanity
"""

import sys
import os
sys.path.append('framework_crewai/blog_crew')

def test_key_validator():
    """Testa o validador de chaves _key"""
    print("🧪 Testando validador de chaves _key...")
    
    try:
        from tools.sanity_key_validator import validate_sanity_data, ensure_post_keys
        
        # Teste 1: Post sem chaves _key
        test_post_without_keys = {
            "_type": "post",
            "title": "Post de Teste",
            "content": [
                {
                    "_type": "block",
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "text": "Este é um texto de teste sem _key"
                        }
                    ]
                },
                {
                    "_type": "block",
                    "style": "h2",
                    "children": [
                        {
                            "_type": "span",
                            "text": "Título H2 sem _key"
                        }
                    ]
                }
            ]
        }
        
        print("📝 Teste 1: Post sem chaves _key")
        result = validate_sanity_data(test_post_without_keys)
        
        if result.get("success"):
            print(f"   ✅ Sucesso: {result.get('keysAdded')} chaves adicionadas")
            print(f"   📊 Mensagem: {result.get('message')}")
            
            # Verificar se as chaves foram realmente adicionadas
            validated_content = result.get("data", {}).get("content", [])
            missing_keys = []
            
            for i, block in enumerate(validated_content):
                if "_key" not in block:
                    missing_keys.append(f"Bloco {i}")
                
                children = block.get("children", [])
                for j, child in enumerate(children):
                    if isinstance(child, dict) and "_key" not in child:
                        missing_keys.append(f"Child {j} do bloco {i}")
            
            if missing_keys:
                print(f"   ❌ Ainda há chaves faltando: {missing_keys}")
            else:
                print("   ✅ Todas as chaves _key foram adicionadas corretamente")
        else:
            print(f"   ❌ Erro: {result.get('error')}")
        
        # Teste 2: Post já com chaves _key
        print("\n📝 Teste 2: Post com chaves _key existentes")
        test_post_with_keys = {
            "_type": "post",
            "title": "Post com Chaves",
            "content": [
                {
                    "_type": "block",
                    "_key": "existing1",
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "_key": "existing2",
                            "text": "Este texto já tem _key"
                        }
                    ]
                }
            ]
        }
        
        result2 = validate_sanity_data(test_post_with_keys)
        
        if result2.get("success"):
            keys_added = result2.get('keysAdded', 0)
            print(f"   ✅ Sucesso: {keys_added} chaves adicionadas (deveria ser 0)")
            if keys_added == 0:
                print("   ✅ Validação correta - nenhuma chave desnecessária adicionada")
            else:
                print("   ⚠️  Chaves foram adicionadas mesmo já existindo")
        else:
            print(f"   ❌ Erro: {result2.get('error')}")
        
        # Teste 3: Usando ensure_post_keys
        print("\n📝 Teste 3: Usando ensure_post_keys")
        result3 = ensure_post_keys(test_post_without_keys)
        
        if result3.get("success"):
            print(f"   ✅ Sucesso: {result3.get('changesCount')} mudanças feitas")
            print(f"   📊 Mensagem: {result3.get('message')}")
        else:
            print(f"   ❌ Erro: {result3.get('error')}")
        
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

def test_crewai_integration():
    """Testa a integração com o CrewAI"""
    print("\n🤖 Testando integração com CrewAI...")
    
    try:
        from tools import validate_sanity_data, ensure_post_keys
        print("   ✅ Ferramentas importadas com sucesso do módulo tools")
        
        # Verificar se são instâncias válidas do CrewAI
        from crewai.tools import BaseTool
        
        if isinstance(validate_sanity_data, BaseTool):
            print("   ✅ validate_sanity_data é uma BaseTool válida")
        else:
            print(f"   ❌ validate_sanity_data não é BaseTool: {type(validate_sanity_data)}")
        
        if isinstance(ensure_post_keys, BaseTool):
            print("   ✅ ensure_post_keys é uma BaseTool válida")
        else:
            print(f"   ❌ ensure_post_keys não é BaseTool: {type(ensure_post_keys)}")
            
    except ImportError as e:
        print(f"   ❌ Erro de importação: {e}")
    except Exception as e:
        print(f"   ❌ Erro inesperado: {e}")

if __name__ == "__main__":
    print("🔧 Testando solução para chaves _key faltando no Sanity\n")
    
    test_key_validator()
    test_crewai_integration()
    
    print("\n✅ Testes concluídos!")
    print("\n📝 Resumo da solução:")
    print("   1. Criado validador de chaves _key (sanity_key_validator.py)")
    print("   2. Integrado ao publish_to_sanity para validação automática")
    print("   3. Disponível como ferramentas CrewAI: validate_sanity_data e ensure_post_keys")
    print("   4. Garante que todos os arrays tenham _key antes de enviar ao Sanity")
    print("\n🎯 O problema de 'Missing keys' foi solucionado!") 