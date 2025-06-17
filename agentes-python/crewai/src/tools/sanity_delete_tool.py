#!/usr/bin/env python3
"""
Ferramenta para excluir documentos do Strapi CMS no framework CrewAI.
"""

import os
import json
import logging
import requests
from typing import Dict, List, Optional, Type, Any
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("strapi_delete_tool")

# Configurações padrão do Strapi
try:
    from ..config import strapi_CONFIG  # Tenta importar das configurações do projeto
    PROJECT_ID = strapi_CONFIG.get("project_id", "z4sx85c6")
    DATASET = strapi_CONFIG.get("dataset", "production")
    API_VERSION = strapi_CONFIG.get("api_version", "2023-05-03")
except ImportError:
    logger.warning("Não foi possível importar configurações do Strapi, usando valores padrão")
    PROJECT_ID = "z4sx85c6"  # valor padrão
    DATASET = "production"
    API_VERSION = "2023-05-03"

# Schema para excluir documentos
class DeleteDocumentInput(BaseModel):
    """Schema de entrada para a ferramenta de exclusão de documentos."""
    document_id: str = Field(..., description="ID do documento a ser excluído")

class DeleteAllDocumentsInput(BaseModel):
    """Schema de entrada para a ferramenta de exclusão em massa de documentos."""
    document_type: str = Field(..., description="Tipo de documento a ser excluído (ex: 'post', 'author', etc.)")
    confirm: bool = Field(default=False, description="Confirmação para excluir todos os documentos (deve ser True)")

class strapiDeleteDocumentTool(BaseTool):
    """Ferramenta CrewAI para excluir documentos no Strapi CMS."""
    
    name: str = "Strapi Delete Document Tool"
    description: str = "Exclui um documento no Strapi CMS pelo ID"
    args_schema: Type[BaseModel] = DeleteDocumentInput
    
    def _get_strapi_API_TOKEN(self) -> str:
        """
        Obtém o token de API do Strapi das variáveis de ambiente.
        
        Returns:
            str: Token de API do Strapi
            
        Raises:
            ValueError: Se o token não estiver disponível
        """
        token = os.environ.get("strapi_API_TOKEN")
        if not token:
            raise ValueError("strapi_API_TOKEN não está definido nas variáveis de ambiente")
        return token
    
    def _run(self, document_id: str) -> Dict:
        """Exclui um documento do Strapi CMS pelo ID."""
        try:
            # Obter token do Strapi
            strapi_API_TOKEN = self._get_strapi_API_TOKEN()
            
            # URL da API do Strapi
            url = f"https://{PROJECT_ID}.api.strapi.io/v{API_VERSION}/data/mutate/{DATASET}"
            
            # Headers
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {strapi_API_TOKEN}"
            }
            
            # Preparar a mutação
            mutations = {
                "mutations": [
                    {
                        "delete": {
                            "id": document_id
                        }
                    }
                ]
            }
            
            # Fazer a requisição
            logger.info(f"Excluindo documento com ID '{document_id}'...")
            response = requests.post(url, headers=headers, json=mutations)
            response.raise_for_status()
            
            # Extrair o resultado
            result = response.json()
            
            # Verificar se a operação foi bem-sucedida
            if "transactionId" in result:
                logger.info(f"Documento excluído com sucesso. ID: {document_id}")
                return {
                    "success": True,
                    "document_id": document_id,
                    "message": f"Documento com ID '{document_id}' excluído com sucesso.",
                    "transaction_id": result.get("transactionId")
                }
            else:
                logger.error(f"Erro ao excluir documento: {result}")
                return {
                    "success": False,
                    "error": "Erro desconhecido",
                    "response": result
                }
        
        except Exception as e:
            logger.error(f"Erro ao excluir documento: {str(e)}")
            return {"success": False, "error": str(e)}

class strapiDeleteAllDocumentsTool(BaseTool):
    """Ferramenta CrewAI para excluir todos os documentos de um tipo no Strapi CMS."""
    
    name: str = "Strapi Delete All Documents Tool"
    description: str = "Exclui todos os documentos de um tipo específico no Strapi CMS"
    args_schema: Type[BaseModel] = DeleteAllDocumentsInput
    
    def _get_strapi_API_TOKEN(self) -> str:
        """
        Obtém o token de API do Strapi das variáveis de ambiente.
        
        Returns:
            str: Token de API do Strapi
            
        Raises:
            ValueError: Se o token não estiver disponível
        """
        token = os.environ.get("strapi_API_TOKEN")
        if not token:
            raise ValueError("strapi_API_TOKEN não está definido nas variáveis de ambiente")
        return token
    
    def _run(self, document_type: str, confirm: bool = False) -> Dict:
        """Exclui todos os documentos de um tipo específico no Strapi CMS."""
        if not confirm:
            return {
                "success": False,
                "error": "Por segurança, você deve confirmar esta operação definindo 'confirm=True'",
                "message": "Operação cancelada por falta de confirmação."
            }
        
        try:
            # Obter token do Strapi
            strapi_API_TOKEN = self._get_strapi_API_TOKEN()
            
            # Importar a ferramenta de listagem para obter os IDs
            try:
                from .strapi_list_tool import strapiListDocumentsTool
                list_tool = strapiListDocumentsTool()
            except ImportError:
                # Criar uma instância temporária se não conseguir importar
                from pydantic import BaseModel, Field
                
                class ListDocumentsInput(BaseModel):
                    document_type: str = Field(..., description="Tipo de documento")
                    limit: int = Field(default=100, description="Limite")
                    return_fields: str = Field(default="_id", description="Campos")
                
                class TempListTool(BaseTool):
                    name: str = "Temp List Tool"
                    description: str = "Temp"
                    args_schema: Type[BaseModel] = ListDocumentsInput
                    
                    def _run(self, document_type: str, limit: int = 100, return_fields: str = "_id") -> Dict:
                        from urllib.parse import quote
                        query = f'*[_type == "{document_type}"][0...{limit}]{{{return_fields}}}'
                        encoded_query = quote(query)
                        url = f"https://{PROJECT_ID}.api.strapi.io/v{API_VERSION}/data/query/{DATASET}?query={encoded_query}"
                        headers = {
                            "Authorization": f"Bearer {strapi_API_TOKEN}"
                        }
                        response = requests.get(url, headers=headers)
                        response.raise_for_status()
                        result = response.json().get("result", [])
                        return {
                            "documents": result,
                            "count": len(result)
                        }
                
                list_tool = TempListTool()
            
            # Listar os documentos
            list_result = list_tool._run(document_type=document_type, limit=1000, return_fields="_id")
            
            documents = list_result.get("documents", [])
            count = len(documents)
            
            if count == 0:
                return {
                    "success": True,
                    "message": f"Nenhum documento do tipo '{document_type}' encontrado para excluir.",
                    "count": 0,
                    "success_count": 0,
                    "failed_count": 0
                }
            
            # Criar a instância da ferramenta de exclusão
            delete_tool = strapiDeleteDocumentTool()
            
            # Excluir cada documento
            success_count = 0
            failed_count = 0
            failed_documents = []
            
            for doc in documents:
                doc_id = doc.get("_id")
                if doc_id:
                    result = delete_tool._run(document_id=doc_id)
                    if result.get("success", False):
                        success_count += 1
                    else:
                        failed_count += 1
                        failed_documents.append({
                            "id": doc_id,
                            "error": result.get("error", "Erro desconhecido")
                        })
            
            return {
                "success": failed_count == 0,
                "message": f"Exclusão de documentos do tipo '{document_type}' concluída.",
                "count": count,
                "success_count": success_count,
                "failed_count": failed_count,
                "failed_documents": failed_documents if failed_count > 0 else []
            }
        
        except Exception as e:
            logger.error(f"Erro ao excluir documentos: {str(e)}")
            return {"success": False, "error": str(e)}

# Exportar as ferramentas
__all__ = ['strapiDeleteDocumentTool', 'strapiDeleteAllDocumentsTool']

# Teste do módulo
if __name__ == "__main__":
    # Exemplo de uso para testar o módulo
    print("Testando ferramenta de exclusão do Strapi...")
    
    # Verificar se o token está definido
    if not os.environ.get("strapi_API_TOKEN"):
        print("ATENÇÃO: strapi_API_TOKEN não está definido. As operações falharão.")
        # Para teste, podemos definir um token temporário
        os.environ["strapi_API_TOKEN"] = "seu_token_aqui"
        
    # Para teste, primeiro listar os documentos
    document_type = "post"
    print(f"Listando documentos do tipo '{document_type}'...")
    
    # Testar exclusão em massa
    delete_all_tool = strapiDeleteAllDocumentsTool()
    result = delete_all_tool._run(document_type=document_type, confirm=True)
    print(f"Resultado da exclusão em massa: {json.dumps(result, indent=2)}")