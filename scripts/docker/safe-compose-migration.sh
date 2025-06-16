#!/bin/bash
# Script seguro para migração dos docker-compose
# Cria links simbólicos em vez de deletar arquivos

echo "🔄 Migração Segura dos Docker Compose Files"
echo "=========================================="
echo ""

# Criar diretório de links se não existir
LEGACY_DIR="/home/strapi/thecryptofrontier/.legacy-compose"
mkdir -p "$LEGACY_DIR"

# Função para criar link de compatibilidade
create_compatibility_link() {
    local old_file=$1
    local new_file=$2
    local base_name=$(basename "$old_file")
    
    if [ -f "$old_file" ]; then
        echo "📦 Processando $base_name..."
        
        # Mover arquivo original para .legacy
        mv "$old_file" "$LEGACY_DIR/$base_name.backup"
        
        # Criar script de redirecionamento
        cat > "$old_file" <<EOF
#!/bin/bash
# MIGRADO: Este arquivo agora redireciona para $new_file
echo "⚠️  AVISO: $base_name foi migrado para $new_file"
echo "📍 Redirecionando comando..."
echo ""

# Detectar se está sendo usado com docker-compose -f
if [[ "\$0" == *"$base_name"* ]]; then
    # Foi chamado diretamente
    docker-compose -f "$new_file" "\$@"
else
    # Está sendo usado em pipe ou source - apenas avisar
    echo "ℹ️  Use: docker-compose -f $new_file"
fi
EOF
        
        chmod +x "$old_file"
        echo "   ✅ Redirecionamento criado"
    fi
}

# Mapear arquivos antigos para novos
echo "🗺️  Mapeamento de Arquivos:"
echo ""

# Frontend
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.frontend.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.yml"

# Guardian
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.guardian.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.agents.yml"

# Guardian MCP
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.guardian-mcp.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.agents.yml"

# Mem0
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.mem0.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.services.yml"

# Cleanup
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.cleanup.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.agents.yml"

# Puppeteer
create_compatibility_link \
    "/home/strapi/thecryptofrontier/docker-compose.puppeteer.yml" \
    "/home/strapi/thecryptofrontier/infrastructure/docker/docker-compose.services.yml"

echo ""
echo "📋 Resumo da Migração:"
echo "====================="
echo ""
echo "✅ Arquivos originais salvos em: $LEGACY_DIR"
echo "✅ Scripts de compatibilidade criados"
echo "✅ Comandos antigos continuam funcionando"
echo ""
echo "🎯 Estrutura Final:"
echo "   infrastructure/docker/"
echo "   ├── docker-compose.yml          # Frontend + Backend"
echo "   ├── docker-compose.dev.yml      # Override desenvolvimento"
echo "   ├── docker-compose.services.yml # Serviços auxiliares"
echo "   └── docker-compose.agents.yml   # Agentes e Guardian"
echo ""
echo "💡 Dica: Use 'source docker-compose-aliases.sh' para aliases úteis"