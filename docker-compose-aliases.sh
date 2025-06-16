#!/bin/bash
# Script de aliases para manter compatibilidade com estrutura antiga
# Este arquivo pode ser sourced no .bashrc ou executado quando necessário

# Frontend
alias dc-frontend='docker-compose -f infrastructure/docker/docker-compose.yml'

# Guardian
alias dc-guardian='docker-compose -f infrastructure/docker/docker-compose.agents.yml'

# Mem0
alias dc-mem0='docker-compose -f infrastructure/docker/docker-compose.services.yml'

# Todos os serviços
alias dc-all='docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.services.yml -f infrastructure/docker/docker-compose.agents.yml'

# Desenvolvimento
alias dc-dev='docker-compose -f infrastructure/docker/docker-compose.yml -f infrastructure/docker/docker-compose.dev.yml'

echo "✅ Aliases docker-compose carregados!"
echo ""
echo "Comandos disponíveis:"
echo "  dc-frontend - Frontend e Backend principal"
echo "  dc-guardian - Todos os agentes e Guardian"
echo "  dc-mem0     - Serviços auxiliares (DB, Mem0, etc)"
echo "  dc-all      - Todos os serviços"
echo "  dc-dev      - Modo desenvolvimento"