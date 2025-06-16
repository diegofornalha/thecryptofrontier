# Sistema Multi-idioma para RSS

## Solução Implementada

### 1. **Agente Tradutor** (`translator_agent.py`)
- Tradução básica sem APIs externas
- Suporta EN → PT e EN → ES
- Usa dicionários e padrões regex
- Preserva formatação Markdown

### 2. **Configuração Multi-idioma** (`multilingual_config.py`)
- Define idiomas suportados (PT, EN, ES)
- 4 estratégias de publicação:
  - **single_language**: Traduz tudo para PT (padrão)
  - **bilingual**: PT + idioma original
  - **multilingual**: Todos os idiomas
  - **original_only**: Mantém original

### 3. **Agente RSS Atualizado** (`rss_blog_agent.py`)
- Integra tradutor e configuração
- Aplica estratégia escolhida
- Formata slugs por idioma
- Mantém formatação Markdown

## Como Usar

### Importar com Tradução (PT apenas):
```bash
python3 rss_blog_agent.py import 5
```

### Mudar Estratégia:
```python
# No código, inicializar com:
agent = RSSBlogAgent(publishing_strategy='bilingual')
```

### Traduzir Texto Manualmente:
```bash
python3 translator_agent.py translate "cryptocurrency market" en pt
# Saída: criptomoeda mercado
```

## Melhorias Futuras

### 1. **Tradução Avançada**
- Integrar com LibreTranslate (auto-hospedado)
- Usar modelos de IA locais (Ollama)
- Melhorar dicionários de termos

### 2. **Integração Strapi i18n**
- Habilitar plugin Internationalization
- Criar posts em múltiplos locales
- Publicar versões por idioma

### 3. **Detecção Automática**
- Detectar idioma do feed
- Escolher estratégia baseada no conteúdo
- Configuração por feed RSS

## Configuração Atual

- **Idioma padrão**: Português (PT-BR)
- **Estratégia padrão**: single_language (tudo em PT)
- **Tradução**: Básica com dicionários
- **Formatação**: Markdown preservado

## Arquivos do Sistema

```
/home/strapi/thecryptofrontier/claude-agents/
├── rss_blog_agent.py         # Agente RSS principal
├── translator_agent.py       # Agente tradutor
├── multilingual_config.py    # Configuração multi-idioma
└── rss_automation.sh        # Script de automação
```

## Próximos Passos

1. **Melhorar Tradução**
   - Adicionar mais termos crypto
   - Implementar contexto de frases
   - Corrigir gramática

2. **Implementar i18n no Strapi**
   - Habilitar plugin
   - Configurar content-types
   - Criar API multi-locale

3. **Interface de Configuração**
   - Escolher estratégia por feed
   - Configurar idiomas alvo
   - Dashboard de monitoramento