#!/usr/bin/env python

import os
import sys
import argparse
import json
import frontmatter
from datetime import datetime
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process

# Adicionar diretório pai ao PATH para importar corretamente
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar módulos do pacote
from agentes_backup_legado import AGENT_ROLES, setup_logger
from agentes_backup_legado.db_manager import DatabaseManager

# Configuração de logging
logger = setup_logger("translator")

# Configuração da API Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Diretórios de trabalho
POSTS_DIR = Path(__file__).parent.parent.parent / "posts_traduzidos"
POSTS_DIR.mkdir(exist_ok=True)

# Define o agente tradutor
def criar_agente_tradutor():
    return Agent(
        role=AGENT_ROLES["TRANSLATOR"],
        goal="Traduzir conteúdo de criptomoedas do inglês para português brasileiro",
        backstory="""Você é um tradutor especializado com grande experiência em criptomoedas.
        Sua tradução é precisa e natural, preservando o significado original do texto
        e adaptando termos técnicos para português quando apropriado.""",
        verbose=True,
        allow_delegation=False,
    )

# Define o agente adaptador/localizador
def criar_agente_adaptador():
    return Agent(
        role=AGENT_ROLES["LOCALIZER"],
        goal="Adaptar conteúdo de criptomoedas para o público brasileiro",
        backstory="""Você é especialista em adaptar conteúdo sobre criptomoedas para 
        o contexto brasileiro. Sabe como contextualizar exemplos, adicionar informações 
        relevantes para o Brasil e tornar o conteúdo mais acessível para o público local, 
        mantendo a precisão técnica.""",
        verbose=True,
        allow_delegation=False,
    )

# Função para obter artigos marcados para tradução
def obter_artigos_para_traduzir():
    """Obtém lista de artigos marcados para tradução."""
    artigos = []
    
    # Buscar arquivos marcados para tradução
    arquivos = list(POSTS_DIR.glob("para_traduzir_*.md"))
    
    for arquivo in arquivos:
        try:
            post = frontmatter.load(arquivo)
            artigos.append({
                "file_path": arquivo,
                "title": post.get("title", "Sem título"),
                "url": post.get("url", ""),
                "date": post.get("date", datetime.now().isoformat()),
                "content": post.content
            })
        except Exception as e:
            logger.error(f"Erro ao ler arquivo {arquivo}: {str(e)}")
    
    return artigos

# Função para traduzir um único artigo
def traduzir_artigo(artigo):
    """Traduz um artigo usando agentes CrewAI."""
    titulo = artigo["title"]
    url = artigo["url"]
    conteudo = artigo["content"]
    caminho_arquivo = artigo["file_path"]
    
    logger.info(f"Iniciando tradução do artigo: {titulo}")
    print(f"\nTraduzindo artigo: {titulo}")
    
    # Inicializar agentes
    agente_tradutor = criar_agente_tradutor()
    agente_adaptador = criar_agente_adaptador()
    
    # Tarefa para o tradutor
    tarefa_traducao = Task(
        description=f"""
        Traduza o seguinte artigo sobre criptomoedas do inglês para português brasileiro:

        Título original: {titulo}
        URL original: {url}
        
        Conteúdo original:
        {conteudo[:4000]}
        
        Siga estas diretrizes:
        1. Traduza para português brasileiro formal
        2. Mantenha termos técnicos de cripto quando não houver equivalente em português
        3. Preserve qualquer formatação importante do texto original
        4. Se o artigo for muito longo, foque nos pontos principais
        5. Inclua o título traduzido no início
        
        Retorne apenas o texto traduzido, sem comentários adicionais.
        """,
        agent=agente_tradutor,
        expected_output="Artigo traduzido para português brasileiro"
    )
    
    # Executar tradução
    crew_tradutor = Crew(
        agents=[agente_tradutor],
        tasks=[tarefa_traducao],
        verbose=1,
        process=Process.sequential
    )
    
    try:
        resultado_traducao = crew_tradutor.kickoff()
        conteudo_traduzido = resultado_traducao.raw
        
        # Tarefa para o adaptador
        tarefa_adaptacao = Task(
            description=f"""
            Adapte o seguinte artigo traduzido sobre criptomoedas para o público brasileiro:
            
            {conteudo_traduzido[:4000]}
            
            Siga estas diretrizes:
            1. Adicione contextualizações relevantes para o mercado brasileiro quando necessário
            2. Adapte exemplos para o contexto brasileiro se apropriado
            3. Explique conceitos que podem ser menos conhecidos no Brasil
            4. Mantenha o tom e estilo do artigo original
            5. Formate o resultado como um post de blog em Markdown
            6. Adicione 5-8 tags relevantes para o conteúdo
            7. Classifique o artigo em uma categoria principal (ex: Bitcoin, Ethereum, DeFi, NFTs, etc.)
            
            Retorne o artigo em formato Markdown com cabeçalho YAML contendo:
            - título traduzido
            - data original
            - tags
            - categoria
            - url original como referência
            """,
            agent=agente_adaptador,
            expected_output="Artigo adaptado em formato Markdown com cabeçalho YAML"
        )
        
        # Executar adaptação
        crew_adaptador = Crew(
            agents=[agente_adaptador],
            tasks=[tarefa_adaptacao],
            verbose=1,
            process=Process.sequential
        )
        
        resultado_adaptacao = crew_adaptador.kickoff()
        artigo_finalizado = resultado_adaptacao.raw
        
        # Extrair nome base do arquivo (remover "para_traduzir_")
        nome_base = caminho_arquivo.name.replace("para_traduzir_", "")
        novo_caminho = POSTS_DIR / nome_base
        
        # Salvar artigo traduzido e adaptado
        with open(novo_caminho, "w", encoding="utf-8") as f:
            f.write(artigo_finalizado)
        
        # Atualizar status no banco de dados
        db = DatabaseManager()
        db.atualizar_status_artigo(url, "traduzido")
        
        # Remover arquivo de marcação
        caminho_arquivo.unlink()
        
        logger.info(f"Artigo traduzido e salvo: {novo_caminho}")
        print(f"✅ Artigo traduzido e salvo: {novo_caminho}")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao traduzir artigo {titulo}: {str(e)}")
        print(f"❌ Erro ao traduzir artigo: {str(e)}")
        return False

# Função principal para traduzir todos os artigos marcados
def processar_traducoes():
    """Traduz todos os artigos marcados para tradução."""
    logger.info("Iniciando processamento de traduções com CrewAI")
    print("Iniciando traduções com agentes CrewAI...")
    
    artigos = obter_artigos_para_traduzir()
    
    if not artigos:
        logger.info("Nenhum artigo encontrado para traduzir")
        print("Nenhum artigo encontrado para traduzir.")
        return
    
    print(f"Encontrados {len(artigos)} artigos para traduzir.")
    logger.info(f"Encontrados {len(artigos)} artigos para traduzir")
    
    traduzidos = 0
    for artigo in artigos:
        if traduzir_artigo(artigo):
            traduzidos += 1
    
    logger.info(f"Processo concluído: {traduzidos}/{len(artigos)} artigos traduzidos")
    print(f"\nProcesso concluído: {traduzidos}/{len(artigos)} artigos traduzidos.")

if __name__ == "__main__":
    try:
        processar_traducoes()
    except KeyboardInterrupt:
        print("\nProcessamento interrompido pelo usuário.")
        logger.info("Processamento interrompido pelo usuário")
        sys.exit(0) 