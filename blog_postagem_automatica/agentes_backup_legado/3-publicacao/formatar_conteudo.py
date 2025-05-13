import re
import json
import sys

def limpar_formatacao(conteudo):
    """
    Remove metadados e formata corretamente o conteúdo para publicação no Sanity.
    
    Args:
        conteudo (str): Conteúdo bruto do post
        
    Returns:
        dict: Dicionário com metadados extraídos e conteúdo limpo
    """
    # Inicializar dicionário de resultado
    resultado = {
        "title": "",
        "date": "",
        "tags": [],
        "category": "",
        "content": ""
    }
    
    # Padrões para extrair metadados
    titulo_pattern = re.compile(r"title:\s*\"(.*?)\"", re.MULTILINE)
    data_pattern = re.compile(r"date:\s*(\d{4}-\d{2}-\d{2})", re.MULTILINE)
    tags_pattern = re.compile(r"tags:\s*(.*?)(?=\n[a-z]+:|$)", re.MULTILINE | re.DOTALL)
    categoria_pattern = re.compile(r"category:\s*(.*?)(?=\n[a-z]+:|$)", re.MULTILINE | re.DOTALL)
    
    # Extrair metadados
    titulo_match = titulo_pattern.search(conteudo)
    if titulo_match:
        resultado["title"] = titulo_match.group(1)
    
    data_match = data_pattern.search(conteudo)
    if data_match:
        resultado["date"] = data_match.group(1)
    
    tags_match = tags_pattern.search(conteudo)
    if tags_match:
        tags_text = tags_match.group(1).strip()
        if tags_text:
            # Separar tags (formato: tag1, tag2, tag3)
            resultado["tags"] = [tag.strip() for tag in tags_text.split(",")]
    
    categoria_match = categoria_pattern.search(conteudo)
    if categoria_match:
        resultado["category"] = categoria_match.group(1).strip()
    
    # Remover seção de metadados
    # Encontrar as linhas delimitadoras "---"
    delimitadores = re.findall(r"---", conteudo)
    
    if len(delimitadores) >= 2:
        # Extrair conteúdo entre o segundo "---" e o final
        partes = conteudo.split("---", 2)
        if len(partes) >= 3:
            conteudo_limpo = partes[2].strip()
        else:
            conteudo_limpo = conteudo
    else:
        conteudo_limpo = conteudo
    
    # Remover repetição do título no início do texto
    if resultado["title"]:
        # Escapar caracteres especiais no título para uso em regex
        titulo_escapado = re.escape(resultado["title"])
        conteudo_limpo = re.sub(f"^\\s*{titulo_escapado}\\s*", "", conteudo_limpo)
    
    resultado["content"] = conteudo_limpo.strip()
    
    return resultado

def processar_arquivo(caminho_arquivo):
    """
    Processa um arquivo de post e retorna o conteúdo formatado.
    
    Args:
        caminho_arquivo (str): Caminho para o arquivo de post
        
    Returns:
        dict: Dicionário com metadados e conteúdo formatado
    """
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            conteudo = arquivo.read()
        
        return limpar_formatacao(conteudo)
    except Exception as e:
        print(f"Erro ao processar arquivo: {e}")
        return None

if __name__ == "__main__":
    # Testar com um arquivo se fornecido como argumento
    if len(sys.argv) > 1:
        caminho_arquivo = sys.argv[1]
        resultado = processar_arquivo(caminho_arquivo)
        if resultado:
            print(json.dumps(resultado, indent=2, ensure_ascii=False))
    else:
        print("Uso: python formatar_conteudo.py caminho_para_arquivo.json") 