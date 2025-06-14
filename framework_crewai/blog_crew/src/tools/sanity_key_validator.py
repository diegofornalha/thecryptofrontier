"""
Validador de chaves _key para Strapi CMS
Garante que todos os arrays tenham as chaves obrigatórias antes de enviar ao Strapi
"""

import uuid
import logging
from typing import Dict, List, Any, Optional
from crewai.tools import tool

logger = logging.getLogger("strapi_key_validator")

def generate_key():
    """Gera uma chave aleatória de 8 caracteres"""
    return str(uuid.uuid4())[:8]

def ensure_array_keys(data: Any, path: str = "") -> bool:
    """
    Garante que todos os arrays tenham chaves _key
    Retorna True se alguma modificação foi feita
    """
    modified = False
    
    if isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, dict):
                # Adicionar _key se não existe
                if '_key' not in item:
                    item['_key'] = generate_key()
                    modified = True
                    logger.info(f"Adicionada _key em {path}[{i}]")
                
                # Recursivamente verificar objetos aninhados
                if ensure_array_keys(item, f"{path}[{i}]"):
                    modified = True
                    
    elif isinstance(data, dict):
        for key, value in data.items():
            if ensure_array_keys(value, f"{path}.{key}" if path else key):
                modified = True
    
    return modified

def validate_portable_text(content: List[Dict]) -> List[Dict]:
    """
    Valida e corrige conteúdo em formato Portable Text
    Garante que todos os blocos e spans tenham _key
    """
    if not isinstance(content, list):
        return content
    
    validated_content = []
    
    for i, block in enumerate(content):
        if not isinstance(block, dict):
            continue
            
        # Garantir que o bloco tenha _key
        if '_key' not in block:
            block['_key'] = generate_key()
            logger.info(f"Adicionada _key ao bloco {i}")
        
        # Garantir que o bloco tenha _type
        if '_type' not in block and 'type' not in block:
            block['_type'] = 'block'
        
        # Processar children (spans)
        if 'children' in block and isinstance(block['children'], list):
            for j, child in enumerate(block['children']):
                if isinstance(child, dict):
                    if '_key' not in child:
                        child['_key'] = generate_key()
                        logger.info(f"Adicionada _key ao span {j} do bloco {i}")
                    
                    if '_type' not in child and 'type' not in child:
                        child['_type'] = 'span'
        
        # Processar markDefs
        if 'markDefs' in block and isinstance(block['markDefs'], list):
            for j, mark in enumerate(block['markDefs']):
                if isinstance(mark, dict) and '_key' not in mark:
                    mark['_key'] = generate_key()
                    logger.info(f"Adicionada _key ao markDef {j} do bloco {i}")
        
        validated_content.append(block)
    
    return validated_content

def validate_post_data(post_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Valida dados de um post antes de enviar ao Strapi
    Garante que todos os arrays tenham _key
    """
    logger.info("Validando dados do post para Strapi...")
    
    # Fazer uma cópia para não modificar o original
    validated_data = post_data.copy()
    
    # Validar conteúdo (Portable Text)
    if 'content' in validated_data and isinstance(validated_data['content'], list):
        validated_data['content'] = validate_portable_text(validated_data['content'])
    
    # Validar arrays de referências
    reference_arrays = ['categories', 'tags', 'relatedPosts']
    for array_name in reference_arrays:
        if array_name in validated_data and isinstance(validated_data[array_name], list):
            for item in validated_data[array_name]:
                if isinstance(item, dict) and '_key' not in item:
                    item['_key'] = generate_key()
                    logger.info(f"Adicionada _key em {array_name}")
    
    # Validar outros arrays recursivamente
    ensure_array_keys(validated_data)
    
    logger.info("Validação concluída")
    return validated_data

@tool
def validate_strapi_data(data=None, **kwargs):
    """
    Ferramenta para validar dados antes de enviar ao Strapi CMS.
    Garante que todos os arrays tenham as chaves _key obrigatórias.
    
    Args:
        data: Dados a serem validados (dict ou JSON string)
        
    Returns:
        Dict com dados validados e relatório de modificações
    """
    try:
        # Processar parâmetros
        if data is None:
            if "post_data" in kwargs:
                data = kwargs["post_data"]
            elif "content" in kwargs:
                data = kwargs["content"]
            elif len(kwargs) > 0:
                # Pegar o primeiro parâmetro que pareça ser dados
                for k, v in kwargs.items():
                    if isinstance(v, (dict, list)):
                        data = v
                        break
        
        if data is None:
            return {"success": False, "error": "Nenhum dado fornecido para validação"}
        
        # Converter string JSON se necessário
        if isinstance(data, str):
            import json
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                return {"success": False, "error": "Dados não são JSON válido"}
        
        if not isinstance(data, dict):
            return {"success": False, "error": "Dados devem ser um objeto"}
        
        # Validar os dados
        original_keys_count = count_keys(data)
        validated_data = validate_post_data(data)
        final_keys_count = count_keys(validated_data)
        
        added_keys = final_keys_count - original_keys_count
        
        return {
            "success": True,
            "data": validated_data,
            "keysAdded": added_keys,
            "message": f"Validação concluída. {added_keys} chaves _key adicionadas."
        }
        
    except Exception as e:
        logger.error(f"Erro na validação: {str(e)}")
        return {"success": False, "error": str(e)}

def count_keys(data: Any) -> int:
    """Conta o número total de chaves _key em uma estrutura de dados"""
    count = 0
    
    if isinstance(data, dict):
        if '_key' in data:
            count += 1
        for value in data.values():
            count += count_keys(value)
    elif isinstance(data, list):
        for item in data:
            count += count_keys(item)
    
    return count

@tool 
def ensure_post_keys(post_data):
    """
    Garante que um post tenha todas as chaves _key necessárias.
    Versão simplificada focada especificamente em posts.
    """
    try:
        if not isinstance(post_data, dict):
            return {"success": False, "error": "post_data deve ser um dicionário"}
        
        # Fazer cópia para não modificar original
        validated_post = post_data.copy()
        changes_made = 0
        
        # Validar conteúdo
        if 'content' in validated_post and isinstance(validated_post['content'], list):
            for i, block in enumerate(validated_post['content']):
                if isinstance(block, dict):
                    # Garantir _key no bloco
                    if '_key' not in block:
                        block['_key'] = generate_key()
                        changes_made += 1
                    
                    # Garantir _key nos children
                    if 'children' in block and isinstance(block['children'], list):
                        for j, child in enumerate(block['children']):
                            if isinstance(child, dict) and '_key' not in child:
                                child['_key'] = generate_key()
                                changes_made += 1
                    
                    # Garantir _key nos markDefs
                    if 'markDefs' in block and isinstance(block['markDefs'], list):
                        for mark in block['markDefs']:
                            if isinstance(mark, dict) and '_key' not in mark:
                                mark['_key'] = generate_key()
                                changes_made += 1
        
        return {
            "success": True,
            "post": validated_post,
            "changesCount": changes_made,
            "message": f"Post validado. {changes_made} chaves adicionadas."
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Teste da validação
    test_post = {
        "_type": "post",
        "title": "Teste",
        "content": [
            {
                "_type": "block",
                "style": "normal",
                "children": [
                    {
                        "_type": "span",
                        "text": "Teste sem _key"
                    }
                ]
            }
        ]
    }
    
    result = validate_strapi_data(test_post)
    print(f"Resultado: {result}") 