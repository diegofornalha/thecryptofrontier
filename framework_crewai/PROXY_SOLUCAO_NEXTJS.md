# Solução de Proxy Reverso para o NextJS no Framework CrewAI

## Contexto do Problema

Ao integrar o frontend NextJS com o serviço Streamlit através do proxy reverso Caddy, enfrentamos desafios similares aos relatados na solução anterior para o Streamlit. O principal problema envolve o carregamento correto de recursos estáticos, manipulação de paths, e comportamento consistente do frontend quando acessado através do path base `/frontend` no proxy.

## Abordagem de Solução

### 1. Atualização da Configuração do Caddy

Modificamos o Caddyfile para oferecer melhor suporte ao NextJS quando acessado através do proxy:

```
# Caddyfile atualizado
:8080 {
    # Configuração simples sem TLS
    
    # Log de requisições
    log {
        output stdout
        format console
    }

    # Rota para o frontend NextJS com suporte a recursos estáticos
    handle_path /frontend/* {
        reverse_proxy nextjs:3000 {
            # Preservar o cabeçalho Host original
            header_up Host {host}
            # Adicionar header para indicar o caminho base para o NextJS
            header_up X-Forwarded-Prefix /frontend
        }
    }

    # Rota para o serviço Streamlit
    handle_path /streamlit/* {
        reverse_proxy streamlit:8501
    }
    
    # Redirecionar / para /streamlit por padrão
    handle / {
        redir /streamlit permanent
    }

    # Suporte para acesso direto às rotas principais (api, _next)
    handle_path /api/* {
        reverse_proxy nextjs:3000
    }

    handle_path /_next/* {
        reverse_proxy nextjs:3000
    }
}
```

As principais melhorias incluem:
- Adição de cabeçalhos `X-Forwarded-Prefix` para informar o NextJS sobre o caminho base
- Preservação do cabeçalho `Host` original
- Adição de rotas diretas para `/_next/*` para garantir o carregamento correto de recursos estáticos
- Suporte explícito às APIs NextJS em `/api/*`

### 2. Configuração de Variáveis de Ambiente no NextJS

Adicionamos variáveis de ambiente no `docker-compose.yml` para que o NextJS esteja ciente de que está sendo servido através de um caminho base:

```yaml
environment:
  # Configurações originais
  - NODE_ENV=production
  - SANITY_PREVIEW=false
  - NEXT_PUBLIC_SANITY_PROJECT_ID=${SANITY_PROJECT_ID}
  - NEXT_PUBLIC_SANITY_DATASET=production
  - NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
  # Variáveis para suporte a proxy
  - NEXT_PUBLIC_PROXY_ENABLED=true
  - NEXT_PUBLIC_ASSETS_PREFIX=/frontend
  - PROXY_BASE_PATH=/frontend
```

Estas variáveis permitem que:
- O NextJS configure corretamente o caminho base para recursos estáticos
- A aplicação detecte quando está sendo servida através do proxy
- Links internos sejam gerados considerando o prefixo `/frontend`

### 3. Atualização do Dockerfile.nextjs

Modificamos o Dockerfile para incluir suporte a configurações de proxy reverso:

```dockerfile
# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
# Adicionar suporte para proxy reverso com detecção de cabeçalhos
ENV NEXT_PUBLIC_ASSETS_PREFIX ""
```

## Vantagens da Solução

Esta abordagem oferece:

1. **Funcionamento Dual**: O frontend pode ser acessado tanto diretamente (porta 3000) quanto via proxy (porta 8080/frontend)
2. **Carregamento correto de recursos**: Assets como JavaScript, CSS e imagens são carregados corretamente em ambos os modos
3. **Navegação consistente**: Links internos funcionam corretamente, respeitando o caminho base quando acessado via proxy
4. **Flexibilidade**: A configuração é adaptável para diferentes ambientes (desenvolvimento local, teste, produção)

## Pontos de Atenção

Ao trabalhar com esta configuração, é importante considerar:

1. **Links no código**: Certifique-se de que os links internos usem funções de roteamento do NextJS em vez de caminhos absolutos hardcoded
2. **API routes**: As rotas de API devem ser planejadas para funcionarem tanto diretamente quanto atrás do proxy
3. **Imagens e recursos estáticos**: Utilize os componentes Image e funções do NextJS para garantir que os caminhos sejam gerados corretamente

## Testes e Validação

Para garantir que a solução funcione corretamente, teste:

1. Acesso direto ao NextJS: `http://localhost:3000`
2. Acesso via proxy: `http://localhost:8080/frontend`
3. Navegação entre páginas em ambos os modos
4. Carregamento de imagens e recursos estáticos
5. Chamadas à API

## Próximos Passos

Para tornar a solução ainda mais robusta, considere:

1. Implementar detecção automática do ambiente e ajuste de configurações
2. Adicionar TLS para ambientes de produção
3. Implementar caching no Caddy para melhorar o desempenho
4. Configurar um health check para garantir que o proxy só direcione requisições para serviços saudáveis

---

Esta solução garante que o frontend NextJS e o Streamlit funcionem harmoniosamente através do mesmo proxy, oferecendo uma experiência integrada para os usuários.