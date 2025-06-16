#!/bin/bash

# Script alternativo para configurar webhook no Strapi v5
# Usa diferentes métodos para tentar configurar o webhook

echo "=== Configuração Alternativa de Webhook Strapi v5 ==="
echo "URL do Webhook: https://webhook-crewai.agentesintegrados.com/webhook/strapi"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Carregar variáveis de ambiente
if [ -f "../framework_crewai/blog_crew/.env" ]; then
    export $(cat ../framework_crewai/blog_crew/.env | grep -v '^#' | xargs)
fi

# Função para testar conexão com Strapi
test_strapi_connection() {
    echo -e "${YELLOW}Testando conexão com Strapi...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        "$STRAPI_URL/api/posts")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Strapi está acessível${NC}"
        return 0
    else
        echo -e "${RED}❌ Não foi possível conectar com Strapi (Status: $response)${NC}"
        return 1
    fi
}

# Método 1: Tentar via API REST do Admin
method1_admin_api() {
    echo -e "\n${YELLOW}Método 1: Tentando criar webhook via Admin API...${NC}"
    
    webhook_payload='{
        "name": "CrewAI Integration",
        "url": "https://webhook-crewai.agentesintegrados.com/webhook/strapi",
        "headers": {
            "Authorization": "Bearer crew-ai-webhook-secret-2025",
            "Content-Type": "application/json",
            "X-CrewAI-Version": "1.0"
        },
        "events": [
            "entry.create",
            "entry.update",
            "entry.delete",
            "entry.publish",
            "entry.unpublish",
            "media.create",
            "media.update",
            "media.delete"
        ],
        "enabled": true
    }'
    
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
        "$STRAPI_URL/admin/webhooks" \
        -H "Authorization: Bearer $STRAPI_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$webhook_payload")
    
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ Webhook criado com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}❌ Não foi possível criar via Admin API (Status: $http_code)${NC}"
        return 1
    fi
}

# Método 2: Configuração via arquivo
method2_config_file() {
    echo -e "\n${YELLOW}Método 2: Criando arquivo de configuração para webhook...${NC}"
    
    config_file="/home/strapi/thecryptofrontier/scripts/webhook-config.json"
    
    cat > "$config_file" << 'EOF'
{
    "webhook": {
        "name": "CrewAI Integration",
        "url": "https://webhook-crewai.agentesintegrados.com/webhook/strapi",
        "headers": {
            "Authorization": "Bearer crew-ai-webhook-secret-2025",
            "Content-Type": "application/json",
            "X-CrewAI-Version": "1.0"
        },
        "events": [
            "entry.create",
            "entry.update",
            "entry.delete",
            "entry.publish",
            "entry.unpublish",
            "media.create",
            "media.update",
            "media.delete"
        ],
        "enabled": true
    }
}
EOF
    
    echo -e "${GREEN}✅ Arquivo de configuração criado em: $config_file${NC}"
    return 0
}

# Método 3: Script Node.js para criar webhook
method3_nodejs_script() {
    echo -e "\n${YELLOW}Método 3: Criando script Node.js para configurar webhook...${NC}"
    
    script_file="/home/strapi/thecryptofrontier/scripts/create-webhook.js"
    
    cat > "$script_file" << 'EOF'
const axios = require('axios');
require('dotenv').config({ path: '../framework_crewai/blog_crew/.env' });

async function createWebhook() {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
    
    const webhookData = {
        name: "CrewAI Integration",
        url: "https://webhook-crewai.agentesintegrados.com/webhook/strapi",
        headers: {
            "Authorization": "Bearer crew-ai-webhook-secret-2025",
            "Content-Type": "application/json",
            "X-CrewAI-Version": "1.0"
        },
        events: [
            "entry.create",
            "entry.update",
            "entry.delete",
            "entry.publish",
            "entry.unpublish",
            "media.create",
            "media.update",
            "media.delete"
        ],
        enabled: true
    };
    
    try {
        const response = await axios.post(
            `${STRAPI_URL}/admin/webhooks`,
            webhookData,
            {
                headers: {
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Webhook criado com sucesso!');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Erro ao criar webhook:', error.response?.data || error.message);
    }
}

createWebhook();
EOF
    
    echo -e "${GREEN}✅ Script Node.js criado em: $script_file${NC}"
    echo "   Para executar: cd /home/strapi/thecryptofrontier && node scripts/create-webhook.js"
    return 0
}

# Função principal
main() {
    # Testar conexão
    if ! test_strapi_connection; then
        echo -e "${RED}Abortando: Strapi não está acessível${NC}"
        exit 1
    fi
    
    # Tentar método 1
    if method1_admin_api; then
        echo -e "\n${GREEN}✅ Webhook configurado com sucesso!${NC}"
        exit 0
    fi
    
    # Se método 1 falhou, criar arquivos auxiliares
    method2_config_file
    method3_nodejs_script
    
    # Instruções manuais
    echo -e "\n${YELLOW}📝 Configuração Manual:${NC}"
    echo "   Como a API não funcionou, você pode:"
    echo ""
    echo "   1. Usar o painel admin do Strapi:"
    echo "      - Acesse: $STRAPI_URL/admin"
    echo "      - Vá em Settings → Webhooks"
    echo "      - Clique em 'Create new webhook'"
    echo "      - Use os dados do arquivo: scripts/webhook-config.json"
    echo ""
    echo "   2. Executar o script Node.js criado:"
    echo "      cd /home/strapi/thecryptofrontier"
    echo "      npm install axios"
    echo "      node scripts/create-webhook.js"
    echo ""
    echo "   3. Usar o container do Strapi diretamente:"
    echo "      docker exec -it strapi-v5 bash"
    echo "      # Dentro do container, criar o webhook via console"
    echo ""
    
    # Testar se o webhook server está rodando
    echo -e "\n${YELLOW}Status do Webhook Server:${NC}"
    if docker ps | grep -q "crewai-webhook-server"; then
        echo -e "${GREEN}✅ Webhook server está rodando${NC}"
        echo "   URL: https://webhook-crewai.agentesintegrados.com"
        echo "   Logs: docker logs -f crewai-webhook-server"
    else
        echo -e "${RED}❌ Webhook server não está rodando${NC}"
        echo "   Iniciar com: cd /home/strapi/thecryptofrontier/scripts/docker && ./start-webhook-server.sh"
    fi
}

# Executar
main