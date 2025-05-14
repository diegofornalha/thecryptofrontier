"""
Ferramentas para manipulação de arquivos
"""

import os
import json
import logging
from crewai.tools import tool

logger = logging.getLogger("file_tools")

@tool
def save_to_file(data=None, file_path=None, **kwargs):
    """Salva dados em um arquivo JSON. Requer 'data' (conteúdo) e 'file_path' (caminho do arquivo)."""
    try:
        # Nova lógica para tentar extrair de uma string JSON no primeiro argumento posicional
        # ou se 'data' for uma string JSON.
        parsed_from_string = False
        if isinstance(data, str):
            try:
                parsed_json = json.loads(data)
                if isinstance(parsed_json, dict):
                    file_path = parsed_json.get("file_path", file_path)
                    data = parsed_json.get("data", data) # data pode ser o próprio JSON parseado ou um campo dentro dele
                    # Se 'data' dentro do JSON parseado ainda for uma string, pode ser um JSON aninhado.
                    # Mas, por simplicidade, assumimos que 'data' agora é o conteúdo real.
                    parsed_from_string = True
                    logger.info("Parâmetros extraídos de uma string JSON fornecida como primeiro argumento.")
            except json.JSONDecodeError:
                # Não era uma string JSON, ou 'data' era uma string de texto normal. Prossegue.
                pass
        
        # Processar parâmetros (lógica original, ajustada para não sobrescrever se já parseado)
        if not parsed_from_string:
            if data is None and "data" in kwargs:
                data = kwargs["data"]
            if file_path is None and "file_path" in kwargs:
                file_path = kwargs["file_path"]
        
        # Verificar se os parâmetros estão presentes
        if data is None:
            logger.error("Parâmetro 'data' não fornecido")
            return {"success": False, "error": "Parâmetro 'data' é obrigatório"}
        if file_path is None:
            logger.error("Parâmetro 'file_path' não fornecido")
            return {"success": False, "error": "Parâmetro 'file_path' é obrigatório"}
        
        # Se os dados forem fornecidos como string JSON, converter para dicionário
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                # Se não for JSON válido, tratar como texto
                pass
        
        # Garantir que o caminho do arquivo seja string
        if not isinstance(file_path, str):
            if hasattr(file_path, "__str__"):
                file_path = str(file_path)
            else:
                logger.error(f"file_path deve ser uma string, recebido: {type(file_path)}")
                return {"success": False, "error": "file_path deve ser uma string"}
        
        # Criar diretório se não existir
        directory = os.path.dirname(file_path)
        if directory:  # Verificar se o caminho tem um diretório pai
            os.makedirs(directory, exist_ok=True)
        
        # Salvar dados no arquivo
        with open(file_path, "w", encoding="utf-8") as f:
            if isinstance(data, (dict, list)):
                json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                # Se não for dict ou list, salvar como texto
                f.write(str(data))
        
        logger.info(f"Arquivo salvo com sucesso: {file_path}")
        return {"success": True, "path": file_path}
    except Exception as e:
        logger.error(f"Erro ao salvar arquivo {file_path}: {str(e)}")
        return {"success": False, "error": str(e)}

@tool
def read_from_file(file_path=None, **kwargs):
    """Lê dados de um arquivo JSON ou texto. Requer 'file_path' (caminho do arquivo)."""
    try:
        # Nova lógica para tentar extrair de uma string JSON no primeiro argumento posicional
        # ou se 'file_path' (o primeiro argumento) for uma string JSON.
        parsed_from_string = False
        if isinstance(file_path, str):
            try:
                # Verifica se a string é um JSON que contém 'file_path'
                parsed_json = json.loads(file_path)
                if isinstance(parsed_json, dict) and "file_path" in parsed_json:
                    file_path = parsed_json.get("file_path")
                    parsed_from_string = True
                    logger.info("Parâmetro 'file_path' extraído de uma string JSON fornecida como primeiro argumento.")
            except json.JSONDecodeError:
                # Não era uma string JSON, então file_path é provavelmente o caminho do arquivo real.
                pass

        # Processar parâmetros (lógica original, ajustada para não sobrescrever se já parseado)
        if not parsed_from_string:
            if file_path is None: # file_path ainda pode ser None se não foi passado diretamente
                file_path = kwargs.get("file_path") or kwargs.get("filename")
        
        # Verificar se o parâmetro está presente
        if file_path is None:
            logger.error("Parâmetro 'file_path' não fornecido")
            return {"success": False, "error": "Parâmetro 'file_path' é obrigatório"}
        
        # Garantir que o caminho do arquivo seja string
        if not isinstance(file_path, str):
            if hasattr(file_path, "__str__"):
                file_path = str(file_path)
            else:
                logger.error(f"file_path deve ser uma string, recebido: {type(file_path)}")
                return {"success": False, "error": "file_path deve ser uma string"}
        
        # Verificar se o arquivo existe
        if not os.path.exists(file_path):
            logger.error(f"Arquivo não encontrado: {file_path}")
            return {"success": False, "error": f"Arquivo não encontrado: {file_path}"}
        
        # Ler o arquivo
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                # Tentar carregar como JSON
                data = json.load(f)
            except json.JSONDecodeError:
                # Se não for JSON válido, ler como texto
                f.seek(0)  # Voltar ao início do arquivo
                data = f.read()
        
        logger.info(f"Arquivo lido com sucesso: {file_path}")
        return {"success": True, "data": data, "path": file_path}
    except Exception as e:
        logger.error(f"Erro ao ler arquivo {file_path}: {str(e)}")
        return {"success": False, "error": str(e)}