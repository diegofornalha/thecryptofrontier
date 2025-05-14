#!/usr/bin/env python
import os
import sys
import time
import argparse
from pathlib import Path

# Garantir que os módulos estejam no path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from src.blog_automacao import BlogAutomacaoCrew
from src.blog_automacao.logic.business_logic import execute_full_flow
from framework_crewai.utils_backeup_legado.publish_to_sanity import publish_articles, verify_publication, verify_duplicates
from framework_crewai.utils_backeup_legado.process_all_articles import process_all_pending_articles

def limpar_banco_dados():
    """Limpa o banco de dados para começar do zero."""
    import sqlite3
    try:
        conn = sqlite3.connect('posts_database.sqlite')
        cursor = conn.cursor()
        
        # Obter contagem
        cursor.execute("SELECT COUNT(*) FROM posts")
        count = cursor.fetchone()[0]
        
        cursor.execute("DELETE FROM posts")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='posts'")
        conn.commit()
        conn.close()
        
        print(f"✅ Banco de dados limpo com sucesso! {count} registros removidos.")
        return True
    except Exception as e:
        print(f"❌ Erro ao limpar banco de dados: {e}")
        return False

def monitorar_feeds():
    """Realiza o monitoramento dos feeds RSS."""
    print("\n========== Iniciando Monitoramento de Feeds RSS ==========")
    crew = BlogAutomacaoCrew()
    result = crew.monitoramento_crew().kickoff(inputs={})
    print("✅ Monitoramento concluído com sucesso!")
    return True

def traduzir_artigos():
    """Executa o processo completo de processamento, tradução e publicação."""
    print("\n========== Iniciando Processamento de Artigos ==========")
    process_all_pending_articles()
    print("✅ Processamento de artigos concluído!")
    return True

def publicar_artigos():
    """Publica os artigos traduzidos no Sanity CMS."""
    print("\n========== Publicando Artigos no Sanity CMS ==========")
    publish_articles()
    print("✅ Publicação concluída!")
    return True

def verificar_status():
    """Verifica o status das publicações no Sanity CMS."""
    print("\n========== Verificando Status de Publicações ==========")
    # Verificar posts publicados
    verify_publication()
    
    # Verificar posts duplicados
    print("\n========== Verificando Posts Duplicados ==========")
    verify_duplicates()
    
    return True

def executar_fluxo_completo(limpar=False):
    """Executa o fluxo completo de processamento."""
    print("\n" + "="*60)
    print("🚀 INICIANDO FLUXO COMPLETO DE AUTOMAÇÃO DE BLOG")
    print("="*60)
    
    # Registrar início
    time_start = time.time()
    
    if limpar:
        limpar_banco_dados()
    
    # Etapa 1: Monitoramento
    monitorar_feeds()
    
    # Etapa 2: Processamento e Publicação
    traduzir_artigos()
    
    # Etapa 3: Verificar status
    verificar_status()
    
    # Calcular tempo total
    time_end = time.time()
    duration = time_end - time_start
    minutes = int(duration // 60)
    seconds = int(duration % 60)
    
    print("\n" + "="*60)
    print(f"✅ FLUXO COMPLETO CONCLUÍDO EM {minutes}m {seconds}s")
    print("="*60)

if __name__ == "__main__":
    # Configurar argparse para opções de linha de comando
    parser = argparse.ArgumentParser(description="Automação de Blog com CrewAI")
    
    # Adicionar argumentos
    parser.add_argument("--limpar", action="store_true", help="Limpar banco de dados antes de iniciar")
    parser.add_argument("--monitorar", action="store_true", help="Apenas monitorar feeds RSS")
    parser.add_argument("--traduzir", action="store_true", help="Apenas traduzir artigos pendentes")
    parser.add_argument("--publicar", action="store_true", help="Apenas publicar artigos traduzidos")
    parser.add_argument("--verificar", action="store_true", help="Apenas verificar status no Sanity")
    
    # Parsear argumentos
    args = parser.parse_args()
    
    # Verificar se alguma opção específica foi escolhida
    if args.monitorar:
        monitorar_feeds()
    elif args.traduzir:
        traduzir_artigos()
    elif args.publicar:
        publicar_artigos()
    elif args.verificar:
        verificar_status()
    else:
        # Se nenhuma opção específica, executar fluxo completo
        executar_fluxo_completo(limpar=args.limpar) 