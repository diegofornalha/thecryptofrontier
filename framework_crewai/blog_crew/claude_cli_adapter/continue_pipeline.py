#!/usr/bin/env python3
"""
Continua o pipeline após a pesquisa
"""
import json
from datetime import datetime
from pathlib import Path

def create_writer_task():
    """Cria tarefa para o writer baseada no output do researcher"""
    
    # Ler output do researcher
    research_output_file = Path("outputs/researcher_20250616_034444_output.json")
    with open(research_output_file, 'r') as f:
        research_data = json.load(f)
    
    # Criar tarefa para writer
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    task_id = f"writer_{timestamp}"
    
    task_content = f"""# Tarefa: {task_id}

## Escrever Artigo: {research_data['result']['topic']}

### Instruções:
1. Usar a pesquisa fornecida para criar um artigo completo
2. Otimizar para SEO com keywords relevantes
3. Estruturar com introdução, desenvolvimento e conclusão
4. Incluir dados e estatísticas da pesquisa
5. Criar título atrativo e meta description

### Pesquisa Base:
```json
{json.dumps(research_data['result'], indent=2, ensure_ascii=False)}
```

### Keywords SEO:
- DeFi yield farming
- Liquid staking 2025
- Cross-chain farming
- DeFi TVL
- Yield optimization

### Estrutura Sugerida:
1. Introdução com hook sobre crescimento de 137% do TVL
2. O que mudou no yield farming em 2025
3. Principais estratégias e plataformas
4. Como começar com segurança
5. Perspectivas futuras

### Output Esperado:
- Artigo de 800-1200 palavras
- Título otimizado para SEO
- Meta description (150-160 chars)
- Tags e categorias relevantes
"""
    
    task_file = Path("tasks") / f"{task_id}.md"
    with open(task_file, 'w') as f:
        f.write(task_content)
    
    return task_file, task_id

def main():
    print("🚀 Continuando Pipeline - Fase de Escrita\n")
    
    # Verificar se existe output de pesquisa
    research_output = Path("outputs/researcher_20250616_034444_output.json")
    if not research_output.exists():
        print("❌ Erro: Output de pesquisa não encontrado!")
        print("   Execute primeiro a fase de pesquisa.")
        return
    
    # Carregar dados da pesquisa
    with open(research_output, 'r') as f:
        research_data = json.load(f)
    
    print(f"✅ Pesquisa carregada: {research_data['result']['topic']}")
    print(f"📊 Resumo: {len(research_data['result']['summary'])} pontos principais")
    
    # Criar tarefa de escrita
    print("\n📝 Criando tarefa de escrita...")
    task_file, task_id = create_writer_task()
    
    print(f"✅ Tarefa criada: {task_file}")
    
    print("\n" + "="*50)
    print("📋 PRÉVIA DA TAREFA:")
    print("="*50 + "\n")
    
    # Mostrar primeiras 30 linhas
    with open(task_file, 'r') as f:
        lines = f.readlines()
        for line in lines[:30]:
            print(line.rstrip())
        if len(lines) > 30:
            print("\n... [conteúdo truncado] ...")
    
    print("\n" + "="*50)
    print("🎯 PRÓXIMOS PASSOS:")
    print("="*50)
    print(f"\n1. Processar com Writer Agent TypeScript:")
    print("   cd mcp_agents")
    print("   npm run writer")
    print(f"\n2. Ou escrever manualmente e salvar em:")
    print(f"   outputs/{task_id}_output.json")

if __name__ == "__main__":
    main()