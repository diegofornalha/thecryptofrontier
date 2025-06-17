# CrewAI no Projeto de Agentes Blog

## 📖 Visão Geral

Embora o projeto atual tenha migrado para uma implementação direta com Claude Code, o CrewAI foi considerado como uma opção para orquestração de agentes. O projeto mantém a estrutura preparada para integração com CrewAI, oferecendo uma alternativa de automação completa.

## 🎯 O que é CrewAI?

CrewAI é um framework para construir e orquestrar equipes de agentes de IA que trabalham juntos para completar tarefas complexas. Principais características:

- **Agentes Especializados**: Cada agente tem um papel específico
- **Colaboração**: Agentes podem trabalhar em conjunto
- **Flexibilidade**: Suporta diferentes LLMs (GPT, Claude, Gemini, etc.)
- **Automação**: Execução de tarefas sem intervenção manual

## 🏗️ Arquitetura Proposta com CrewAI

### 1. **Estrutura de Agentes**

```python
from crewai import Agent, Task, Crew

# Agente Pesquisador
researcher = Agent(
    role='Pesquisador de Conteúdo',
    goal='Encontrar informações relevantes e atualizadas sobre o tópico',
    backstory='Especialista em pesquisa com anos de experiência em análise de dados',
    tools=[SerperDevTool(), WebScrapeTool()],
    llm=gemini_llm  # Usa Gemini (mais barato)
)

# Agente Escritor
writer = Agent(
    role='Escritor de Blog',
    goal='Criar conteúdo envolvente e bem estruturado',
    backstory='Escritor profissional especializado em conteúdo digital',
    tools=[],
    llm=claude_llm  # Usa Claude (melhor qualidade)
)

# Agente SEO
seo_specialist = Agent(
    role='Especialista em SEO',
    goal='Otimizar conteúdo para mecanismos de busca',
    backstory='Expert em SEO com foco em ranqueamento orgânico',
    tools=[KeywordTool(), SEOAnalyzer()],
    llm=gemini_llm
)
```

### 2. **Definição de Tarefas**

```python
# Tarefa de Pesquisa
research_task = Task(
    description='Pesquisar sobre {topic} e compilar informações relevantes',
    agent=researcher,
    expected_output='Relatório com principais pontos, estatísticas e tendências'
)

# Tarefa de Escrita
writing_task = Task(
    description='Criar post de blog baseado na pesquisa sobre {topic}',
    agent=writer,
    expected_output='Post completo com 1500+ palavras em Markdown'
)

# Tarefa de Otimização
seo_task = Task(
    description='Otimizar o post para SEO',
    agent=seo_specialist,
    expected_output='Post otimizado com meta tags e palavras-chave'
)
```

### 3. **Orquestração com Crew**

```python
# Criar equipe
blog_crew = Crew(
    agents=[researcher, writer, seo_specialist],
    tasks=[research_task, writing_task, seo_task],
    verbose=True,
    process='sequential'  # Tarefas executadas em sequência
)

# Executar
result = blog_crew.kickoff({'topic': 'IA no Marketing Digital'})
```

## 🔄 Integração com o Sistema Atual

### 1. **Híbrido: CrewAI + Claude Code**

```python
class HybridBlogSystem:
    """
    Combina CrewAI para pesquisa com Claude Code para escrita
    """
    
    def __init__(self):
        self.research_crew = self._setup_research_crew()
        self.claude_agent = ClaudeCLIBlogAgent()
    
    def _setup_research_crew(self):
        # Configurar apenas agente de pesquisa com Gemini
        researcher = Agent(
            role='Pesquisador',
            goal='Coletar informações sobre o tópico',
            llm=Gemini(model='gemini-pro', api_key=os.getenv('GEMINI_API_KEY'))
        )
        
        research_task = Task(
            description='Pesquisar e compilar informações sobre {topic}',
            agent=researcher
        )
        
        return Crew(agents=[researcher], tasks=[research_task])
    
    async def create_post(self, topic):
        # 1. Pesquisa com CrewAI (Gemini - barato)
        research_result = self.research_crew.kickoff({'topic': topic})
        
        # 2. Criar tarefa para Claude Code (grátis)
        context = {
            'topic': topic,
            'research': research_result,
            'style': 'baseado em pesquisa'
        }
        
        task_file = self.claude_agent.create_task_file('create_post', context)
        
        return task_file
```

### 2. **CrewAI para Automação de RSS**

```python
from crewai import Agent, Task, Crew

class RSSCrewAI:
    """
    CrewAI para processar feeds RSS automaticamente
    """
    
    def __init__(self):
        self.setup_agents()
    
    def setup_agents(self):
        # Agente Analisador de RSS
        self.rss_analyzer = Agent(
            role='Analisador de Feeds',
            goal='Identificar artigos relevantes para adaptação',
            tools=[FeedParserTool()]
        )
        
        # Agente Adaptador de Conteúdo
        self.content_adapter = Agent(
            role='Adaptador de Conteúdo',
            goal='Adaptar conteúdo para público brasileiro',
            llm=Gemini(model='gemini-pro')
        )
        
        # Agente Publisher
        self.publisher = Agent(
            role='Publisher',
            goal='Publicar conteúdo no Strapi',
            tools=[StrapiPublishTool()]
        )
    
    def process_feed(self, feed_url):
        # Definir tarefas
        analyze_task = Task(
            description=f'Analisar feed RSS: {feed_url}',
            agent=self.rss_analyzer
        )
        
        adapt_task = Task(
            description='Adaptar artigos selecionados para PT-BR',
            agent=self.content_adapter
        )
        
        publish_task = Task(
            description='Publicar artigos adaptados no Strapi',
            agent=self.publisher
        )
        
        # Criar crew
        rss_crew = Crew(
            agents=[self.rss_analyzer, self.content_adapter, self.publisher],
            tasks=[analyze_task, adapt_task, publish_task]
        )
        
        return rss_crew.kickoff()
```

## 📊 Comparação: CrewAI vs Implementação Direta

| Aspecto | CrewAI | Implementação Direta |
|---------|--------|---------------------|
| **Complexidade** | Alta - Requer configuração de múltiplos agentes | Baixa - Código simples e direto |
| **Flexibilidade** | Muito flexível - Suporta workflows complexos | Moderada - Adequada para tarefas específicas |
| **Custo** | Variável - Depende dos LLMs usados | Potencialmente menor - Controle total |
| **Manutenção** | Complexa - Múltiplas dependências | Simples - Menos pontos de falha |
| **Escalabilidade** | Excelente - Fácil adicionar novos agentes | Boa - Requer mais código manual |

## 🛠️ Implementação de CrewAI no Projeto

### 1. **Instalação**
```bash
pip install crewai
pip install crewai-tools
```

### 2. **Configuração Básica**
```python
# config/crewai_config.py
import os
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI

# Configurar LLMs
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7
)

# Agentes padrão
def get_research_agent():
    return Agent(
        role='Pesquisador de Conteúdo',
        goal='Encontrar informações relevantes sobre criptomoedas',
        backstory='Analista especializado em mercado crypto',
        llm=gemini_llm,
        verbose=True
    )

def get_writer_agent():
    return Agent(
        role='Escritor Crypto',
        goal='Criar conteúdo educativo sobre criptomoedas',
        backstory='Jornalista especializado em blockchain e crypto',
        llm=gemini_llm,
        verbose=True
    )
```

### 3. **Workflow Completo**
```python
# workflows/blog_workflow.py
from crewai import Crew, Task
from config.crewai_config import get_research_agent, get_writer_agent

class BlogWorkflowCrewAI:
    def __init__(self):
        self.researcher = get_research_agent()
        self.writer = get_writer_agent()
    
    def create_crypto_post(self, topic, keywords):
        # Task 1: Pesquisa
        research_task = Task(
            description=f"""
            Pesquise sobre: {topic}
            Foque em:
            - Tendências atuais
            - Dados e estatísticas
            - Casos de uso práticos
            - Perspectivas futuras
            
            Keywords: {', '.join(keywords)}
            """,
            agent=self.researcher,
            expected_output="Relatório detalhado com insights e dados"
        )
        
        # Task 2: Escrita
        writing_task = Task(
            description=f"""
            Baseado na pesquisa, crie um post de blog sobre: {topic}
            
            Requisitos:
            - Título atrativo (máx 60 chars)
            - 1500-2000 palavras
            - Linguagem acessível
            - Incluir dados da pesquisa
            - Otimizado para SEO
            
            Formato: Markdown
            """,
            agent=self.writer,
            expected_output="Post completo em Markdown"
        )
        
        # Criar Crew
        blog_crew = Crew(
            agents=[self.researcher, self.writer],
            tasks=[research_task, writing_task],
            verbose=True
        )
        
        # Executar
        result = blog_crew.kickoff()
        return result
```

## 🔧 Ferramentas Customizadas para CrewAI

### 1. **Strapi Tool**
```python
from crewai_tools import BaseTool

class StrapiTool(BaseTool):
    name: str = "Strapi Publisher"
    description: str = "Publica conteúdo no Strapi CMS"
    
    def _run(self, content: dict) -> str:
        """Publica post no Strapi"""
        headers = {
            'Authorization': f'Bearer {os.getenv("STRAPI_API_TOKEN")}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f"{os.getenv('STRAPI_URL')}/api/posts",
            json={'/var/lib/docker/volumes/thecryptofrontier-data': content},
            headers=headers
        )
        
        if response.status_code in [200, 201]:
            return f"Post publicado com sucesso! ID: {response.json()['/var/lib/docker/volumes/thecryptofrontier-data']['id']}"
        else:
            return f"Erro ao publicar: {response.status_code}"
```

### 2. **Crypto /var/lib/docker/volumes/thecryptofrontier-data Tool**
```python
class CryptoDataTool(BaseTool):
    name: str = "Crypto /var/lib/docker/volumes/thecryptofrontier-data Fetcher"
    description: str = "Busca dados de criptomoedas em tempo real"
    
    def _run(self, symbol: str) -> dict:
        """Busca dados de uma criptomoeda"""
        # Implementação para buscar dados
        # Pode usar APIs gratuitas como CoinGecko
        pass
```

## 💡 Casos de Uso Avançados

### 1. **Multi-Agente para Análise Completa**
```python
# Crew com múltiplos especialistas
crypto_analysis_crew = Crew(
    agents=[
        market_analyst,      # Analisa tendências de mercado
        technical_analyst,   # Análise técnica
        news_researcher,     # Pesquisa notícias
        content_writer,      # Escreve o artigo
        translator,          # Traduz para múltiplos idiomas
        seo_optimizer       # Otimiza para SEO
    ],
    tasks=[...],
    process='hierarchical'  # Agentes trabalham em hierarquia
)
```

### 2. **Pipeline de Conteúdo Automatizado**
```python
class AutomatedContentPipeline:
    def __init__(self):
        self.crews = {
            'research': self._create_research_crew(),
            'writing': self._create_writing_crew(),
            'optimization': self._create_optimization_crew()
        }
    
    async def process_topic(self, topic):
        # 1. Pesquisa inicial
        research = await self.crews['research'].kickoff({'topic': topic})
        
        # 2. Criação de conteúdo
        content = await self.crews['writing'].kickoff({
            'topic': topic,
            'research': research
        })
        
        # 3. Otimização e publicação
        final = await self.crews['optimization'].kickoff({
            'content': content
        })
        
        return final
```

## 🚀 Migração CrewAI → Claude Code

O projeto optou por migrar de CrewAI para Claude Code devido a:

1. **Custo**: Claude Code é gratuito via CLI
2. **Qualidade**: Claude produz conteúdo superior
3. **Simplicidade**: Menos complexidade de manutenção
4. **Controle**: Maior controle sobre o processo

No entanto, CrewAI permanece uma opção viável para:
- Workflows muito complexos
- Necessidade de múltiplos agentes especializados
- Integração com diversas ferramentas
- Automação completa sem intervenção

## 📚 Recursos Adicionais

- [Documentação CrewAI](https://docs.crewai.io/)
- [Exemplos de Implementação](https://github.com/joaomdmoura/crewAI-examples)
- [CrewAI Tools](https://docs.crewai.io/tools)
- [Comunidade CrewAI](https://discord.gg/crewai)