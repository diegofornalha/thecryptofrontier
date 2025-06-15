# 🚀 Instalação do DiegoTools MCP no Linux (The Crypto Frontier)

## Pré-requisitos
- Node.js 18+ instalado
- Claude CLI instalado (`npm install -g @anthropic-ai/claude-code`)
- Git configurado
- Estar no diretório do projeto: `/home/strapi/thecryptofrontier`

## Comando de Instalação Completo

### 1️⃣ Comando Único (Copie e Cole)
```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools && \
rm -rf build node_modules && \
npm install && \
npm run build && \
claude mcp remove DiegoTools -s user 2>/dev/null; \
claude mcp add DiegoTools /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/run.sh \
  -s user
```

### 2️⃣ Passo a Passo (Se preferir)

1. **Navegue até o diretório do MCP:**
   ```bash
   cd /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools
   ```

2. **Limpe builds anteriores:**
   ```bash
   rm -rf build node_modules
   ```

3. **Instale dependências e compile:**
   ```bash
   npm install && npm run build
   ```

4. **Remova instalação anterior (se existir):**
   ```bash
   claude mcp remove DiegoTools -s user
   ```

5. **Adicione o DiegoTools:**
   ```bash
   claude mcp add DiegoTools /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/run.sh \
     -s user
   ```

## 🔍 Verificar Instalação

Após instalar, verifique:
```bash
claude mcp list
```

Deve mostrar:
```
DiegoTools - /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/run.sh
```

## 🐛 Solução de Problemas

### Erro: "command not found: claude"
```bash
npm install -g @anthropic-ai/claude-code
```

### Erro: "build failed"
```bash
# Instale TypeScript globalmente
npm install -g typescript
# Tente novamente
npm run build
```

### Erro de permissão no Linux
```bash
# Use sudo se necessário para instalação global
sudo npm install -g @anthropic-ai/claude-code

# Para o diretório do projeto, certifique-se de ter permissões
sudo chown -R $USER:$USER /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools
```

### Erro: "EACCES: permission denied" ao executar
```bash
# Torne o script executável
chmod +x /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools/run.sh
```

## ✅ Teste Final

Crie um novo terminal e execute:
```bash
cd /home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools
npx ts-node src/cli.ts agent create gitManager
```

Se o agente for criado sem erros de "stack overflow", a instalação foi bem-sucedida!

## 🔧 Script de Instalação Automatizada

Para facilitar futuras instalações, crie este script:

```bash
#!/bin/bash
# Arquivo: /home/strapi/thecryptofrontier/scripts/install-mcp-tools.sh

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando instalação do DiegoTools MCP...${NC}"

# Diretório base
MCP_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/mcp-diego-tools"

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

# Remover instalação anterior
echo -e "${GREEN}🗑️  Removendo instalação anterior...${NC}"
claude mcp remove DiegoTools -s user 2>/dev/null

# Adicionar MCP
echo -e "${GREEN}➕ Adicionando DiegoTools ao Claude...${NC}"
echo -e "${RED}⚠️  Lembre-se de adicionar seus tokens!${NC}"

echo "claude mcp add DiegoTools $MCP_DIR/run.sh \\"
echo "  --env GITHUB_TOKEN=seu_token_aqui \\"
echo "  --env MEM0_API_KEY=sua_chave_aqui \\"
echo "  --env MEM0_BASE_URL=https://api.mem0.ai \\"
echo "  -s user"

echo -e "${GREEN}✅ Instalação preparada! Execute o comando acima com seus tokens.${NC}"
```

Torne o script executável:
```bash
chmod +x /home/strapi/thecryptofrontier/scripts/install-mcp-tools.sh
```

## 🔗 Referências

- [Documentação MCP](https://modelcontextprotocol.com)
- [Changelog do DiegoTools](../claude-flow-diego/mcp-diego-tools/CHANGELOG.md)
- [Código fonte](../claude-flow-diego/mcp-diego-tools/)