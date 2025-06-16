#!/bin/bash
# Script para migrar comandos docker-compose antigos para nova estrutura
# Mantém compatibilidade com comandos existentes

set -e

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 <arquivo-compose> [comandos docker-compose]"
    echo ""
    echo "Arquivos migrados:"
    echo "  docker-compose.frontend.yml     → infrastructure/docker/docker-compose.yml"
    echo "  docker-compose.guardian.yml     → infrastructure/docker/docker-compose.agents.yml"
    echo "  docker-compose.guardian-mcp.yml → infrastructure/docker/docker-compose.agents.yml"
    echo "  docker-compose.mem0.yml         → infrastructure/docker/docker-compose.services.yml"
    echo "  docker-compose.cleanup.yml      → infrastructure/docker/docker-compose.agents.yml"
    echo "  docker-compose.puppeteer.yml    → infrastructure/docker/docker-compose.services.yml"
    echo ""
    echo "Exemplo: $0 docker-compose.frontend.yml up -d"
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Mapear arquivo antigo para novo
map_compose_file() {
    local old_file="$1"
    
    case "$old_file" in
        "docker-compose.frontend.yml")
            echo "infrastructure/docker/docker-compose.yml"
            ;;
        "docker-compose.guardian.yml" | "docker-compose.guardian-mcp.yml")
            echo "infrastructure/docker/docker-compose.agents.yml"
            ;;
        "docker-compose.mem0.yml" | "docker-compose.puppeteer.yml")
            echo "infrastructure/docker/docker-compose.services.yml"
            ;;
        "docker-compose.cleanup.yml")
            echo "infrastructure/docker/docker-compose.agents.yml"
            ;;
        *)
            echo "$old_file"  # Manter o arquivo se não for mapeado
            ;;
    esac
}

# Processar argumentos
COMPOSE_FILE="$1"
shift  # Remove primeiro argumento

# Verificar se é um arquivo que precisa ser migrado
if [[ "$COMPOSE_FILE" == docker-compose.*.yml ]]; then
    NEW_FILE=$(map_compose_file "$COMPOSE_FILE")
    
    if [ "$NEW_FILE" != "$COMPOSE_FILE" ]; then
        echo "⚠️  AVISO: $COMPOSE_FILE foi migrado para $NEW_FILE"
        echo "📍 Redirecionando comando..."
        echo ""
    fi
    
    # Executar comando com novo arquivo
    docker-compose -f "$NEW_FILE" "$@"
else
    # Se não for um arquivo compose, executar normalmente
    docker-compose "$COMPOSE_FILE" "$@"
fi