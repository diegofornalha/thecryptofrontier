sempre reponda em pt br
# CLAUDE.md - Diretrizes de Organização do Projeto

## 📁 Estrutura de Diretórios

Este projeto segue uma organização específica para manter os arquivos bem estruturados. **SEMPRE** siga estas diretrizes ao criar novos arquivos:

### 🏗️ Estrutura Principal

```
/home/strapi/thecryptofrontier/
├── docs/                    # Toda documentação do projeto
├── strapi/                  # Aplicação Strapi
├── scripts/                 # Scripts utilitários
│   ├── docker/             # Scripts relacionados ao Docker
│   └── patches/            # Scripts de patches e workarounds
├── agentes-python/          # Agentes em Python
├── claude-agents_blog-ts/   # Agentes em TypeScript para blog
├── claude-flow-diego-cli/   # Agentes de linha de comando
│   └── claude-diego-flow/
│       └── src/
│           └── agents/     # Guardian e outros agentes
├── src/                     # Código fonte principal do Next.js
├── public/                  # Assets públicos
└── [arquivos de config]     # package.json, docker-compose.yml, etc (raiz)
```

### 📝 Onde Colocar Cada Tipo de Arquivo

#### Documentação
**Localização:** `/docs/` (na raiz do projeto)
- Arquivos `.md` de documentação
- Instruções de deploy
- Guias de configuração
- Documentação técnica
- **EXCEÇÃO:** CLAUDE.md permanece na raiz

#### Scripts Docker
**Localização:** `/scripts/docker/`
- Scripts de inicialização (`docker-start.sh`)
- Scripts de monitoramento (`monitor-container.sh`)
- Scripts de produção (`start-production.sh`, `update-production.sh`)
- Scripts de deploy (`deploy-studio.sh`)

#### Scripts de Patches
**Localização:** `/scripts/patches/`
- Patches de dependências (`patch-nanoid.js`)
- Scripts de correção (`apply-preload-patch.js`)

#### Scripts Gerais
**Localização:** `/scripts/`
- Geradores de código (`generate_python_schemas.ts`)
- Scripts de migração
- Utilitários diversos

#### Agentes Python
**Localização:** `/agentes-python/`
- Agentes Python para automação
- Scripts de processamento
- Ferramentas auxiliares

#### Agentes TypeScript para Blog
**Localização:** `/claude-agents_blog-ts/`
- Agentes TypeScript especializados em blog
- Integração com sistema de publicação
- Processamento de conteúdo

#### Agentes CLI
**Localização:** `/claude-flow-diego-cli/`
- Agentes de linha de comando
- Guardian Orchestrator
- Ferramentas MCP

### ⚠️ Arquivos que DEVEM Permanecer na Raiz

Estes arquivos são padrão e devem ficar na raiz:
- `package.json`
- `docker-compose.yml`
- `docker-compose.production.yml`
- `Dockerfile.frontend.production`
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `postcss.config.js`
- `.env` files
- `netlify.toml`

### 🚫 O que NÃO Fazer

1. **Nunca** coloque scripts soltos na raiz
2. **Nunca** misture documentação com código
3. **Nunca** crie arquivos temporários na raiz
4. **Sempre** use as pastas apropriadas

### 🔄 Atualizando Referências

Quando mover arquivos, lembre-se de atualizar:
1. Scripts que referenciam os arquivos movidos
2. `package.json` scripts
3. Dockerfiles
4. Documentação

### 📋 Checklist para Novos Arquivos

Antes de criar um arquivo, pergunte-se:
- [ ] É documentação? → `/docs/`
- [ ] É um script Docker? → `/scripts/docker/`
- [ ] É um patch/workaround? → `/scripts/patches/`
- [ ] É um script utilitário? → `/scripts/`
- [ ] É um agente Python? → `/agentes-python/`
- [ ] É um agente TypeScript para blog? → `/claude-agents_blog-ts/`
- [ ] É um agente CLI? → `/claude-flow-diego-cli/`
- [ ] É código do Next.js? → `/src/`
- [ ] É um arquivo de configuração padrão? → Raiz

### 🤖 Agentes do Projeto

O projeto possui 3 grupos de agentes organizados por tecnologia e propósito:

#### 1. Agentes Python (`/agentes-python/`)
- Agentes de automação e processamento
- Integração com APIs externas
- Scripts de análise de dados

#### 2. Agentes TypeScript para Blog (`/claude-agents_blog-ts/`)
- Agentes especializados em conteúdo de blog
- Processamento e publicação de artigos
- Integração com CMS

#### 3. Agentes CLI (`/claude-flow-diego-cli/`)
- **Guardian Orchestrator**: Agente principal de coordenação
  - Localização: `/claude-flow-diego-cli/claude-diego-flow/src/agents/guardian-orchestrator-mcp.ts`
  - Responsável por coordenação e supervisão de outros agentes
  - Integração com MCP (Model Context Protocol)
  - Sistema de memória e PDCA
- Agentes especialistas (Docker, NextJS, Strapi, etc.)
- Ferramentas de linha de comando
