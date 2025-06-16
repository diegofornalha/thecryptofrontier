#!/usr/bin/env python3
"""
Blog Pipeline - Workflow principal adaptado para Claude CLI
Coordena os agentes para criar posts completos
"""
import os
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

# Importar agentes
import sys
sys.path.append('/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter')

from agents.researcher_agent import ResearcherAgent
from agents.writer_agent import WriterAgent
from agents.editor_agent import EditorAgent
from agents.publisher_agent import PublisherAgent


class BlogPipeline:
    """
    Pipeline completo para criação de posts
    Coordena múltiplos agentes em sequência
    """
    
    def __init__(self):
        self.researcher = ResearcherAgent()
        self.writer = WriterAgent()
        self.editor = EditorAgent()
        self.publisher = PublisherAgent()
        
        # Diretórios
        self.outputs_dir = Path("/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/outputs")
        self.pipeline_state_file = self.outputs_dir / "pipeline_state.json"
        
        # Estado do pipeline
        self.state = self.load_state()
    
    def load_state(self) -> Dict[str, Any]:
        """Carrega estado do pipeline"""
        if self.pipeline_state_file.exists():
            with open(self.pipeline_state_file, 'r') as f:
                return json.load(f)
        return {"current_task": None, "completed_tasks": [], "pipeline_id": None}
    
    def save_state(self):
        """Salva estado do pipeline"""
        with open(self.pipeline_state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    async def create_blog_post(
        self,
        topic: str,
        keywords: List[str] = None,
        auto_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Cria um post completo do início ao fim
        
        Args:
            topic: Tópico do post
            keywords: Palavras-chave SEO
            auto_mode: Se True, monitora outputs automaticamente
        
        Returns:
            Resultado do pipeline
        """
        pipeline_id = f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.state["pipeline_id"] = pipeline_id
        
        print(f"\n🚀 Iniciando Pipeline: {pipeline_id}")
        print(f"📝 Tópico: {topic}\n")
        
        # 1. Fase de Pesquisa
        print("1️⃣ FASE DE PESQUISA")
        research_task = self.researcher.research_topic(topic, depth="comprehensive")
        self.state["current_task"] = {"phase": "research", "task_file": research_task}
        self.save_state()
        
        if auto_mode:
            research_output = await self.wait_for_output("researcher", extract_id(research_task))
        else:
            print("⏸️  Aguardando processamento manual...")
            print(f"📋 Tarefa: {research_task}")
            input("\nPressione ENTER após processar no Claude CLI...")
            research_output = self.get_latest_output("researcher")
        
        if not research_output:
            return {"status": "failed", "phase": "research", "error": "No output found"}
        
        # 2. Fase de Escrita
        print("\n2️⃣ FASE DE ESCRITA")
        write_task = self.writer.write_article(
            topic=topic,
            research_data=research_output.get("result"),
            keywords=keywords
        )
        self.state["current_task"] = {"phase": "writing", "task_file": write_task}
        self.save_state()
        
        if auto_mode:
            write_output = await self.wait_for_output("writer", extract_id(write_task))
        else:
            print("⏸️  Aguardando processamento manual...")
            print(f"📋 Tarefa: {write_task}")
            input("\nPressione ENTER após processar no Claude CLI...")
            write_output = self.get_latest_output("writer")
        
        if not write_output:
            return {"status": "failed", "phase": "writing", "error": "No output found"}
        
        # 3. Fase de Edição
        print("\n3️⃣ FASE DE EDIÇÃO")
        content = write_output.get("result", {}).get("content", "")
        edit_task = self.editor.edit_article(content)
        self.state["current_task"] = {"phase": "editing", "task_file": edit_task}
        self.save_state()
        
        if auto_mode:
            edit_output = await self.wait_for_output("editor", extract_id(edit_task))
        else:
            print("⏸️  Aguardando processamento manual...")
            print(f"📋 Tarefa: {edit_task}")
            input("\nPressione ENTER após processar no Claude CLI...")
            edit_output = self.get_latest_output("editor")
        
        if not edit_output:
            return {"status": "failed", "phase": "editing", "error": "No output found"}
        
        # 4. Fase de Publicação
        print("\n4️⃣ FASE DE PUBLICAÇÃO")
        final_content = edit_output.get("result", {}).get("edited_content", content)
        
        # Preparar dados para publicação
        post_data = {
            "title": write_output.get("result", {}).get("title", topic),
            "slug": write_output.get("result", {}).get("slug", ""),
            "content": final_content,
            "excerpt": write_output.get("result", {}).get("excerpt", ""),
            "seo": write_output.get("result", {}).get("seo", {}),
            "tags": write_output.get("result", {}).get("tags", []),
            "categories": write_output.get("result", {}).get("categories", [])
        }
        
        # Publicar no Strapi
        publish_result = await self.publisher.publish_to_strapi(post_data)
        
        # Finalizar pipeline
        self.state["completed_tasks"].append(pipeline_id)
        self.state["current_task"] = None
        self.save_state()
        
        print(f"\n✅ Pipeline Concluído: {pipeline_id}")
        
        return {
            "status": "success",
            "pipeline_id": pipeline_id,
            "post_id": publish_result.get("post_id"),
            "url": publish_result.get("url"),
            "summary": {
                "topic": topic,
                "title": post_data["title"],
                "word_count": len(final_content.split()),
                "quality_score": edit_output.get("result", {}).get("quality_score", 0)
            }
        }
    
    async def wait_for_output(self, agent_name: str, task_id: str, timeout: int = 300) -> Optional[Dict[str, Any]]:
        """
        Aguarda output ser criado (modo automático)
        
        Args:
            agent_name: Nome do agente
            task_id: ID da tarefa
            timeout: Tempo máximo de espera em segundos
        
        Returns:
            Output do agente ou None
        """
        output_file = self.outputs_dir / f"{task_id}_output.json"
        start_time = time.time()
        
        print(f"⏳ Aguardando output de {agent_name}...")
        
        while time.time() - start_time < timeout:
            if output_file.exists():
                try:
                    with open(output_file, 'r') as f:
                        output = json.load(f)
                    print(f"✅ Output recebido de {agent_name}")
                    return output
                except json.JSONDecodeError:
                    await asyncio.sleep(1)
            
            await asyncio.sleep(2)
        
        print(f"⏰ Timeout aguardando {agent_name}")
        return None
    
    def get_latest_output(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """
        Busca output mais recente de um agente
        
        Args:
            agent_name: Nome do agente
        
        Returns:
            Output mais recente ou None
        """
        output_files = list(self.outputs_dir.glob(f"{agent_name.lower()}_*_output.json"))
        
        if not output_files:
            return None
        
        # Pega o mais recente
        latest_file = max(output_files, key=lambda f: f.stat().st_mtime)
        
        try:
            with open(latest_file, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None
    
    def list_pending_tasks(self) -> List[Dict[str, str]]:
        """Lista todas as tarefas pendentes"""
        tasks_dir = Path("/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/tasks")
        pending = []
        
        for task_file in tasks_dir.glob("*.md"):
            agent_name = task_file.name.split('_')[0]
            pending.append({
                "agent": agent_name,
                "file": str(task_file),
                "created": datetime.fromtimestamp(task_file.stat().st_mtime).isoformat()
            })
        
        return pending
    
    def resume_pipeline(self) -> Optional[str]:
        """Retoma pipeline interrompido"""
        if self.state["current_task"]:
            phase = self.state["current_task"]["phase"]
            task_file = self.state["current_task"]["task_file"]
            
            print(f"📌 Retomando pipeline na fase: {phase}")
            print(f"📋 Tarefa pendente: {task_file}")
            
            return phase
        
        return None


def extract_id(file_path: str) -> str:
    """Extrai ID da tarefa do caminho do arquivo"""
    return Path(file_path).stem


async def main():
    """Exemplo de uso do pipeline"""
    pipeline = BlogPipeline()
    
    # Verificar se há pipeline para retomar
    if pipeline.resume_pipeline():
        print("\nDeseja continuar o pipeline anterior? (s/n)")
        if input().lower() == 's':
            # Continuar de onde parou
            # ... implementar lógica de retomada
            pass
    
    # Criar novo post
    result = await pipeline.create_blog_post(
        topic="DeFi 2.0: A próxima evolução das finanças descentralizadas",
        keywords=["defi 2.0", "finanças descentralizadas", "yield farming", "liquidity mining"],
        auto_mode=False  # Modo manual por padrão
    )
    
    print("\n📊 Resultado Final:")
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())