#!/bin/bash

# Script para testar todos os especialistas

echo "🧪 Testando Todos os Especialistas"
echo "=================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Garantir que a rede existe
echo "1. Verificando rede agent-network..."
docker network create agent-network 2>/dev/null || true

# Lista de especialistas para testar
declare -A specialists=(
    ["claude-code-specialist"]="analisar produtividade"
    ["nextjs-specialist"]="verificar estrutura"
    ["strapi-specialist"]="analisar configuração"
    ["cleanup-specialist"]="analisar limpeza"
)

# Limpar containers anteriores
echo -e "\n2. Limpando containers anteriores..."
for specialist in "${!specialists[@]}"; do
    docker rm -f $specialist 2>/dev/null || true
done

# Testar cada especialista
echo -e "\n3. Testando especialistas..."
for specialist in "${!specialists[@]}"; do
    echo -e "\n${YELLOW}Testando $specialist...${NC}"
    
    # Executar teste
    docker run --rm \
        --name ${specialist}-test \
        --network agent-network \
        -v $(pwd)/workspace:/workspace:ro \
        -v $(pwd)/CLAUDE.md:/app/CLAUDE.md:ro \
        claude-flow/$specialist:latest \
        npx tsx src/agents/${specialist}-agent.ts "${specialists[$specialist]}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $specialist funcionando corretamente${NC}"
    else
        echo -e "${RED}✗ Erro ao executar $specialist${NC}"
    fi
done

echo -e "\n${GREEN}✅ Teste concluído!${NC}"
echo "=================================="

# Instruções para produção
echo -e "\nPara executar em modo daemon (background):"
echo "docker run -d --name <specialist-name> --network agent-network \\"
echo "  -v \$(pwd)/workspace:/workspace:ro \\"
echo "  -v \$(pwd)/CLAUDE.md:/app/CLAUDE.md:ro \\"
echo "  --restart unless-stopped \\"
echo "  claude-flow/<specialist-name>:latest \\"
echo "  /bin/sh -c 'while true; do sleep 3600; done'"