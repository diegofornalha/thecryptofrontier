#!/usr/bin/env python

import os
import sys
import argparse
import time
import json
import feedparser
from datetime import datetime
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process

# Adicionar diretório pai ao PATH para importar corretamente
sys.path.append(str(Path(__file__).parent.parent.parent))

# Importar módulos do pacote
from agentes_backup_legado import AGENT_ROLES
from agentes_backup_legado.logger import setup_logger
from agentes_backup_legado.db_manager import DatabaseManager

# Importar funções do módulo RSS - caminho correto sem hífen
sys.path.append(str(Path(__file__).parent))
from rss_monitor import obter_feeds_rss, verificar_artigo_processado

# Configuração de logging
logger = setup_logger("monitoramento_crew")

# Configuração da API Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Diretório para salvar os artigos traduzidos
POSTS_DIR = Path(__file__).parent.parent.parent / "posts_traduzidos"
POSTS_DIR.mkdir(exist_ok=True)

# Limite de artigos por execução
MAX_ARTICLES_PER_RUN = 3

# Função para criar um nome de arquivo seguro
def criar_nome_arquivo(title, date):
    """Cria um nome de arquivo seguro baseado no título e data."""
    date_str = date.strftime("%Y-%m-%d")
    safe_title = "".join(c if c.isalnum() or c in " -" else "_" for c in title)
    safe_title = safe_title.replace(" ", "-").lower()[:80]  # Limita tamanho
    return f"{date_str}-{safe_title}.md"

# Define o agente monitor de RSS
def criar_agente_monitor():
    return Agent(
        role=AGENT_ROLES["MONITOR"],
        goal="Monitorar feeds RSS e identificar novos artigos sobre criptomoedas",
        backstory="""Você é um especialista em monitoramento de feeds RSS. 
        Sua missão é identificar artigos sobre criptomoedas que ainda não foram 
        processados e fornecer um resumo do seu conteúdo para avaliação.""",
        verbose=True,
        allow_delegation=False,
    )

# Define o agente seletor de conteúdo
def criar_agente_seletor():
    return Agent(
        role=AGENT_ROLES["SELECTOR"],
        goal="Avaliar e selecionar conteúdo relevante sobre criptomoedas para o blog",
        backstory="""Você é um especialista em criptomoedas com grande experiência em blockchain,
        DeFi, NFTs e tendências do mercado. Sua missão é identificar conteúdo relevante 
        e de alta qualidade para o público brasileiro interessado em criptomoedas.""",
        verbose=True,
        allow_delegation=False,
    )

# Função principal para processar feeds com CrewAI
def processar_feeds_com_crew(loop_minutes=None):
    """Processa os feeds RSS usando agentes CrewAI."""
    logger.info("Iniciando monitoramento de feeds RSS com agentes CrewAI.")
    print(f"Iniciando monitoramento de feeds RSS com agentes CrewAI.")
    
    # Inicializar agentes
    agente_monitor = criar_agente_monitor()
    agente_seletor = criar_agente_seletor()
    
    # Inicializar banco de dados
    db = DatabaseManager()
    
    # Obter lista de feeds RSS
    feeds_rss = obter_feeds_rss()
    
    # Processar feeds
    while True:
        artigos_processados = 0
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds...")
        logger.info(f"Verificando feeds RSS. Total de feeds: {len(feeds_rss)}")
        
        for feed_url in feeds_rss:
            if artigos_processados >= MAX_ARTICLES_PER_RUN:
                break
                
            try:
                print(f"Buscando artigos de: {feed_url}")
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:5]:  # Verificar os 5 mais recentes
                    if artigos_processados >= MAX_ARTICLES_PER_RUN:
                        break
                        
                    title = entry.get("title", "Sem título")
                    link = entry.get("link", "")
                    
                    # Se já processamos este artigo, pular
                    if verificar_artigo_processado(db, title, link):
                        print(f"Artigo já processado: {title}")
                        continue
                    
                    # Data de publicação
                    pub_date = entry.get("published_parsed", None)
                    if pub_date:
                        date = datetime(*pub_date[:6])
                    else:
                        date = datetime.now()
                    
                    # Obter o conteúdo do artigo
                    summary = entry.get("summary", "")
                    content = entry.get("content", [{"value": ""}])[0]["value"] if "content" in entry else ""
                    article_content = content or summary or "Conteúdo não disponível"
                    
                    # Criar tarefa para o agente monitor analisar artigo
                    tarefa_monitor = Task(
                        description=f"""
                        Analise o seguinte artigo de criptomoedas:
                        
                        Título: {title}
                        URL: {link}
                        Data: {date.strftime('%Y-%m-%d')}
                        
                        Conteúdo: {article_content[:1500]}...
                        
                        Forneça:
                        1. Um resumo conciso do artigo (max 3 frases)
                        2. Os principais tópicos abordados (max 5 tópicos)
                        3. Razão pela qual pode ser relevante para investidores brasileiros
                        
                        Formato de resposta:
                        {{"resumo": "Resumo aqui", 
                         "topicos": ["tópico 1", "tópico 2", ...], 
                         "relevancia": "Explicação da relevância"}}
                        """,
                        agent=agente_monitor,
                        expected_output="Análise do artigo em formato JSON"
                    )
                    
                    # Executar análise
                    crew_monitor = Crew(
                        agents=[agente_monitor],
                        tasks=[tarefa_monitor],
                        verbose=1,
                        process=Process.sequential
                    )
                    
                    resultado_monitor = crew_monitor.kickoff()
                    
                    # Tentar extrair análise JSON da resposta
                    try:
                        analise = None
                        # Tentar extrair JSON diretamente
                        for line in resultado_monitor.raw.split('\n'):
                            line = line.strip()
                            if line.startswith('{') and line.endswith('}'):
                                analise = json.loads(line)
                                break
                        
                        # Extrair JSON entre blocos de código
                        if not analise:
                            import re
                            json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', resultado_monitor.raw, re.DOTALL)
                            if json_match:
                                analise = json.loads(json_match.group(1))
                        
                        # Se não conseguimos extrair o JSON, usar um fallback
                        if not analise:
                            analise = {
                                "resumo": resultado_monitor.raw[:200] + "...",
                                "topicos": ["Criptomoeda", "Blockchain"],
                                "relevancia": "Tópico atual em cripto"
                            }
                    except Exception as e:
                        logger.error(f"Erro ao extrair análise JSON: {str(e)}")
                        analise = {
                            "resumo": resultado_monitor.raw[:200] + "...",
                            "topicos": ["Criptomoeda", "Blockchain"],
                            "relevancia": "Tópico atual em cripto"
                        }
                    
                    # Criar tarefa para o agente seletor avaliar relevância
                    tarefa_selecao = Task(
                        description=f"""
                        Avalie se o seguinte artigo de criptomoedas é relevante para o público brasileiro:
                        
                        Título: {title}
                        URL: {link}
                        
                        Análise do artigo:
                        Resumo: {analise.get('resumo', '')}
                        Tópicos: {', '.join(analise.get('topicos', []))}
                        Relevância: {analise.get('relevancia', '')}
                        
                        Critérios de avaliação:
                        1. Relevância para investidores brasileiros
                        2. Novidade da informação
                        3. Potencial de interesse
                        4. Impacto no mercado brasileiro
                        
                        Retorne apenas "SIM" se o artigo for relevante ou "NÃO" caso contrário, seguido de uma breve justificativa.
                        """,
                        agent=agente_seletor,
                        expected_output="Decisão de relevância do artigo com justificativa"
                    )
                    
                    # Executar avaliação
                    crew_seletor = Crew(
                        agents=[agente_seletor],
                        tasks=[tarefa_selecao],
                        verbose=1,
                        process=Process.sequential
                    )
                    
                    resultado_avaliacao = crew_seletor.kickoff()
                    decisao = resultado_avaliacao.raw.strip().upper()
                    
                    # Se for relevante, registrar para tradução
                    if decisao.startswith("SIM"):
                        print(f"✅ Artigo considerado relevante: {title}")
                        logger.info(f"Artigo relevante identificado: {title}")
                        
                        # Registrar artigo no banco de dados como selecionado para tradução
                        db.inserir_artigo({
                            "title": title,
                            "url": link,
                            "date": date.isoformat(),
                            "content": article_content[:1000],  # Salvar apenas um trecho
                            "status": "selecionado",
                            "selected_at": datetime.now().isoformat()
                        })
                        
                        # Para módulo de tradução separado
                        # Vamos apenas criar um arquivo de marcação para o tradutor processar depois
                        nome_arquivo = criar_nome_arquivo(title, date)
                        caminho_arquivo = POSTS_DIR / f"para_traduzir_{nome_arquivo}"
                        
                        with open(caminho_arquivo, "w", encoding="utf-8") as f:
                            f.write(f"""---
title: "{title}"
url: "{link}"
date: "{date.isoformat()}"
status: "selecionado"
---

{article_content}
""")
                        
                        print(f"✅ Artigo marcado para tradução: {nome_arquivo}")
                        artigos_processados += 1
                    else:
                        print(f"❌ Artigo não relevante: {title}")
                        # Registrar artigo como rejeitado
                        db.inserir_artigo({
                            "title": title,
                            "url": link,
                            "date": date.isoformat(),
                            "status": "rejeitado",
                            "rejected_at": datetime.now().isoformat(),
                            "rejection_reason": decisao
                        })
                        
            except Exception as e:
                logger.error(f"Erro ao processar feed {feed_url}: {str(e)}")
                print(f"Erro ao processar feed {feed_url}: {str(e)}")
        
        if artigos_processados == 0:
            print("Nenhum novo artigo relevante encontrado.")
        else:
            print(f"Processados {artigos_processados} artigos nesta execução.")
            logger.info(f"Total de {artigos_processados} artigos marcados para tradução")
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até a próxima verificação
        print(f"Aguardando {loop_minutes} minutos até a próxima verificação...")
        logger.info(f"Entrando em modo de espera por {loop_minutes} minutos")
        time.sleep(loop_minutes * 60)

if __name__ == "__main__":
    # Configurar parser de argumentos
    parser = argparse.ArgumentParser(description="Monitor de feeds RSS com CrewAI")
    parser.add_argument("--loop", type=int, help="Verificar feeds a cada X minutos")
    args = parser.parse_args()
    
    try:
        processar_feeds_com_crew(args.loop)
    except KeyboardInterrupt:
        print("\nMonitoramento interrompido pelo usuário.")
        logger.info("Monitoramento interrompido pelo usuário")
        sys.exit(0) 