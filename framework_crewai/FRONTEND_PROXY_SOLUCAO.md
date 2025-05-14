# Solução para Proxy Reverso com Portal Unificado

## Problema

O projeto precisava de uma configuração de proxy reverso para permitir o acesso ao frontend NextJS e ao Streamlit através do mesmo ponto de entrada (porta 8080), com uma página inicial unificada:

- Página Inicial: `http://localhost:8080/` 
- Streamlit: `http://localhost:8080/streamlit`
- NextJS: `http://localhost:8080/frontend`

Desafios encontrados:
- Acesso do container Docker ao NextJS rodando no host
- Configuração correta dos redirecionamentos no Caddy
- Criação de página inicial integradora
- Gerenciamento do ciclo de vida das aplicações
- Resolução de problemas com o projectId do Sanity

## Solução Implementada

### 1. Arquitetura da Solução

- **Página Inicial**: Arquivo HTML estático servido pelo Caddy na rota raiz
- **NextJS**: Roda diretamente no host (fora do Docker) na porta 3001, acessível via `/frontend`
- **Streamlit**: Roda em container Docker na porta 8501, acessível via `/streamlit`
- **Caddy**: Proxy reverso em container Docker na porta 8080, gerencia todos os redirecionamentos
- **Redis**: Serviço de cache/fila em container Docker

### 2. Configuração do Caddy

O arquivo `Caddyfile` foi configurado para:

- Servir uma página inicial estática na rota raiz (`/`)
- Redirecionar `/streamlit/*` para o serviço Streamlit no Docker
- Redirecionar `/frontend/*` para o NextJS no host
- Configurar rotas para recursos estáticos e APIs do NextJS (`/_next/*` e `/api/*`)
- Usar o IP correto da interface de rede para acessar o host (172.17.0.1)

### 3. Página Inicial Integradora

Criamos uma página HTML estática (`/static/index.html`) que:
- Apresenta o nome e a descrição do projeto
- Oferece links diretos para as duas plataformas (Streamlit e NextJS)
- Possui estilização moderna e responsiva

### 4. Configuração do Docker Compose

O arquivo `docker-compose.yml` foi ajustado para:

- Adicionar `extra_hosts` no serviço Caddy para permitir acesso ao host
- Montar o diretório `/static` para servir arquivos estáticos
- Manter serviços essenciais (Streamlit, Redis, Caddy)
- Remover o container NextJS (agora rodando diretamente no host)

### 5. Scripts de Gerenciamento

Foram criados três scripts para facilitar o gerenciamento:

- **restart_with_frontend.sh**: Reinicia todo o ambiente
- **start_nextjs_frontend.sh**: Inicia apenas o frontend NextJS
- **stop_all.sh**: Para todo o ambiente

### 6. Correções no Sanity

- Corrigimos problemas no cliente Sanity definindo um projectId válido fixo
- Atualizamos as configurações no `.env.local` para garantir compatibilidade

## Como Usar

1. Para iniciar o ambiente completo:
   ```bash
   ./restart_with_frontend.sh
   ```

2. Para iniciar apenas o frontend (se os containers já estiverem rodando):
   ```bash
   ./start_nextjs_frontend.sh
   ```

3. Para parar todo o ambiente:
   ```bash
   ./stop_all.sh
   ```

## Acesso aos Serviços

- **Página Inicial**: http://localhost:8080
- **Streamlit (direto)**: http://localhost:8501
- **Streamlit (via proxy)**: http://localhost:8080/streamlit
- **NextJS (direto)**: http://localhost:3001
- **NextJS (via proxy)**: http://localhost:8080/frontend

## Verificação de Logs

- Docker: `docker-compose logs -f`
- NextJS: `tail -f nextjs.log`
- Caddy: `docker logs caddy-crewai-proxy`

## Considerações Técnicas

1. **Acesso ao Host**: Utilizamos o IP 172.17.0.1 para permitir que containers Docker acessem serviços rodando no host. Configurado no Caddyfile.

2. **Porta 3001**: O NextJS foi configurado para rodar na porta 3001, pois a porta 3000 estava em uso.

3. **Variáveis de Ambiente**: As configurações necessárias são automaticamente injetadas pelos scripts:
   - `NEXT_PUBLIC_PROXY_ENABLED=true`
   - `NEXT_PUBLIC_ASSETS_PREFIX=/frontend`
   - `PROXY_BASE_PATH=/frontend`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID=brby2yrg`
   - `NEXT_PUBLIC_SANITY_DATASET=production`

4. **Cliente Sanity**: Foi necessário corrigir o arquivo `client.ts` para utilizar um projectId válido, evitando problemas de formatação.

5. **Arquivos Estáticos**: Os arquivos HTML e CSS estáticos são servidos diretamente pelo Caddy da pasta `/app/static`.

## Próximos Passos

Para ambientes de produção, considerar:
- Configurar TLS/HTTPS no Caddy
- Implementar autenticação para os diferentes serviços
- Monitoramento e alerta para cada componente
- Dockerização completa do NextJS
- Melhorar a página inicial com mais informações e métricas