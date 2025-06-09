"""
Script para processar o post real do XRP e mostrar a conversão
"""

import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tests.test_markdown_conversion import convert_markdown_to_sanity_objects_direct

def process_real_xrp_post():
    """Processa o post real do XRP com os problemas identificados"""
    
    print("🔄 Processando post real do XRP...")
    
    # Conteúdo problemático do post real
    problematic_content = """
À medida que o XRP se recupera da queda da semana passada, analistas estão examinando a significância do pequeno influxo que impulsionou o preço do XRP para cima.

**XRP registra influxo líquido de US$ 18,6 milhões, preço salta**

A figura da comunidade, Chad Steingraber, destacou a métrica de influxo em um tweet. Ele observou que o XRP subiu de US$ 2,08 para US$ 2,17 em 6 de junho após um influxo líquido de apenas US$ 18,6 milhões.

**Multiplicador de crescimento de 647x**

No entanto, em uma publicação subsequente [em 8 de junho](https://x.com/ChadSteingraber/status/1931733903523381637) Steingraber apontou que o XRP subiu de US$ 2,17 para US$ 2,28 com apenas US$ 17 milhões em influxos líquidos.

Aqui, o multiplicador é de aproximadamente 647x, o que significa que cada US$ 1 de influxo líquido aumentou a capitalização de mercado do XRP em cerca de US$ 647 durante esse movimento.

[Imagem mostrando os multiplicadores](https://pbs.twimg.com/media/Gs7ldW9WsAAnJLq?format=jpg&name=large)

No entanto, o XRP terminou o mesmo dia com um fluxo líquido negativo de US$ 5,88 milhões, indicando um efluxo.

**Olhos voltados para ETFs para impulsionar os preços**

Vale ressaltar que, nos últimos meses, fluxos negativos maiores dominaram o mercado XRP. Isso pode ajudar a explicar o desempenho de preço relativamente plano do XRP nos últimos seis meses.
"""
    
    result = convert_markdown_to_sanity_objects_direct(problematic_content)
    
    if result["success"]:
        print("✅ Conversão bem-sucedida!")
        print(f"📊 Número de blocos gerados: {len(result['blocks'])}")
        
        # Contar tipos de bloco
        block_types = {}
        for block in result['blocks']:
            block_type = block['_type']
            block_types[block_type] = block_types.get(block_type, 0) + 1
        
        print("\n📈 Distribuição de tipos de bloco:")
        for block_type, count in block_types.items():
            print(f"  - {block_type}: {count}")
        
        print("\n🔍 Detalhes dos blocos especiais:")
        for i, block in enumerate(result['blocks']):
            if block['_type'] in ['image', 'embedBlock']:
                print(f"\n  Bloco {i+1} ({block['_type']}):")
                if block['_type'] == 'image':
                    print(f"    - Alt: {block.get('alt', 'N/A')}")
                    print(f"    - Caption: {block.get('caption', 'N/A')}")
                    print(f"    - URL: {block.get('url', 'N/A')}")
                elif block['_type'] == 'embedBlock':
                    print(f"    - Tipo: {block.get('embedType', 'N/A')}")
                    print(f"    - URL: {block.get('url', 'N/A')}")
                    print(f"    - Caption: {block.get('caption', 'N/A')}")
        
        # Salvar resultado em arquivo JSON para inspeção
        output_file = "posts_processados/xrp_post_converted.json"
        os.makedirs("posts_processados", exist_ok=True)
        
        converted_post = {
            "_type": "post",
            "title": "XRP: Alta de 647x no Market Cap de apenas US$ 17 milhões? O que sabemos?",
            "content": result['blocks'],
            "processedAt": "2025-01-27T12:00:00Z",
            "originalIssues": [
                "Links markdown de imagem não convertidos",
                "Links markdown do Twitter não convertidos"
            ],
            "fixedIssues": [
                "✅ Imagens convertidas para objetos Sanity",
                "✅ Embeds do Twitter convertidos para objetos Sanity",
                "✅ Links normais mantidos como anotações"
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(converted_post, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultado salvo em: {output_file}")
        
        return result
    else:
        print("❌ Erro na conversão:")
        print(f"  {result['error']}")
        return None

def show_before_after():
    """Mostra comparação antes/depois"""
    
    print("\n" + "="*60)
    print("📋 COMPARAÇÃO ANTES/DEPOIS")
    print("="*60)
    
    print("\n❌ ANTES (Problemático):")
    print("```")
    print("[em 8 de junho](https://x.com/ChadSteingraber/status/1931733903523381637)")
    print("[Imagem mostrando os multiplicadores](https://pbs.twimg.com/media/Gs7ldW9WsAAnJLq?format=jpg&name=large)")
    print("```")
    
    print("\n✅ DEPOIS (Objetos Sanity):")
    print("```json")
    print("""{
  "_type": "embedBlock",
  "embedType": "twitter", 
  "url": "https://x.com/ChadSteingraber/status/1931733903523381637",
  "caption": "em 8 de junho"
}""")
    print()
    print("""{
  "_type": "image",
  "asset": {"_type": "reference", "_ref": "image-abc123-Gs7ldW9WsAAnJLq"},
  "alt": "Imagem mostrando os multiplicadores",
  "caption": "Imagem mostrando os multiplicadores"
}""")
    print("```")

if __name__ == "__main__":
    print("🚀 Processando post real do XRP com problemas identificados\n")
    
    result = process_real_xrp_post()
    
    if result:
        show_before_after()
    
    print("\n✨ Processamento concluído!") 