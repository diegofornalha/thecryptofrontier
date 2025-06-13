#!/usr/bin/env python3
"""
Ferramenta para listar documentos do Sanity CMS no framework CrewAI.
"""

import os
import json
import logging
import requests
from typing import Dict, List, Optional, Type, Any
from urllib.parse import quote
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sanity_list_tool")

# Configurações padrão do Sanity
try:
    from ..config import SANITY_CONFIG  # Tenta importar das configurações do projeto
    PROJECT_ID = SANITY_CONFIG.get("project_id", "z4sx85c6")
    DATASET = SANITY_CONFIG.get("dataset", "production")
    API_VERSION = SANITY_CONFIG.get("api_version", "2023-05-03")
except ImportError:
    logger.warning("Não foi possível importar configurações do Sanity, usando valores padrão")
    PROJECT_ID = "z4sx85c6"  # valor padrão
    DATASET = "production"
    API_VERSION = "2023-05-03"

# Schema para listar documentos
class ListDocumentsInput(BaseModel):
    """Schema de entrada para a ferramenta de listagem de documentos."""
    document_type: str = Field(..., description="Tipo de documento a ser listado (ex: 'post', 'author', etc.)")
    limit: int = Field(default=100, description="Número máximo de documentos a retornar")
    return_fields: str = Field(default="_id,title", description="Campos a retornar, separados por vírgula")

class SanityListDocumentsTool(BaseTool):
    """Ferramenta CrewAI para listar documentos no Sanity CMS."""
    
    name: str = "Sanity List Documents Tool"
    description: str = "Lista documentos no Sanity CMS de um tipo específico"
    args_schema: Type[BaseModel] = ListDocumentsInput
    
    def _get_SANITY_API_TOKEN(self) -> str:
        """
        Obtém o token de API do Sanity das variáveis de ambiente.
        
        Returns:
            str: Token de API do Sanity
            
        Raises:
            ValueError: Se o token não estiver disponível
        """
        token = os.environ.get("SANITY_API_TOKEN")
        if not token:
            raise ValueError("SANITY_API_TOKEN não está definido nas variáveis de ambiente")
        return token
    
    def _run(self, document_type: str, limit: int = 100, return_fields: str = "_id,title") -> Dict:
        """Executa a listagem de documentos."""
        try:
            # Obter token do Sanity
            SANITY_API_TOKEN = self._get_SANITY_API_TOKEN()
            
            # Construir a query GROQ
            query = f'*[_type == "{document_type}"][0...{limit}]{{{return_fields}}}'
            encoded_query = quote(query)
            
            # URL da API do Sanity
            url = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
            
            # Headers
            headers = {
                "Authorization": f"Bearer {SANITY_API_TOKEN}"
            }
            
            # Fazer a requisição
            logger.info(f"Consultando documentos do tipo '{document_type}'...")
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            # Extrair os resultados
            result = response.json().get("result", [])
            
            # Verificar se há documentos
            if not result:
                logger.info(f"Nenhum documento do tipo '{document_type}' encontrado.")
                return {"documents": [], "count": 0, "message": f"Nenhum documento do tipo '{document_type}' encontrado."}
            
            # Retornar os documentos
            return {
                "documents": result,
                "count": len(result),
                "message": f"Encontrados {len(result)} documentos do tipo '{document_type}'."
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar documentos: {str(e)}")
            return {"error": str(e), "documents": [], "count": 0}

# Exportar a ferramenta
__all__ = ['SanityListDocumentsTool']

# Teste do módulo
if __name__ == "__main__":
    # Exemplo de uso para testar o módulo
    print("Testando ferramenta de listagem do Sanity...")
    
    # Verificar se o token está definido
    if not os.environ.get("SANITY_API_TOKEN"):
        print("ATENÇÃO: SANITY_API_TOKEN não está definido. As operações falharão.")
        # Para teste, podemos definir um token temporário
        os.environ["SANITY_API_TOKEN"] = "seu_token_aqui"
    
    # Testar listagem de documentos
    list_tool = SanityListDocumentsTool()
    result = list_tool._run("post")
    print(f"Resultado da listagem: {json.dumps(result, indent=2)}")