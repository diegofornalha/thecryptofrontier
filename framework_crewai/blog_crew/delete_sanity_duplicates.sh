#!/bin/bash
# Script para remover posts duplicados e de propaganda do Sanity CMS

# Configurações do Sanity
PROJECT_ID="brby2yrg"
DATASET="production"
API_VERSION="2023-05-03"

# Lista de IDs duplicados para remover
DUPLICATE_IDS=(
    "xxjpUrvSZKbS0VWKYwp51z"
    "xxjpUrvSZKbS0VWKYwozi6"
    "xxjpUrvSZKbS0VWKYwozTV"
    "bINVl60rCuopV1vTnzj2Ve"
    "EC84shJEENJ2Ei1xHNxs9P"
    "EC84shJEENJ2Ei1xHNxgs4"
    "B3b5wPBzDYvTTMVihWoDZ2"
    "8pYdfL3aL47Vbm89px4WIE"
    "8pYdfL3aL47Vbm89px4W3K"
)

# Palavras-chave para identificar posts de propaganda
PROPAGANDA_KEYWORDS=(
    "LiteFinance"
    "litefinance"
    "lite finance"
    "Partner Application"
    "partner application"
)

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se o token do Sanity está disponível
if [ -z "$SANITY_API_TOKEN" ]; then
  # Tentar carregar do arquivo .env se existir
  if [ -f ".env" ]; then
    source .env
  fi

  # Verificar novamente se o token foi carregado
  if [ -z "$SANITY_API_TOKEN" ]; then
    echo -e "${RED}Erro: SANITY_API_TOKEN não está definido${NC}"
    echo "Defina a variável de ambiente SANITY_API_TOKEN ou adicione ao arquivo .env"
    exit 1
  fi
fi

# Função para remover um documento por ID
remove_document() {
  local id=$1
  echo -e "${BLUE}Removendo documento ${id}...${NC}"
  
  # Executar o comando curl para remover o documento
  RESULT=$(curl -s -X POST "https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SANITY_API_TOKEN}" \
    -d "{\"mutations\": [{\"delete\": {\"id\": \"${id}\"}}]}")
  
  # Verificar o resultado
  if echo "$RESULT" | grep -q "transactionId"; then
    echo -e "${GREEN}✓ Documento removido com sucesso: ${id}${NC}"
    return 0
  else
    echo -e "${RED}✗ Erro ao remover documento: ${id}${NC}"
    echo "$RESULT"
    return 1
  fi
}

# 1. Remover IDs duplicados conhecidos
echo -e "${YELLOW}=== REMOVENDO POSTS DUPLICADOS CONHECIDOS ===${NC}"
SUCCESS_DUPS=0
FAILED_DUPS=0

for ID in "${DUPLICATE_IDS[@]}"; do
  if remove_document "$ID"; then
    SUCCESS_DUPS=$((SUCCESS_DUPS + 1))
  else
    FAILED_DUPS=$((FAILED_DUPS + 1))
  fi
  # Pequena pausa entre requisições
  sleep 0.5
done

echo -e "${YELLOW}Duplicados: ${SUCCESS_DUPS} removidos, ${FAILED_DUPS} falhas${NC}"
echo ""

# 2. Procurar e remover posts de propaganda
echo -e "${YELLOW}=== IDENTIFICANDO E REMOVENDO POSTS DE PROPAGANDA ===${NC}"

# Obter a lista completa de posts
echo "Obtendo lista de documentos post..."
OUTPUT=$(python list_sanity_documents.py post)

# Contador para documentos processados
SUCCESS_PROP=0
FAILED_PROP=0
TOTAL_PROP=0

# Para cada palavra-chave de propaganda, procurar posts correspondentes
for KEYWORD in "${PROPAGANDA_KEYWORDS[@]}"; do
  echo -e "${BLUE}Procurando posts com a palavra-chave: ${KEYWORD}${NC}"
  
  # Encontrar IDs e títulos de documentos contendo a palavra-chave
  MATCHING_LINES=$(echo "$OUTPUT" | grep -i "$KEYWORD")
  
  if [ -z "$MATCHING_LINES" ]; then
    echo "Nenhum post encontrado com essa palavra-chave."
    continue
  fi
  
  # Extrair IDs dos documentos correspondentes
  MATCHING_IDS=$(echo "$MATCHING_LINES" | grep -o "ID: [^ ]*" | sed 's/ID: //g')
  
  # Para cada ID, remover o documento
  for ID in $MATCHING_IDS; do
    TOTAL_PROP=$((TOTAL_PROP + 1))
    if remove_document "$ID"; then
      SUCCESS_PROP=$((SUCCESS_PROP + 1))
    else
      FAILED_PROP=$((FAILED_PROP + 1))
    fi
    # Pequena pausa entre requisições
    sleep 0.5
  done
done

# Mostrar resumo
echo ""
echo -e "${YELLOW}=== RESUMO DA OPERAÇÃO ===${NC}"
echo "Total de duplicatas conhecidas: ${#DUPLICATE_IDS[@]}"
echo "Duplicatas removidas com sucesso: $SUCCESS_DUPS"
echo "Falhas em duplicatas: $FAILED_DUPS"
echo ""
echo "Posts de propaganda encontrados: $TOTAL_PROP"
echo "Posts de propaganda removidos: $SUCCESS_PROP"
echo "Falhas em posts de propaganda: $FAILED_PROP"
echo ""
echo "Total geral: $((${#DUPLICATE_IDS[@]} + TOTAL_PROP))"
echo "Total removido: $((SUCCESS_DUPS + SUCCESS_PROP))"
echo "Total de falhas: $((FAILED_DUPS + FAILED_PROP))"

if [ $((FAILED_DUPS + FAILED_PROP)) -eq 0 ]; then
  echo -e "${GREEN}Operação concluída com sucesso!${NC}"
else
  echo -e "${RED}Algumas operações falharam. Verifique os erros acima.${NC}"
fi