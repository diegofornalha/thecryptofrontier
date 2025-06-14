sempre reponda em pt br
# CLAUDE.md - Diretrizes de Organização do Projeto

## 📁 Estrutura de Diretórios

Este projeto segue uma organização específica para manter os arquivos bem estruturados. **SEMPRE** siga estas diretrizes ao criar novos arquivos:

### 🏗️ Estrutura Principal

```
/home/strapi/thecryptofrontier/
├── strapi/
│   └── docs/               # Toda documentação do projeto (MOVIDO PARA STRAPI)
├── scripts/                 # Scripts utilitários
│   ├── docker/             # Scripts relacionados ao Docker
│   └── patches/            # Scripts de patches e workarounds
├── framework_crewai/        # Framework CrewAI para automação de blog
├── claude-flow-diego/       # Projeto de agentes
│   └── claude-diego-flow/
│       └── src/
│           └── agents/     # Guardian e outros agentes
├── src/                     # Código fonte principal do Next.js
├── public/                  # Assets públicos
└── [arquivos de config]     # package.json, docker-compose.yml, etc (raiz)
```

### 📝 Onde Colocar Cada Tipo de Arquivo

#### Documentação
**Localização:** `/strapi/docs/` (ATUALIZADO - movido para dentro de strapi)
- Arquivos `.md` de documentação
- Instruções de deploy
- Guias de configuração
- Documentação técnica

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

#### Framework CrewAI
**Localização:** `/framework_crewai/blog_crew/`
- Scripts Python para automação
- Ferramentas de sincronização
- Agentes e tarefas

### ⚠️ Arquivos que DEVEM Permanecer na Raiz

Estes arquivos são padrão e devem ficar na raiz:
- `package.json`
- `docker-compose.yml`
- `docker-compose.production.yml`
- `Dockerfile.nextjs`
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
- [ ] É documentação? → `/strapi/docs/`
- [ ] É um script Docker? → `/scripts/docker/`
- [ ] É um patch/workaround? → `/scripts/patches/`
- [ ] É um script utilitário? → `/scripts/`
- [ ] É parte do CrewAI? → `/framework_crewai/blog_crew/`
- [ ] É código do Next.js? → `/src/`
- [ ] É um arquivo de configuração padrão? → Raiz

### 🤖 Agentes do Projeto

#### Guardian
**Localização:** `/claude-flow-diego/claude-diego-flow/src/agents/`
- Agente principal do sistema
- Responsável por coordenação e supervisão
