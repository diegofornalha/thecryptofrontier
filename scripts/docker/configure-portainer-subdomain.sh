#!/bin/bash
# Script para configurar subdomínio docker.agentesintegrados.com para o Portainer

echo "🌐 Configurando subdomínio para Portainer"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
SUBDOMAIN="docker"
DOMAIN="agentesintegrados.com"
PORTAINER_PORT="9992"
CADDYFILE="/etc/caddy/Caddyfile"

# Verificar se está rodando como root ou sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script precisa ser executado com sudo${NC}" 
   exit 1
fi

# Criar configuração para o Caddyfile
echo "📝 Criando configuração do Caddy..."

# Backup do Caddyfile atual
cp $CADDYFILE "${CADDYFILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Configuração do subdomínio para Portainer
cat > /tmp/portainer-caddy.conf << EOF

# Portainer - Docker Management UI
${SUBDOMAIN}.${DOMAIN} {
    # Proxy reverso para o Portainer
    reverse_proxy localhost:${PORTAINER_PORT} {
        # Headers necessários
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
        
        # Websocket support para Portainer
        header_up Upgrade {>Upgrade}
        header_up Connection {>Connection}
    }
    
    # Headers de segurança
    header {
        # Segurança básica
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        
        # Permissões
        Permissions-Policy "geolocation=(), microphone=(), camera=()"
        
        # Remover headers desnecessários
        -Server
        -X-Powered-By
    }
    
    # Logs específicos para o Portainer
    log {
        output file /var/log/caddy/portainer.log {
            roll_size 10mb
            roll_keep 5
        }
        format json
        level INFO
    }
    
    # Configurações de timeout para operações longas
    timeouts {
        read 300s
        write 300s
        idle 300s
    }
    
    # Tamanho máximo de upload (para importar backups)
    request_body {
        max_size 500MB
    }
}
EOF

# Verificar se a configuração já existe
if grep -q "${SUBDOMAIN}.${DOMAIN}" "$CADDYFILE"; then
    echo -e "${YELLOW}⚠️  Configuração para ${SUBDOMAIN}.${DOMAIN} já existe no Caddyfile${NC}"
    echo "Deseja substituí-la? (s/n)"
    read -r resposta
    if [[ ! "$resposta" =~ ^[Ss]$ ]]; then
        echo "Operação cancelada"
        exit 0
    fi
    # Remover configuração antiga
    sed -i "/^${SUBDOMAIN}\.${DOMAIN} {/,/^}/d" "$CADDYFILE"
fi

# Adicionar nova configuração
cat /tmp/portainer-caddy.conf >> "$CADDYFILE"
rm /tmp/portainer-caddy.conf

# Validar configuração
echo "🔍 Validando configuração do Caddy..."
if caddy validate --config "$CADDYFILE"; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Caddy${NC}"
    echo "Restaurando backup..."
    cp "${CADDYFILE}.backup.$(date +%Y%m%d_%H%M%S)" "$CADDYFILE"
    exit 1
fi

# Recarregar Caddy
echo "🔄 Recarregando Caddy..."
systemctl reload caddy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Caddy recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao recarregar Caddy${NC}"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p /var/log/caddy
touch /var/log/caddy/portainer.log
chown caddy:caddy /var/log/caddy/portainer.log

# Instruções finais
echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Certifique-se de que o registro DNS está configurado:"
echo "   - Nome: ${SUBDOMAIN}"
echo "   - Tipo: CNAME"
echo "   - Valor: srv782625.hstgr.cloud"
echo "   - TTL: 14400"
echo ""
echo "2. Aguarde a propagação do DNS (pode levar até 24 horas)"
echo ""
echo "3. Acesse o Portainer em: https://${SUBDOMAIN}.${DOMAIN}"
echo ""
echo "💡 Dicas:"
echo "- Verificar DNS: dig ${SUBDOMAIN}.${DOMAIN}"
echo "- Ver logs: tail -f /var/log/caddy/portainer.log"
echo "- Status do Caddy: systemctl status caddy"
echo ""

# Opção de criar registro DNS automaticamente
echo "Deseja criar o registro DNS automaticamente? (s/n)"
read -r criar_dns

if [[ "$criar_dns" =~ ^[Ss]$ ]]; then
    if [ -f "/etc/caddy/scripts/criar-subdominio.sh" ]; then
        echo "Executando script de criação de DNS..."
        /etc/caddy/scripts/criar-subdominio.sh criar ${SUBDOMAIN}
    else
        echo -e "${YELLOW}Script de criação automática não encontrado.${NC}"
        echo "Crie o registro DNS manualmente no painel da Hostinger."
    fi
fi

echo ""
echo "🎉 Script finalizado!"