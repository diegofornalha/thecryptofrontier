#!/bin/bash
# Script simplificado para iniciar Claude Flow no Linux

PROJECT_PATH="/home/sanity/thecryptofrontier/claude-flow-diego"
cd "$PROJECT_PATH/claude-diego-flow" || exit 1

echo "🚀 Iniciando Claude Flow Diego no Linux"
echo "======================================"

# Verificar Docker
if ! docker ps &> /dev/null; then
    echo "❌ Docker não está rodando ou você não tem permissões"
    echo "   Execute: sudo systemctl start docker"
    echo "   Ou adicione seu usuário ao grupo docker: sudo usermod -aG docker $USER"
    exit 1
fi

# Menu de opções
echo ""
echo "Escolha o que deseja iniciar:"
echo "1) Guardian Agent (monitoramento e organização)"
echo "2) Auto-commit Agent (commits automáticos)"  
echo "3) Agent Log Service (logging centralizado)"
echo "4) Dashboard Flask (interface web)"
echo "5) Todos os serviços"
echo "6) Parar todos os serviços"
echo ""
read -p "Opção (1-6): " OPTION

case $OPTION in
    1)
        echo "🛡️  Iniciando Guardian..."
        docker run -d \
            --name organization-guardian \
            -v "$PROJECT_PATH:/workspace" \
            -e NODE_ENV=production \
            claude-flow-orchestrator \
            npm run guardian
        echo "✅ Guardian iniciado"
        ;;
    
    2)
        echo "💾 Iniciando Auto-commit..."
        docker run -d \
            --name auto-commit-agent \
            -v "$PROJECT_PATH:/workspace" \
            -v /var/run/docker.sock:/var/run/docker.sock \
            claude-flow-auto-commit
        echo "✅ Auto-commit iniciado"
        ;;
    
    3)
        echo "📝 Iniciando Agent Log..."
        docker run -d \
            --name agent-log-service \
            -p 3001:3001 \
            -v "$PROJECT_PATH/logs:/logs" \
            claude-flow-agent-log
        echo "✅ Agent Log iniciado na porta 3001"
        ;;
    
    4)
        echo "🌐 Iniciando Dashboard..."
        docker run -d \
            --name claude-dashboard \
            -p 5000:5000 \
            -v "$PROJECT_PATH:/app" \
            claude-flow-flask
        echo "✅ Dashboard iniciado em http://localhost:5000"
        ;;
    
    5)
        echo "🚀 Iniciando todos os serviços..."
        
        # Guardian
        docker run -d \
            --name organization-guardian \
            -v "$PROJECT_PATH:/workspace" \
            -e NODE_ENV=production \
            claude-flow-orchestrator \
            npm run guardian
        
        # Auto-commit
        docker run -d \
            --name auto-commit-agent \
            -v "$PROJECT_PATH:/workspace" \
            -v /var/run/docker.sock:/var/run/docker.sock \
            claude-flow-auto-commit
        
        # Agent Log
        docker run -d \
            --name agent-log-service \
            -p 3001:3001 \
            -v "$PROJECT_PATH/logs:/logs" \
            claude-flow-agent-log
        
        # Dashboard
        docker run -d \
            --name claude-dashboard \
            -p 5000:5000 \
            -v "$PROJECT_PATH:/app" \
            claude-flow-flask
        
        echo "✅ Todos os serviços iniciados!"
        echo ""
        echo "📊 Status dos serviços:"
        docker ps --filter "name=organization-guardian" --filter "name=auto-commit-agent" --filter "name=agent-log-service" --filter "name=claude-dashboard" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    
    6)
        echo "🛑 Parando todos os serviços..."
        docker stop organization-guardian auto-commit-agent agent-log-service claude-dashboard 2>/dev/null
        docker rm organization-guardian auto-commit-agent agent-log-service claude-dashboard 2>/dev/null
        echo "✅ Serviços parados"
        ;;
    
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📋 Comandos úteis:"
echo "   docker ps                         # Ver containers rodando"
echo "   docker logs -f <container-name>   # Ver logs em tempo real"
echo "   docker exec -it <container> bash  # Entrar no container"