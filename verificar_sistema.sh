#!/bin/bash

# Script para verificar o estado do sistema após remoção de arquivos
# Uso: ./verificar_sistema.sh [URL_TESTE_OPCIONAL] [ARQUIVO_REMOVIDO]

# Cores para melhor visualização
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
RESET='\033[0m'

echo -e "${AMARELO}[VERIFICAÇÃO DE SISTEMA]${RESET}"
echo -e "${AMARELO}=======================================${RESET}"
echo "Iniciando verificação de sistema após modificações..."
echo ""

# URL base para testes (default: localhost:3200)
URL_BASE=${1:-"http://localhost:3200"}
ARQUIVO_REMOVIDO=${2:-"não especificado"}

echo -e "${AMARELO}[INFORMAÇÕES]${RESET}"
echo "URL base para testes: $URL_BASE"
echo "Arquivo/diretório removido: $ARQUIVO_REMOVIDO"
echo ""

# Verificar status dos contêineres Docker
echo -e "${AMARELO}[STATUS DOS CONTÊINERES]${RESET}"
if docker-compose ps; then
    echo -e "\n${VERDE}✓ Contêineres do docker-compose estão em execução${RESET}"
else
    echo -e "\n${VERMELHO}✗ Problemas nos contêineres do docker-compose${RESET}"
fi
echo ""

# Verificar logs recentes do contêiner principal
echo -e "${AMARELO}[LOGS RECENTES]${RESET}"
CONTAINER_PRINCIPAL=$(docker-compose ps -q | head -n 1)
if [ -n "$CONTAINER_PRINCIPAL" ]; then
    docker logs $CONTAINER_PRINCIPAL --tail 20 | grep -i "error\|fatal\|failed"
    if [ $? -eq 0 ]; then
        echo -e "\n${VERMELHO}✗ Erros encontrados nos logs${RESET}"
    else
        echo -e "\n${VERDE}✓ Nenhum erro crítico nos logs recentes${RESET}"
    fi
else
    echo -e "${VERMELHO}✗ Nenhum contêiner encontrado${RESET}"
fi
echo ""

# Verificar se a aplicação está respondendo
echo -e "${AMARELO}[VERIFICAÇÃO DE RESPOSTA HTTP]${RESET}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL_BASE)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${VERDE}✓ Aplicação está respondendo com código HTTP 200 (OK)${RESET}"
else
    echo -e "${VERMELHO}✗ Aplicação não está respondendo corretamente. Código HTTP: $HTTP_CODE${RESET}"
fi
echo ""

# Verificar recursos específicos (imagens, etc.)
echo -e "${AMARELO}[VERIFICAÇÃO DE RECURSOS]${RESET}"

# Lista de recursos comuns para verificar
declare -a RECURSOS=(
    "/images/logo-dark.svg"
    "/images/favicon.svg"
    "/images/main-hero.svg"
)

RECURSOS_COM_PROBLEMA=0
for recurso in "${RECURSOS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL_BASE$recurso)
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "${VERDE}✓ Recurso $recurso está disponível${RESET}"
    else
        echo -e "${VERMELHO}✗ Recurso $recurso não está disponível (HTTP $HTTP_CODE)${RESET}"
        RECURSOS_COM_PROBLEMA=$((RECURSOS_COM_PROBLEMA+1))
    fi
done

# Resultado final
echo -e "\n${AMARELO}[RESULTADO DA VERIFICAÇÃO]${RESET}"
if [ "$HTTP_CODE" == "200" ] && [ $RECURSOS_COM_PROBLEMA -eq 0 ]; then
    echo -e "${VERDE}✓ O sistema parece estar funcionando normalmente após as modificações${RESET}"
elif [ "$HTTP_CODE" == "200" ] && [ $RECURSOS_COM_PROBLEMA -gt 0 ]; then
    echo -e "${AMARELO}⚠ A aplicação está respondendo, mas ${RECURSOS_COM_PROBLEMA} recursos não estão disponíveis${RESET}"
    echo -e "${AMARELO}⚠ As modificações podem ter causado problemas visuais no site${RESET}"
else
    echo -e "${VERMELHO}✗ O sistema apresenta problemas após as modificações${RESET}"
fi

echo ""
echo -e "${AMARELO}[SUGESTÕES]${RESET}"
if [ $RECURSOS_COM_PROBLEMA -gt 0 ]; then
    echo "- Considere restaurar os arquivos removidos se eles forem essenciais"
    echo "- Verifique se as imagens e outros recursos estão carregando corretamente no navegador"
    echo "- Considere reiniciar os contêineres se o problema persistir: docker-compose restart"
fi 