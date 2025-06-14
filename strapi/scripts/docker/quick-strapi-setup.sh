#!/bin/bash

# Quick Strapi Setup - Guardian Script
# Parte do claude-diego-flow

echo "🚀 Quick Strapi Setup - Guardian automatizando o processo"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretório base
STRAPI_DIR="/home/strapi/thecryptofrontier/strapi"
SCRIPTS_DIR="$STRAPI_DIR/scripts"

# 1. Verificar se Strapi está rodando
echo -e "\n${YELLOW}1. Verificando status do Strapi...${NC}"
if docker ps | grep -q strapi-cms; then
    echo -e "${GREEN}✓ Strapi está rodando${NC}"
else
    echo -e "${RED}✗ Strapi não está rodando. Iniciando...${NC}"
    cd $STRAPI_DIR
    docker compose up -d
    echo "Aguardando 30 segundos para inicialização..."
    sleep 30
fi

# 2. Mostrar URL do admin
echo -e "\n${YELLOW}2. URLs importantes:${NC}"
echo "   Admin Panel: https://ale-blog.agentesintegrados.com/admin"
echo "   API Base: https://ale-blog.agentesintegrados.com/api"

# 3. Instruções para criar admin
echo -e "\n${YELLOW}3. Criar usuário administrador:${NC}"
echo "   1. Acesse: https://ale-blog.agentesintegrados.com/admin"
echo "   2. Preencha o formulário de registro"
echo "   3. Salve as credenciais com segurança"
echo "   4. Após criar o admin, gere um token de API em:"
echo "      Settings > API Tokens > Create new API Token"
echo "      - Name: 'Migration Token'"
echo "      - Type: 'Full Access'"
echo "      - Duration: 'Unlimited'"

# 4. Preparar scripts
echo -e "\n${YELLOW}4. Scripts prontos para uso:${NC}"
echo "   Após obter o token, execute:"
echo ""
echo "   export STRAPI_ADMIN_TOKEN='seu-token-aqui'"
echo "   export STRAPI_URL='https://ale-blog.agentesintegrados.com'"
echo ""
echo "   # Ativar APIs públicas:"
echo "   cd $SCRIPTS_DIR"
echo "   node setup-public-permissions.js"
echo ""
echo "   # Popular dados de exemplo:"
echo "   node migrate-sample-data.js"
echo ""
echo "   # Ou migrar do Strapi:"
echo "   node migrate-from-strapi.js"

# 5. Criar arquivo de ambiente
echo -e "\n${YELLOW}5. Criando arquivo de configuração...${NC}"
cat > $SCRIPTS_DIR/.env.example << EOF
# Strapi Configuration
STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_ADMIN_TOKEN=seu-token-aqui

# Strapi Configuration (para migração)
strapi_PROJECT_ID=seu-project-id
strapi_DATASET=production
strapi_TOKEN=seu-strapi-token
EOF

echo -e "${GREEN}✓ Arquivo .env.example criado em $SCRIPTS_DIR${NC}"

# 6. Status final
echo -e "\n${GREEN}=================================================="
echo "✅ Setup inicial completo!"
echo "==================================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Criar admin manualmente no navegador"
echo "2. Gerar token de API"
echo "3. Executar scripts de configuração"
echo ""
echo "Guardian está pronto para ajudar! 🛡️"