#!/bin/bash
# Script rápido para configurar Portainer usando o sistema existente

echo "🚀 Configuração Rápida - Portainer Subdomínio"
echo "============================================"

# Verificar se o script do sistema existe
if [ -f "/etc/caddy/scripts/criar-subdominio.sh" ]; then
    echo "✅ Script do sistema encontrado"
    
    # Criar o subdomínio docker usando o script do sistema
    sudo /etc/caddy/scripts/criar-subdominio.sh criar docker
    
    # Agora precisamos customizar a configuração para o Portainer
    echo ""
    echo "📝 Customizando configuração para Portainer..."
    
    # Criar configuração específica do Portainer
    sudo tee /tmp/docker-portainer.conf > /dev/null << 'EOF'
docker.agentesintegrados.com {
    # Proxy reverso para Portainer na porta 9992
    reverse_proxy localhost:9992 {
        # Headers essenciais
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
        
        # Suporte WebSocket (importante para Portainer)
        header_up Upgrade {>Upgrade}
        header_up Connection {>Connection}
    }
    
    # Headers de segurança
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        X-XSS-Protection "1; mode=block"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        -Server
    }
    
    # Logs
    log {
        output file /var/log/caddy/docker-portainer.log
        format json
    }
}
EOF
    
    # Substituir a configuração genérica pela específica do Portainer
    sudo sed -i '/^docker\.agentesintegrados\.com {/,/^}/d' /etc/caddy/Caddyfile
    sudo cat /tmp/docker-portainer.conf | sudo tee -a /etc/caddy/Caddyfile > /dev/null
    sudo rm /tmp/docker-portainer.conf
    
    # Recarregar Caddy
    sudo systemctl reload caddy
    
    echo ""
    echo "✅ Configuração concluída!"
    echo ""
    echo "🌐 Portainer estará disponível em:"
    echo "   https://docker.agentesintegrados.com"
    echo ""
    echo "📋 Informações:"
    echo "   - Porta local: 9992"
    echo "   - HTTPS automático via Let's Encrypt"
    echo "   - WebSocket habilitado"
    echo ""
    
else
    echo "❌ Script do sistema não encontrado em /etc/caddy/scripts/"
    echo "Use o script completo: ./configure-portainer-subdomain.sh"
    exit 1
fi

# Verificar se Portainer está rodando
if docker ps | grep -q portainer; then
    echo "✅ Portainer está rodando"
else
    echo "⚠️  Portainer não está rodando. Inicie com:"
    echo "   docker start portainer"
fi

echo ""
echo "🔍 Para verificar:"
echo "   - DNS: dig docker.agentesintegrados.com"
echo "   - Logs: sudo tail -f /var/log/caddy/docker-portainer.log"
echo "   - Status: sudo systemctl status caddy"