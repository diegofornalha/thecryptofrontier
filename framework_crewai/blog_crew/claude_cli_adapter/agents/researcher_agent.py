#!/usr/bin/env python3
"""
Researcher Agent - Adaptado para Claude CLI
Responsável por pesquisar e coletar informações
"""
from typing import Dict, Any, List, Optional
from .base_agent import BaseClaudeAgent
from ..tools.rss_reader import RSSReaderTool
from ..tools.web_search import WebSearchTool


class ResearcherAgent(BaseClaudeAgent):
    """Agente especializado em pesquisa e coleta de informações"""
    
    def __init__(self):
        super().__init__(
            name="Researcher",
            role="Pesquisador Sênior de Conteúdo Cripto",
            goal="Encontrar e analisar as últimas notícias e tendências do mercado de criptomoedas",
            backstory="""Você é um pesquisador experiente com profundo conhecimento em:
            - Análise de mercado de criptomoedas
            - Tendências tecnológicas blockchain
            - Análise fundamental e técnica
            - Identificação de narrativas emergentes
            - Verificação de fontes confiáveis
            
            Você tem acesso a feeds RSS especializados e sempre busca informações
            precisas e atualizadas para criar conteúdo de alta qualidade.""",
            tools=[RSSReaderTool(), WebSearchTool()]
        )
    
    def execute(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Executa pesquisa sobre um tópico
        """
        # Criar arquivo de tarefa
        task_file = self.create_task(task, context)
        
        # Retornar informações sobre a tarefa criada
        return {
            "status": "task_created",
            "task_file": task_file,
            "next_step": "Execute no Claude CLI e salve output conforme instruções",
            "agent": self.name
        }
    
    def research_topic(self, topic: str, depth: str = "comprehensive") -> str:
        """
        Cria tarefa de pesquisa sobre um tópico específico
        
        Args:
            topic: Tópico a pesquisar
            depth: Profundidade da pesquisa (quick, standard, comprehensive)
        """
        task_description = f"""
## Pesquisar: {topic}

### Profundidade: {depth}

Por favor, realize uma pesquisa {'rápida' if depth == 'quick' else 'completa' if depth == 'comprehensive' else 'padrão'} sobre o tópico.

### Estrutura da Pesquisa:

1. **Resumo Executivo** (3-5 pontos principais)

2. **Contexto Atual**
   - Situação do mercado
   - Desenvolvimentos recentes
   - Principais players envolvidos

3. **Análise Detalhada**
   - Aspectos técnicos relevantes
   - Impacto no mercado
   - Oportunidades e riscos

4. **Tendências Identificadas**
   - Curto prazo (1-3 meses)
   - Médio prazo (3-12 meses)
   - Longo prazo (1+ anos)

5. **Fontes e Referências**
   - Links para artigos originais
   - Credibilidade das fontes
   - Data das informações

6. **Insights Únicos**
   - Conexões não óbvias
   - Perspectivas diferenciadas
   - Recomendações

### Critérios de Qualidade:

- ✅ Informações atualizadas (últimos 30 dias preferencialmente)
- ✅ Fontes confiáveis e verificáveis
- ✅ Análise imparcial e equilibrada
- ✅ Foco em valor para o leitor
- ✅ Linguagem clara mas técnica quando necessário
"""
        
        context = {
            "topic": topic,
            "depth": depth,
            "focus": "cryptocurrency and blockchain",
            "target_audience": "investidores e entusiastas cripto"
        }
        
        return self.create_task(task_description, context)
    
    def analyze_rss_feed(self, feed_urls: List[str], limit: int = 10) -> str:
        """
        Cria tarefa para analisar feeds RSS
        """
        task_description = f"""
## Analisar Feeds RSS

### Feeds para Análise:
{chr(10).join(f'- {url}' for url in feed_urls)}

### Limite: {limit} artigos mais recentes por feed

### Análise Requerida:

1. **Resumo dos Principais Tópicos**
   - Temas mais discutidos
   - Narrativas emergentes
   - Sentimento geral do mercado

2. **Artigos Mais Relevantes**
   - Título e fonte
   - Resumo do conteúdo
   - Por que é importante
   - Impacto potencial

3. **Padrões Identificados**
   - Convergência de opiniões
   - Divergências notáveis
   - Sinais de mercado

4. **Recomendações de Conteúdo**
   - Tópicos para explorar
   - Ângulos únicos
   - Oportunidades de conteúdo

### Output Esperado:

Estruture a análise de forma clara e acionável, destacando
os insights mais valiosos para criação de conteúdo.
"""
        
        context = {
            "feed_urls": feed_urls,
            "limit": limit,
            "analysis_type": "content_opportunities"
        }
        
        return self.create_task(task_description, context)