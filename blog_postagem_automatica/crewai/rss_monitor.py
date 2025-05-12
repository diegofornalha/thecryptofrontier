# rss_monitor.py
import feedparser
import json
import os
import hashlib
import difflib
from datetime import datetime
import sqlite3

# Carrega configurações
import config
import db_manager  # Importar o módulo, não uma classe específica

# Flag para usar o novo sistema de banco de dados
USE_SQLITE_DB = True  # Altere para False para voltar ao sistema JSON

def load_processed_items(filepath=config.PROCESSED_POSTS_FILE):
    """Carrega a lista de GUIDs e hashes de posts já processados."""
    if USE_SQLITE_DB:
        # Inicializa o banco de dados se necessário
        db_manager.init_db()
        return {
            "guids": set(),  # Não precisamos carregar todos os GUIDs, as funções do DB já fazem a verificação
            "content_hashes": set(),
            "titles": set()
        }
    else:
        # Sistema antigo baseado em JSON
        if not os.path.exists(filepath):
            return {"guids": set(), "content_hashes": set(), "titles": set()}
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {
                    "guids": set(data.get("processed_guids", [])),
                    "content_hashes": set(data.get("processed_content_hashes", [])),
                    "titles": set(data.get("processed_titles", []))
                }
        except (json.JSONDecodeError, IOError):
            return {"guids": set(), "content_hashes": set(), "titles": set()}

def save_processed_item(guid, content="", title="", filepath=config.PROCESSED_POSTS_FILE):
    """Adiciona o GUID, hash de conteúdo e título de um item processado ao sistema de controle."""
    if USE_SQLITE_DB:
        # Salva no banco de dados SQLite
        return db_manager.save_processed_post(guid, title, content)
    else:
        # Sistema antigo baseado em JSON
        processed_data = load_processed_items(filepath)
        
        # Adiciona o GUID ao conjunto
        processed_data["guids"].add(guid)
        
        # Calcula e adiciona o hash do conteúdo, se fornecido
        if content:
            content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
            processed_data["content_hashes"].add(content_hash)
        
        # Adiciona o título para verificação futura de similaridade
        if title:
            processed_data["titles"].add(title)
        
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump({
                    "processed_guids": list(processed_data["guids"]),
                    "processed_content_hashes": list(processed_data["content_hashes"]),
                    "processed_titles": list(processed_data["titles"])
                }, f, indent=4)
            return True
        except IOError as e:
            print(f"Erro ao salvar item processado: {e}")
            return False

def is_similar_to_processed_title(title, similarity_threshold=0.85):
    """Verifica se um título é muito similar a títulos já processados."""
    if USE_SQLITE_DB:
        return db_manager.is_title_similar(title, similarity_threshold)
    else:
        processed_data = load_processed_items()
        for processed_title in processed_data["titles"]:
            similarity = difflib.SequenceMatcher(None, title, processed_title).ratio()
            if similarity >= similarity_threshold:
                print(f"Título similar encontrado: {title} | Similar a: {processed_title} | Similaridade: {similarity:.2f}")
                return True
        return False

def is_duplicate_content(content):
    """Verifica se o conteúdo é duplicado com base no hash MD5."""
    if USE_SQLITE_DB:
        return db_manager.is_content_duplicated(content)
    else:
        if not content:
            return False
        
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        processed_data = load_processed_items()
        
        return content_hash in processed_data["content_hashes"]

def extract_content_from_entry(entry):
    """Extrai o conteúdo de um item de feed, lidando com diferentes formatos."""
    try:
        # Primeira opção: campo 'content'
        if 'content' in entry:
            content_array = entry.get('content', [])
            if content_array and isinstance(content_array, list):
                # Normalmente é uma lista de dicionários, cada um com 'value'
                for content_item in content_array:
                    if isinstance(content_item, dict) and 'value' in content_item:
                        return content_item.get('value', '')
            elif isinstance(content_array, dict) and 'value' in content_array:
                # Às vezes pode ser um único dicionário
                return content_array.get('value', '')
            elif isinstance(content_array, str):
                # Ou pode ser diretamente uma string
                return content_array
                
        # Segunda opção: campo 'summary_detail'
        if 'summary_detail' in entry and isinstance(entry.summary_detail, dict):
            return entry.summary_detail.get('value', '')
            
        # Terceira opção: campo 'summary'
        if 'summary' in entry:
            return entry.get('summary', '')
            
        # Se chegamos aqui, não encontramos conteúdo utilizável
        print(f"Aviso: Não foi possível extrair conteúdo para o item: {entry.get('title', 'Sem título')}")
        return ""
        
    except Exception as e:
        print(f"Erro ao extrair conteúdo do feed: {e}")
        return ""

def fetch_new_items():
    """Busca novos itens do feed RSS que não foram processados anteriormente."""
    try:
        feed_url = config.RSS_FEED_URL
        print(f"Buscando feed RSS de: {feed_url}")
        
        # Inicializar o banco de dados
        db_manager.init_db()
        print(f"Banco de dados inicializado em: posts_database.sqlite")
        
        # Buscar feed RSS
        feed = feedparser.parse(feed_url)
        
        if not feed.entries:
            print("Nenhum item encontrado no feed RSS.")
            return []
            
        print(f"{len(feed.entries)} itens encontrados no feed.")
        
        # Para teste, retornar o primeiro item sem verificar se foi processado
        # Remova ou comente esta linha após o teste
        first_entry = feed.entries[0]
        print(f"Processando primeiro item para teste: {first_entry.get('title', 'Sem título')}")
        
        # Extrair conteúdo de forma segura
        content = extract_content_from_entry(first_entry)
        if not content:
            print("Aviso: Conteúdo vazio para o primeiro item")
            
        # Se não houver conteúdo, tentar usar summary
        if not content and 'summary' in first_entry:
            content = first_entry.get('summary', '')
            print("Usando summary como conteúdo")
            
        # Criar item formatado
        item = {
            "title": first_entry.get("title", "Sem Título"),
            "link": first_entry.get("link", ""),
            "guid": first_entry.get("guid", first_entry.get("link", "")),
            "published_parsed": first_entry.get("published_parsed"),
            "summary": first_entry.get("summary", ""),
            "content": content
        }
        
        return [item]
        
        # Buscar itens já processados
        processed_posts = db_manager.get_all_processed_posts()
        print(f"{len(processed_posts)} itens já processados.")
        
        new_items = []
        
        for entry in feed.entries:
            guid = entry.get("guid") or entry.get("link") # 'guid' é preferível, 'link' como fallback
            if not guid:
                print(f"Alerta: Item sem GUID ou Link no feed: {entry.get('title')}")
                continue

            # Extrai informações para verificações
            title = entry.get("title", "Sem Título")
            content_raw = entry.get("content", [{"value": entry.get("summary", "")}])
            
            # Garantir que o conteúdo seja uma string
            if isinstance(content_raw, list):
                if content_raw:
                    content = content_raw[0].get("value", "")
                else:
                    content = ""
            else:
                content = content_raw
                
            if not isinstance(content, str):
                content = str(content)
                
            print(f"Tipo de conteúdo extraído: {type(content)}")
            
            # Verifica se o item já foi processado por GUID
            if USE_SQLITE_DB:
                is_processed = db_manager.is_guid_processed(guid)
            else:
                is_processed = guid in processed_posts
            
            if is_processed:
                # print(f"Item já processado por GUID: {title}")
                continue
            
            # Verifica se o conteúdo é duplicado
            if is_duplicate_content(content):
                print(f"Item com conteúdo duplicado: {title}")
                continue
            
            # Verifica se o título é muito similar a um já processado
            if is_similar_to_processed_title(title):
                print(f"Item com título muito similar a um já processado: {title}")
                continue

            # Item é novo e não é duplicado
            item = {
                "title": title,
                "link": entry.get("link", ""),
                "guid": guid,
                "published_parsed": entry.get("published_parsed"),
                "summary": entry.get("summary", ""),
                "content": content
            }
            
            new_items.append(item)
            print(f"Novo item encontrado: {item['title']}")
            
        # Ordena por data de publicação, do mais antigo para o mais novo, se disponível
        if new_items and all(item.get("published_parsed") for item in new_items):
            new_items.sort(key=lambda x: x["published_parsed"])
        
        print(f"{len(new_items)} novos itens para processar.")
        return new_items
    except Exception as e:
        print(f"Erro ao buscar novos itens: {e}")
        return []

def migrate_to_sqlite():
    """Migra os dados do formato JSON para o banco de dados SQLite."""
    if os.path.exists(config.PROCESSED_POSTS_FILE):
        print(f"Migrando dados do arquivo {config.PROCESSED_POSTS_FILE} para SQLite...")
        result = db_manager.migrate_from_json(config.PROCESSED_POSTS_FILE)
        if result:
            backup_file = f"{config.PROCESSED_POSTS_FILE}.bak"
            os.rename(config.PROCESSED_POSTS_FILE, backup_file)
            print(f"Migração concluída com sucesso. Arquivo original renomeado para {backup_file}")
        return result
    else:
        print(f"Arquivo {config.PROCESSED_POSTS_FILE} não encontrado. Nenhuma migração necessária.")
        return False

if __name__ == "__main__":
    # Teste rápido
    print("Testando rss_monitor.py...")
    
    # Verificar se devemos migrar para SQLite
    if USE_SQLITE_DB and os.path.exists(config.PROCESSED_POSTS_FILE):
        # Tenta migrar os dados existentes para SQLite
        migrate_to_sqlite()
    
    # Limpar arquivos de teste conforme o sistema utilizado
    if USE_SQLITE_DB:
        if os.path.exists(db_manager.DB_PATH):
            print(f"Usando sistema SQLite. Banco de dados já existe em {db_manager.DB_PATH}")
    else:
        if os.path.exists(config.PROCESSED_POSTS_FILE):
            os.remove(config.PROCESSED_POSTS_FILE)
            print(f"Arquivo {config.PROCESSED_POSTS_FILE} removido para teste.")

    novos = fetch_new_items()
    if novos:
        print(f"\nEncontrados {len(novos)} novos itens:")
        for item_novo in novos:
            print(f"  Título: {item_novo['title']}")
            print(f"  Link: {item_novo['link']}")
            print(f"  GUID: {item_novo['guid']}")
            # print(f"  Conteúdo (resumo): {item_novo['summary'][:100]}...")
            # print(f"  Conteúdo (completo): {item_novo['content'][:100]}...")
            save_processed_item(item_novo['guid'], item_novo['content'], item_novo['title'])
            print(f"  Item {item_novo['guid']} marcado como processado.")
        
        print("\nSegunda busca (não deve encontrar novos itens):")
        novos_2 = fetch_new_items()
        if not novos_2:
            print("Nenhum novo item encontrado, como esperado.")
        else:
            print(f"ERRO: Encontrados {len(novos_2)} novos itens na segunda busca!")
    else:
        print("Nenhum novo item encontrado na primeira busca.")

