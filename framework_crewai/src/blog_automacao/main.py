#!/usr/bin/env python
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
            # A crew (apenas monitor) deve retornar a lista de arquivos salvos
            inputs = {"base_dir": str(base_dir)} # Passar base_dir para a crew/tasks
            print("Executando monitoramento_crew().kickoff()...")
            result = crew.monitoramento_crew().kickoff(inputs=inputs)
            
            print(f"\nProcessamento de monitoramento CrewAI concluído.")
            # O resultado esperado é a lista de arquivos salvos
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

def executar_traducao(crew_components: BlogAutomacaoCrew, base_dir, arquivo_especifico_para_teste=None, modo_apenas_teste_sem_api=False):
    """Executa apenas a tradução e adaptação de conteúdo."""
    print(f"=== INICIANDO TRADUÇÃO DE ARTIGOS (CrewAI - Base Dir: {base_dir}) ===")
    dir_para_traduzir = Path(base_dir) / "posts_para_traduzir"
    dir_traduzidos = Path(base_dir) / "posts_traduzidos"
    dir_formatados = Path(base_dir) / "posts_formatados"
    dir_traduzidos.mkdir(parents=True, exist_ok=True)
    dir_formatados.mkdir(parents=True, exist_ok=True)

    arquivos_para_processar_str = []
    if arquivo_especifico_para_teste:
        path_especifico = Path(arquivo_especifico_para_teste)
        if not path_especifico.is_absolute():
             # Se não for absoluto, assume que é relativo ao CWD (raiz do projeto)
            path_especifico = Path.cwd() / path_especifico
        
        # Normaliza para garantir que estamos comparando caminhos consistentes
        path_especifico = path_especifico.resolve()
        print(f"Modo de teste: Processando arquivo específico: {path_especifico}")
        
        # Verifica se o arquivo de teste realmente está no diretório esperado para tradução
        # Isso ajuda a garantir que a lógica de "transformação" (se houver) seja aplicada corretamente
        # e que os caminhos relativos para a crew sejam consistentes.
        dir_esperado_para_traduzir_teste = path_especifico.parent
        if dir_esperado_para_traduzir_teste.name != 'posts_para_traduzir':
            print(f"AVISO: O arquivo de teste {path_especifico.name} não está em um subdiretório 'posts_para_traduzir'.")
            # Mesmo assim, vamos processá-lo se ele existir.
            if path_especifico.exists() and path_especifico.is_file():
                 arquivos_para_processar_str.append(str(path_especifico))
            else:
                print(f"ERRO: Arquivo de teste específico {path_especifico} não encontrado.")
                return
        else:
            if path_especifico.exists() and path_especifico.is_file():
                arquivos_para_processar_str.append(str(path_especifico))
            else:
                print(f"ERRO: Arquivo de teste específico {path_especifico} (em posts_para_traduzir) não encontrado.")
                return
    else:
        print(f"Procurando arquivos JSON em: {dir_para_traduzir}")
        if dir_para_traduzir.exists():
            arquivos_para_processar_str = [str(f) for f in dir_para_traduzir.glob("*.json")]
        else:
            print(f"Diretório {dir_para_traduzir} não encontrado.")

    print(f"Encontrados {len(arquivos_para_processar_str)} artigos para traduzir.")

    if not arquivos_para_processar_str:
        print("Nenhum arquivo para traduzir encontrado.")
        return

    traducao_crew = crew_components.traducao_crew()

    for arquivo_json_path_original_str in arquivos_para_processar_str:
        print(f"\nProcessando tradução de: {Path(arquivo_json_path_original_str).name}")
        arquivo_json_path_original = Path(arquivo_json_path_original_str).resolve() # Resolve para absoluto

        # A lógica de transformação do arquivo de teste foi removida daqui, 
        # pois agora o arquivo de entrada já deve estar no formato JSON esperado pela translation_task.
        # O próprio arquivo {arquivo_json} é passado para a task.

        if modo_apenas_teste_sem_api:
            # Simula a criação de um arquivo traduzido para testar o fluxo restante sem API
            print(f"MODO TESTE SEM API: Simulando tradução para {arquivo_json_path_original.name}")
            nome_arquivo_traduzido = f"traduzido_teste_{arquivo_json_path_original.stem}.json"
            # Garante que o dir_traduzidos use o mesmo base_dir que a lógica principal
            # Se o arquivo de teste estiver em um local completamente diferente, precisamos ajustar.
            if arquivo_especifico_para_teste:
                caminho_base_para_salvar_teste = arquivo_json_path_original.parent.parent # ex: temp_test_dir_single_post
            else:
                caminho_base_para_salvar_teste = Path(base_dir)
            
            dir_traduzidos_teste = caminho_base_para_salvar_teste / "posts_traduzidos"
            dir_traduzidos_teste.mkdir(parents=True, exist_ok=True)
            caminho_arquivo_traduzido = dir_traduzidos_teste / nome_arquivo_traduzido
            
            conteudo_simulado = {
                "simulacao": True,
                "original_file": str(arquivo_json_path_original),
                "translated_content": "Este é um conteúdo traduzido simulado."
            }
            with open(caminho_arquivo_traduzido, 'w', encoding='utf-8') as f:
                json.dump(conteudo_simulado, f, indent=2)
            print(f"Arquivo traduzido simulado salvo em: {caminho_arquivo_traduzido}")
            # Não remove o original no modo de teste sem API
        else:
            # Bloco ELSE para a execução normal com a CrewAI
            inputs_crew = {'arquivo_json': str(arquivo_json_path_original)} # Passa caminho absoluto
            print(f"Executando traducao_crew().kickoff() para {arquivo_json_path_original.name}...")
            
            resultado_traducao = traducao_crew.kickoff(inputs=inputs_crew)
            print(f"Resultado da traducao_crew (bruto): {resultado_traducao!r}")

            caminho_arquivo_traduzido_str = str(resultado_traducao).strip()
            print(f"Caminho do arquivo traduzido (string após strip): {caminho_arquivo_traduzido_str!r}")

            # Debugging adicional:
            cwd = Path.cwd()
            print(f"CWD atual: {cwd}")
            
            path_obj_debug = Path(caminho_arquivo_traduzido_str)
            print(f"Objeto Path criado a partir do resultado da crew: {path_obj_debug}")
            
            if not path_obj_debug.is_absolute():
                print(f"Caminho \"{path_obj_debug}\" NÃO é absoluto. Tentando resolver com base no CWD ({cwd}).")
                path_obj_debug_resolvido_cwd = (cwd / path_obj_debug).resolve(strict=False)
                print(f"Resolvido com CWD: {path_obj_debug_resolvido_cwd}")
                print(f"Existe (resolvido com CWD)?: {path_obj_debug_resolvido_cwd.exists()}")
                print(f"É arquivo (resolvido com CWD)?: {path_obj_debug_resolvido_cwd.is_file()}")
            else:
                print(f"Caminho \"{path_obj_debug}\" JÁ é absoluto.")

            # Tentar resolver para um caminho absoluto (mesmo que já seja, para normalizar e verificar)
            try:
                # Usar o path_obj_debug diretamente, que já é o caminho retornado pela crew
                caminho_absoluto_final_check = path_obj_debug.resolve(strict=True) 
                print(f"Caminho absoluto final para verificação (strict=True): {caminho_absoluto_final_check}")
                print(f"Existe (final_check)?: {caminho_absoluto_final_check.exists()}")
                print(f"É arquivo (final_check)?: {caminho_absoluto_final_check.is_file()}")
            except FileNotFoundError:
                print(f"ERRO ao resolver o caminho da crew com strict=True: Arquivo não encontrado em {path_obj_debug}")
                caminho_absoluto_final_check_non_strict = path_obj_debug.resolve(strict=False)
                print(f"Caminho absoluto final (strict=False): {caminho_absoluto_final_check_non_strict}")
                print(f"Existe (non_strict)?: {caminho_absoluto_final_check_non_strict.exists()}")
                print(f"É arquivo (non_strict)?: {caminho_absoluto_final_check_non_strict.is_file()}")

            # Verifica se o resultado é um caminho de arquivo válido e se o arquivo existe
            # A crew deve retornar o caminho do arquivo salvo pela localization_task
            # Usar o objeto Path diretamente, que já foi validado/resolvido acima.
            if not caminho_arquivo_traduzido_str or not path_obj_debug.is_file(): # path_obj_debug é Path(caminho_string_da_crew)
                print(f"ERRO NA CONDICIONAL: A crew de tradução não retornou um caminho de arquivo válido ou o arquivo ({path_obj_debug}) não existe/não é arquivo.")
                continue 
            
            caminho_arquivo_traduzido = path_obj_debug # Já é um objeto Path
            print(f"Arquivo traduzido gerado por crewAI: {caminho_arquivo_traduzido}")

            # Mover o arquivo original após sucesso (APENAS SE NÃO FOR O MODO DE TESTE ESPECÍFICO)
            if not arquivo_especifico_para_teste:
                try:
                    dir_processados = Path(base_dir) / "posts_processados_original"
                    dir_processados.mkdir(parents=True, exist_ok=True)
                    arquivo_json_path_original.rename(dir_processados / arquivo_json_path_original.name)
                    print(f"Arquivo original movido para: {dir_processados / arquivo_json_path_original.name}")
                except OSError as e_move:
                    print(f"Erro ao mover arquivo original {arquivo_json_path_original.name}: {e_move}")
            else:
                print("Modo de teste com arquivo específico: arquivo original NÃO será movido/deletado de posts_para_traduzir.")

def executar_formatacao_json(crew_components: BlogAutomacaoCrew, base_dir, arquivo_especifico_para_teste=None):
    """Executa a formatação do conteúdo traduzido para o formato JSON específico do Sanity."""
    print(f"=== INICIANDO FORMATAÇÃO JSON DE ARTIGOS (CrewAI - Base Dir: {base_dir}) ===")
    dir_traduzidos = base_dir / "posts_traduzidos"
    dir_formatados = base_dir / "posts_formatados"
    dir_formatados.mkdir(parents=True, exist_ok=True)
    
    # Determinar quais arquivos processar
    arquivos_para_processar = []
    if arquivo_especifico_para_teste:
        path_especifico = Path(arquivo_especifico_para_teste)
        if not path_especifico.is_absolute():
            path_especifico = Path.cwd() / path_especifico
        path_especifico = path_especifico.resolve()
        
        if path_especifico.exists() and path_especifico.is_file():
            arquivos_para_processar.append(path_especifico)
        else:
            print(f"ERRO: Arquivo de teste específico {path_especifico} não encontrado.")
            return
    else:
        # Busca arquivos .json que começam com 'traduzido_'
        arquivos_para_processar = list(dir_traduzidos.glob("traduzido_*.json"))
    
    if not arquivos_para_processar:
        print("Nenhum artigo traduzido encontrado para formatar.")
        return
    
    print(f"Encontrados {len(arquivos_para_processar)} artigos para formatar.")
    
    formatacao_crew = crew_components.formatacao_json_crew()
    
    for arquivo_origem in arquivos_para_processar:
        print(f"\nProcessando formatação de: {arquivo_origem.name}")
        inputs = {
            "arquivo_json": str(arquivo_origem),
            "base_dir": str(base_dir)
        }
        
        try:
            # Executar a crew de formatação
            print(f"Executando formatacao_json_crew().kickoff() para {arquivo_origem.name}...")
            resultado_crew = formatacao_crew.kickoff(inputs=inputs)
            
            print(f"Resultado da formatação JSON (via crew): {resultado_crew}")
            
            # O arquivo formatado já é salvo pela crew (pelo agente json_formatter)
            
        except Exception as e:
            print(f"Erro ao executar formatacao_json_crew para {arquivo_origem.name}: {e}")

def executar_publicacao(crew_components: BlogAutomacaoCrew, base_dir, arquivo_especifico_para_teste=None, modo_apenas_teste_sem_api=False):
    """Executa apenas a publicação de conteúdo no Sanity CMS.
    
    Args:
        crew_components: Instância do BlogAutomacaoCrew
        base_dir: Diretório base para os subdiretórios de posts.
        arquivo_especifico_para_teste: Caminho para um arquivo específico para teste
        modo_apenas_teste_sem_api: Se True, não faz chamadas reais para APIs externas
    """
    print(f"=== INICIANDO PUBLICAÇÃO DE ARTIGOS (CrewAI - Base Dir: {base_dir}) ===")
    dir_formatados = base_dir / "posts_formatados"
    dir_publicados = base_dir / "posts_publicados"
    dir_publicados.mkdir(parents=True, exist_ok=True)
    
    # Determinar quais arquivos processar
    arquivos_para_processar = []
    if arquivo_especifico_para_teste:
        path_especifico = Path(arquivo_especifico_para_teste)
        if not path_especifico.is_absolute():
            path_especifico = Path.cwd() / path_especifico
        path_especifico = path_especifico.resolve()
        
        if path_especifico.exists() and path_especifico.is_file():
            arquivos_para_processar.append(path_especifico)
        else:
            print(f"ERRO: Arquivo de teste específico {path_especifico} não encontrado.")
            return
    else:
        # Busca arquivos .json que começam com 'formatado_'
        arquivos_para_processar = list(dir_formatados.glob("formatado_*.json"))
    
    if not arquivos_para_processar:
        print("Nenhum artigo formatado encontrado para publicar.")
        return
    
    print(f"Encontrados {len(arquivos_para_processar)} artigos para publicar.")
    
    for arquivo_origem in arquivos_para_processar:
        print(f"\nProcessando publicação de: {arquivo_origem.name}")
        inputs = {
            "arquivo_json": str(arquivo_origem), # Passa o caminho do arquivo JSON formatado
            "base_dir": str(base_dir) # Passa base_dir para a crew/tasks
        }
        
        try:
            # A publicacao_crew deve retornar o resultado da SanityPublishTool
            print(f"Executando publicacao_crew().kickoff() para {arquivo_origem.name}...")
            resultado_crew = crew_components.publicacao_crew().kickoff(inputs=inputs)
            
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

            # O arquivo já é movido para posts_publicados pela SanityPublishTool

        except Exception as e_pub:
            print(f"Erro ao executar publicacao_crew para {arquivo_origem.name}: {e_pub}")

def executar_fluxo_completo(crew, base_dir, loop_minutes=None):
    """Executa o fluxo completo: Monitoramento -> Tradução -> Formatação JSON -> Publicação.
    
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
        executar_formatacao_json(crew, base_dir)  # Nova etapa adicionada
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

def executar_verificacao_duplicatas(crew_components: BlogAutomacaoCrew, limite=20, modo_remocao=False):
    """Executa a verificação e opcionalmente a remoção de artigos duplicados.
    
    Args:
        crew_components: Instância do BlogAutomacaoCrew
        limite: Número de artigos recentes a verificar
        modo_remocao: Se True, remove automaticamente os artigos duplicados; se False, apenas detecta
    """
    print(f"=== INICIANDO VERIFICAÇÃO DE DUPLICATAS NO SANITY CMS (CrewAI) ===")
    print(f"Modo: {'Detecção e Remoção' if modo_remocao else 'Apenas Detecção'}")
    print(f"Analisando os {limite} artigos mais recentes")
    
    try:
        # Configurar inputs para a tarefa
        inputs = {
            "limit": limite,
            "action": "remove" if modo_remocao else "detect"
        }
        
        # Executar crew de verificação de duplicatas
        verificacao_crew = crew_components.verificacao_duplicatas_crew()
        print("Executando verificacao_duplicatas_crew().kickoff()...")
        result = verificacao_crew.kickoff(inputs=inputs)
        
        # Exibir resultado
        print("\nVerificação de duplicatas concluída.")
        print(f"Resultado: {result}")
        
        return result
        
    except Exception as e:
        print(f"Erro ao executar verificação de duplicatas: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

def main():
    # Configurar e analisar argumentos da linha de comando
    parser = argparse.ArgumentParser(description='Script para automação de blog de criptomoedas usando CrewAI.')
    parser.add_argument('--monitoramento', action='store_true', help='Executar apenas o monitoramento de feeds RSS')
    parser.add_argument('--traducao', action='store_true', help='Executar apenas a tradução de artigos')
    parser.add_argument('--formatacao-json', action='store_true', help='Executar apenas a formatação JSON de artigos traduzidos')
    parser.add_argument('--publicacao', action='store_true', help='Executar apenas a publicação no Sanity')
    parser.add_argument('--completo', action='store_true', help='Executar o fluxo completo: monitoramento -> tradução -> publicação')
    parser.add_argument('--verificar-duplicatas', action='store_true', help='Verificar artigos duplicados no Sanity')
    parser.add_argument('--remover-duplicatas', action='store_true', help='Detectar e remover artigos duplicados no Sanity')
    parser.add_argument('--loop', type=int, help='Executar em loop a cada N minutos')
    parser.add_argument('--offline-local', action='store_true', help='Modo de teste offline sem APIs externas')
    parser.add_argument('--arquivo-teste', type=str, help='Arquivo específico para processar (apenas para tradução/publicação)')
    parser.add_argument('--base-dir', type=str, default='.', help='Diretório base para posts')
    parser.add_argument('--limite-duplicatas', type=int, default=20, help='Número de artigos recentes a verificar para duplicatas')

    args = parser.parse_args()
    
    # Determinar diretório base
    base_dir = Path(args.base_dir)
    print(f"Diretório base definido como: {base_dir.absolute()}")
    
    # Garantir que os diretórios base existam
    (base_dir / "posts_para_traduzir").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_traduzidos").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_formatados").mkdir(parents=True, exist_ok=True)
    (base_dir / "posts_publicados").mkdir(parents=True, exist_ok=True)

    # Inicializar a CrewAI (isso pode carregar configs, LLM, etc.)
    try:
        blog_crew = BlogAutomacaoCrew()
        print("BlogAutomacaoCrew inicializada com sucesso.")
    except Exception as e_crew:
        print(f"ERRO CRÍTICO ao inicializar BlogAutomacaoCrew: {e_crew}")
        print("Verifique as configurações de API (ex: GEMINI_API_KEY) e dependências.")
        # Se a crew não puder ser inicializada, apenas o modo de monitoramento direto pode funcionar
        if args.monitoramento and not (args.traducao or args.publicacao or args.completo or args.verificar_duplicatas or args.remover_duplicatas):
            print("Tentando executar monitoramento direto devido à falha na inicialização da Crew...")
            executar_monitoramento_direto(base_dir, args.loop)
        else:
            print("Não é possível continuar sem a inicialização bem-sucedida da Crew para esta operação.")
            sys.exit(1)
        return # Sair da main se a crew falhou e o fallback foi executado ou não era aplicável

    # Lógica de execução baseada nos argumentos
    executou_algo = False
    
    if args.verificar_duplicatas:
        executar_verificacao_duplicatas(blog_crew, args.limite_duplicatas, False)
        executou_algo = True
    
    if args.remover_duplicatas:
        executar_verificacao_duplicatas(blog_crew, args.limite_duplicatas, True)
        executou_algo = True
    
    if args.monitoramento:
        executar_monitoramento(blog_crew, base_dir, args.loop)
        executou_algo = True
        
    if args.traducao:
        executar_traducao(blog_crew, base_dir, args.arquivo_teste, args.offline_local)
        executou_algo = True
        
    if args.formatacao_json:
        executar_formatacao_json(blog_crew, base_dir, args.arquivo_teste)
        executou_algo = True
    
    if args.publicacao:
        executar_publicacao(blog_crew, base_dir, args.arquivo_teste, args.offline_local)
        executou_algo = True
        
    if args.completo:
        executar_fluxo_completo(blog_crew, base_dir, args.loop)
        executou_algo = True
    
    # Se nenhum argumento foi fornecido, mostrar ajuda
    if not executou_algo:
        parser.print_help()
        sys.exit(0)

if __name__ == "__main__":
    main() 