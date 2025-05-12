#!/usr/bin/env python
# gerar_posts.py
"""
Script para acionar a geração de novos posts RSS com diferentes opções.

Uso:
    python gerar_posts.py                   # Executa uma vez e gera novos posts
    python gerar_posts.py --loop 60         # Executa em loop a cada 60 minutos
    python gerar_posts.py --historico       # Gera apenas o histórico de traduções
    python gerar_posts.py --migrar-sqlite   # Migra dados para o banco SQLite
    python gerar_posts.py --ajuda           # Mostra esta ajuda
"""

import os
import sys
import time
from datetime import datetime
import argparse

# Importa os módulos do sistema
import main
import logger
import config
import rss_monitor
import db_manager

def mostrar_ajuda():
    """Mostra a ajuda do script."""
    print("""
Gerador de Posts RSS - Ajuda

Opções:
    --loop MINUTOS     Executa o monitoramento em loop, verificando a cada MINUTOS
    --historico        Gera apenas o histórico de traduções HTML
    --migrar-sqlite    Migra dados do formato JSON para o banco SQLite
    --ajuda            Mostra esta ajuda

Exemplos:
    python gerar_posts.py                   # Executa uma vez
    python gerar_posts.py --loop 60         # Executa a cada 60 minutos
    python gerar_posts.py --historico       # Gera apenas o histórico
    python gerar_posts.py --migrar-sqlite   # Migra dados para SQLite
    """)

def gerar_historico():
    """Gera o histórico de traduções."""
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Gerando histórico de traduções...")
    arquivo_historico = logger.generate_history_html()
    if arquivo_historico:
        print(f"Histórico gerado com sucesso em: {arquivo_historico}")
    else:
        print("Erro ao gerar histórico de traduções.")

def migrar_para_sqlite():
    """Migra dados do formato JSON para SQLite."""
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando migração para SQLite...")
    
    # Inicializa o banco de dados
    db_manager.init_db()
    
    # Migra os dados de posts processados
    rss_monitor.migrate_to_sqlite()
    
    # Migra os dados de log de traduções
    logger.migrate_to_sqlite()
    
    print("Migração para SQLite concluída.")

def main_function():
    """Função principal que processa os argumentos e executa as ações."""
    # Configura o parser de argumentos
    parser = argparse.ArgumentParser(description="Gerador de Posts RSS")
    parser.add_argument("--loop", type=int, help="Executa em loop a cada N minutos")
    parser.add_argument("--historico", action="store_true", help="Gera apenas o histórico de traduções")
    parser.add_argument("--migrar-sqlite", action="store_true", help="Migra dados para SQLite")
    parser.add_argument("--ajuda", action="store_true", help="Mostra ajuda")
    
    # Processa os argumentos
    args = parser.parse_args()
    
    # Mostra ajuda se solicitado
    if args.ajuda:
        mostrar_ajuda()
        return
    
    # Migra para SQLite se solicitado
    if args.migrar_sqlite:
        migrar_para_sqlite()
        return
    
    # Gera apenas o histórico se solicitado
    if args.historico:
        gerar_historico()
        return
    
    # Executa em loop
    if args.loop:
        print(f"Iniciando monitoramento em loop a cada {args.loop} minutos...")
        try:
            while True:
                # Executa o processamento de posts
                main.run_single_cycle()
                
                # Gera o histórico após cada ciclo
                gerar_historico()
                
                # Aguarda até o próximo ciclo
                print(f"\nAguardando {args.loop} minutos até o próximo ciclo...")
                time.sleep(args.loop * 60)
        except KeyboardInterrupt:
            print("\nMonitoramento interrompido pelo usuário.")
    else:
        # Executa uma única vez
        print("Executando processamento único de posts RSS...")
        main.run_single_cycle()
        gerar_historico()
        print("Processamento concluído.")

if __name__ == "__main__":
    main_function() 