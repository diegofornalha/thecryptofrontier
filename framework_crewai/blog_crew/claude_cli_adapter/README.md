# Claude CLI Adapter - CrewAI Blog MVP

Sistema híbrido Python/TypeScript para automação de blog usando Claude CLI (custo zero).

## 🏗️ Arquitetura

```
Python (Orquestração)          TypeScript (Processamento)
├── base_agent.py             ├── base-agent.ts
├── researcher_agent.py  →    ├── researcher.ts
├── writer_agent.py      →    ├── writer.ts
├── editor_agent.py      →    ├── editor.ts
└── publisher_agent.py        └── [processa diretamente]
```

## 📁 Estrutura de Diretórios

```
claude_cli_adapter/
├── agents/              # Agentes Python que criam tarefas
├── mcp_agents/         # Agentes TypeScript que processam tarefas
│   ├── src/
│   │   ├── agents/     # Implementações dos agentes
│   │   ├── tools/      # Ferramentas (RSS, Web Scraper)
│   │   └── types/      # TypeScript types
│   └── dist/           # Código compilado
├── tasks/              # Arquivos .md de tarefas
├── outputs/            # Resultados JSON dos agentes
└── workflows/          # Pipelines de automação
```

## 🚀 Como Funciona

1. **Python cria tarefas**: Agentes Python geram arquivos `.md` em `/tasks`
2. **TypeScript processa**: Agentes MCP leem tarefas e executam
3. **Outputs salvos**: Resultados em JSON em `/outputs`
4. **Pipeline coordena**: Python orquestra todo o fluxo

## 📦 Instalação

### Python
```bash
cd framework_crewai/blog_crew/claude_cli_adapter
pip install -r requirements.txt
```

### TypeScript
```bash
cd mcp_agents
npm install
npm run build
```

## 🎯 Uso

### 1. Executar Pipeline Completo (Python)
```bash
python workflows/blog_pipeline.py
```

### 2. Executar Agentes Individualmente

**Python (criar tarefa):**
```bash
python agents/researcher_agent.py
```

**TypeScript (processar tarefa):**
```bash
cd mcp_agents
npm run researcher  # ou writer, editor
```

### 3. Modo Automático vs Manual

**Manual (padrão):**
- Python cria tarefa
- Você processa no Claude CLI
- Python aguarda você confirmar

**Automático:**
- Define `auto_mode=True` no pipeline
- TypeScript agents processam automaticamente

## 🔄 Fluxo de Trabalho

```mermaid
graph LR
    A[Tópico] --> B[Researcher Python]
    B --> C[researcher_*.md]
    C --> D[Researcher TS]
    D --> E[research_output.json]
    E --> F[Writer Python]
    F --> G[writer_*.md]
    G --> H[Writer TS]
    H --> I[writer_output.json]
    I --> J[Editor Python]
    J --> K[editor_*.md]
    K --> L[Editor TS]
    L --> M[editor_output.json]
    M --> N[Publisher Python]
    N --> O[Strapi API]
```

## 🛠️ Configuração

### Variáveis de Ambiente
```bash
# .env
STRAPI_URL=http://localhost:1338
STRAPI_API_TOKEN=seu_token_aqui
```

### Strapi Content-Type
Certifique-se de ter um content-type `posts` com:
- title (String)
- slug (String)
- content (Rich Text)
- excerpt (Text)
- seo (Component)
- tags (Relation)
- categories (Relation)

## 🤖 Agentes

### Researcher
- Busca informações em feeds RSS
- Analisa tendências do mercado
- Gera contexto para artigos

### Writer
- Cria artigos completos
- Otimiza para SEO
- Estrutura conteúdo

### Editor
- Revisa e melhora textos
- Corrige erros
- Sugere otimizações

### Publisher
- Publica diretamente no Strapi
- Não cria tarefas intermediárias
- Gerencia publicação

## 📝 Exemplo de Tarefa

```markdown
# Tarefa: researcher_20241216_143022

## Pesquisar sobre: DeFi 2.0

### Instruções:
1. Buscar informações atualizadas sobre DeFi 2.0
2. Analisar tendências e oportunidades
3. Identificar riscos e desafios
4. Compilar fontes confiáveis

### Contexto:
```json
{
  "topic": "DeFi 2.0",
  "depth": "comprehensive"
}
```
```

## 🔍 Monitoramento

### Ver tarefas pendentes:
```bash
ls tasks/
```

### Ver outputs processados:
```bash
ls outputs/
```

### Logs de publicação:
```bash
cat outputs/publication_log.json
```

## 🚨 Troubleshooting

### Erro: "No pending tasks"
- Verifique se há arquivos `.md` em `/tasks`
- Execute primeiro o agente Python correspondente

### Erro: "Failed to parse JSON"
- Verifique formato do contexto na tarefa
- JSON deve estar entre ` ```json ` e ` ``` `

### TypeScript não compila
- Execute `npm install` primeiro
- Verifique versão do Node (>= 16)

## 🎉 MVP Completo!

Este sistema permite:
- ✅ Custo zero usando Claude CLI
- ✅ Automação completa de blog
- ✅ Integração com Strapi v5
- ✅ Arquitetura híbrida Python/TypeScript
- ✅ Extensível e customizável