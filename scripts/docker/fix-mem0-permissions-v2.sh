#!/bin/bash
# Script atualizado para corrigir permissões do Mem0 Bridge com volume Docker

echo "🔧 Corrigindo permissões do Mem0 Bridge (Volume Docker)..."

# Parar o container para fazer as correções
echo "🛑 Parando container mem0-bridge..."
docker stop mem0-bridge

# Aguardar parada completa
sleep 2

# Iniciar container temporário para ajustar permissões do volume
echo "🔐 Ajustando permissões no volume mem0_data..."
docker run --rm -v mem0_data:/data alpine sh -c "
    echo '📁 Ajustando proprietário do diretório /data...'
    chown -R 1001:1001 /data
    echo '📄 Criando arquivo memory-store.json se não existir...'
    if [ ! -f /data/memory-store.json ]; then
        echo '{\"memories\":[],\"metadata\":{}}' > /data/memory-store.json
    fi
    chown 1001:1001 /data/memory-store.json
    chmod 644 /data/memory-store.json
    echo '✅ Permissões ajustadas!'
    ls -la /data/
"

# Reiniciar o container
echo "🔄 Reiniciando container mem0-bridge..."
docker start mem0-bridge

# Aguardar inicialização
sleep 5

# Verificar se está funcionando
echo "🧪 Verificando funcionamento..."

# Verificar se está saudável
if docker ps | grep -q "mem0-bridge.*healthy"; then
    echo "✅ Container mem0-bridge está saudável!"
else
    echo "⚠️  Container mem0-bridge ainda não está saudável"
fi

# Verificar logs sem erros
echo ""
echo "📋 Últimos logs (verificando erros):"
docker logs mem0-bridge --tail 20 | grep -E "(Error|error|EACCES|permission)" || echo "✅ Nenhum erro de permissão encontrado!"

echo ""
echo "📊 Status atual:"
docker exec mem0-bridge ls -la /data/ 2>/dev/null || echo "❌ Não foi possível listar /data"

echo ""
echo "🎯 Para testar o Mem0, você pode usar:"
echo "   curl -X POST http://localhost:3002/memory/store \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"content\":\"Teste de memória\",\"metadata\":{\"test\":true}}'"
echo ""
echo "📝 Para monitorar em tempo real:"
echo "   docker logs -f mem0-bridge"