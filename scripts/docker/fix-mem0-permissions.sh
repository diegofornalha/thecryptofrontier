#!/bin/bash
# Script para corrigir permissões do Mem0 Bridge

echo "🔧 Corrigindo permissões do Mem0 Bridge..."

# Verificar se o container está rodando
if ! docker ps | grep -q mem0-bridge; then
    echo "❌ Container mem0-bridge não está rodando!"
    exit 1
fi

# Obter o ID do usuário nodejs dentro do container (geralmente 1001)
NODEJS_UID=$(docker exec mem0-bridge id -u nodejs 2>/dev/null || echo "1001")
echo "📝 UID do usuário nodejs no container: $NODEJS_UID"

# Criar diretório de memória se não existir
MEMORY_DIR="/home/strapi/thecryptofrontier/claude-flow-diego/memory"
if [ ! -d "$MEMORY_DIR" ]; then
    echo "📁 Criando diretório de memória..."
    mkdir -p "$MEMORY_DIR"
fi

# Ajustar permissões do diretório para o usuário nodejs
echo "🔐 Ajustando permissões do diretório..."
sudo chown -R $NODEJS_UID:$NODEJS_UID "$MEMORY_DIR"
sudo chmod -R 755 "$MEMORY_DIR"

# Se o arquivo memory-store.json existir, ajustar suas permissões também
MEMORY_FILE="$MEMORY_DIR/memory-store.json"
if [ -f "$MEMORY_FILE" ]; then
    echo "📄 Ajustando permissões do arquivo memory-store.json..."
    sudo chown $NODEJS_UID:$NODEJS_UID "$MEMORY_FILE"
    sudo chmod 644 "$MEMORY_FILE"
else
    echo "📄 Criando arquivo memory-store.json vazio..."
    echo '{"memories":[],"metadata":{}}' | sudo tee "$MEMORY_FILE" > /dev/null
    sudo chown $NODEJS_UID:$NODEJS_UID "$MEMORY_FILE"
    sudo chmod 644 "$MEMORY_FILE"
fi

# Reiniciar o container para aplicar as mudanças
echo "🔄 Reiniciando container mem0-bridge..."
docker restart mem0-bridge

# Aguardar alguns segundos
sleep 5

# Verificar se o container está saudável
if docker ps | grep -q "mem0-bridge.*healthy"; then
    echo "✅ Container mem0-bridge está saudável!"
    
    # Testar se está funcionando
    echo "🧪 Testando funcionamento..."
    RESPONSE=$(curl -s http://localhost:3002/health 2>/dev/null)
    
    if [ ! -z "$RESPONSE" ]; then
        echo "✅ Mem0 Bridge está respondendo!"
        echo "📊 Resposta: $RESPONSE"
    else
        echo "⚠️  Mem0 Bridge não está respondendo na porta 3002"
        echo "📋 Verificando logs..."
        docker logs mem0-bridge --tail 10
    fi
else
    echo "❌ Container mem0-bridge não está saudável!"
    echo "📋 Logs do container:"
    docker logs mem0-bridge --tail 20
fi

echo ""
echo "🎯 Dica: Para monitorar o Mem0 em tempo real, use:"
echo "   docker logs -f mem0-bridge"
echo ""
echo "📝 Nota: Se o problema persistir, verifique se o usuário nodejs (uid $NODEJS_UID)"
echo "   tem as permissões corretas dentro do container."