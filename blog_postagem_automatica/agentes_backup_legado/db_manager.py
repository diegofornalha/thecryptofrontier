#!/usr/bin/env python
# db_manager.py
"""
Módulo para gerenciar o banco de dados SQLite que armazena informações sobre posts processados.
"""

import os
import sqlite3
import hashlib
import difflib
from datetime import datetime

# Caminho para o banco de dados SQLite
DB_PATH = "posts_database.sqlite"

def init_db():
    """Inicializa o banco de dados SQLite, criando as tabelas necessárias se não existirem."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela de posts processados
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        link TEXT,
        processed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        output_file TEXT
    )
    ''')
    
    # Tabela de log de traduções
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS translations_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guid TEXT NOT NULL,
        title_original TEXT NOT NULL,
        title_translated TEXT NOT NULL,
        link_original TEXT,
        output_file TEXT NOT NULL,
        status TEXT DEFAULT 'sucesso',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guid) REFERENCES posts(guid)
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Banco de dados inicializado em: {DB_PATH}")

def is_guid_processed(guid):
    """Verifica se um GUID já foi processado."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM posts WHERE guid = ?", (guid,))
    result = cursor.fetchone() is not None
    
    conn.close()
    return result

def is_content_duplicated(content):
    """Verifica se o conteúdo é duplicado com base no hash MD5."""
    if not content:
        return False
    
    content_hash = hashlib.json5(content.encode('utf-8')).hexdigest()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM posts WHERE content_hash = ?", (content_hash,))
    result = cursor.fetchone() is not None
    
    conn.close()
    return result

def is_title_similar(title, similarity_threshold=0.85):
    """Verifica se um título é muito similar a títulos já processados."""
    if not title:
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Busca todos os títulos
    cursor.execute("SELECT title FROM posts")
    existing_titles = [row[0] for row in cursor.fetchall()]
    
    conn.close()
    
    # Verifica similaridade
    for existing_title in existing_titles:
        similarity = difflib.SequenceMatcher(None, title, existing_title).ratio()
        if similarity >= similarity_threshold:
            print(f"Título similar encontrado: {title} | Similar a: {existing_title} | Similaridade: {similarity:.2f}")
            return True
    
    return False

def save_processed_post(guid, title, content, link="", output_file=""):
    """Salva um post processado no banco de dados."""
    if not guid or not title:
        print("GUID e título são obrigatórios")
        return False
    
    # Garantir que o conteúdo seja uma string
    if not isinstance(content, str):
        print(f"Convertendo conteúdo para string antes de salvar. Tipo original: {type(content)}")
        if isinstance(content, list):
            try:
                if content and hasattr(content[0], 'value'):
                    content = content[0].value
                else:
                    content = str(content)
            except:
                content = str(content)
        else:
            content = str(content)
    
    # Calcula o hash do conteúdo
    content_hash = hashlib.json5(content.encode('utf-8')).hexdigest() if content else ""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO posts (guid, title, content_hash, link, output_file) VALUES (?, ?, ?, ?, ?)",
            (guid, title, content_hash, link, output_file)
        )
        conn.commit()
        conn.close()
        print(f"Post salvo no banco de dados: {title}")
        return True
    except sqlite3.IntegrityError:
        print(f"Post já existe no banco de dados: {title}")
        conn.close()
        return False

def log_translation(guid, title_original, title_translated, link_original="", output_file="", status="sucesso"):
    """Registra uma tradução realizada no log."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO translations_log (guid, title_original, title_translated, link_original, output_file, status) VALUES (?, ?, ?, ?, ?, ?)",
        (guid, title_original, title_translated, link_original, output_file, status)
    )
    
    conn.commit()
    conn.close()
    print(f"Tradução registrada no log: {title_original}")

def get_translation_history(limit=100):
    """Recupera o histórico de traduções, do mais recente para o mais antigo."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM translations_log ORDER BY timestamp DESC LIMIT ?",
        (limit,)
    )
    
    history = []
    for row in cursor.fetchall():
        history.append({
            "id": row[0],
            "guid": row[1],
            "titulo_original": row[2],
            "titulo_traduzido": row[3],
            "link_original": row[4],
            "arquivo_gerado": row[5],
            "status": row[6],
            "data_hora": row[7]
        })
    
    conn.close()
    return history

def get_all_processed_posts():
    """Recupera todos os posts processados."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Para acessar colunas pelo nome
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM posts ORDER BY processed_date DESC")
    
    posts = []
    for row in cursor.fetchall():
        posts.append(dict(row))
    
    conn.close()
    return posts

def migrate_from_json(processed_json_file):
    """Migra dados do arquivo JSON para o banco de dados SQLite."""
    import json
    
    if not os.path.exists(processed_json_file):
        print(f"Arquivo JSON não encontrado: {processed_json_file}")
        return False
    
    try:
        with open(processed_json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Inicializa o banco de dados
        init_db()
        
        # Obtém os dados do arquivo JSON
        guids = data.get("processed_guids", [])
        content_hashes = data.get("processed_content_hashes", [])
        titles = data.get("processed_titles", [])
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Migra os dados
        count = 0
        for i, guid in enumerate(guids):
            title = titles[i] if i < len(titles) else f"Post {i+1}"
            content_hash = content_hashes[i] if i < len(content_hashes) else ""
            
            try:
                cursor.execute(
                    "INSERT INTO posts (guid, title, content_hash) VALUES (?, ?, ?)",
                    (guid, title, content_hash)
                )
                count += 1
            except sqlite3.IntegrityError:
                # Ignora duplicatas
                pass
        
        conn.commit()
        conn.close()
        
        print(f"Migração concluída: {count} itens migrados para o banco de dados.")
        return True
    
    except (json.JSONDecodeError, IOError) as e:
        print(f"Erro na migração: {e}")
        return False

# Classe para compatibilidade com código existente
class DatabaseManager:
    """Classe para gerenciar o banco de dados SQLite."""
    
    def __init__(self):
        """Inicializa o gerenciador de banco de dados."""
        init_db()
    
    def artigo_existe(self, title, url):
        """Verifica se um artigo já existe no banco de dados."""
        return is_guid_processed(url) or is_title_similar(title)
    
    def inserir_artigo(self, artigo):
        """Insere um artigo no banco de dados."""
        return save_processed_post(
            artigo.get("url", ""),
            artigo.get("title", ""),
            artigo.get("content", ""),
            artigo.get("url", ""),
            artigo.get("output_file", "")
        )
    
    def obter_historico_traducoes(self, limit=100):
        """Obtém o histórico de traduções."""
        return get_translation_history(limit)
    
    def registrar_traducao(self, guid, titulo_original, titulo_traduzido, link_original="", arquivo_saida="", status="sucesso"):
        """Registra uma tradução no log."""
        return log_translation(guid, titulo_original, titulo_traduzido, link_original, arquivo_saida, status)
    
    def obter_todos_artigos(self):
        """Obtém todos os artigos processados."""
        return get_all_processed_posts()

if __name__ == "__main__":
    # Inicializa o banco de dados
    init_db()
    
    # Testes básicos
    print("\nTeste de funções do banco de dados:")
    
    # Testa salvamento de post
    test_guid = "test-guid-123"
    test_title = "Teste de Título"
    test_content = "Este é um conteúdo de teste para verificar a funcionalidade."
    
    if not is_guid_processed(test_guid):
        save_processed_post(test_guid, test_title, test_content, "https://example.com", "output/test.html")
    else:
        print(f"Post de teste já existe: {test_guid}")
    
    # Testa log de tradução
    log_translation(
        test_guid,
        "Test Title Original",
        "Título de Teste Traduzido",
        "https://example.com",
        "output/test.html"
    )
    
    # Verifica histórico
    history = get_translation_history(5)
    print("\nHistórico de traduções recentes:")
    for entry in history:
        print(f"  {entry['data_hora']} - {entry['titulo_original']} -> {entry['titulo_traduzido']}")
    
    # Testa migração se o arquivo existir
    import config
    if os.path.exists(config.PROCESSED_POSTS_FILE):
        print(f"\nMigrando dados de {config.PROCESSED_POSTS_FILE} para o banco de dados SQLite...")
        migrate_from_json(config.PROCESSED_POSTS_FILE) 