#!/bin/bash
# Script de deploy do Claude Flow Diego para Debian Linux

echo "🚀 Deploy do Claude Flow Diego para Debian"
echo "=========================================="

# Configurações
PROJECT_PATH="/home/strapi/thecryptofrontier/claude-flow-diego"
PORTAINER_PORT=9992
PORTAINER_HTTPS_PORT=9993

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root ou com sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script precisa ser executado com sudo${NC}" 
   exit 1
fi

echo "📋 Pré-requisitos:"
echo "  - Docker instalado"
echo "  - Git instalado"
echo "  - Node.js 18+ instalado"
echo ""

# 1. Instalar Docker se necessário
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker não encontrado. Instalando...${NC}"
    apt-get update
    apt-get install -y docker.io docker-compose
    systemctl enable docker
    systemctl start docker
    usermod -aG docker $SUDO_USER
    echo -e "${GREEN}✅ Docker instalado${NC}"
else
    echo -e "${GREEN}✅ Docker já instalado${NC}"
fi

# 2. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js não encontrado. Instalando...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js instalado${NC}"
else
    echo -e "${GREEN}✅ Node.js já instalado${NC}"
fi

# 3. Navegar para o projeto
cd "$PROJECT_PATH" || exit 1

# 4. Instalar dependências
echo "📦 Instalando dependências..."
cd claude-diego-flow
npm install

# Instalar dependências do mcp-diego-tools também
cd ../mcp-diego-tools
npm install
cd ..

# 5. Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."
if [ ! -f mcp-diego-tools/.env ]; then
    cat > mcp-diego-tools/.env << EOF
# Configurações do MCP Diego Tools
GITHUB_TOKEN=seu_token_aqui
MEM0_API_KEY=seu_token_aqui
MEM0_BASE_URL=https://api.mem0.ai
EOF
    echo -e "${YELLOW}⚠️  Configure os tokens em mcp-diego-tools/.env${NC}"
fi

# 6. Parar e remover containers antigos
echo "🧹 Limpando containers antigos..."
docker stop portainer 2>/dev/null || true
docker rm portainer 2>/dev/null || true
docker stop auto-commit-claude-flow-diego claude-flow-diego-diego-full organization-guardian agent-log-service 2>/dev/null || true
docker rm auto-commit-claude-flow-diego claude-flow-diego-diego-full organization-guardian agent-log-service 2>/dev/null || true

# 7. Iniciar Portainer
echo "🐳 Iniciando Portainer..."
docker run -d \
  -p ${PORTAINER_PORT}:9000 \
  -p ${PORTAINER_HTTPS_PORT}:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

echo -e "${GREEN}✅ Portainer iniciado em http://localhost:${PORTAINER_PORT}${NC}"

# 8. Construir imagens do projeto
echo "🔨 Construindo imagens Docker..."
cd claude-diego-flow/docker

# Construir cada imagem
for dockerfile in Dockerfile.*; do
    if [ -f "$dockerfile" ]; then
        service_name=$(echo $dockerfile | sed 's/Dockerfile\.//')
        echo "📦 Construindo $service_name..."
        docker build -f "$dockerfile" -t "claude-flow-$service_name" ..
    fi
done

cd ../..

# 9. Criar diretórios necessários
echo "📁 Criando estrutura de diretórios..."
mkdir -p memory/agents memory/sessions
mkdir -p claude-diego-flow/docs
mkdir -p claude-diego-flow/logs

# 10. Ajustar permissões
echo "🔐 Ajustando permissões..."
chown -R $SUDO_USER:$SUDO_USER "$PROJECT_PATH"
chmod +x claude-diego-flow/scripts/*.sh

echo ""
echo "========================================"
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure os tokens em mcp-diego-tools/.env"
echo "2. Acesse o Portainer em http://localhost:9992"
echo "3. Execute os serviços com:"
echo "   cd $PROJECT_PATH/claude-diego-flow"
echo "   ./scripts/start-guardian.sh"
echo ""
echo "📊 Comandos úteis:"
echo "   docker ps                    # Ver containers rodando"
echo "   docker logs <container>      # Ver logs"
echo "   npm run guardian             # Iniciar guardian local"
echo ""