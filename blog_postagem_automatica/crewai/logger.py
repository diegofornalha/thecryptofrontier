# logger.py
import os
import json
import datetime
from typing import Dict, List, Optional

# Importação do novo módulo de banco de dados
import db_manager

# Flag para usar o banco de dados SQLite
USE_SQLITE_DB = True  # Altere para False para usar o sistema antigo baseado em JSON

# Arquivo de log
LOG_FILE = "traducoes_log.json"

def load_log() -> List[Dict]:
    """Carrega o histórico de traduções do arquivo de log ou banco de dados."""
    if USE_SQLITE_DB:
        # Inicializa o banco de dados se necessário
        db_manager.init_db()
        # Retorna o histórico do banco de dados
        return db_manager.get_translation_history()
    else:
        # Sistema antigo baseado em JSON
        if not os.path.exists(LOG_FILE):
            return []
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

def save_log(log_entries: List[Dict]) -> None:
    """Salva o histórico de traduções no arquivo de log.
    
    Nota: Este método só é usado no sistema baseado em JSON.
    No sistema SQLite, as entradas são salvas individualmente via log_translation().
    """
    if USE_SQLITE_DB:
        # No sistema SQLite, esta função não faz nada, pois as entradas são inseridas individualmente
        pass
    else:
        # Sistema antigo baseado em JSON
        try:
            with open(LOG_FILE, "w", encoding="utf-8") as f:
                json.dump(log_entries, f, indent=4, ensure_ascii=False)
        except IOError as e:
            print(f"Erro ao salvar log: {e}")

def log_translation(item: Dict, output_path: str, title_translated: str) -> None:
    """Registra uma tradução no log."""
    if USE_SQLITE_DB:
        # Registra no banco de dados SQLite
        guid = item.get("guid", "")
        title_original = item.get("title", "")
        link_original = item.get("link", "")
        
        db_manager.log_translation(
            guid=guid,
            title_original=title_original,
            title_translated=title_translated,
            link_original=link_original,
            output_file=output_path,
            status="sucesso"
        )
    else:
        # Sistema antigo baseado em JSON
        log_entries = load_log()
        
        # Cria entrada de log
        log_entry = {
            "data_hora": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "guid": item.get("guid", ""),
            "titulo_original": item.get("title", ""),
            "titulo_traduzido": title_translated,
            "link_original": item.get("link", ""),
            "arquivo_gerado": output_path,
            "status": "sucesso"
        }
        
        # Adiciona entrada ao log
        log_entries.append(log_entry)
        
        # Salva log atualizado
        save_log(log_entries)
    
    print(f"Tradução registrada no log: {item.get('title', '')}")

def generate_history_html() -> str:
    """Gera uma página HTML com o histórico de traduções."""
    log_entries = load_log()
    
    # Ordena entradas por data, das mais recentes para as mais antigas
    if not USE_SQLITE_DB:  # No SQLite, já vem ordenado
        log_entries.sort(key=lambda x: x.get("data_hora", ""), reverse=True)
    
    html = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Histórico de Traduções</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        a {
            color: #2980b9;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .status-success {
            color: green;
        }
        .status-error {
            color: red;
        }
    </style>
</head>
<body>
    <h1>Histórico de Traduções</h1>
    <p>Total de artigos traduzidos: <strong>""" + str(len(log_entries)) + """</strong></p>
    <p>Última atualização: <strong>""" + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</strong></p>
    
    <table>
        <tr>
            <th>Data/Hora</th>
            <th>Título Original</th>
            <th>Título Traduzido</th>
            <th>Links</th>
            <th>Status</th>
        </tr>
"""
    
    # Adiciona linhas para cada entrada de log
    for entry in log_entries:
        status_class = "status-success" if entry.get("status") == "sucesso" else "status-error"
        
        # Ajuste para diferentes sistemas (as chaves podem ser diferentes)
        if USE_SQLITE_DB:
            data_hora = entry.get("data_hora", "")
            titulo_original = entry.get("titulo_original", "")
            titulo_traduzido = entry.get("titulo_traduzido", "")
            link_original = entry.get("link_original", "")
            arquivo_gerado = entry.get("arquivo_gerado", "")
            status = entry.get("status", "")
        else:
            data_hora = entry.get("data_hora", "")
            titulo_original = entry.get("titulo_original", "")
            titulo_traduzido = entry.get("titulo_traduzido", "")
            link_original = entry.get("link_original", "")
            arquivo_gerado = entry.get("arquivo_gerado", "")
            status = entry.get("status", "")
        
        html += f"""
        <tr>
            <td>{data_hora}</td>
            <td>{titulo_original}</td>
            <td>{titulo_traduzido}</td>
            <td>
                <a href="{link_original}" target="_blank">Original</a> | 
                <a href="{arquivo_gerado}" target="_blank">Traduzido</a>
            </td>
            <td class="{status_class}">{status}</td>
        </tr>"""
    
    html += """
    </table>
</body>
</html>"""
    
    # Salva a página HTML
    history_path = "historico_traducoes.html"
    try:
        with open(history_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Histórico HTML gerado em: {history_path}")
        return history_path
    except IOError as e:
        print(f"Erro ao gerar histórico HTML: {e}")
        return ""

def migrate_to_sqlite():
    """Migra os dados do log JSON para o banco de dados SQLite."""
    if os.path.exists(LOG_FILE):
        print(f"Migrando dados do log JSON para o banco de dados SQLite...")
        log_entries = load_log()
        
        if not log_entries:
            print("Nenhum dado para migrar.")
            return False
        
        # Inicializa o banco de dados
        db_manager.init_db()
        
        count = 0
        for entry in log_entries:
            try:
                # Primeiro registra o post processado
                db_manager.save_processed_post(
                    guid=entry.get("guid", ""),
                    title=entry.get("titulo_original", ""),
                    content="",  # Não temos o conteúdo aqui
                    link=entry.get("link_original", ""),
                    output_file=entry.get("arquivo_gerado", "")
                )
                
                # Depois registra a tradução
                db_manager.log_translation(
                    guid=entry.get("guid", ""),
                    title_original=entry.get("titulo_original", ""),
                    title_translated=entry.get("titulo_traduzido", ""),
                    link_original=entry.get("link_original", ""),
                    output_file=entry.get("arquivo_gerado", ""),
                    status=entry.get("status", "sucesso")
                )
                
                count += 1
            except Exception as e:
                print(f"Erro ao migrar entrada: {e}")
        
        print(f"Migração concluída: {count} entradas migradas.")
        
        # Renomeia o arquivo original
        if count > 0:
            backup_file = f"{LOG_FILE}.bak"
            os.rename(LOG_FILE, backup_file)
            print(f"Arquivo original renomeado para {backup_file}")
        
        return count > 0
    else:
        print(f"Arquivo de log {LOG_FILE} não encontrado.")
        return False

if __name__ == "__main__":
    # Testa a geração do histórico HTML
    print("Gerando histórico HTML...")
    
    # Verifica se devemos migrar para SQLite
    if USE_SQLITE_DB and os.path.exists(LOG_FILE):
        migrate_to_sqlite()
    
    path = generate_history_html()
    print(f"Histórico gerado em: {path}") 