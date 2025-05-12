#!/usr/bin/env python
"""
Script principal para execução da automação de blog usando CrewAI.

Uso:
    python -m src.blog_automacao.main [--monitoramento|--traducao|--publicacao|--completo] [--loop N]

Opções:
    --monitoramento  Executa apenas o monitoramento e seleção de conteúdo
    --traducao       Executa apenas a tradução e adaptação de conteúdo
    --publicacao     Executa apenas a revisão e publicação de conteúdo
    --completo       Executa o fluxo completo (padrão)
    --loop N         Executa em loop a cada N minutos
"""

import os
import sys
import time
import argparse
import json
from datetime import datetime
from pathlib import Path

from blog_automacao import BlogAutomacaoCrew
from blog_automacao.tools.rss_tools import RssFeedTool

def executar_monitoramento_direto(loop_minutes=None):
    """Executa o monitoramento diretamente usando a ferramenta RSS, sem passar pelos agentes CrewAI.
    
    Este é um método alternativo quando o Gemini não está disponível ou configurado.
    
    Args:
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS DIRETO ===")
    
    # Criar diretório para artigos a serem traduzidos se não existir
    os.makedirs("posts_para_traduzir", exist_ok=True)
    os.makedirs("posts_traduzidos", exist_ok=True)
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds RSS...")
        
        # Criar ferramenta RSS
        rss_tool = RssFeedTool()
        
        # Executar ferramenta
        artigos = rss_tool._run(max_entries=5)
        
        # Verificar se encontramos artigos novos
        if not artigos:
            print("Nenhum artigo novo encontrado.")
        else:
            print(f"Encontrados {len(artigos)} artigos novos.")
            
            # Salvar artigos para tradução
            for i, artigo in enumerate(artigos):
                # Gerar nome de arquivo único para o artigo
                titulo_slug = artigo["title"].lower()
                titulo_slug = "".join(c if c.isalnum() else "_" for c in titulo_slug)
                titulo_slug = titulo_slug[:50]  # Limitar tamanho
                
                arquivo_nome = f"para_traduzir_{int(time.time())}_{i}_{titulo_slug}.md"
                caminho_arquivo = Path("posts_para_traduzir") / arquivo_nome
                
                # Criar cabeçalho YAML Front Matter
                front_matter = {
                    "title": artigo["title"],
                    "original_link": artigo["link"],
                    "date": artigo["date"],
                    "source": artigo["source"],
                    "tags": artigo.get("tags", ["bitcoin", "criptomoedas"]),
                    "status": "para_traduzir"
                }
                
                # Salvar como markdown
                with open(caminho_arquivo, "w", encoding="utf-8") as f:
                    f.write("---\n")
                    json.dump(front_matter, f, ensure_ascii=False, indent=2)
                    f.write("\n---\n\n")
                    f.write(artigo["content"])
                
                print(f"Artigo salvo para tradução: {caminho_arquivo}")
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até a próxima verificação
        print(f"Aguardando {loop_minutes} minutos até a próxima verificação...")
        time.sleep(loop_minutes * 60)

def executar_monitoramento(crew, loop_minutes=None):
    """Executa apenas o monitoramento e seleção de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS ===")
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds RSS...")
        
        try:
            # Executar crew de monitoramento
            inputs = {}
            print("Tentando executar com CrewAI e Gemini...")
            result = crew.monitoramento_crew().kickoff(inputs=inputs)
            
            print(f"\nProcessamento concluído com CrewAI.")
            print(result.raw)
        except Exception as e:
            print(f"Erro ao executar crew de monitoramento: {str(e)}")
            print("\nMudando para modo direto (sem CrewAI/Gemini)...")
            try:
                # Tentar até 3 vezes com delay entre tentativas
                max_retries = 3
                for i in range(max_retries):
                    try:
                        executar_monitoramento_direto(None)  # Executar uma vez
                        print("Monitoramento direto executado com sucesso.")
                        break
                    except Exception as e2:
                        if i < max_retries - 1:
                            print(f"Tentativa {i+1} falhou: {str(e2)}")
                            print(f"Aguardando 5 segundos antes da próxima tentativa...")
                            time.sleep(5)
                        else:
                            print(f"Todas as tentativas falharam. Último erro: {str(e2)}")
                            raise
            except Exception as e3:
                print(f"Erro no modo direto: {str(e3)}")
                print("ERRO CRÍTICO: Não foi possível executar o monitoramento de nenhuma forma.")
                if not loop_minutes:
                    sys.exit(1)  # Sair com erro se não estiver em loop
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até a próxima verificação
        print(f"Aguardando {loop_minutes} minutos até a próxima verificação...")
        time.sleep(loop_minutes * 60)

def executar_traducao(crew):
    """Executa apenas a tradução e adaptação de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
    """
    print(f"=== INICIANDO TRADUÇÃO DE ARTIGOS ===")
    
    # Verificar se há artigos para traduzir
    dir_posts = Path("posts_para_traduzir")
    arquivos = list(dir_posts.glob("para_traduzir_*.md"))
    
    if not arquivos:
        print("Nenhum artigo encontrado para traduzir.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para traduzir.")
    
    # Processar cada arquivo
    for arquivo in arquivos:
        print(f"\nProcessando: {arquivo.name}")
        inputs = {
            "arquivo_markdown": str(arquivo)
        }
        
        result = crew.traducao_crew().kickoff(inputs=inputs)
        print(f"Resultado: {result.raw[:100]}...")

def executar_publicacao(crew):
    """Executa apenas a revisão e publicação de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
    """
    print(f"=== INICIANDO PUBLICAÇÃO NO SANITY ===")
    
    # Verificar se há artigos traduzidos para publicar
    dir_posts = Path("posts_traduzidos")
    arquivos = list(dir_posts.glob("*.md"))
    arquivos = [a for a in arquivos if not a.name.startswith("para_traduzir_")]
    
    if not arquivos:
        print("Nenhum artigo traduzido encontrado para publicar.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para publicar.")
    
    # Processar cada arquivo
    for arquivo in arquivos:
        print(f"\nProcessando: {arquivo.name}")
        inputs = {
            "arquivo_markdown": str(arquivo)
        }
        
        result = crew.publicacao_crew().kickoff(inputs=inputs)
        print(f"Resultado: {result.raw[:100]}...")

def executar_fluxo_completo(crew, loop_minutes=None):
    """Executa o fluxo completo de monitoramento, tradução e publicação.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== EXECUTANDO FLUXO COMPLETO ===")
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando ciclo completo...")
        
        # Passo 1: Monitoramento
        print(f"Passo 1: Monitoramento e seleção de conteúdo...")
        try:
            crew.monitoramento_crew().kickoff(inputs={})
        except Exception as e:
            print(f"Erro no monitoramento: {e}")
            print("Executando monitoramento direto como fallback...")
            executar_monitoramento_direto(None)
        
        # Passo 2: Tradução (se houver artigos para traduzir)
        dir_posts = Path("posts_para_traduzir")
        arquivos_traduzir = list(dir_posts.glob("para_traduzir_*.md"))
        
        if arquivos_traduzir:
            print(f"Passo 2: Tradução de {len(arquivos_traduzir)} artigos...")
            for arquivo in arquivos_traduzir:
                try:
                    result = crew.traducao_crew().kickoff(inputs={"arquivo_markdown": str(arquivo)})
                    
                    # Após traduzir com sucesso, mover para a pasta de traduzidos
                    arquivo_traduzido = Path("posts_traduzidos") / arquivo.name.replace("para_traduzir_", "traduzido_")
                    # TODO: Implementar a movimentação do arquivo após tradução
                except Exception as e:
                    print(f"Erro ao traduzir {arquivo.name}: {e}")
        else:
            print("Passo 2: Nenhum artigo para traduzir.")
        
        # Passo 3: Publicação (se houver artigos traduzidos)
        arquivos_publicar = [a for a in Path("posts_traduzidos").glob("*.md")]
        
        if arquivos_publicar:
            print(f"Passo 3: Publicação de {len(arquivos_publicar)} artigos...")
            for arquivo in arquivos_publicar:
                try:
                    crew.publicacao_crew().kickoff(inputs={"arquivo_markdown": str(arquivo)})
                    
                    # Após publicar com sucesso, mover para a pasta de publicados
                    arquivo_publicado = Path("posts_publicados") / arquivo.name
                    # TODO: Implementar a movimentação do arquivo após publicação
                except Exception as e:
                    print(f"Erro ao publicar {arquivo.name}: {e}")
        else:
            print("Passo 3: Nenhum artigo para publicar.")
        
        print(f"Ciclo completo finalizado.")
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até o próximo ciclo
        print(f"Aguardando {loop_minutes} minutos até o próximo ciclo...")
        time.sleep(loop_minutes * 60)

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description="Automação de blog usando CrewAI")
    parser.add_argument("--monitoramento", action="store_true", help="Executa apenas o monitoramento")
    parser.add_argument("--traducao", action="store_true", help="Executa apenas a tradução")
    parser.add_argument("--publicacao", action="store_true", help="Executa apenas a publicação")
    parser.add_argument("--completo", action="store_true", help="Executa o fluxo completo")
    parser.add_argument("--loop", type=int, help="Executa em loop a cada N minutos")
    parser.add_argument("--direto", action="store_true", help="Executa monitoramento direto (sem CrewAI)")
    
    args = parser.parse_args()
    
    try:
        # Verificar qual comando executar
        if args.direto:
            # Executar monitoramento direto sem CrewAI
            executar_monitoramento_direto(args.loop)
        elif args.monitoramento:
            # Inicializar a crew
            crew = BlogAutomacaoCrew()
            executar_monitoramento(crew, args.loop)
        elif args.traducao:
            # Inicializar a crew
            crew = BlogAutomacaoCrew()
            executar_traducao(crew)
        elif args.publicacao:
            # Inicializar a crew
            crew = BlogAutomacaoCrew()
            executar_publicacao(crew)
        else:
            # Inicializar a crew
            crew = BlogAutomacaoCrew()
            executar_fluxo_completo(crew, args.loop)
    except KeyboardInterrupt:
        print("\nProcessamento interrompido pelo usuário.")
        sys.exit(0)

if __name__ == "__main__":
    main() 