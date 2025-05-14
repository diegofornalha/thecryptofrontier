#!/usr/bin/env python3
"""
Script simplificado para automação de blog usando CrewAI.
Executa o fluxo completo: busca de artigos RSS → tradução → formatação → publicação.
Sem dependências de Redis ou Streamlit.
Implementado conforme documentação oficial: https://docs.crewai.com/
"""

import os
import json
import logging
import time
from pathlib import Path
from datetime import datetime

# Importações do CrewAI
from crewai import Agent, Task, Crew, Process
from langchain_core.tools import tool

# Configuração básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("simple_blog_flow")

# Verificar se as variáveis de ambiente essenciais estão definidas
REQUIRED_ENV_VARS = ["GEMINI_API_KEY", "SANITY_PROJECT_ID", "SANITY_API_TOKEN"]
for var in REQUIRED_ENV_VARS:
    if not os.environ.get(var):
        logger.warning(f"Variável de ambiente {var} não definida!")

# Configuração do LLM (Google Gemini Pro)
from langchain_google_genai import ChatGoogleGenerativeAI

# Definir API Key do Google Gemini
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Criar o LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

# Definir ferramentas usando o decorador @tool
@tool
def read_rss_feeds(feeds_file="feeds.json"):
    """Lê os feeds RSS configurados e retorna os artigos mais recentes."""
    import feedparser
    
    # Carregar configuração de feeds
    try:
        with open(feeds_file, "r") as f:
            feeds_config = json.load(f)
    except Exception as e:
        logger.error(f"Erro ao carregar feeds: {str(e)}")
        return {"error": str(e), "feeds": []}
    
    results = []
    
    # Processar cada feed
    for feed in feeds_config:
        try:
            logger.info(f"Lendo feed: {feed['name']} ({feed['url']})")
            parsed_feed = feedparser.parse(feed["url"])
            
            # Verificar se o feed foi parseado corretamente
            if not hasattr(parsed_feed, "entries"):
                logger.warning(f"Feed sem entradas: {feed['name']}")
                continue
                
            # Processar os últimos 5 artigos do feed
            for entry in parsed_feed.entries[:5]:
                article = {
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "summary": entry.get("summary", ""),
                    "published": entry.get("published", ""),
                    "source": feed["name"],
                    "tags": [tag.get("term", "") for tag in entry.get("tags", [])] if hasattr(entry, "tags") else [],
                    "processed_date": datetime.now().isoformat(),
                }
                results.append(article)
            
            logger.info(f"Feed {feed['name']} processado com sucesso: {len(parsed_feed.entries[:5])} artigos")
            
        except Exception as e:
            logger.error(f"Erro ao processar feed {feed['name']}: {str(e)}")
    
    return results

@tool
def save_to_file(data, file_path):
    """Salva dados em um arquivo JSON."""
    try:
        # Criar diretório se não existir
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Salvar dados no arquivo
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return {"success": True, "path": file_path}
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo {file_path}: {str(e)}")
        return {"success": False, "error": str(e)}

@tool
def read_from_file(file_path):
    """Lê dados de um arquivo JSON."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Erro ao ler arquivo {file_path}: {str(e)}")
        return {"error": str(e)}

@tool
def publish_to_sanity(post_data):
    """Publica um post no Sanity CMS."""
    try:
        import requests
        
        # Configurações do Sanity
        project_id = os.environ.get("SANITY_PROJECT_ID")
        dataset = "production"
        api_token = os.environ.get("SANITY_API_TOKEN")
        
        if not project_id or not api_token:
            return {"success": False, "error": "Credenciais do Sanity não configuradas"}
        
        # URL da API do Sanity
        url = f"https://{project_id}.api.sanity.io/v2021-06-07/data/mutate/{dataset}"
        
        # Configuração de autenticação
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_token}"
        }
        
        # Preparar a mutação
        mutations = {
            "mutations": [
                {
                    "create": {
                        "_type": "post",
                        "title": post_data.get("title"),
                        "slug": {"_type": "slug", "current": post_data.get("slug")},
                        "content": post_data.get("content"),
                        "excerpt": post_data.get("excerpt", ""),
                        "publishedAt": datetime.now().isoformat(),
                    }
                }
            ]
        }
        
        # Enviar a requisição
        response = requests.post(url, headers=headers, json=mutations)
        
        if response.status_code == 200:
            result = response.json()
            return {"success": True, "document_id": result.get("results", [{}])[0].get("id")}
        else:
            return {"success": False, "error": f"Erro HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        logger.error(f"Erro ao publicar no Sanity: {str(e)}")
        return {"success": False, "error": str(e)}

def create_agents():
    """Cria os agentes necessários para o fluxo."""
    
    # Agente Monitor - responsável por monitorar feeds RSS
    monitor = Agent(
        role="Monitor de Feeds RSS",
        goal="Encontrar artigos relevantes sobre criptomoedas em feeds RSS",
        backstory="""Você é um especialista em monitoramento de notícias e feeds RSS.
        Sua função é verificar feeds de notícias de criptomoedas e identificar artigos
        relevantes e interessantes para serem traduzidos para o público brasileiro.""",
        verbose=True,
        tools=[read_rss_feeds, save_to_file],
        llm=llm
    )
    
    # Agente Tradutor - responsável por traduzir artigos
    translator = Agent(
        role="Tradutor de Conteúdo",
        goal="Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade",
        backstory="""Você é um tradutor especializado em criptomoedas e tecnologia blockchain.
        Você conhece a terminologia técnica e sabe adaptá-la para o público brasileiro.
        Sua tradução é fluida e natural, preservando o significado original do texto.""",
        verbose=True,
        tools=[read_from_file, save_to_file],
        llm=llm
    )
    
    # Agente Formatador - responsável por formatar o conteúdo para o Sanity
    formatter = Agent(
        role="Formatador de Conteúdo",
        goal="Preparar o conteúdo traduzido para publicação no Sanity CMS",
        backstory="""Você é especialista em formatação de conteúdo para CMS. 
        Seu trabalho é transformar o artigo traduzido em um formato compatível com o Sanity CMS,
        organizando metadados, conteúdo e criando slugs apropriados.""",
        verbose=True,
        tools=[read_from_file, save_to_file],
        llm=llm
    )
    
    # Agente Publicador - responsável por publicar no Sanity
    publisher = Agent(
        role="Publicador de Conteúdo",
        goal="Publicar artigos formatados no Sanity CMS",
        backstory="""Você é responsável pela publicação final dos artigos no CMS.
        Você verifica se tudo está correto e realiza a publicação, garantindo que
        o conteúdo esteja disponível no blog.""",
        verbose=True,
        tools=[read_from_file, publish_to_sanity, save_to_file],
        llm=llm
    )
    
    return monitor, translator, formatter, publisher

def create_tasks(monitor, translator, formatter, publisher):
    """Cria as tarefas para o fluxo."""
    
    # Tarefa 1: Monitorar feeds RSS
    monitoring_task = Task(
        description="""
        Monitore os feeds RSS definidos no arquivo feeds.json e encontre os 3 artigos mais relevantes
        e interessantes para o público brasileiro. 
        
        Para cada artigo:
        1. Avalie a relevância e interesse para o público brasileiro
        2. Verifique se o conteúdo é atual e informativo
        3. Colete título, link, resumo e data de publicação
        
        Salve cada artigo selecionado em um arquivo separado na pasta 'posts_para_traduzir'
        com nome 'para_traduzir_{timestamp}_{index}.json'
        
        Retorne a lista dos arquivos salvos.
        """,
        agent=monitor,
        expected_output="Lista de arquivos JSON salvos na pasta 'posts_para_traduzir'"
    )
    
    # Tarefa 2: Traduzir artigos
    translation_task = Task(
        description="""
        Traduza os artigos encontrados na pasta 'posts_para_traduzir'.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo original
        2. Traduza o título, resumo e conteúdo para português brasileiro
        3. Adapte o texto para o público brasileiro, mantendo os termos técnicos conforme necessário
        4. Salve o artigo traduzido em um arquivo na pasta 'posts_traduzidos'
           com nome 'traduzido_{nome_original}'
        
        Retorne a lista dos arquivos traduzidos.
        """,
        agent=translator,
        expected_output="Lista de arquivos JSON traduzidos na pasta 'posts_traduzidos'"
    )
    
    # Tarefa 3: Formatar para o Sanity
    formatting_task = Task(
        description="""
        Formate os artigos traduzidos da pasta 'posts_traduzidos' para o formato do Sanity CMS.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo traduzido
        2. Crie um slug a partir do título (remova acentos, substitua espaços por hífens, use letras minúsculas)
        3. Formate o conteúdo para o Sanity, separando em parágrafos
        4. Adicione metadados: título, slug, resumo, data de publicação
        5. Salve o artigo formatado em um arquivo na pasta 'posts_formatados'
           com nome 'formatado_{nome_original}'
        
        Retorne a lista dos arquivos formatados.
        """,
        agent=formatter,
        expected_output="Lista de arquivos JSON formatados na pasta 'posts_formatados'"
    )
    
    # Tarefa 4: Publicar no Sanity
    publishing_task = Task(
        description="""
        Publique os artigos formatados da pasta 'posts_formatados' no Sanity CMS.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo formatado
        2. Publique o artigo no Sanity usando a ferramenta publish_to_sanity
        3. Verifique se a publicação foi bem-sucedida
        4. Se publicado com sucesso, mova o arquivo para 'posts_publicados'
           com nome 'publicado_{nome_original}'
        
        Retorne um relatório dos artigos publicados com sucesso.
        """,
        agent=publisher,
        expected_output="Relatório de publicação dos artigos no Sanity CMS"
    )
    
    return [monitoring_task, translation_task, formatting_task, publishing_task]

def setup_directories():
    """Cria as pastas necessárias para o fluxo."""
    directories = [
        "posts_para_traduzir",
        "posts_traduzidos",
        "posts_formatados",
        "posts_publicados"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Diretório '{directory}' criado/verificado com sucesso")

def run_blog_flow():
    """Executa o fluxo completo de automação do blog."""
    
    # Configurar pastas de trabalho
    setup_directories()
    
    # Criar os agentes
    logger.info("Criando agentes...")
    monitor, translator, formatter, publisher = create_agents()
    
    # Criar as tarefas
    logger.info("Definindo tarefas...")
    tasks = create_tasks(monitor, translator, formatter, publisher)
    
    # Criar a crew
    logger.info("Montando a equipe de agentes...")
    crew = Crew(
        agents=[monitor, translator, formatter, publisher],
        tasks=tasks,
        verbose=2,
        process=Process.sequential
    )
    
    # Executar o fluxo
    logger.info("Iniciando o fluxo de automação...")
    result = crew.kickoff()
    
    # Exibir resultado final
    logger.info(f"Fluxo concluído com sucesso!")
    logger.info(f"Resultado: {result}")
    
    return result

if __name__ == "__main__":
    logger.info("Iniciando processo simplificado de automação de blog...")
    run_blog_flow()