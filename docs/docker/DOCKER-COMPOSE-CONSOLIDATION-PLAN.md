# 📋 Plano de Consolidação Docker Compose

## Status Atual

Temos 16 arquivos docker-compose.yml distribuídos no projeto:

### 🏢 Arquivos Principais (em /infrastructure/docker/)
1. `docker-compose.yml` - Frontend + Backend principal
2. `docker-compose.dev.yml` - Override para desenvolvimento
3. `docker-compose.services.yml` - Serviços auxiliares
4. `docker-compose.agents.yml` - Todos os agentes

### 📁 Arquivos Legados (na raiz)
5. `docker-compose.frontend.yml` - Redundante com infrastructure/
6. `docker-compose.guardian.yml` - Redundante com agents
7. `docker-compose.guardian-mcp.yml` - Redundante com agents
8. `docker-compose.mem0.yml` - Redundante com services
9. `docker-compose.cleanup.yml` - Pode ser integrado
10. `docker-compose.puppeteer.yml` - Pode ser integrado

### 🔧 Arquivos de Submódulos
11. `claude-flow-diego/docker-compose.agents-optimized.yml`
12. `claude-flow-diego/docker-compose.mem0-local.yml`
13. `claude-flow-diego/docker-compose.unified-log.yml`
14. `claude-flow-diego/claude-diego-flow/dashboard/docker-compose.yml`
15. `framework_crewai/blog_crew/docker-compose.yml`
16. `framework_crewai/blog_crew/docker-compose.webhook.yml`

## Estratégia de Consolidação

### Fase 1: Manter Estrutura de 4 Arquivos Principais
```
/infrastructure/docker/
├── docker-compose.yml          # Frontend + Backend
├── docker-compose.dev.yml      # Overrides de desenvolvimento
├── docker-compose.services.yml # Serviços auxiliares (DB, Redis, etc)
└── docker-compose.agents.yml   # Todos os agentes e Guardian
```

### Fase 2: Migração Gradual
1. **Arquivos na raiz**: Criar scripts de migração que apontam para `/infrastructure/docker/`
2. **Submódulos**: Manter por enquanto, pois são projetos semi-independentes
3. **Documentar**: Cada arquivo deve ter um comentário explicando seu propósito

### Fase 3: Scripts de Conveniência
Criar scripts em `/scripts/docker/` para facilitar o uso:
- `start-all.sh` - Inicia todos os serviços
- `start-dev.sh` - Modo desenvolvimento
- `start-prod.sh` - Modo produção
- `start-agents.sh` - Apenas agentes

## Benefícios

1. **Organização Clara**: 4 arquivos com propósitos bem definidos
2. **Manutenção Simplificada**: Atualizações em um único lugar
3. **Flexibilidade**: Ainda permite executar partes específicas
4. **Compatibilidade**: Scripts mantêm compatibilidade com comandos antigos

## Implementação

### Passo 1: Backup
```bash
cp -r /home/strapi/thecryptofrontier/*.yml /home/strapi/thecryptofrontier/backup/
```

### Passo 2: Criar Scripts de Redirecionamento
Para cada arquivo legado, criar um script que redireciona para o novo:
```bash
#!/bin/bash
# docker-compose.frontend.yml -> infrastructure/docker/docker-compose.yml
docker-compose -f infrastructure/docker/docker-compose.yml $@
```

### Passo 3: Testar Gradualmente
1. Testar um serviço por vez
2. Verificar logs e conectividade
3. Validar com equipe antes de remover arquivos antigos

## Cronograma

- **Semana 1**: Scripts de redirecionamento e testes
- **Semana 2**: Migração dos serviços principais
- **Semana 3**: Migração dos agentes
- **Semana 4**: Limpeza e documentação final

## Notas Importantes

⚠️ **NÃO remover arquivos imediatamente** - Manter por 30 dias após migração
⚠️ **Comunicar equipe** antes de qualquer mudança
⚠️ **Testar em ambiente de desenvolvimento** primeiro

---

**Status**: Planejado
**Última atualização**: 2025-06-16