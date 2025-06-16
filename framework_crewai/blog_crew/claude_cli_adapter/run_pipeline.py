#!/usr/bin/env python3
"""
Script simples para executar o pipeline de blog
"""
import asyncio
from agents.researcher_agent import ResearcherAgent

def test_researcher():
    """Testa apenas o agente de pesquisa com RSS"""
    print("🚀 Iniciando teste do Researcher Agent...")
    
    researcher = ResearcherAgent()
    
    # Criar tarefa de pesquisa
    task_file = researcher.research_topic(
        topic="Últimas novidades em DeFi e Ethereum", 
        depth="quick"
    )
    
    print(f"\n✅ Tarefa criada: {task_file}")
    print("\n📝 Conteúdo da tarefa:")
    
    # Ler e mostrar conteúdo
    with open(task_file, 'r') as f:
        print(f.read())
    
    print("\n🎯 Próximos passos:")
    print("1. Execute o agente TypeScript para processar:")
    print(f"   cd mcp_agents && npm run researcher")
    print("2. Ou processe manualmente no Claude CLI")
    print("3. O output será salvo em outputs/")

if __name__ == "__main__":
    test_researcher()