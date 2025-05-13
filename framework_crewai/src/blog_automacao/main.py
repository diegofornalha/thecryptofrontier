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

def executar_monitoramento_direto(base_dir, loop_minutes=None):
    """Executa o monitoramento diretamente usando a ferramenta RSS, sem passar pelos agentes CrewAI.
    
    Este é um método alternativo quando o Gemini não está disponível ou configurado.
    
    Args:
        base_dir: Diretório base para os subdiretórios de posts.
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS DIRETO (Base Dir: {base_dir}) ===")
    
    # Criar diretório para artigos a serem traduzidos se não existir
    dir_para_traduzir = base_dir / "posts_para_traduzir"
    dir_para_traduzir.mkdir(parents=True, exist_ok=True)
    # dir_traduzidos = Path("posts_traduzidos") # Não necessário aqui
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds RSS...")
        
        # Criar ferramenta RSS
        rss_tool = RssFeedTool() # Passar base_dir para a ferramenta se ela precisar
        
        # Executar ferramenta
        artigos = rss_tool._run(max_entries=5)
        
        # Verificar se encontramos artigos novos
        if not artigos:
            print(f"Nenhum artigo novo encontrado no modo direto.") # Adicionado log para clareza
        else:
            print(f"Encontrados {len(artigos)} artigos novos.")
            
            # Salvar artigos para tradução
            for i, artigo in enumerate(artigos):
                # Gerar nome de arquivo único para o artigo
                titulo_slug = artigo.get("title", "sem_titulo").lower()
                titulo_slug = "".join(c if c.isalnum() else "_" for c in titulo_slug)
                titulo_slug = titulo_slug[:50]  # Limitar tamanho
                
                timestamp_atual = int(time.time())
                arquivo_nome = f"para_traduzir_{timestamp_atual}_{i}_{titulo_slug}.json"
                caminho_arquivo = dir_para_traduzir / arquivo_nome
                
                # Estrutura JSON detalhada
                frontmatter_original = {
                    "title": artigo.get("title", "Sem Título Original"),
                    "original_link": artigo.get("link", ""),
                    "published_date": artigo.get("date", datetime.now().isoformat()), # Usar uma data consistente
                    "source_name": artigo.get("source", "Desconhecido"),
                    "tags_originais": artigo.get("tags", []), # Campo para tags originais se houver
                    "slug_original": titulo_slug, # Adicionar slug original
                    "timestamp_captura": timestamp_atual
                }

                dados_salvar = {
                    "frontmatter_original": frontmatter_original,
                    "content_text_original": artigo.get("content_text", ""), # Assumindo que rss_tool retorna content_text
                    "content_html_original": artigo.get("content_html", ""), # E/ou content_html
                    "resumo_original": artigo.get("summary", ""), # Se a ferramenta RSS fornecer resumo
                    # Campos para serem preenchidos posteriormente
                    "content_text_traduzido": None,
                    "content_html_traduzido": None,
                    "frontmatter_traduzido": None 
                }
                
                try:
                    with open(caminho_arquivo, "w", encoding="utf-8") as f:
                        json.dump(dados_salvar, f, ensure_ascii=False, indent=4) # Usar indent=4 para melhor legibilidade
                    print(f"SUCESSO AO SALVAR: {caminho_arquivo}") 
                except Exception as e_save:
                    print(f"!!!!!! ERRO REAL AO SALVAR ARQUIVO {caminho_arquivo}: {e_save} !!!!!!") # Erro mais visível
                    # Considerar levantar o erro aqui para que o main.py retorne um código de erro
                    # raise e_save 
        
        # Se não for para executar em loop, sair
        if not loop_minutes:
            break
            
        # Aguardar até a próxima verificação
        print(f"Aguardando {loop_minutes} minutos até a próxima verificação...")
        time.sleep(loop_minutes * 60)

def executar_monitoramento(crew, base_dir, loop_minutes=None):
    """Executa apenas o monitoramento e seleção de conteúdo usando CrewAI.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        base_dir: Diretório base para os subdiretórios de posts.
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO MONITORAMENTO RSS (CrewAI - Base Dir: {base_dir}) ===")
    
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Verificando feeds RSS com CrewAI...")
        
        try:
            # Executar crew de monitoramento
            # A crew (monitor + selector) deve retornar a lista de arquivos salvos
            inputs = {"base_dir": str(base_dir)} # Passar base_dir para a crew/tasks
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
                executar_monitoramento_direto(base_dir, None)  # Executar uma vez, passar base_dir
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

def executar_traducao(crew, base_dir, arquivo_especifico_para_teste=None):
    """Executa apenas a tradução e adaptação de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        base_dir: Diretório base para os subdiretórios de posts.
        arquivo_especifico_para_teste: Caminho completo para um arquivo JSON específico a ser testado.
    """
    print(f"=== INICIANDO TRADUÇÃO DE ARTIGOS (CrewAI - Base Dir: {base_dir}) ===")
    dir_para_traduzir = Path(base_dir) / "posts_para_traduzir" # Certificar que base_dir é Path
    dir_traduzidos = Path(base_dir) / "posts_traduzidos"
    dir_traduzidos.mkdir(parents=True, exist_ok=True)
    
    arquivos_para_processar = []
    if arquivo_especifico_para_teste:
        arquivo_teste_path = Path(arquivo_especifico_para_teste)
        if arquivo_teste_path.exists():
            arquivos_para_processar.append(arquivo_teste_path)
            print(f"Modo de teste: Processando arquivo específico: {arquivo_teste_path}")
        else:
            print(f"Erro no modo de teste: Arquivo específico não encontrado: {arquivo_teste_path}")
            return
    else:
        arquivos_para_processar = list(dir_para_traduzir.glob("para_traduzir_*.json"))

    if not arquivos_para_processar:
        print("Nenhum artigo encontrado para traduzir.")
        return

    print(f"Encontrados {len(arquivos_para_processar)} artigos para traduzir.")
    
    for arquivo_origem_path in arquivos_para_processar: # Renomeado para arquivo_origem_path
        print(f"\nProcessando tradução de: {arquivo_origem_path.name}")

        # Adicionar lógica de transformação se for o arquivo de teste
        arquivo_para_crew = arquivo_origem_path
        if arquivo_especifico_para_teste and arquivo_origem_path == Path(arquivo_especifico_para_teste):
            print(f"Transformando arquivo de teste: {arquivo_origem_path.name}")
            try:
                with open(arquivo_origem_path, 'r', encoding='utf-8') as f:
                    dados_originais = json.load(f)

                frontmatter_original = {
                    "title": dados_originais.get("metadata", {}).get("title", "Sem Título Original"),
                    "original_link": dados_originais.get("metadata", {}).get("original_link", ""),
                    "published_date": dados_originais.get("metadata", {}).get("date", datetime.now().isoformat()),
                    "source_name": dados_originais.get("metadata", {}).get("source", "Desconhecido"),
                    "tags_originais": dados_originais.get("metadata", {}).get("tags", []),
                    "slug_original": dados_originais.get("metadata", {}).get("title", "sem_titulo").lower().replace(" ", "-")[:50],
                    "timestamp_captura": int(time.time())
                }

                dados_transformados = {
                    "frontmatter_original": frontmatter_original,
                    "content_text_original": "", # Deixar vazio, pois o original só tem HTML
                    "content_html_original": dados_originais.get("content", ""),
                    "resumo_original": "", # Adicionar se disponível no futuro
                    "content_text_traduzido": None,
                    "content_html_traduzido": None,
                    "frontmatter_traduzido": None
                }
                
                # Salvar o arquivo transformado (pode ser com novo nome ou sobrescrever)
                # Para este teste, vamos sobrescrever o arquivo original dentro de temp_test_dir_single_post
                # É importante que esta lógica só rode para o arquivo de teste!
                with open(arquivo_origem_path, 'w', encoding='utf-8') as f:
                    json.dump(dados_transformados, f, ensure_ascii=False, indent=4)
                print(f"Arquivo de teste transformado e salvo em: {arquivo_origem_path}")
                arquivo_para_crew = arquivo_origem_path # crew usará o arquivo transformado

            except Exception as e_transform:
                print(f"Erro ao transformar o arquivo de teste {arquivo_origem_path.name}: {e_transform}")
                continue # Pular para o próximo arquivo se a transformação falhar

        inputs = {
            "arquivo_json": str(arquivo_para_crew), # Passa o caminho do arquivo JSON para a crew
            "base_dir": str(Path(base_dir)) # Passa base_dir para a crew/tasks
        }
        
        try:
            # A traducao_crew deve retornar o caminho do arquivo JSON salvo em posts_traduzidos
            print(f"Executando traducao_crew().kickoff() para {arquivo_para_crew.name}...")
            resultado_crew = crew.traducao_crew().kickoff(inputs=inputs)
            
            # O resultado esperado da localization_task é o caminho do arquivo salvo
            caminho_arquivo_traduzido_str = str(resultado_crew).strip()
            caminho_arquivo_traduzido_str = resultado_crew
            print(f"Resultado da traducao_crew: {caminho_arquivo_traduzido_str}")

            if isinstance(caminho_arquivo_traduzido_str, str) and Path(caminho_arquivo_traduzido_str).exists():
                caminho_arquivo_traduzido = Path(caminho_arquivo_traduzido_str)
                print(f"Arquivo traduzido e adaptado salvo em: {caminho_arquivo_traduzido}")
                # Mover o arquivo original após sucesso
                try:
                    arquivo_origem_path.unlink() # Remover o arquivo de 'posts_para_traduzir'
                    print(f"Arquivo original removido: {arquivo_origem_path}")
                except OSError as e_move:
                    print(f"Erro ao remover arquivo original {arquivo_origem_path}: {e_move}")
            else:
                print(f"Erro: A crew de tradução não retornou um caminho de arquivo válido ou o arquivo não existe: {caminho_arquivo_traduzido_str}")

        except Exception as e_trad:
            print(f"Erro ao executar traducao_crew para {arquivo_para_crew.name}: {e_trad}")

def executar_publicacao(crew, base_dir):
    """Executa apenas a revisão e publicação de conteúdo.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        base_dir: Diretório base para os subdiretórios de posts.
    """
    print(f"=== INICIANDO PUBLICAÇÃO DE ARTIGOS (CrewAI - Base Dir: {base_dir}) ===")
    dir_traduzidos = base_dir / "posts_traduzidos"
    dir_publicados = base_dir / "posts_publicados"
    dir_publicados.mkdir(parents=True, exist_ok=True)
    
    # Busca arquivos .json que começam com 'traduzido_'
    arquivos = list(dir_traduzidos.glob("traduzido_*.json"))
    
    if not arquivos:
        print("Nenhum artigo traduzido encontrado para publicar.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para publicar.")
    
    for arquivo_origem in arquivos:
        print(f"\nProcessando publicação de: {arquivo_origem.name}")
        inputs = {
            "arquivo_json": str(arquivo_origem), # Passa o caminho do arquivo JSON original
            "base_dir": str(base_dir) # Passa base_dir para a crew/tasks
        }
        
        try:
            # A publicacao_crew deve retornar o resultado da SanityPublishTool
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

def executar_fluxo_completo(crew, base_dir, loop_minutes=None):
    """Executa o fluxo completo: Monitoramento -> Tradução -> Publicação.
    
    Args:
        crew: Instância do BlogAutomacaoCrew
        base_dir: Diretório base para os subdiretórios de posts.
        loop_minutes: Se definido, executa em loop a cada N minutos
    """
    print(f"=== INICIANDO FLUXO COMPLETO (Base Dir: {base_dir}) ===")
    while True:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando novo ciclo completo...")
        executar_monitoramento(crew, base_dir, None)  # Executar uma vez dentro do loop completo
        executar_traducao(crew, base_dir)
        executar_publicacao(crew, base_dir)
        
        if not loop_minutes:
            break
            
        # Aguardar até o próximo ciclo
        print(f"Aguardando {loop_minutes} minutos até o próximo ciclo...")
        time.sleep(loop_minutes * 60)

    # Necessário para que a RssFeedTool possa encontrar o feeds.json no diretório correto
    # O ideal seria a ferramenta ter seu próprio mecanismo de encontrar o config ou recebê-lo
    # Esta é uma solução temporária para compatibilidade com a estrutura atual.
    # print(f"CWD antes de mudar: {os.getcwd()}")
    # os.chdir(Path(__file__).parent) # Mudar CWD para o diretório do script main.py (src/blog_automacao)
    # print(f"CWD depois de mudar: {os.getcwd()}")

    # Não é mais necessário mudar o CWD globalmente se base_dir for usado consistentemente
    
    # Tentar carregar URLs de feed do feeds.json na raiz do projeto (framework_crewai)
    project_root = Path(__file__).parent.parent.parent # framework_crewai
    feeds_json_path = project_root / "feeds.json"
    feed_urls = load_feed_urls_from_config(feeds_json_path)
    
    # Se não encontrar no local esperado, tenta no diretório src/blog_automacao (local antigo)
    if not feed_urls:
        current_dir_feeds_json = Path(__file__).parent / "feeds.json"
        feed_urls = load_feed_urls_from_config(current_dir_feeds_json)
        if feed_urls:
            print(f"Aviso: Usando feeds.json de {current_dir_feeds_json}. Considere movê-lo para {feeds_json_path}")

    if not feed_urls:
        print("ERRO: Não foi possível carregar URLs de feed do feeds.json. Verifique os caminhos.")
        # Poderia usar um fallback para uma lista hardcoded aqui se necessário
        # feed_urls = ["http://default-feed.com/rss"]

    parser = argparse.ArgumentParser(
        description="Executa a automação de blog usando CrewAI.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "--monitoramento", action="store_true", 
        help="Executa apenas o monitoramento e seleção de conteúdo"
    )
    parser.add_argument(
        "--traducao", action="store_true", 
        help="Executa apenas a tradução e adaptação de conteúdo"
    )
    parser.add_argument(
        "--publicacao", action="store_true", 
        help="Executa apenas a revisão e publicação de conteúdo"
    )
    parser.add_argument(
        "--completo", action="store_true", 
        help="Executa o fluxo completo (padrão se nenhuma outra ação for especificada)"
    )
    parser.add_argument(
        "--loop", type=int, metavar="N", 
        help="Executa em loop a cada N minutos (aplicável a --monitoramento ou --completo)"
    )
    parser.add_argument(
        "--base_dir", type=str, default=".",
        help="Diretório base para os subdiretórios de posts (posts_para_traduzir, etc.). Padrão: diretório atual."
    )
    parser.add_argument(
        "--teste_traducao_arquivo", type=str, help="Caminho para um arquivo JSON específico para testar o fluxo de tradução"
    )
    
    args = parser.parse_args()
    
    base_dir = Path(args.base_dir).resolve() # Resolve para caminho absoluto
    print(f"Usando diretório base: {base_dir}")
    
    # Garantir que os diretórios base existam
    (base_dir / "posts_para_traduzir").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_traduzidos").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_publicados").mkdir(parents=True, exist_ok=True)

    # Inicializar a CrewAI (isso pode carregar configs, LLM, etc.)
    try:
        blog_crew = BlogAutomacaoCrew()
        print("BlogAutomacaoCrew inicializada com sucesso.")
    except Exception as e_crew:
        print(f"ERRO CRÍTICO ao inicializar BlogAutomacaoCrew: {e_crew}")
        print("Verifique as configurações de API (ex: GEMINI_API_KEY) e dependências.")
        # Se a crew não puder ser inicializada, apenas o modo de monitoramento direto pode funcionar
        if args.monitoramento and not (args.traducao or args.publicacao or args.completo):
            print("Tentando executar monitoramento direto devido à falha na inicialização da Crew...")
            executar_monitoramento_direto(base_dir, args.loop)
        else:
            print("Não é possível continuar sem a inicialização bem-sucedida da Crew para esta operação.")
            sys.exit(1)
        return # Sair da main se a crew falhou e o fallback foi executado ou não era aplicável

    # Lógica de execução baseada nos argumentos
    executou_algo = False
    if args.monitoramento:
        executar_monitoramento(blog_crew, base_dir, args.loop)
        executou_algo = True
    elif args.traducao:
        if args.teste_traducao_arquivo:
            # Usar o base_dir específico para o arquivo de teste
            executar_traducao(blog_crew, base_dir, args.teste_traducao_arquivo)
        else:
            # Usar o base_dir padrão para a execução normal da tradução
            executar_traducao(blog_crew, base_dir)
        executou_algo = True
    elif args.publicacao:
        executar_publicacao(blog_crew, base_dir)
        executou_algo = True
    elif args.completo or not executou_algo: # Executar completo se nenhuma flag específica for passada
        executar_fluxo_completo(blog_crew, base_dir, args.loop)

def load_feed_urls_from_config(filepath):
    """Carrega URLs de feed de um arquivo JSON que contém uma lista de objetos com 'name' e 'url'."""
    if not filepath.exists():
        print(f"Aviso: Arquivo de configuração de feeds não encontrado em {filepath}")
        return [] # Retorna lista vazia se o arquivo não existe

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list) and all(isinstance(item, dict) and 'url' in item for item in data):
                print(f"Carregados {len(data)} feeds de {filepath}")
                return data # Retorna a lista de dicionários
            else:
                print(f"Erro: Formato inesperado em {filepath}. Esperado: lista de objetos com chave 'url'.")
                return []
    except json.JSONDecodeError:
        print(f"Erro: Falha ao decodificar JSON em {filepath}.")
        return []
    except Exception as e:
        print(f"Erro ao ler arquivo de feeds {filepath}: {e}")
        return []

def main():
    # << INDENTAR TODO O CÓDIGO ABAIXO PARA DENTRO DE main() >>
    # Tentar carregar URLs de feed do feeds.json na raiz do projeto (framework_crewai)
    project_root = Path(__file__).parent.parent.parent # framework_crewai
    feeds_json_path = project_root / "feeds.json"
    feed_urls = load_feed_urls_from_config(feeds_json_path)
    
    # Se não encontrar no local esperado, tenta no diretório src/blog_automacao (local antigo)
    if not feed_urls:
        current_dir_feeds_json = Path(__file__).parent / "feeds.json"
        feed_urls = load_feed_urls_from_config(current_dir_feeds_json)
        if feed_urls:
            print(f"Aviso: Usando feeds.json de {current_dir_feeds_json}. Considere movê-lo para {feeds_json_path}")

    if not feed_urls:
        print("ERRO: Não foi possível carregar URLs de feed do feeds.json. Verifique os caminhos.")
        # Poderia usar um fallback para uma lista hardcoded aqui se necessário
        # feed_urls = ["http://default-feed.com/rss"]

    parser = argparse.ArgumentParser(
        description="Executa a automação de blog usando CrewAI.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "--monitoramento", action="store_true", 
        help="Executa apenas o monitoramento e seleção de conteúdo"
    )
    parser.add_argument(
        "--traducao", action="store_true", 
        help="Executa apenas a tradução e adaptação de conteúdo"
    )
    parser.add_argument(
        "--publicacao", action="store_true", 
        help="Executa apenas a revisão e publicação de conteúdo"
    )
    parser.add_argument(
        "--completo", action="store_true", 
        help="Executa o fluxo completo (padrão se nenhuma outra flag for passada)"
    )
    parser.add_argument(
        "--loop", type=int, metavar="N", 
        help="Executa em loop a cada N minutos (aplicável ao monitoramento e completo)"
    )
    parser.add_argument(
        "--base_dir", type=str, default=".",
        help="Diretório base para os subdiretórios de posts (posts_para_traduzir, etc.). Padrão: diretório atual."
    )
    parser.add_argument(
        "--teste_traducao_arquivo", type=str, help="Caminho para um arquivo JSON específico para testar o fluxo de tradução"
    )
    
    args = parser.parse_args()
    
    base_dir = Path(args.base_dir).resolve() # Resolve para caminho absoluto
    print(f"Usando diretório base: {base_dir}")
    
    # Garantir que os diretórios base existam
    (base_dir / "posts_para_traduzir").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_traduzidos").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_publicados").mkdir(parents=True, exist_ok=True)

    # Inicializar a CrewAI (isso pode carregar configs, LLM, etc.)
    try:
        blog_crew = BlogAutomacaoCrew()
        print("BlogAutomacaoCrew inicializada com sucesso.")
    except Exception as e_crew:
        print(f"ERRO CRÍTICO ao inicializar BlogAutomacaoCrew: {e_crew}")
        print("Verifique as configurações de API (ex: GEMINI_API_KEY) e dependências.")
        # Se a crew não puder ser inicializada, apenas o modo de monitoramento direto pode funcionar
        if args.monitoramento and not (args.traducao or args.publicacao or args.completo):
            print("Tentando executar monitoramento direto devido à falha na inicialização da Crew...")
            executar_monitoramento_direto(base_dir, args.loop)
        else:
            print("Não é possível continuar sem a inicialização bem-sucedida da Crew para esta operação.")
            sys.exit(1)
        return # Sair da main se a crew falhou e o fallback foi executado ou não era aplicável

    # Lógica de execução baseada nos argumentos
    executou_algo = False
    if args.monitoramento:
        executar_monitoramento(blog_crew, base_dir, args.loop)
        executou_algo = True
    elif args.traducao:
        if args.teste_traducao_arquivo:
            # Usar o base_dir específico para o arquivo de teste
            executar_traducao(blog_crew, base_dir, args.teste_traducao_arquivo)
        else:
            # Usar o base_dir padrão para a execução normal da tradução
            executar_traducao(blog_crew, base_dir)
        executou_algo = True
    elif args.publicacao:
        executar_publicacao(blog_crew, base_dir)
        executou_algo = True
    elif args.completo or not executou_algo: # Executar completo se nenhuma flag específica for passada
        executar_fluxo_completo(blog_crew, base_dir, args.loop)
    # << FIM DO BLOCO INDENTADO >>

if __name__ == "__main__":
    # Configuração para garantir que os imports relativos funcionem mesmo se 
    # o script for chamado de um diretório diferente ou como parte de um pacote maior.
    # Isso é importante se você executar, por exemplo, `python src/blog_automacao/main.py`
    # em vez de `python -m src.blog_automacao.main`
    current_script_path = Path(__file__).resolve()
    # src_dir vai ser .../framework_crewai/src
    src_dir = current_script_path.parent.parent 
    # project_root_dir vai ser .../framework_crewai
    project_root_dir = src_dir.parent 

    if str(project_root_dir) not in sys.path:
        sys.path.insert(0, str(project_root_dir))
        print(f"Adicionado {project_root_dir} ao sys.path para imports de módulo")
    
    main() 