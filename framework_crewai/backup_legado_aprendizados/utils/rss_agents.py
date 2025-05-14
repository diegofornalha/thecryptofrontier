#!/usr/bin/env python3
"""
Definição dos agentes para o fluxo RSS para Sanity
"""
from crewai import Agent

def create_agents():
    """Cria e retorna os agentes para o fluxo RSS para Sanity"""
    
    # Agente leitor de RSS
    rss_reader = Agent(
        role="Especialista em RSS",
        goal="Extrair conteúdo relevante de feeds RSS de criptomoedas",
        backstory="""Você é um especialista em análise de feeds RSS, com foco em blockchain e
        criptomoedas. Identifica rapidamente as notícias mais importantes.""",
        verbose=True
    )
    
    # Agente analista de conteúdo
    content_analyst = Agent(
        role="Analista de Conteúdo",
        goal="Analisar e enriquecer informações sobre criptomoedas",
        backstory="""Você é um analista especializado em blockchain e criptomoedas,
        com conhecimento sobre tecnologias emergentes e tendências de mercado.""",
        verbose=True
    )
    
    # Agente redator de conteúdo
    content_writer = Agent(
        role="Redator Especializado",
        goal="Criar conteúdo envolvente sobre criptomoedas",
        backstory="""Você é um redator experiente em blockchain,
        transformando análises técnicas em conteúdo acessível.""",
        verbose=True
    )
    
    # Agente publicador no Sanity
    sanity_publisher = Agent(
        role="Especialista em CMS",
        goal="Formatar conteúdo para o Sanity CMS",
        backstory="""Você é especialista no CMS Sanity, com conhecimento 
        dos schemas e estruturas de dados para publicação.""",
        verbose=True
    )
    
    return rss_reader, content_analyst, content_writer, sanity_publisher 