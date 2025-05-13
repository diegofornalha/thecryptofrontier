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
import shutil # Usar shutil para mover arquivos entre diferentes sistemas de arquivos, se necessário

# Tentativa de import relativo para quando executado como módulo
try:
    from .crew import BlogAutomacaoCrew
    from .tools.rss_tools import RssFeedTool # Importar para possível passagem de config
except ImportError:
    # Fallback para execução direta do script ou se o relativo falhar
    from crew import BlogAutomacaoCrew
    from tools.rss_tools import RssFeedTool

def executar_monitoramento_direto(loop_minutes=None):
    """Executa o monitoramento diretamente usando a ferramenta RSS, sem passar pelos agentes CrewAI.
    
    Este é um método alternativo quando o Gemini não está disponível ou configurado.
    
    Args:
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS DIRETO ===")
    
    # Criar diretório para artigos a serem traduzidos se não existir
    dir_para_traduzir = Path("posts_para_traduzir")
    dir_para_traduzir.mkdir(exist_ok=True)
    # dir_traduzidos = Path("posts_traduzidos") # Não necessário aqui
    # dir_traduzidos.mkdir(exist_ok=True)
    
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
                
                arquivo_nome = f"para_traduzir_{int(time.time())}_{i}_{titulo_slug}.json"
                caminho_arquivo = dir_para_traduzir / arquivo_nome
                
                # Criar cabeçalho YAML Front Matter
                front_matter = {
                    "title": artigo["title"],
                    "original_link": artigo["link"],
                    "date": artigo["date"],
                    "source": artigo["source"],
                    "tags": artigo.get("tags", ["bitcoin", "criptomoedas"]),
                    "status": "para_traduzir"
                }
                
                # Salvar como markdown (ou JSON, o nome do arquivo é .json)
                # Salvar como JSON pode ser mais robusto para metadados complexos
                dados_salvar = {
                    "metadata": front_matter,
                    "content": artigo["content"]
                }
                try:
                    with open(caminho_arquivo, "w", encoding="utf-8") as f:
                        json.dump(dados_salvar, f, ensure_ascii=False, indent=2)
                    print(f"Artigo salvo para tradução: {caminho_arquivo}")
                except Exception as e_save:
                    print(f"Erro ao salvar arquivo {caminho_arquivo}: {e_save}")
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até a próxima verificação
        print(f"Aguardando {loop_minutes} minutos até a próxima verificação...")
        time.sleep(loop_minutes * 60)

def executar_monitoramento(crew, loop_minutes=None):
    """Executa apenas o monitoramento e seleção de conteúdo usando CrewAI.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS (CrewAI) ===")
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds RSS com CrewAI...")
        
        try:
            # Executar crew de monitoramento
            # A crew (monitor + selector) deve retornar a lista de arquivos salvos
            inputs = {} # A crew/tool deve encontrar os feeds
            print("Executando monitoramento_crew().kickoff()...")
            result = crew.monitoramento_crew().kickoff(inputs=inputs)
            
            print(f"\nProcessamento de monitoramento CrewAI concluído.")
            # O resultado esperado de selection_task é a lista de arquivos salvos
            print(f"Arquivos salvos para tradução (resultado da crew): {result}") 

        except Exception as e:
            print(f"Erro ao executar crew de monitoramento: {str(e)}")
            print("\nTentando executar monitoramento direto como fallback...")
            try:
                # Tentar fallback direto
                executar_monitoramento_direto(None)  # Executar uma vez
                print("Monitoramento direto executado com sucesso como fallback.")
            except Exception as e3:
                print(f"Erro no modo direto de fallback: {str(e3)}")
                print("ERRO CRÍTICO: Não foi possível executar o monitoramento.")
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
    print(f"=== INICIANDO TRADUÇÃO DE ARTIGOS (CrewAI) ===")
    dir_para_traduzir = Path("posts_para_traduzir")
    dir_traduzidos = Path("posts_traduzidos")
    dir_traduzidos.mkdir(exist_ok=True)
    
    arquivos = list(dir_para_traduzir.glob("para_traduzir_*.json"))
    
    if not arquivos:
        print("Nenhum artigo encontrado para traduzir.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para traduzir.")
    
    for arquivo_origem in arquivos:
        print(f"\nProcessando tradução de: {arquivo_origem.name}")
        inputs = {
            "arquivo_markdown": str(arquivo_origem) # Passa o caminho do arquivo original
        }
        
        try:
            # A traducao_crew (translation + localization) deve retornar o caminho do arquivo salvo em posts_traduzidos
            print(f"Executando traducao_crew().kickoff() para {arquivo_origem.name}...")
            resultado_crew = crew.traducao_crew().kickoff(inputs=inputs)
            
            # O resultado esperado da localization_task é o caminho do arquivo salvo
            caminho_arquivo_traduzido_str = resultado_crew
            print(f"Resultado da traducao_crew: {caminho_arquivo_traduzido_str}")

            if isinstance(caminho_arquivo_traduzido_str, str) and Path(caminho_arquivo_traduzido_str).exists():
                caminho_arquivo_traduzido = Path(caminho_arquivo_traduzido_str)
                print(f"Arquivo traduzido e adaptado salvo em: {caminho_arquivo_traduzido}")
                # Mover o arquivo original após sucesso
                try:
                    arquivo_origem.unlink() # Remover o arquivo de 'posts_para_traduzir'
                    print(f"Arquivo original removido: {arquivo_origem}")
                except OSError as e_move:
                    print(f"Erro ao remover arquivo original {arquivo_origem}: {e_move}")
            else:
                print(f"Erro: A crew de tradução não retornou um caminho de arquivo válido ou o arquivo não existe: {caminho_arquivo_traduzido_str}")

        except Exception as e_trad:
            print(f"Erro ao executar traducao_crew para {arquivo_origem.name}: {e_trad}")

def executar_publicacao(crew):
    """Executa apenas a revisão e publicação de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
    """
    print(f"=== INICIANDO PUBLICAÇÃO NO SANITY (CrewAI) ===")
    dir_traduzidos = Path("posts_traduzidos")
    dir_publicados = Path("posts_publicados")
    dir_publicados.mkdir(exist_ok=True)
    
    # Busca arquivos .json que começam com 'traduzido_'
    arquivos = list(dir_traduzidos.glob("traduzido_*.json"))
    
    if not arquivos:
        print("Nenhum artigo traduzido encontrado para publicar.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para publicar.")
    
    for arquivo_origem in arquivos:
        print(f"\nProcessando publicação de: {arquivo_origem.name}")
        inputs = {
            "arquivo_markdown": str(arquivo_origem) # Passa o caminho do arquivo traduzido
        }
        
        try:
            # A publicacao_crew (editing + seo + publish) deve retornar o resultado da SanityPublishTool
            print(f"Executando publicacao_crew().kickoff() para {arquivo_origem.name}...")
            resultado_crew = crew.publicacao_crew().kickoff(inputs=inputs)
            
            print(f"Resultado da SanityPublishTool (via crew): {resultado_crew}")
            
            # Verificar se a publicação foi bem-sucedida (depende do formato de retorno da sua ferramenta)
            # Assumindo que retorna um dict e tem uma chave 'success': True/False
            sucesso = False
            if isinstance(resultado_crew, dict) and resultado_crew.get("success") is True:
                sucesso = True
                print(f"Publicação bem-sucedida para: {arquivo_origem.name}")
            elif isinstance(resultado_crew, str) and 'success": true' in resultado_crew.lower(): # Fallback se for string JSON
                sucesso = True
                print(f"Publicação bem-sucedida para: {arquivo_origem.name}")
            else:
                 print(f"Falha na publicação ou formato de resposta inesperado para: {arquivo_origem.name}. Resposta: {resultado_crew}")

            if sucesso:
                 # Mover arquivo para 'posts_publicados' após sucesso
                arquivo_destino = dir_publicados / arquivo_origem.name.replace("traduzido_", "publicado_")
                try:
                    # Usar shutil.move para mais robustez entre sistemas de arquivos
                    shutil.move(str(arquivo_origem), str(arquivo_destino))
                    print(f"Arquivo movido para publicados: {arquivo_destino}")
                except Exception as e_move:
                    print(f"Erro ao mover arquivo {arquivo_origem} para {arquivo_destino}: {e_move}")
                    # Mesmo com erro ao mover, não tentar republicar
            # else: Não mover se a publicação falhar, para tentar novamente depois

        except Exception as e_pub:
            print(f"Erro ao executar publicacao_crew para {arquivo_origem.name}: {e_pub}")

def executar_fluxo_completo(crew, loop_minutes=None):
    """Executa o fluxo completo de monitoramento, tradução e publicação.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== EXECUTANDO FLUXO COMPLETO (CrewAI) ===")
    
    while True:
        start_time = time.time()
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando ciclo completo...")
        
        # Passo 1: Monitoramento
        print(f"\n----- Passo 1: Monitoramento e seleção ----- ")
        executar_monitoramento(crew, loop_minutes=None) # Executa uma vez
        
        # Passo 2: Tradução
        print(f"\n----- Passo 2: Tradução e Adaptação ----- ")
        executar_traducao(crew) # Processa todos os arquivos pendentes
        
        # Passo 3: Publicação
        print(f"\n----- Passo 3: Revisão e Publicação ----- ")
        executar_publicacao(crew) # Processa todos os arquivos pendentes
        
        end_time = time.time()
        print(f"\nCiclo completo finalizado em {end_time - start_time:.2f} segundos.")
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até o próximo ciclo
        print(f"Aguardando {loop_minutes} minutos até o próximo ciclo...")
        time.sleep(loop_minutes * 60)

def load_feed_urls_from_config():
    """Carrega URLs de feed de um arquivo feeds.json ou retorna uma lista padrão."""
    feeds_file = Path(__file__).parent.parent.parent / "feeds.json" # Sobe três níveis para framework_crewai/feeds.json
    default_feeds = [
        {"name": "CoinDesk", "url": "https://www.coindesk.com/arc/outboundfeeds/rss/"},
        # Adicione mais feeds padrão aqui se desejar
    ]
    if feeds_file.exists():
        try:
            with open(feeds_file, 'r') as f:
                data = json.load(f)
                if isinstance(data, list) and all("url" in item for item in data):
                    print(f"Carregado {len(data)} feeds de {feeds_file}")
                    return data
                elif isinstance(data, dict) and "feeds" in data and isinstance(data["feeds"], list):
                     print(f"Carregado {len(data['feeds'])} feeds de {feeds_file} (formato aninhado)")
                     return data["feeds"]
                else:
                    print(f"Formato inesperado em {feeds_file}. Usando feeds padrão.")
                    return default_feeds
        except json.JSONDecodeError:
            print(f"Erro ao decodificar {feeds_file}. Usando feeds padrão.")
            return default_feeds
    else:
        print("Arquivo feeds.json não encontrado na raiz. Usando feeds padrão.")
        return default_feeds

def main():
    """Função principal que interpreta argumentos e chama a execução apropriada."""
    parser = argparse.ArgumentParser(description="Automação de blog usando CrewAI")
    parser.add_argument("--monitoramento", action="store_true", help="Executa apenas o monitoramento")
    parser.add_argument("--traducao", action="store_true", help="Executa apenas a tradução")
    parser.add_argument("--publicacao", action="store_true", help="Executa apenas a publicação")
    parser.add_argument("--completo", action="store_true", help="Executa o fluxo completo (padrão se nenhuma flag for passada)")
    parser.add_argument("--loop", type=int, help="Executa em loop a cada N minutos (aplicável a --monitoramento ou --completo)")
    parser.add_argument("--direto", action="store_true", help="Executa monitoramento direto (sem CrewAI/LLM)")
    
    args = parser.parse_args()
    
    # Determinar a ação padrão se nenhuma flag for passada
    run_completo = not (args.monitoramento or args.traducao or args.publicacao or args.direto)

    try:
        # Executar monitoramento direto se solicitado
        if args.direto:
            print("Executando em modo de monitoramento direto...")
            executar_monitoramento_direto(args.loop)
            return # Sair após modo direto

        # Inicializar a crew (apenas se não for modo direto)
        print("Inicializando BlogAutomacaoCrew...")
        crew = BlogAutomacaoCrew()
        print("BlogAutomacaoCrew inicializada.")

        # Verificar qual comando executar
        if args.monitoramento:
            executar_monitoramento(crew, args.loop)
        elif args.traducao:
            if args.loop:
                print("Aviso: --loop não é aplicável a --traducao. Executando uma vez.")
            executar_traducao(crew)
        elif args.publicacao:
            if args.loop:
                print("Aviso: --loop não é aplicável a --publicacao. Executando uma vez.")
            executar_publicacao(crew)
        else: # args.completo ou padrão
            executar_fluxo_completo(crew, args.loop)
            
    except KeyboardInterrupt:
        print("\nProcessamento interrompido pelo usuário.")
        sys.exit(0)
    except Exception as e_main:
        print(f"\nERRO FATAL na execução principal: {e_main}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 