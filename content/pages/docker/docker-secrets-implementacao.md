---
title: Implementação de Docker Secrets
type: PageLayout
slug: /docker/docker-secrets-implementacao
layout: PageLayout
sections:
  - type: GenericSection
    title: Implementação de Docker Secrets
    subtitle: Guia completo para implementação de Docker Secrets
    text: |
      ## O que foi feito

      1. **Modificação do docker-compose.yml**
         - Adicionada seção de `secrets` nos serviços:
           - `caddy-proxy`
           - `tenant1-frontier`
           - `tenant2-service`
         - Adicionada definição dos secrets no final do arquivo

      2. **Criação dos arquivos de secrets**
         - Diretório `secrets/` criado para armazenar os arquivos
         - Arquivos criados:
           - `caddy_api_token.txt`
           - `frontier_api_key.txt`
           - `db_password.txt`
           - `tenant2_api_key.txt`

      3. **Script de inicialização**
         - Criado script `use-docker-secrets.sh` para inicializar o Docker Swarm
         - Script registra os secrets no Swarm
         - Script também demonstra como acessar os secrets nos contêineres

      4. **Deploy dos serviços**
         - Serviços implantados usando o comando `docker stack deploy`
         - Todos os serviços estão rodando com acesso aos secrets

      ## LEMBRETE IMPORTANTE

      ### Pré-requisitos
      - **Docker Swarm**: Para usar Docker Secrets, é NECESSÁRIO ter o Docker Swarm inicializado
        ```bash
        docker swarm init --advertise-addr 127.0.0.1
        ```

      ### Como acessar os secrets nos contêineres
      - Os secrets são montados como arquivos em `/run/secrets/`
      - Exemplo: Para ler o token do Caddy
        ```bash
        cat /run/secrets/caddy_api_token
        ```

      - Em aplicações Node.js:
        ```javascript
        const fs = require('fs');
        const caddyApiToken = fs.readFileSync('/run/secrets/caddy_api_token', 'utf8');
        ```

      ### Atualização de secrets
      Para atualizar um secret existente:
      1. Remover o secret antigo
         ```bash
         docker secret rm nome_do_secret
         ```
      2. Criar um novo com o mesmo nome
         ```bash
         docker secret create nome_do_secret arquivo_com_novo_valor.txt
         ```
      3. Atualizar os serviços
         ```bash
         docker stack deploy -c docker-compose.yml cryptofrontier
         ```

      ### Persistência
      - Os secrets são persistentes no Docker Swarm
      - Não é necessário criar novamente após reiniciar o host
      - Cada secret só precisa ser criado UMA VEZ (não por usuário)
    styles:
      self:
        height: auto
        width: wide
        margin: ["mt-0", "mb-0", "ml-0", "mr-0"]
        padding: ["pt-16", "pb-16", "pl-8", "pr-8"]
        justifyContent: center
        borderRadius: none
        borderWidth: 0
        borderStyle: none
        borderColor: border-neutral
---