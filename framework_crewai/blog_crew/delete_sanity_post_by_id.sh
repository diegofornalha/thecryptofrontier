#!/bin/bash
# Script para remover um documento específico do tipo post no Sanity CMS por ID
# Uso: ./delete_sanity_post_by_id.sh <id-do-documento>

# Configurações do Sanity
PROJECT_ID="brby2yrg"
DATASET="production"
API_VERSION="2023-05-03"

# Verificar se foi fornecido um ID
if [ -z "$1" ]; then
  echo "Erro: É necessário fornecer o ID do documento."
  echo "Uso: $0 <id-do-documento>"
  exit 1
fi

DOCUMENT_ID="$1"

# Verificar se o token do Sanity está disponível
if [ -z "$SANITY_API_TOKEN" ]; then
  # Tentar carregar do arquivo .env se existir
  if [ -f ".env" ]; then
    source .env
  fi

  # Verificar novamente se o token foi carregado
  if [ -z "$SANITY_API_TOKEN" ]; then
    echo "Erro: SANITY_API_TOKEN não está definido"
    echo "Defina a variável de ambiente SANITY_API_TOKEN ou adicione ao arquivo .env"
    exit 1
  fi
fi

# Confirmar a remoção
echo "Você vai remover o documento com ID: $DOCUMENT_ID"
read -p "Tem certeza que deseja continuar? (s/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  echo "Operação cancelada."
  exit 0
fi

# Executar o comando curl para remover o documento
echo "Removendo documento $DOCUMENT_ID..."
RESULT=$(curl -s -X POST "https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SANITY_API_TOKEN}" \
  -d "{\"mutations\": [{\"delete\": {\"id\": \"${DOCUMENT_ID}\"}}]}")

# Verificar o resultado
if echo "$RESULT" | grep -q "transactionId"; then
  echo "✓ Documento removido com sucesso: $DOCUMENT_ID"
  exit 0
else
  echo "✗ Erro ao remover documento: $DOCUMENT_ID"
  echo "$RESULT"
  exit 1
fi 