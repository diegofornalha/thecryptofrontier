# -*- coding: utf-8 -*-
# Gerado automaticamente - NÃO EDITE MANUALMENTE
# Este arquivo torna o diretório 'generated_sanity_schemas' um pacote Python
# e importa/reexporta todos os schemas gerados.

import importlib
import pkgutil

__all__ = []
loaded_schemas = {}

# Importa dinamicamente todos os módulos _schema.py neste diretório
for _, module_name, _ in pkgutil.iter_modules(__path__):
    if module_name.endswith('_schema'):
        try:
            module = importlib.import_module(f'.{module_name}', __name__)
            if hasattr(module, 'schema') and isinstance(module.schema, dict) and 'name' in module.schema:
                schema_name = module.schema['name']
                # Define uma variável com o nome do schema (ex: post = module.schema)
                globals()[schema_name] = module.schema 
                # Adiciona o nome ao __all__ para import *
                __all__.append(schema_name)
                # Armazena no dicionário para acesso fácil
                loaded_schemas[schema_name] = module.schema
            else:
               print(f"Aviso: Módulo {module_name} não tem um dicionário 'schema' com 'name' válido.")
        except Exception as e:
            print(f"Erro ao importar o schema {module_name}: {e}")

# Você pode acessar os schemas individualmente (ex: from generated_sanity_schemas import post)
# Ou acessar todos através do dicionário loaded_schemas (ex: from generated_sanity_schemas import loaded_schemas)
