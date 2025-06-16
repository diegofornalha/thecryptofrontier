# 🏗️ Plano de Reorganização de Diretórios

## Estrutura Atual vs Proposta

### Estado Atual (Problemático)
```
/home/strapi/thecryptofrontier/
├── src/                       # Frontend Next.js
├── strapi-v5-fresh/          # Backend Strapi
├── framework_crewai/         # Pipeline de conteúdo
├── claude-flow-diego/        # Agentes e Guardian
├── scripts/                  # Scripts diversos
├── docs/                     # Documentação
├── docker/                   # Arquivos Docker
├── mem0/                     # Serviço de memória
├── logs/                     # Logs do sistema
├── test-browserless.js       # Arquivos soltos na raiz ❌
├── test-puppeteer.js         # Arquivos soltos na raiz ❌
└── [vários docker-compose]   # Múltiplos docker-compose ❌
```

### Estrutura Proposta (Organizada)
```
/home/strapi/thecryptofrontier/
├── apps/                     # Todas as aplicações
│   ├── frontend/            # Next.js (mover de src/)
│   ├── strapi/             # Strapi v5 (mover de strapi-v5-fresh/)
│   └── agents/             # Todos os agentes (consolidar)
│       ├── guardian/       # Guardian system
│       ├── specialists/    # Agentes especialistas
│       └── crewai/        # Pipeline CrewAI
├── infrastructure/          # Configuração e deploy
│   ├── docker/             # Docker compose consolidados ✅
│   ├── scripts/            # Scripts de automação
│   └── config/             # Configurações gerais
├── docs/                    # Documentação ✅
├── data/                    # Dados persistentes
│   ├── logs/               # Logs centralizados
│   ├── memory/             # Dados do Mem0
│   └── uploads/            # Uploads do Strapi
└── .env.example            # Template de variáveis
```

## Ações de Migração

### Fase 1: Criar Nova Estrutura
```bash
mkdir -p apps/{frontend,strapi,agents/{guardian,specialists,crewai}}
mkdir -p infrastructure/{scripts,config}
mkdir -p data/{logs,memory,uploads}
```

### Fase 2: Mover Aplicações
1. **Frontend**: `src/` → `apps/frontend/`
2. **Strapi**: `strapi-v5-fresh/` → `apps/strapi/`
3. **Guardian**: `claude-flow-diego/` → `apps/agents/guardian/`
4. **CrewAI**: `framework_crewai/` → `apps/agents/crewai/`

### Fase 3: Consolidar Scripts
- Mover scripts relevantes para `infrastructure/scripts/`
- Remover scripts obsoletos ou duplicados

### Fase 4: Atualizar Referências
- Docker Compose paths
- Scripts de build/deploy
- Documentação
- CI/CD pipelines

## Benefícios da Nova Estrutura

1. **Clareza**: Separação clara entre apps, infra e dados
2. **Escalabilidade**: Fácil adicionar novas apps ou agentes
3. **Manutenção**: Tudo organizado por função
4. **Deploy**: Simplifica CI/CD e Docker builds
5. **Monorepo**: Estrutura pronta para ferramentas como Nx ou Turborepo

## Script de Migração

```bash
#!/bin/bash
# migration.sh - Execute com cuidado!

# 1. Backup completo
tar -czf backup-before-reorg.tar.gz .

# 2. Criar estrutura
mkdir -p apps/{frontend,strapi,agents/{guardian,specialists,crewai}}
mkdir -p infrastructure/{scripts,config}
mkdir -p data/{logs,memory,uploads}

# 3. Mover com links simbólicos primeiro (seguro)
ln -s $(pwd)/src apps/frontend
ln -s $(pwd)/strapi-v5-fresh apps/strapi
# ... etc

# 4. Testar que tudo funciona
# 5. Mover de verdade (após validação)
```

## Riscos e Mitigações

### Riscos:
1. Quebrar referências em scripts
2. Docker builds falharem
3. CI/CD parar de funcionar

### Mitigações:
1. Usar links simbólicos primeiro
2. Testar cada mudança
3. Fazer backup completo
4. Migrar incrementalmente

## Checklist de Validação

- [ ] Todos os docker-compose funcionam
- [ ] Scripts encontram arquivos corretos
- [ ] Frontend builda sem erros
- [ ] Strapi inicia normalmente
- [ ] Agentes se comunicam
- [ ] Logs são gravados corretamente
- [ ] Documentação atualizada

## Ordem de Execução Recomendada

1. **Preparação** (10 min)
   - Backup completo
   - Parar todos os serviços
   
2. **Migração Estrutural** (30 min)
   - Criar diretórios
   - Mover arquivos
   - Atualizar paths
   
3. **Validação** (20 min)
   - Testar cada serviço
   - Verificar comunicação
   - Confirmar logs
   
4. **Cleanup** (10 min)
   - Remover diretórios vazios
   - Deletar links temporários
   - Commit das mudanças

**Tempo Total Estimado**: 1-2 horas com testes