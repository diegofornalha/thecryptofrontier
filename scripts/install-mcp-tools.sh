#!/bin/bash
# Script de instalação automatizada do DiegoTools MCP para Linux
# Projeto: The Crypto Frontier

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando instalação do DiegoTools MCP...${NC}"
echo -e "${YELLOW}📍 Projeto: The Crypto Frontier${NC}"
echo ""

# Diretório base
MCP_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools"

# Verificar se o diretório existe
if [ ! -d "$MCP_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $MCP_DIR não encontrado!${NC}"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Erro: Node.js não está instalado!${NC}"
    echo "Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Erro: Node.js versão $NODE_VERSION detectada. Versão 18+ é necessária!${NC}"
    exit 1
fi

# Verificar se o Claude CLI está instalado
if ! command -v claude &> /dev/null; then
    echo -e "${YELLOW}⚠️  Claude CLI não encontrado. Instalando...${NC}"
    npm install -g @anthropic-ai/claude-code
fi

# Navegar para o diretório
cd "$MCP_DIR" || exit 1

# Limpar builds anteriores
echo -e "${GREEN}🧹 Limpando builds anteriores...${NC}"
rm -rf build node_modules

# Instalar dependências
echo -e "${GREEN}📦 Instalando dependências...${NC}"
npm install

# Compilar projeto
echo -e "${GREEN}🔨 Compilando projeto...${NC}"
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Erro: Build falhou!${NC}"
    exit 1
fi

# Tornar run.sh executável
chmod +x run.sh

# Remover instalação anterior
echo -e "${GREEN}🗑️  Removendo instalação anterior...${NC}"
claude mcp remove DiegoTools -s user 2>/dev/null

# Solicitar tokens se não estiverem definidos
echo ""
echo -e "${YELLOW}🔑 Configuração de Tokens${NC}"
echo "Você precisará fornecer os seguintes tokens:"
echo "1. GitHub Token (https://github.com/settings/tokens)"
echo "2. Mem0 API Key (https://app.mem0.ai)"
echo ""

# Verificar se os tokens estão em variáveis de ambiente
if [ -z "$GITHUB_TOKEN" ]; then
    read -p "Digite seu GitHub Token (ou pressione Enter para adicionar depois): " github_token
else
    github_token=$GITHUB_TOKEN
    echo "✓ GitHub Token detectado das variáveis de ambiente"
fi

if [ -z "$MEM0_API_KEY" ]; then
    read -p "Digite sua Mem0 API Key (ou pressione Enter para adicionar depois): " mem0_key
else
    mem0_key=$MEM0_API_KEY
    echo "✓ Mem0 API Key detectada das variáveis de ambiente"
fi

# Construir comando de instalação
echo ""
echo -e "${GREEN}➕ Comando para adicionar DiegoTools ao Claude:${NC}"
echo ""

install_cmd="claude mcp add DiegoTools $MCP_DIR/run.sh"

if [ ! -z "$github_token" ]; then
    install_cmd="$install_cmd --env GITHUB_TOKEN=$github_token"
else
    install_cmd="$install_cmd --env GITHUB_TOKEN=seu_token_aqui"
fi

if [ ! -z "$mem0_key" ]; then
    install_cmd="$install_cmd --env MEM0_API_KEY=$mem0_key"
else
    install_cmd="$install_cmd --env MEM0_API_KEY=sua_chave_aqui"
fi

install_cmd="$install_cmd --env MEM0_BASE_URL=https://api.mem0.ai -s user"

# Se tokens foram fornecidos, executar automaticamente
if [ ! -z "$github_token" ] && [ ! -z "$mem0_key" ]; then
    echo -e "${GREEN}🚀 Executando instalação...${NC}"
    eval $install_cmd
    
    # Verificar instalação
    echo ""
    echo -e "${GREEN}🔍 Verificando instalação...${NC}"
    claude mcp list | grep DiegoTools
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ DiegoTools instalado com sucesso!${NC}"
        echo ""
        echo -e "${YELLOW}📝 Teste a instalação com:${NC}"
        echo "cd $MCP_DIR"
        echo "npx ts-node src/cli.ts agent create gitManager"
    else
        echo -e "${RED}❌ Erro na instalação. Verifique os logs acima.${NC}"
    fi
else
    # Mostrar comando para o usuário executar manualmente
    echo "$install_cmd"
    echo ""
    echo -e "${YELLOW}⚠️  Copie e execute o comando acima depois de substituir os tokens!${NC}"
    echo ""
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
fi

echo ""
echo -e "${GREEN}📚 Documentação completa em:${NC}"
echo "/home/strapi/thecryptofrontier/strapi/docs/mcp-diego-tools-linux-install.md"