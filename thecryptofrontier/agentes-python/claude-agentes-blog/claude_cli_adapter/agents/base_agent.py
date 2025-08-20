#!/usr/bin/env python3
"""
Base Agent para MVP com Claude CLI
Adaptado do CrewAI para custo zero
"""
import json
import os
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path


class BaseClaudeAgent(ABC):
    """
    Classe base para agentes usando Claude CLI
    Inspirada no CrewAI mas simplificada para MVP
    """
    
    def __init__(
        self,
        name: str,
        role: str,
        goal: str,
        backstory: str,
        tools: Optional[List] = None
    ):
        self.name = name
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.tools = tools or []
        
        # Diretório para tarefas
        self.tasks_dir = Path("/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/tasks")
        self.tasks_dir.mkdir(parents=True, exist_ok=True)
        
        # Diretório para outputs
        self.outputs_dir = Path("/home/strapi/thecryptofrontier/framework_crewai/blog_crew/claude_cli_adapter/outputs")
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
    
    def create_task(self, task_description: str, context: Dict[str, Any] = None) -> str:
        """
        Cria arquivo de tarefa para Claude CLI processar
        Retorna o caminho do arquivo criado
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        task_id = f"{self.name.lower()}_{timestamp}"
        task_file = self.tasks_dir / f"{task_id}.md"
        
        # Criar conteúdo da tarefa
        content = self._build_task_content(task_description, context, task_id)
        
        # Salvar arquivo
        with open(task_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"📋 Tarefa criada: {task_file}")
        return str(task_file)
    
    def _build_task_content(self, task_description: str, context: Dict[str, Any], task_id: str) -> str:
        """Constrói conteúdo da tarefa com personalidade do agente"""
        
        output_file = self.outputs_dir / f"{task_id}_output.json"
        
        content = f"""# Tarefa para {self.name}

## Identidade do Agente

**Papel**: {self.role}
**Objetivo**: {self.goal}
**Contexto**: {self.backstory}

## Tarefa

{task_description}

## Contexto Adicional

```json
{json.dumps(context or {}, indent=2, ensure_ascii=False)}
```

## Ferramentas Disponíveis

{self._format_tools()}

## Instruções de Output

Por favor, salve o resultado em formato JSON no arquivo:
`{output_file}`

### Formato do Output:

```json
{{
    "agent": "{self.name}",
    "task_id": "{task_id}",
    "timestamp": "ISO timestamp",
    "status": "success|partial|failed",
    "result": {{
        // Resultado específico da tarefa
    }},
    "metadata": {{
        "processing_time": "tempo estimado",
        "confidence": 0.95,
        "notes": "observações relevantes"
    }}
}}
```

## Critérios de Qualidade

1. Seja preciso e completo
2. Mantenha o tom e estilo do papel definido
3. Use as ferramentas quando necessário
4. Documente decisões importantes
5. Retorne dados estruturados
"""
        
        return content
    
    def _format_tools(self) -> str:
        """Formata lista de ferramentas disponíveis"""
        if not self.tools:
            return "Nenhuma ferramenta específica disponível."
        
        tools_text = ""
        for tool in self.tools:
            tools_text += f"- **{tool.name}**: {tool.description}\n"
        
        return tools_text
    
    @abstractmethod
    def execute(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Método abstrato para executar tarefa
        Deve ser implementado por cada agente específico
        """
        pass
    
    def get_output(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Recupera output processado pelo Claude CLI"""
        output_file = self.outputs_dir / f"{task_id}_output.json"
        
        if output_file.exists():
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ Erro ao ler output: {e}")
                return None
        
        return None
    
    def cleanup_old_tasks(self, days: int = 7):
        """Remove tarefas antigas"""
        import time
        
        current_time = time.time()
        
        for task_file in self.tasks_dir.glob("*.md"):
            file_age = current_time - task_file.stat().st_mtime
            if file_age > (days * 24 * 60 * 60):
                task_file.unlink()
                print(f"🗑️  Removido: {task_file.name}")