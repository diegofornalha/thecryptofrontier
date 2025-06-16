#!/usr/bin/env python3
"""
Teste simples do pipeline RSS - MVP
"""
import os
import json
from datetime import datetime
from pathlib import Path

# Criar diretórios necessários
tasks_dir = Path("tasks")
outputs_dir = Path("outputs")
tasks_dir.mkdir(exist_ok=True)
outputs_dir.mkdir(exist_ok=True)

def create_research_task(topic):
    """Cria uma tarefa de pesquisa simples"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    task_id = f"researcher_{timestamp}"
    
    task_content = f"""# Tarefa: {task_id}

## Pesquisar sobre: {topic}

### Instruções:
1. Buscar informações atualizadas sobre o tópico
2. Analisar feeds RSS de cripto (CoinDesk, CoinTelegraph, etc)
3. Identificar tendências e novidades relevantes
4. Compilar insights únicos

### Contexto:
```json
{{
    "topic": "{topic}",
    "depth": "comprehensive",
    "sources": ["rss", "web"],
    "timestamp": "{datetime.now().isoformat()}"
}}
```

### Output Esperado:
- Resumo das principais descobertas
- Análise de tendências
- Fontes consultadas
- Insights únicos para o artigo
"""
    
    task_file = tasks_dir / f"{task_id}.md"
    with open(task_file, 'w') as f:
        f.write(task_content)
    
    return task_file, task_id

def main():
    print("🚀 Teste Simples do Pipeline RSS\n")
    
    # Tópico para pesquisar
    topic = "Últimas novidades em DeFi e yield farming"
    
    print(f"📝 Criando tarefa de pesquisa sobre: {topic}")
    task_file, task_id = create_research_task(topic)
    
    print(f"✅ Tarefa criada: {task_file}")
    
    print("\n" + "="*50)
    print("📋 CONTEÚDO DA TAREFA:")
    print("="*50 + "\n")
    
    with open(task_file, 'r') as f:
        print(f.read())
    
    print("\n" + "="*50)
    print("🎯 PRÓXIMOS PASSOS:")
    print("="*50)
    print("\n1. OPÇÃO A - Processar com TypeScript Agent:")
    print("   cd mcp_agents")
    print("   npm run researcher")
    print(f"\n2. OPÇÃO B - Processar manualmente:")
    print(f"   - Abra o arquivo: {task_file}")
    print("   - Execute a pesquisa manualmente")
    print(f"   - Salve o resultado em: outputs/{task_id}_output.json")
    print("\n3. O pipeline continuará após o processamento")

if __name__ == "__main__":
    main()