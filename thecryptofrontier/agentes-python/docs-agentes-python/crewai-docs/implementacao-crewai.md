# Guia de Implementação CrewAI para Blog

## 🚀 Setup Completo do Zero

### 1. Instalação e Configuração

#### Requisitos
```bash
# Python 3.8 ou superior
python3 --version

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

#### Instalação de Pacotes
```bash
# CrewAI e dependências
pip install crewai
pip install crewai-tools
pip install langchain-google-genai
pip install python-dotenv
pip install aiohttp
pip install feedparser
```

#### Arquivo `.env`
```bash
# APIs
GEMINI_API_KEY=sua_chave_gemini_aqui
ANTHROPIC_API_KEY=sua_chave_claude_aqui  # Opcional
OPENAI_API_KEY=sua_chave_openai_aqui    # Opcional

# Strapi
STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=seu_token_strapi

# Configurações
CREW_VERBOSE=true
CREW_MEMORY=true
```

### 2. Estrutura do Projeto CrewAI

```
blog-crewai/
├── agents/
│   ├── __init__.py
│   ├── researcher.py
│   ├── writer.py
│   ├── seo_specialist.py
│   └── translator.py
├── tasks/
│   ├── __init__.py
│   ├── research_tasks.py
│   ├── writing_tasks.py
│   └── seo_tasks.py
├── tools/
│   ├── __init__.py
│   ├── strapi_tool.py
│   ├── search_tool.py
│   └── crypto_tool.py
├── crews/
│   ├── __init__.py
│   └── blog_crew.py
├── config.py
├── main.py
└── requirements.txt
```

### 3. Implementação dos Agentes

#### `agents/researcher.py`
```python
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
from tools.search_tool import SearchTool
import os

class ResearchAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.3
        )
        
    def create(self):
        return Agent(
            role='Pesquisador de Conteúdo Crypto',
            goal='Encontrar informações precisas e atualizadas sobre criptomoedas e blockchain',
            backstory="""Você é um pesquisador especializado em criptomoedas com anos de 
            experiência analisando o mercado. Sua especialidade é encontrar dados confiáveis,
            tendências emergentes e insights valiosos sobre o ecossistema crypto.""",
            tools=[SearchTool()],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=3
        )
```

#### `agents/writer.py`
```python
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

class WriterAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.7
        )
    
    def create(self):
        return Agent(
            role='Escritor de Blog Crypto',
            goal='Criar conteúdo envolvente e educativo sobre criptomoedas',
            backstory="""Você é um escritor experiente especializado em tornar conceitos
            complexos de blockchain e criptomoedas acessíveis para todos os públicos.
            Seu estilo é claro, envolvente e sempre baseado em fatos.""",
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=2
        )
```

#### `agents/seo_specialist.py`
```python
from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

class SEOAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.2
        )
    
    def create(self):
        return Agent(
            role='Especialista em SEO',
            goal='Otimizar conteúdo para máxima visibilidade nos mecanismos de busca',
            backstory="""Você é um especialista em SEO com profundo conhecimento de
            algoritmos de busca. Sua expertise inclui otimização de palavras-chave,
            meta tags, estrutura de conteúdo e link building.""",
            llm=self.llm,
            verbose=True,
            allow_delegation=False
        )
```

### 4. Definição de Tarefas

#### `tasks/research_tasks.py`
```python
from crewai import Task

class ResearchTasks:
    @staticmethod
    def research_topic(agent, topic, keywords):
        return Task(
            description=f"""
            Pesquise detalhadamente sobre: {topic}
            
            Requisitos da pesquisa:
            1. Dados e estatísticas recentes (2024-2025)
            2. Tendências atuais do mercado
            3. Casos de uso práticos
            4. Opiniões de especialistas
            5. Projeções futuras
            
            Palavras-chave importantes: {', '.join(keywords)}
            
            Forneça um relatório estruturado com:
            - Resumo executivo
            - Principais descobertas
            - Dados estatísticos
            - Fontes confiáveis
            """,
            agent=agent,
            expected_output="Relatório de pesquisa detalhado em formato estruturado"
        )
    
    @staticmethod
    def analyze_competitors(agent, topic):
        return Task(
            description=f"""
            Analise os principais artigos concorrentes sobre: {topic}
            
            Identifique:
            1. Gaps de conteúdo não cobertos
            2. Ângulos únicos para abordar
            3. Palavras-chave não exploradas
            4. Formatos de conteúdo populares
            
            Objetivo: Criar conteúdo que se destaque da concorrência
            """,
            agent=agent,
            expected_output="Análise competitiva com oportunidades de diferenciação"
        )
```

#### `tasks/writing_tasks.py`
```python
from crewai import Task

class WritingTasks:
    @staticmethod
    def write_blog_post(agent, topic, research_data):
        return Task(
            description=f"""
            Crie um post de blog completo sobre: {topic}
            
            Use os dados da pesquisa fornecida: {research_data}
            
            Estrutura requerida:
            1. Título atrativo (máximo 60 caracteres)
            2. Introdução engajante (150-200 palavras)
            3. 5-7 seções com subtítulos H2/H3
            4. Exemplos práticos e casos de uso
            5. Dados e estatísticas integrados naturalmente
            6. Conclusão com call-to-action
            
            Requisitos:
            - 1500-2000 palavras
            - Tom profissional mas acessível
            - Formato Markdown
            - Incluir pelo menos 3 insights únicos
            """,
            agent=agent,
            expected_output="Post completo em Markdown pronto para publicação"
        )
    
    @staticmethod
    def create_social_snippets(agent, blog_content):
        return Task(
            description=f"""
            Baseado no post do blog, crie snippets para redes sociais:
            
            1. Twitter/X (3 variações)
               - Máximo 280 caracteres
               - Incluir hashtags relevantes
               
            2. LinkedIn (1 post)
               - 150-300 palavras
               - Tom profissional
               
            3. Instagram (caption)
               - Engajante e visual
               - Incluir emojis apropriados
               - Call-to-action claro
            """,
            agent=agent,
            expected_output="Snippets otimizados para cada rede social"
        )
```

#### `tasks/seo_tasks.py`
```python
from crewai import Task

class SEOTasks:
    @staticmethod
    def optimize_content(agent, content):
        return Task(
            description=f"""
            Otimize o seguinte conteúdo para SEO:
            
            {content}
            
            Tarefas de otimização:
            1. Criar meta título (50-60 caracteres)
            2. Criar meta descrição (150-160 caracteres)
            3. Identificar e integrar palavras-chave LSI
            4. Otimizar densidade de palavras-chave (1-2%)
            5. Criar schema markup apropriado
            6. Sugerir internal links relevantes
            7. Otimizar headings (H1, H2, H3)
            8. Criar alt text para imagens sugeridas
            
            Foco em rankear para termos crypto em português
            """,
            agent=agent,
            expected_output="Conteúdo totalmente otimizado com meta dados"
        )
```

### 5. Ferramentas Customizadas

#### `tools/strapi_tool.py`
```python
from crewai_tools import BaseTool
import aiohttp
import asyncio
import json
import os

class StrapiPublisherTool(BaseTool):
    name: str = "Strapi Publisher"
    description: str = "Publica posts no Strapi CMS"
    
    def _run(self, post_data: str) -> str:
        """Publica post no Strapi"""
        try:
            # Parse do JSON se necessário
            if isinstance(post_data, str):
                post_data = json.loads(post_data)
            
            # Executar de forma assíncrona
            result = asyncio.run(self._publish_async(post_data))
            return result
        except Exception as e:
            return f"Erro ao publicar: {str(e)}"
    
    async def _publish_async(self, post_data):
        headers = {
            'Authorization': f'Bearer {os.getenv("STRAPI_API_TOKEN")}',
            'Content-Type': 'application/json'
        }
        
        # Preparar dados para Strapi
        strapi_data = {
            '/var/lib/docker/volumes/thecryptofrontier-data': {
                'title': post_data.get('title'),
                'slug': post_data.get('slug'),
                'content': post_data.get('content'),
                'excerpt': post_data.get('excerpt'),
                'seo': post_data.get('seo', {}),
                'publishedAt': post_data.get('publishedAt'),
                'status': 'published'
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{os.getenv('STRAPI_URL')}/api/posts",
                json=strapi_data,
                headers=headers
            ) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    return f"Post publicado com sucesso! ID: {result['/var/lib/docker/volumes/thecryptofrontier-data']['id']}"
                else:
                    error = await response.text()
                    return f"Erro ao publicar: {response.status} - {error}"
```

#### `tools/crypto_tool.py`
```python
from crewai_tools import BaseTool
import requests

class CryptoDataTool(BaseTool):
    name: str = "Crypto /var/lib/docker/volumes/thecryptofrontier-data Fetcher"
    description: str = "Busca dados de preços e informações de criptomoedas"
    
    def _run(self, query: str) -> str:
        """
        Busca dados de crypto
        Query format: "price bitcoin" ou "marketcap ethereum"
        """
        parts = query.split()
        if len(parts) < 2:
            return "Formato inválido. Use: 'price bitcoin' ou 'marketcap ethereum'"
        
        action = parts[0]
        crypto = parts[1]
        
        # Usar API gratuita do CoinGecko
        try:
            if action == "price":
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto}&vs_currencies=usd,brl"
                response = requests.get(url)
                /var/lib/docker/volumes/thecryptofrontier-data = response.json()
                
                if crypto in /var/lib/docker/volumes/thecryptofrontier-data:
                    usd = /var/lib/docker/volumes/thecryptofrontier-data[crypto]['usd']
                    brl = /var/lib/docker/volumes/thecryptofrontier-data[crypto]['brl']
                    return f"{crypto.capitalize()}: ${usd:,.2f} USD | R$ {brl:,.2f} BRL"
                else:
                    return f"Crypto {crypto} não encontrada"
                    
            elif action == "marketcap":
                url = f"https://api.coingecko.com/api/v3/coins/{crypto}"
                response = requests.get(url)
                /var/lib/docker/volumes/thecryptofrontier-data = response.json()
                
                market_cap = /var/lib/docker/volumes/thecryptofrontier-data['market_data']['market_cap']['usd']
                return f"Market Cap de {crypto.capitalize()}: ${market_cap:,.0f} USD"
                
        except Exception as e:
            return f"Erro ao buscar dados: {str(e)}"
```

### 6. Crew Principal

#### `crews/blog_crew.py`
```python
from crewai import Crew, Process
from agents.researcher import ResearchAgent
from agents.writer import WriterAgent
from agents.seo_specialist import SEOAgent
from tasks.research_tasks import ResearchTasks
from tasks.writing_tasks import WritingTasks
from tasks.seo_tasks import SEOTasks

class BlogCrew:
    def __init__(self):
        # Inicializar agentes
        self.researcher = ResearchAgent().create()
        self.writer = WriterAgent().create()
        self.seo_specialist = SEOAgent().create()
        
        # Inicializar tarefas
        self.research_tasks = ResearchTasks()
        self.writing_tasks = WritingTasks()
        self.seo_tasks = SEOTasks()
    
    def create_blog_post(self, topic: str, keywords: list):
        """Cria um post completo sobre o tópico"""
        
        # Definir tarefas
        research_task = self.research_tasks.research_topic(
            self.researcher, topic, keywords
        )
        
        competitor_analysis = self.research_tasks.analyze_competitors(
            self.researcher, topic
        )
        
        writing_task = self.writing_tasks.write_blog_post(
            self.writer, topic, "USE_PREVIOUS_TASK_OUTPUT"
        )
        
        seo_task = self.seo_tasks.optimize_content(
            self.seo_specialist, "USE_PREVIOUS_TASK_OUTPUT"
        )
        
        social_task = self.writing_tasks.create_social_snippets(
            self.writer, "USE_PREVIOUS_TASK_OUTPUT"
        )
        
        # Criar crew
        crew = Crew(
            agents=[self.researcher, self.writer, self.seo_specialist],
            tasks=[research_task, competitor_analysis, writing_task, seo_task, social_task],
            verbose=True,
            process=Process.sequential
        )
        
        # Executar
        result = crew.kickoff()
        return result
    
    def create_crypto_analysis(self, crypto_name: str):
        """Cria análise específica de uma criptomoeda"""
        
        # Tarefas especializadas para análise crypto
        research_task = Task(
            description=f"""
            Realize uma análise completa de {crypto_name}:
            
            1. Dados técnicos atuais (preço, volume, market cap)
            2. Histórico de desenvolvimento
            3. Casos de uso e adoção
            4. Análise de sentimento do mercado
            5. Projeções e opiniões de especialistas
            6. Riscos e oportunidades
            
            Use a ferramenta Crypto /var/lib/docker/volumes/thecryptofrontier-data Fetcher para dados em tempo real
            """,
            agent=self.researcher,
            expected_output="Análise completa com dados técnicos e fundamentais"
        )
        
        # Continuar com escrita e otimização...
        crew = Crew(
            agents=[self.researcher, self.writer, self.seo_specialist],
            tasks=[research_task, writing_task, seo_task],
            verbose=True
        )
        
        return crew.kickoff()
```

### 7. Script Principal

#### `main.py`
```python
#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from crews.blog_crew import BlogCrew
import asyncio
import argparse

# Carregar variáveis de ambiente
load_dotenv()

class BlogAutomation:
    def __init__(self):
        self.blog_crew = BlogCrew()
    
    async def create_single_post(self, topic: str, keywords: list):
        """Cria um único post"""
        print(f"🚀 Criando post sobre: {topic}")
        print(f"📌 Palavras-chave: {', '.join(keywords)}")
        
        try:
            # Executar crew
            result = self.blog_crew.create_blog_post(topic, keywords)
            
            print("\n✅ Post criado com sucesso!")
            print("-" * 50)
            print(result)
            
            # Salvar resultado
            filename = f"output_{topic.replace(' ', '_').lower()}.md"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(str(result))
            
            print(f"\n📄 Salvo em: {filename}")
            
            return result
            
        except Exception as e:
            print(f"\n❌ Erro: {str(e)}")
            return None
    
    async def batch_create_posts(self, topics_file: str):
        """Cria múltiplos posts de um arquivo"""
        with open(topics_file, 'r', encoding='utf-8') as f:
            topics = json.load(f)
        
        results = []
        for topic_data in topics:
            result = await self.create_single_post(
                topic_data['topic'],
                topic_data['keywords']
            )
            results.append(result)
            
            # Delay entre posts
            await asyncio.sleep(30)
        
        return results

def main():
    parser = argparse.ArgumentParser(description='Blog Automation com CrewAI')
    parser.add_argument('--topic', type=str, help='Tópico do post')
    parser.add_argument('--keywords', type=str, help='Palavras-chave (separadas por vírgula)')
    parser.add_argument('--batch', type=str, help='Arquivo JSON com múltiplos tópicos')
    parser.add_argument('--crypto', type=str, help='Nome da crypto para análise')
    
    args = parser.parse_args()
    
    automation = BlogAutomation()
    
    if args.topic and args.keywords:
        # Post único
        keywords = [k.strip() for k in args.keywords.split(',')]
        asyncio.run(automation.create_single_post(args.topic, keywords))
        
    elif args.batch:
        # Múltiplos posts
        asyncio.run(automation.batch_create_posts(args.batch))
        
    elif args.crypto:
        # Análise de crypto
        result = automation.blog_crew.create_crypto_analysis(args.crypto)
        print(result)
        
    else:
        print("Use --help para ver as opções disponíveis")

if __name__ == "__main__":
    main()
```

### 8. Arquivo de Configuração para Batch

#### `topics.json`
```json
[
    {
        "topic": "Bitcoin Halving 2024: Impactos no Mercado",
        "keywords": ["bitcoin halving", "btc 2024", "mineração bitcoin", "preço bitcoin"]
    },
    {
        "topic": "DeFi: O Futuro das Finanças Descentralizadas",
        "keywords": ["defi", "finanças descentralizadas", "yield farming", "liquidity pools"]
    },
    {
        "topic": "NFTs além da Arte: Casos de Uso Práticos",
        "keywords": ["nft utility", "nft casos uso", "tokens não fungíveis", "web3"]
    }
]
```

### 9. Executando o Sistema

#### Comandos Básicos
```bash
# Post único
python main.py --topic "Ethereum 2.0: O que Esperar" --keywords "ethereum,eth2.0,staking,pos"

# Múltiplos posts
python main.py --batch topics.json

# Análise de crypto
python main.py --crypto bitcoin
```

#### Script de Automação (`run_crew.sh`)
```bash
#!/bin/bash
# Script para executar CrewAI Blog Automation

# Ativar ambiente virtual
source venv/bin/activate

# Verificar variáveis de ambiente
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY não configurada!"
    exit 1
fi

# Executar com logs
python main.py "$@" 2>&1 | tee -a crew_blog_$(date +%Y%m%d).log

echo "✅ Execução concluída!"
```

### 10. Monitoramento e Logs

#### `monitor.py`
```python
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'crew_blog_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('BlogCrewAI')

# Usar em callbacks do CrewAI
def log_step_callback(step_output):
    logger.info(f"Step completed: {step_output}")

def log_task_callback(task_output):
    logger.info(f"Task completed: {task_output}")
```

## 🎯 Dicas de Otimização

1. **Performance**
   - Use `max_iter` nos agentes para limitar iterações
   - Configure `temperature` apropriada para cada agente
   - Use cache para pesquisas repetidas

2. **Qualidade**
   - Forneça backstories detalhadas aos agentes
   - Use ferramentas especializadas
   - Implemente validação de output

3. **Custo**
   - Use Gemini para tarefas de pesquisa (mais barato)
   - Limite o número de iterações
   - Implemente cache de resultados

4. **Escalabilidade**
   - Use process='hierarchical' para crews complexas
   - Implemente filas de tarefas
   - Monitore uso de recursos