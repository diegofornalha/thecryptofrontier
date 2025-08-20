# Solução para Docker MCP Desconectado

Este documento descreve os passos para resolver o problema de conexão do `dockerMcp` no Gemini CLI, que se manifestava com a mensagem "Disconnected (0 tools cached)".

## Problema

O Gemini CLI indicava que o `dockerMcp` estava desconectado e sem ferramentas em cache, apesar de haver uma configuração para ele no `settings.json` do projeto.

## Diagnóstico

Após verificar a configuração existente em `.gemini/settings.json`, foi identificado que o Gemini CLI estava configurado para executar um contêiner Docker chamado `docker-mcp:latest`. A causa raiz do problema era a ausência da imagem Docker `docker-mcp:latest` no ambiente local, impedindo o Gemini CLI de iniciar o servidor MCP corretamente.

## Solução

A solução envolveu a construção da imagem Docker `docker-mcp:latest` a partir do `Dockerfile` presente no diretório `docker-mcp` do projeto.

1.  **Navegar até o diretório `docker-mcp`:**
    ```bash
    cd /home/strapi/thecryptofrontier/docker-mcp
    ```

2.  **Construir a imagem Docker:**
    Foi executado o seguinte comando para construir a imagem e marcá-la com a tag `docker-mcp:latest`:
    ```bash
    docker build -t docker-mcp:latest .
    ```

    Este comando lê o `Dockerfile` no diretório atual (`.`) e cria a imagem necessária.

## Verificação

Após a construção bem-sucedida da imagem Docker, o Gemini CLI pôde se conectar ao `dockerMcp`. Para que as mudanças fossem reconhecidas, foi necessário reiniciar o Gemini CLI ou executar o comando `/memory refresh` dentro do CLI.

Com a imagem `docker-mcp:latest` disponível, o servidor MCP pôde ser iniciado e as ferramentas foram carregadas corretamente.