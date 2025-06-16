# Arquitetura do Sistema Claude-Agents

## 🎯 Filosofia: Simplicidade > Complexidade

Nossa abordagem prioriza:
- **Código legível** sobre abstrações complexas
- **Manutenibilidade** sobre features desnecessárias
- **Funcionalidade** sobre frameworks pesados

## 🏗️ Estrutura

```
/claude-agents/
├── Agentes Principais
│   ├── rss_blog_agent.py      # Monitor RSS → Strapi
│   └── multilingual_config.py  # Config multi-idioma
│
├── Escritores Especializados
│   ├── brazilian_crypto_writer.py  # Mercado BR
│   ├── us_crypto_writer.py        # Mercado US
│   └── spanish_crypto_writer.py   # Mercado ES
│
├── Utilitários
│   └── utils/
│       └── dedupe.py          # Deduplicação simples
│
└── Automação
    └── rss_automation.sh      # Cron job
```

## 🔄 Fluxo de Trabalho

```
1. RSS Feed → Parser
2. Filtro de Duplicatas
3. Seleção de Estratégia:
   - single_language → PT apenas
   - translate_all → Traduz para todos
   - adapt_content → Adapta culturalmente
4. Processamento por Escritor Especializado
5. Publicação no Strapi
```

## ⚡ Por que NÃO usar CrewAI?

### CrewAI é ótimo para:
- Múltiplos agentes colaborando
- Workflows complexos
- Grandes equipes

### Nosso caso é simples:
- RSS → Processar → Publicar
- 3 idiomas fixos
- Sem necessidade de colaboração entre agentes

### Comparação:
| Aspecto | CrewAI | Nossa Solução |
|---------|---------|---------------|
| Linhas de código | 1000+ | ~300 |
| Dependências | 15+ | 3 |
| Tempo de setup | Horas | Minutos |
| Debug | Complexo | Simples |
| Manutenção | Alta | Baixa |

## 🚀 Vantagens da Nossa Abordagem

1. **Zero Overhead**
   - Sem abstrações desnecessárias
   - Execução direta e rápida

2. **Fácil Debugging**
   - Stack traces simples
   - Código linear e previsível

3. **Flexibilidade**
   - Adicionar novo idioma = novo writer
   - Modificar lógica = editar 1 arquivo

4. **Economia**
   - Sem APIs de tradução
   - Sem dependências pesadas

## 📦 O que Aproveitamos do CrewAI

Extraímos apenas conceitos úteis:
- Sistema de deduplicação (simplificado)
- Estrutura de logs
- Organização de ferramentas

Mas sem:
- Framework complexo
- Decoradores desnecessários
- Sistema de tasks/crews
- Dependências pesadas

## 🔮 Futuro

Se precisarmos escalar:
1. Adicionar mais writers especializados
2. Melhorar sistema de cache
3. Implementar retry com backoff
4. Adicionar mais fontes RSS

Mas sempre mantendo a simplicidade!

## 🔄 Plano B: CrewAI

Mantemos o framework CrewAI como plano B estratégico para cenários futuros que exijam:
- Múltiplos agentes colaborando
- Workflows complexos com decisões
- Integração com múltiplas APIs
- Pipeline configurável

Ver: `/docs/PLANO-B-CREWAI.md` para detalhes de quando e como migrar.