from pathlib import Path
import json
from crewai.tools import BaseTool

class FileSaveTool(BaseTool):
    name: str = "File Save Tool"
    description: str = (
        "Saves the given content to a specified file path. "
        "The tool will create parent directories if they do not exist. "
        "Input to this tool should be a dictionary with two keys: "
        "\'file_path\' (a string representing the full path where the file should be saved) and "
        "\'content\' (a string representing the content to be saved)."
    )

    def _run(self, file_path: str, content: str) -> str:
        try:
            path = Path(file_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            # Tenta interpretar o conteúdo como JSON e salvá-lo de forma formatada
            # Se não for JSON, salva como texto puro.
            try:
                # Verifica se o conteúdo já é um dict/list (se o LLM passou um objeto)
                if isinstance(content, (dict, list)):
                    parsed_content = content
                else: # Se for string, tenta carregar como JSON
                    parsed_content = json.loads(content)
                
                with open(path, 'w', encoding='utf-8') as f:
                    json.dump(parsed_content, f, ensure_ascii=False, indent=2)
                return f"JSON content successfully saved to {file_path}"

            except (json.JSONDecodeError, TypeError):
                # Se não for um JSON válido ou já um objeto serializável, salva como texto.
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(str(content)) # Garante que o conteúdo seja string
                return f"Text content successfully saved to {file_path}"

        except Exception as e:
            return f"Error saving file to {file_path}: {e}"

# Exemplo de como o agente deveria chamar (para referência):
# Action: File Save Tool
# Action Input:
# {{
#   "file_path": "caminho/completo/para/salvar/arquivo.json",
#   "content": "{ \"chave\": \"valor\" }"
# }} 