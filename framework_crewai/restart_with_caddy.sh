#!/bin/bash

# Parar os contêineres existentes
echo "Parando contêineres existentes..."
docker-compose down

# Remover volumes antigos do Caddy (opcional)
# echo "Removendo volumes do Caddy..."
# docker volume rm framework_crewai_caddy_data framework_crewai_caddy_config

# Iniciar os contêineres 
echo "Iniciando contêineres com Caddy..."
docker-compose up -d

# Verificar status
echo "Verificando status dos contêineres..."
docker-compose ps

echo ""
echo "Instalação concluída!"
echo "Acesse: http://localhost/streamlit/"
echo ""
echo "Para visualizar logs do Caddy:"
echo "docker logs caddy-crewai-proxy -f"
echo ""
echo "Para visualizar logs do Streamlit:"
echo "docker logs streamlit-crewai-ui -f" 