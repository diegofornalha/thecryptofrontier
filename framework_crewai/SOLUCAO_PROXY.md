# Solução de Proxy Reverso para o Framework CrewAI

## Contexto do Problema

O projeto framework_crewai passou por uma reestruturação de código, migrando funcionalidades legadas para uma nova estrutura modular. Durante esse processo, encontramos desafios relacionados à acessibilidade da aplicação Streamlit através de um proxy reverso.

## Abordagem de Solução

### 1. Migração do Código

Primeiro, migramos todo o código relevante da pasta `backup_legado_aprendizados` para a nova estrutura modular em `src/blog_automacao/tools/`:

- **redis_tools.py**: Gerenciamento de Redis (cache, filas)
- **process_queue.py**: Processamento de artigos

Também atualizamos todas as importações nos arquivos relevantes para apontar para os novos módulos.

### 2. Tentativa Inicial com Proxy Reverso Caddy

Implementamos um proxy reverso usando Caddy para disponibilizar a aplicação através de uma única porta (8080):

```
# Caddyfile inicial
:8080 {
    # Configurações básicas
    tls internal

    # Servir arquivos estáticos 
    root * /app/static
    file_server

    # Rota para o serviço Streamlit
    handle_path /streamlit/* {
        reverse_proxy streamlit:8501
    }
    
    # Redirecionar / para /streamlit
    handle / {
        redir /streamlit permanent
    }
    
    # Log de requisições
    log {
        output stdout
        format console
    }
}
```

Essa abordagem apresentou dificuldades com o carregamento de recursos estáticos do Streamlit e a manipulação de caminhos.

### 3. Problemas Encontrados

Os principais problemas identificados foram:

1. **Recursos estáticos não encontrados**: O Streamlit procurava seus arquivos CSS, JavaScript e fontes em caminhos específicos.
2. **Manipulação de caminhos**: A complexidade na configuração do proxy para lidar corretamente com os caminhos.
3. **Conflitos de TLS**: Erros na configuração TLS no Caddy.

### 4. Solução Final

Adotamos uma abordagem dupla:

#### 4.1. Simplificação do Proxy Reverso

Modificamos o Caddyfile para uma configuração minimalista, encaminhando diretamente todas as requisições:

```
# Caddyfile final
:8080 {
    # Configuração simples sem TLS
    
    # Log de requisições
    log {
        output stdout
        format console
    }

    # Redirecionar qualquer rota para o Streamlit
    handle /* {
        reverse_proxy streamlit:8501
    }
}
```

#### 4.2. Exposição Direta do Streamlit

Simultaneamente, expusemos diretamente a porta do Streamlit no `docker-compose.yml`:

```yaml
# Serviço Streamlit no docker-compose.yml
streamlit:
  # Outras configurações...
  ports:
    - "8501:8501"  # Expor diretamente para acesso externo
```

Isso garante que o aplicativo possa ser acessado de duas formas:
- Via proxy na porta 8080 (http://localhost:8080)
- Diretamente na porta 8501 (http://localhost:8501)

### 5. Vantagens da Solução

Esta abordagem dupla oferece:

1. **Flexibilidade**: Usuários podem escolher o método de acesso mais conveniente
2. **Redundância**: Se um método falhar, o outro permanece disponível
3. **Simplicidade**: Configuração simplificada do proxy minimiza pontos de falha
4. **Transparência**: Ambos os métodos fornecem a mesma experiência de usuário

## Lições Aprendidas

1. **Proxies para Streamlit**: Configurações proxy para Streamlit precisam considerar como ele carrega recursos estáticos.
2. **Depuração via logs**: A análise detalhada dos logs do Caddy foi crucial para identificar os problemas.
3. **Abordagens redundantes**: Em ambientes de desenvolvimento, fornecer múltiplos caminhos de acesso aumenta a resiliência.
4. **Simplicidade triunfa**: Uma configuração de proxy mais simples e direta geralmente é mais robusta.

## Próximos Passos

Para ambientes de produção, recomenda-se:

1. Refinar a configuração do Caddy para incluir TLS adequado
2. Implementar autenticação básica no proxy
3. Considerar a utilização de nomes de domínio em vez de portas
4. Melhorar a manipulação de caches e tempos de resposta

---

Esta solução garantiu que o framework permanecesse acessível enquanto mantinha a flexibilidade para refinamentos futuros da arquitetura de proxy.