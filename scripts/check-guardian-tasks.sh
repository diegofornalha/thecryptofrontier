#!/bin/bash

# Script para verificar tarefas do Guardian via terminal

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3004"

# Verificar se Guardian está rodando
check_guardian() {
    curl -s "$API_URL/health" > /dev/null 2>&1
    return $?
}

# Opções de comando
case "$1" in
    "pending"|"")
        if ! check_guardian; then
            echo -e "${RED}❌ Guardian API não está respondendo em $API_URL${NC}"
            exit 1
        fi
        
        # Buscar tarefas pendentes em formato simples
        curl -s "$API_URL/tasks/pending/simple"
        ;;
    
    "json")
        if ! check_guardian; then
            echo -e "${RED}❌ Guardian API não está respondendo em $API_URL${NC}"
            exit 1
        fi
        
        # Formato JSON para processamento
        curl -s "$API_URL/tasks/pending" | jq .
        ;;
    
    "suggestions")
        if ! check_guardian; then
            echo -e "${RED}❌ Guardian API não está respondendo em $API_URL${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}💡 Sugestões:${NC}"
        curl -s "$API_URL/suggestions" | jq -r '.suggestions[]'
        ;;
    
    "resume")
        if ! check_guardian; then
            echo -e "${RED}❌ Guardian API não está respondendo em $API_URL${NC}"
            exit 1
        fi
        
        curl -s "$API_URL/session/resume"
        ;;
    
    "help")
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos:"
        echo "  pending     - Ver tarefas pendentes (formato texto)"
        echo "  json        - Ver tarefas pendentes (formato JSON)"
        echo "  suggestions - Ver sugestões do Guardian"
        echo "  resume      - Ver resumo da sessão"
        echo "  help        - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  $0              # Ver tarefas pendentes"
        echo "  $0 pending      # Mesmo que acima"
        echo "  $0 json | jq    # Ver em JSON formatado"
        ;;
    
    *)
        echo -e "${RED}Comando desconhecido: $1${NC}"
        echo "Use '$0 help' para ver comandos disponíveis"
        exit 1
        ;;
esac