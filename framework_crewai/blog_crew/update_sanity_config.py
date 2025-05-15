#!/usr/bin/env python3
"""
Script para atualizar a configuração do Sanity com o novo token
Cria um arquivo .env.sanity que pode ser carregado pelo sistema
"""

import os
import logging
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("sanity_config")

# Token do Sanity com permissões corretas
SANITY_TOKEN = "ske0xiMqVVtwL0uu1WniYKnUzLdPCGIAEZlWS6odd3c5d5pKPEUHZIbM6UIcSXF2qdHgE7vRwcFhv6Cq9KCtbNuhbTkLWYTZrSVOGcqnweIbjVuS0TasGjhiMQsbYeOWCB4HZE8rEXDXx73pXjZHdiBVKZh2GWwnT2TxRA7hR2ZB2VAuWvj6"

def update_env_file():
    """Atualiza o arquivo .env com o token do Sanity"""
    env_file = Path(".env")
    
    # Se o arquivo .env existe, lê o conteúdo atual
    if env_file.exists():
        with open(env_file, "r") as f:
            conteudo = f.read()
        
        # Verifica se já existe a variável SANITY_API_TOKEN
        if "SANITY_API_TOKEN=" in conteudo:
            # Substitui o valor da variável
            linhas = conteudo.splitlines()
            novo_conteudo = []
            
            for linha in linhas:
                if linha.startswith("SANITY_API_TOKEN="):
                    novo_conteudo.append(f"SANITY_API_TOKEN={SANITY_TOKEN}")
                else:
                    novo_conteudo.append(linha)
            
            # Escreve o novo conteúdo no arquivo
            with open(env_file, "w") as f:
                f.write("\n".join(novo_conteudo))
            
            logger.info(f"Token atualizado no arquivo {env_file}")
        else:
            # Adiciona a variável no final do arquivo
            with open(env_file, "a") as f:
                f.write(f"\nSANITY_API_TOKEN={SANITY_TOKEN}\n")
            
            logger.info(f"Token adicionado no arquivo {env_file}")
    else:
        # Cria o arquivo .env
        with open(env_file, "w") as f:
            f.write(f"SANITY_API_TOKEN={SANITY_TOKEN}\n")
        
        logger.info(f"Arquivo {env_file} criado com o token")

def update_config_file():
    """Atualiza o arquivo config/sanity_config.py com o token do Sanity"""
    config_file = Path("config/sanity_config.py")
    
    if not config_file.exists():
        logger.warning(f"Arquivo {config_file} não encontrado")
        return
    
    # Lê o conteúdo atual
    with open(config_file, "r") as f:
        conteudo = f.read()
    
    # Adiciona linha para definir o token padrão
    linhas = conteudo.splitlines()
    novo_conteudo = []
    token_adicionado = False
    
    for linha in linhas:
        novo_conteudo.append(linha)
        
        # Adiciona o token após a definição de SANITY_CONFIG
        if "SANITY_CONFIG = {" in linha and not token_adicionado:
            # Avança até o final da definição de SANITY_CONFIG
            i = linhas.index(linha)
            while i < len(linhas) and "}" not in linhas[i]:
                i += 1
            
            if i < len(linhas):
                # Adiciona o token após a definição de SANITY_CONFIG
                indice = novo_conteudo.index(linhas[i]) + 1
                novo_conteudo.insert(indice, "\n# Token padrão do Sanity com permissões corretas")
                novo_conteudo.insert(indice + 1, f"DEFAULT_SANITY_TOKEN = os.environ.get('SANITY_API_TOKEN', '{SANITY_TOKEN}')")
                token_adicionado = True
    
    # Escreve o novo conteúdo no arquivo
    with open(config_file, "w") as f:
        f.write("\n".join(novo_conteudo))
    
    logger.info(f"Token adicionado no arquivo {config_file}")

if __name__ == "__main__":
    logger.info("Atualizando configuração do Sanity...")
    
    # Atualiza o arquivo .env
    update_env_file()
    
    # Atualiza o arquivo config/sanity_config.py
    update_config_file()
    
    logger.info("Configuração do Sanity atualizada com sucesso!") 