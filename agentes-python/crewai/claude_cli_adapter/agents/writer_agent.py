#!/usr/bin/env python3
"""
Writer Agent - Adaptado para Claude CLI
Responsável por escrever e estruturar conteúdo
"""
from typing import Dict, Any, Optional
from .base_agent import BaseClaudeAgent


class WriterAgent(BaseClaudeAgent):
    """Agente especializado em escrita de conteúdo para blog"""
    
    def __init__(self):
        super().__init__(
            name="Writer",
            role="Escritor Especialista em Criptomoedas",
            goal="Criar conteúdo envolvente, informativo e otimizado para SEO sobre criptomoedas",
            backstory="""Você é um escritor experiente com especialização em:
            - Redação de artigos sobre blockchain e criptomoedas
            - SEO e otimização de conteúdo
            - Storytelling técnico
            - Simplificação de conceitos complexos
            - Engajamento de audiência cripto
            
            Você escreve de forma clara mas profunda, equilibrando
            acessibilidade com precisão técnica."""
        )
    
    def execute(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Executa tarefa de escrita"""
        task_file = self.create_task(task, context)
        
        return {
            "status": "task_created",
            "task_file": task_file,
            "agent": self.name
        }
    
    def write_article(
        self,
        topic: str,
        research_data: Optional[Dict[str, Any]] = None,
        keywords: Optional[List[str]] = None,
        tone: str = "professional"
    ) -> str:
        """
        Cria tarefa para escrever artigo completo
        """
        task_description = f"""
## Escrever Artigo: {topic}

### Tom: {tone}

### Palavras-chave SEO:
{chr(10).join(f'- {kw}' for kw in (keywords or ['blockchain', 'criptomoedas']))}

### Estrutura do Artigo:

1. **Título** (máximo 60 caracteres)
   - Atrativo e otimizado para SEO
   - Inclua palavra-chave principal

2. **Meta Descrição** (150-160 caracteres)
   - Resumo envolvente
   - Call-to-action implícito

3. **Introdução** (150-200 palavras)
   - Hook inicial forte
   - Apresentação do problema/oportunidade
   - Preview do conteúdo

4. **Corpo Principal** (1200-1500 palavras)
   - 4-6 seções com H2
   - Parágrafos de 3-4 linhas
   - Exemplos práticos
   - Dados e estatísticas
   - Imagens sugeridas com alt text

5. **Conclusão** (150-200 palavras)
   - Resumo dos pontos principais
   - Call-to-action claro
   - Perspectivas futuras

6. **Elementos SEO**
   - Tags: 5-7 relevantes
   - Categorias: 1-2 principais
   - Links internos sugeridos
   - Schema markup recomendado

### Estilo de Escrita:

- ✍️ Use "você" para conexão direta
- ✍️ Frases curtas e impactantes
- ✍️ Analogias quando apropriado
- ✍️ Evite jargão desnecessário
- ✍️ Mantenha tom {tone}

### Formatação:

- Use **negrito** para destacar conceitos
- Use listas para melhor escaneabilidade
- Inclua citações quando relevante
- Sugira posições para gráficos/imagens
"""
        
        context = {
            "topic": topic,
            "research_data": research_data,
            "keywords": keywords,
            "tone": tone,
            "target_length": 1500,
            "format": "markdown"
        }
        
        return self.create_task(task_description, context)
    
    def optimize_content(self, content: str, optimization_goals: List[str]) -> str:
        """
        Cria tarefa para otimizar conteúdo existente
        """
        task_description = f"""
## Otimizar Conteúdo

### Objetivos de Otimização:
{chr(10).join(f'- {goal}' for goal in optimization_goals)}

### Conteúdo Original:
```markdown
{content}
```

### Melhorias Requeridas:

1. **SEO**
   - Densidade de palavras-chave (1-2%)
   - Headers otimizados
   - Meta tags
   - Alt text para imagens

2. **Legibilidade**
   - Score Flesch Reading Ease > 60
   - Parágrafos curtos
   - Subtítulos claros
   - Transições suaves

3. **Engajamento**
   - Perguntas retóricas
   - Exemplos práticos
   - Storytelling
   - CTAs estratégicos

4. **Estrutura**
   - Fluxo lógico
   - Hierarquia clara
   - Conclusão impactante

### Output:
Retorne o conteúdo otimizado mantendo a essência original
mas melhorando significativamente os aspectos listados.
"""
        
        context = {
            "original_content": content,
            "optimization_goals": optimization_goals
        }
        
        return self.create_task(task_description, context)