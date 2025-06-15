#!/bin/bash
# Fix Mem0 permissions
# Script para corrigir permissões do diretório de memória do Mem0

echo "🔧 Corrigindo permissões do Mem0..."

# Criar diretório se não existir
MEM0_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/memory"
if [ ! -d "$MEM0_DIR" ]; then
    echo "📁 Criando diretório: $MEM0_DIR"
    mkdir -p "$MEM0_DIR"
fi

# Ajustar permissões
echo "🔐 Ajustando permissões..."
chmod 777 "$MEM0_DIR"

# Verificar se o container está rodando
if docker ps | grep -q mem0-local; then
    echo "🔄 Reiniciando container mem0-local..."
    docker restart mem0-local
    
    # Aguardar o container reiniciar
    sleep 5
    
    # Verificar saúde do container
    if docker ps | grep -q mem0-local; then
        echo "✅ Container mem0-local reiniciado com sucesso!"
        
        # Testar conexão
        if curl -s http://localhost:3002/health > /dev/null 2>&1; then
            echo "✅ Mem0 está respondendo corretamente!"
        else
            echo "⚠️  Mem0 iniciou mas não está respondendo ainda. Aguarde alguns segundos..."
        fi
    else
        echo "❌ Erro ao reiniciar container mem0-local"
        exit 1
    fi
else
    echo "⚠️  Container mem0-local não está rodando"
    echo "💡 Execute: docker-compose -f /home/strapi/thecryptofrontier/claude-flow-diego/docker-compose.mem0-local.yml up -d"
fi

echo "✅ Processo concluído!"