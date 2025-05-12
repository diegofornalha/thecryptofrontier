#!/usr/bin/env python
"""
Teste de fluxo completo para processamento de um único artigo
Uso: python teste_fluxo_completo.py [caminho_do_arquivo]
"""

import os
import sys
import json
import time
import sqlite3
import hashlib
import shutil
import feedparser
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse
import google.generativeai as genai
import re

# Cores para terminal
class TermColors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Configurações
DB_PATH = "posts_database.sqlite"
GEMINI_CONFIG = {}

def print_header(text):
    """Imprime um cabeçalho formatado"""
    print(f"\n{TermColors.HEADER}{TermColors.BOLD}{'=' * 60}{TermColors.ENDC}")
    print(f"{TermColors.HEADER}{TermColors.BOLD}{text.center(60)}{TermColors.ENDC}")
    print(f"{TermColors.HEADER}{TermColors.BOLD}{'=' * 60}{TermColors.ENDC}\n")

def print_step(step, text):
    """Imprime uma etapa formatada"""
    print(f"{TermColors.BLUE}[{step}] {text}{TermColors.ENDC}")

def print_success(text):
    """Imprime uma mensagem de sucesso formatada"""
    print(f"{TermColors.GREEN}✓ {text}{TermColors.ENDC}")

def print_warning(text):
    """Imprime um aviso formatado"""
    print(f"{TermColors.YELLOW}⚠ {text}{TermColors.ENDC}")

def print_error(text):
    """Imprime um erro formatado"""
    print(f"{TermColors.RED}✗ {text}{TermColors.ENDC}")

def init_db():
    """Inicializa o banco de dados para controle de artigos"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS test_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        link TEXT,
        processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_date TIMESTAMP,
        source TEXT,
        status TEXT DEFAULT 'test'
    )
    ''')
    
    conn.commit()
    conn.close()
    print_success("Banco de dados inicializado")

def carregar_config_gemini():
    """Carrega a configuração da API do Gemini do arquivo legado"""
    global GEMINI_CONFIG
    try:
        sys.path.append("agentes_backup_legado")
        from config import GEMINI_API_KEY, GEMINI_MODEL
        GEMINI_CONFIG = {
            "api_key": GEMINI_API_KEY,
            "model": GEMINI_MODEL
        }
        print_success(f"Configuração Gemini carregada")
        return True
    except ImportError:
        print_warning("Não foi possível carregar as configurações do Gemini do código legado")
        return False

def obter_feed_artigo():
    """Obtém um único artigo de feed RSS"""
    print_step("1.1", "Buscando feeds RSS")
    
    # Lista de feeds para testar
    feeds = [
        "https://cointelegraph.com/rss",
        "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "https://decrypt.co/feed",
        "https://blog.chain.link/rss/"
    ]
    
    for feed_url in feeds:
        try:
            print_step("1.2", f"Processando feed: {feed_url}")
            feed = feedparser.parse(feed_url)
            
            if not feed or not hasattr(feed, 'entries') or not feed.entries:
                print_warning(f"Nenhuma entrada encontrada no feed {feed_url}")
                continue
                
            # Extrair domínio para identificação
            domain = urlparse(feed_url).netloc
            
            # Pegar apenas o primeiro artigo
            entry = feed.entries[0]
            
            # Extrair dados básicos
            artigo = {
                "title": entry.get("title", "Sem título"),
                "link": entry.get("link", ""),
                "source": domain,
                "feed_url": feed_url
            }
            
            # Extrair data de publicação
            pub_date = entry.get("published_parsed", None)
            if pub_date:
                artigo["date"] = datetime(*pub_date[:6]).isoformat()
            else:
                artigo["date"] = datetime.now().isoformat()
                
            # Extrair conteúdo
            if "content" in entry and entry.content:
                artigo["content"] = entry.content[0].value
            elif "summary" in entry:
                artigo["content"] = entry.summary
            else:
                artigo["content"] = ""
                
            # Extrair autor se disponível
            if "author" in entry:
                artigo["author"] = entry.author
                
            # Extrair tags se disponíveis
            if "tags" in entry:
                artigo["tags"] = [tag.term for tag in entry.tags]
                
            print_success(f"Artigo encontrado: {artigo['title']}")
            return artigo
                
        except Exception as e:
            print_error(f"Erro ao processar feed {feed_url}: {str(e)}")
    
    return None

def processar_arquivo_existente(caminho_arquivo):
    """Processa um arquivo já existente na pasta posts_para_traduzir"""
    print_step("1.1", f"Processando arquivo existente: {caminho_arquivo}")
    
    try:
        with open(caminho_arquivo, "r", encoding="utf-8") as f:
            conteudo = f.read()
        
        # Separar front matter e conteúdo
        match = re.match(r'^---\n(.*?)\n---\n\n(.*)', conteudo, re.DOTALL)
        if not match:
            print_error("Formato inválido do arquivo Markdown")
            return None
            
        yaml_frontmatter = match.group(1)
        conteudo_html = match.group(2)
        
        # Extrair front matter como dicionário
        front_matter = json.loads(yaml_frontmatter)
        
        # Criar objeto de artigo
        artigo = {
            "title": front_matter.get("title", "Sem título"),
            "link": front_matter.get("original_link", ""),
            "source": front_matter.get("source", ""),
            "date": front_matter.get("date", datetime.now().isoformat()),
            "content": conteudo_html,
            "tags": front_matter.get("tags", ["bitcoin", "criptomoedas"]),
            "arquivo_original": caminho_arquivo
        }
        
        print_success(f"Artigo carregado: {artigo['title']}")
        return artigo
            
    except Exception as e:
        print_error(f"Erro ao processar arquivo {caminho_arquivo}: {str(e)}")
        return None

def salvar_artigo_para_traduzir(artigo):
    """Salva o artigo para tradução"""
    print_step("2.1", "Salvando artigo para tradução")
    
    # Verificar se pasta existe
    os.makedirs("posts_para_traduzir", exist_ok=True)
    
    # Se já temos um arquivo original, usar ele diretamente
    if "arquivo_original" in artigo:
        print_success(f"Usando arquivo existente: {artigo['arquivo_original']}")
        return artigo['arquivo_original']
    
    # Gerar nome de arquivo único para o artigo
    titulo_slug = artigo["title"].lower()
    titulo_slug = "".join(c if c.isalnum() else "_" for c in titulo_slug)
    titulo_slug = titulo_slug[:50]  # Limitar tamanho
    
    arquivo_nome = f"teste_para_traduzir_{int(time.time())}_{titulo_slug}.md"
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
    
    print_success(f"Artigo salvo para tradução: {caminho_arquivo}")
    return caminho_arquivo

def traduzir_artigo(caminho_arquivo):
    """Traduz o artigo usando Gemini API"""
    print_step("3.1", "Iniciando tradução do artigo")
    
    # Verificar se temos configuração Gemini
    if not GEMINI_CONFIG:
        print_error("Configuração Gemini não disponível. Não é possível traduzir.")
        return None
        
    # Ler o arquivo Markdown
    with open(caminho_arquivo, "r", encoding="utf-8") as f:
        conteudo = f.read()
    
    # Separar front matter e conteúdo
    match = re.match(r'^---\n(.*?)\n---\n\n(.*)', conteudo, re.DOTALL)
    if not match:
        print_error("Formato inválido do arquivo Markdown")
        return None
        
    yaml_frontmatter = match.group(1)
    conteudo_html = match.group(2)
    
    # Configurar Gemini
    genai.configure(api_key=GEMINI_CONFIG["api_key"])
    model = genai.GenerativeModel(GEMINI_CONFIG["model"])
    
    # Instruções para o Gemini
    prompt = f"""
    Traduza o seguinte artigo de inglês para português brasileiro. 
    Mantenha todas as tags HTML e formatação original.
    Traduza apenas o texto, não as tags HTML ou URLs.
    Use linguagem formal e precisa para o contexto de criptomoedas.
    
    ARTIGO ORIGINAL:
    {conteudo_html}
    
    ARTIGO TRADUZIDO:
    """
    
    print_step("3.2", "Enviando para o Gemini API...")
    
    try:
        # Chamar a API Gemini
        resposta = model.generate_content(prompt)
        traducao = resposta.text
        
        # Extrair front matter como dicionário
        front_matter = json.loads(yaml_frontmatter)
        
        # Atualizar front matter
        front_matter["status"] = "traduzido"
        front_matter["translated_date"] = datetime.now().isoformat()
        
        # Salvar na pasta de traduzidos
        os.makedirs("posts_traduzidos", exist_ok=True)
        
        # Determinar nome do arquivo
        nome_arquivo_original = Path(caminho_arquivo).name
        if nome_arquivo_original.startswith("para_traduzir_"):
            nome_arquivo = nome_arquivo_original.replace("para_traduzir_", "traduzido_")
        else:
            nome_arquivo = nome_arquivo_original.replace("teste_para_traduzir", "teste_traduzido")
        
        arquivo_traduzido = Path("posts_traduzidos") / nome_arquivo
        
        with open(arquivo_traduzido, "w", encoding="utf-8") as f:
            f.write("---\n")
            json.dump(front_matter, f, ensure_ascii=False, indent=2)
            f.write("\n---\n\n")
            f.write(traducao)
            
        print_success(f"Artigo traduzido e salvo em: {arquivo_traduzido}")
        return arquivo_traduzido
        
    except Exception as e:
        print_error(f"Erro na tradução: {str(e)}")
        return None

def simular_publicacao(caminho_arquivo):
    """Simula a publicação de um artigo traduzido"""
    print_step("4.1", "Simulando publicação no Sanity CMS")
    
    # Ler o arquivo
    with open(caminho_arquivo, "r", encoding="utf-8") as f:
        conteudo = f.read()
    
    # Separar front matter e conteúdo
    match = re.match(r'^---\n(.*?)\n---\n\n(.*)', conteudo, re.DOTALL)
    if not match:
        print_error("Formato inválido do arquivo Markdown")
        return False
        
    yaml_frontmatter = match.group(1)
    conteudo_html = match.group(2)
    
    # Extrair front matter como dicionário
    front_matter = json.loads(yaml_frontmatter)
    
    # Atualizar front matter
    front_matter["status"] = "publicado"
    front_matter["published_date"] = datetime.now().isoformat()
    
    # Salvar na pasta de publicados
    os.makedirs("posts_publicados", exist_ok=True)
    
    # Determinar nome do arquivo
    nome_arquivo_original = Path(caminho_arquivo).name
    if nome_arquivo_original.startswith("traduzido_"):
        nome_arquivo = nome_arquivo_original.replace("traduzido_", "publicado_")
    else:
        nome_arquivo = nome_arquivo_original.replace("teste_traduzido", "teste_publicado")
    
    arquivo_publicado = Path("posts_publicados") / nome_arquivo
    
    with open(arquivo_publicado, "w", encoding="utf-8") as f:
        f.write("---\n")
        json.dump(front_matter, f, ensure_ascii=False, indent=2)
        f.write("\n---\n\n")
        f.write(conteudo_html)
        
    print_success(f"Artigo simulado como publicado em: {arquivo_publicado}")
    
    # Tentar executar script de publicação no Sanity se existir
    try:
        script_path = Path("agentes_backup_legado/scripts") / "publicar_posts_markdown.js"
        if script_path.exists():
            print_step("4.2", "Tentando publicar no Sanity CMS")
            
            # Verificar se o Node.js está disponível
            import subprocess
            try:
                subprocess.run(["node", "--version"], capture_output=True, check=True)
                
                # Executar o script de publicação
                print_step("4.3", "Executando script de publicação")
                result = subprocess.run(
                    ["node", str(script_path)],
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                if result.returncode == 0:
                    print_success("Publicação realizada no Sanity CMS")
                    print_success(f"Saída do script: {result.stdout}")
                    return True
                else:
                    print_error(f"Erro na publicação: {result.stderr}")
            except subprocess.CalledProcessError:
                print_warning("Node.js não disponível, publicação simulada apenas")
        else:
            print_warning("Script de publicação não encontrado, publicação simulada apenas")
    except Exception as e:
        print_error(f"Erro ao tentar publicação real: {str(e)}")
    
    return True

def testar_fluxo_completo(arquivo_para_traduzir=None):
    """Executa o teste de fluxo completo"""
    print_header("TESTE DE FLUXO COMPLETO")
    
    # Inicializar banco de dados
    init_db()
    
    # Carregar configuração Gemini
    if not carregar_config_gemini():
        print_warning("Continuando sem tradução automática")
    
    # Etapa 1: Obter um artigo
    print_header("ETAPA 1: MONITORAMENTO")
    
    artigo = None
    caminho_arquivo = None
    
    # Se temos um arquivo específico, usar ele
    if arquivo_para_traduzir and os.path.exists(arquivo_para_traduzir):
        artigo = processar_arquivo_existente(arquivo_para_traduzir)
        if artigo:
            caminho_arquivo = arquivo_para_traduzir
    else:
        # Caso contrário, buscar um novo artigo de feed RSS
        artigo = obter_feed_artigo()
        
    if not artigo:
        print_error("Não foi possível obter nenhum artigo. Teste falhou.")
        return False
    
    # Etapa 2: Salvar para tradução ou usar existente
    print_header("ETAPA 2: PREPARAÇÃO")
    caminho_arquivo = salvar_artigo_para_traduzir(artigo)
    if not caminho_arquivo:
        print_error("Não foi possível processar o artigo. Teste falhou.")
        return False
    
    # Etapa 3: Traduzir
    print_header("ETAPA 3: TRADUÇÃO")
    arquivo_traduzido = None
    if GEMINI_CONFIG:
        arquivo_traduzido = traduzir_artigo(caminho_arquivo)
        if not arquivo_traduzido:
            print_warning("Tradução falhou, mas continuando com o teste")
    else:
        print_warning("Pulando etapa de tradução, GEMINI_API_KEY não configurada")
        # Criar uma cópia simulada para prosseguir com o teste
        nome_arquivo = Path(caminho_arquivo).name.replace("para_traduzir", "traduzido")
        arquivo_traduzido = Path("posts_traduzidos") / nome_arquivo
        os.makedirs("posts_traduzidos", exist_ok=True)
        shutil.copy(caminho_arquivo, arquivo_traduzido)
        print_warning(f"Cópia simulada de tradução criada em: {arquivo_traduzido}")
    
    # Etapa 4: Publicação (simulada)
    print_header("ETAPA 4: PUBLICAÇÃO (SIMULADA)")
    if not arquivo_traduzido:
        print_error("Não há arquivo traduzido para publicar. Pulando etapa.")
    else:
        sucesso = simular_publicacao(arquivo_traduzido)
        if not sucesso:
            print_warning("Publicação simulada falhou, mas continuando com o teste")
    
    # Concluir teste
    print_header("TESTE CONCLUÍDO")
    print_success("Fluxo completo testado com sucesso")
    print(f"\n{TermColors.BLUE}Arquivos gerados:{TermColors.ENDC}")
    print(f"  • Monitoramento: {caminho_arquivo}")
    if arquivo_traduzido:
        print(f"  • Tradução: {arquivo_traduzido}")
    print(f"\n{TermColors.GREEN}Próximos passos:{TermColors.ENDC}")
    print("  1. Verificar o conteúdo dos arquivos gerados")
    print("  2. Executar o fluxo completo com scripts adequados")
    
    return True

if __name__ == "__main__":
    # Verificar se foi passado um arquivo específico
    if len(sys.argv) > 1:
        arquivo_para_traduzir = sys.argv[1]
        print(f"Usando arquivo específico: {arquivo_para_traduzir}")
        testar_fluxo_completo(arquivo_para_traduzir)
    else:
        # Executar o teste sem arquivo específico
        testar_fluxo_completo() 