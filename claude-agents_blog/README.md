# Claude Agents - Sistema de Agentes para Blog

Este diretório contém os agentes principais do sistema de blog automatizado.

## 📁 Estrutura

### Agentes Principais

- **`rss_blog_agent.py`** - Agente principal que monitora feeds RSS e cria posts automaticamente
- **`multilingual_config.py`** - Configuração multi-idioma para publicação em PT, EN e ES

### Agentes de Escrita Especializados

- **`brazilian_crypto_writer.py`** - Especialista em conteúdo crypto para mercado brasileiro
- **`us_crypto_writer.py`** - Especialista em conteúdo crypto para mercado americano  
- **`spanish_crypto_writer.py`** - Especialista em conteúdo crypto para mercado hispanohablante

### Outros Agentes

- **`translator_agent.py`** - Agente de tradução offline (sem APIs externas)
- **`claude_cli_blog_agent.py`** - Integração com Claude CLI
- **`simple_blog_agent.py`** - Agente básico para testes
- **`mcp_blog_server.py`** - Servidor MCP para blog

### Scripts de Automação

- **`rss_automation.sh`** - Script para executar o RSS agent periodicamente
- **`automated_workflow.sh`** - Workflow completo de automação

## 🚀 Uso

### RSS Agent com Multi-idioma

```bash
# Executar manualmente
python rss_blog_agent.py

# Ou usar o script de automação
./rss_automation.sh
```

### Configuração Multi-idioma

O sistema suporta 3 estratégias de publicação:

1. **`single_language`** - Publica apenas em português
2. **`translate_all`** - Traduz e publica em todos os idiomas
3. **`adapt_content`** - Adapta conteúdo para cada mercado (recomendado)

## 📝 Configuração

Variáveis de ambiente necessárias:

```bash
STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=seu_token_aqui
```

## 🔧 Manutenção

- Os crypto writers são independentes e não requerem APIs externas
- O RSS agent mantém um arquivo `processed_rss_posts.json` para evitar duplicatas
- Logs são gerados para debug e monitoramento

## ⚠️ Importante

Esta é a implementação principal e única dos agentes de escrita crypto. 
Qualquer duplicação em outros diretórios deve ser removida.