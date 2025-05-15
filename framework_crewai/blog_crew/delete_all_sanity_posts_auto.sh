#!/bin/bash
# Versão automática do script para remover todos os documentos do tipo post do Sanity CMS
# Não pede confirmação do usuário

# Configurações do Sanity
PROJECT_ID="brby2yrg"
DATASET="production"
API_VERSION="2023-05-03"

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

# Obter a lista de IDs dos documentos (usando o script Python)
echo "Obtendo lista de documentos post..."
# Armazenar a saída do comando Python
OUTPUT=$(python list_sanity_documents.py post)

# Extrair apenas as linhas com os IDs usando expressão regular
IDS=$(echo "$OUTPUT" | grep -o "ID: [^ ]*" | sed 's/ID: //g')

# Verificar se há IDs para processar
if [ -z "$IDS" ]; then
  echo "Nenhum documento post encontrado para remover."
  exit 0
fi

# Mostrar documentos que serão removidos
echo "Os seguintes documentos serão removidos automaticamente:"
echo "$OUTPUT" | grep "ID:"
echo ""

# Contador para documentos processados
COUNT=0
SUCCESS=0
FAILED=0

# Para cada ID, chamar o script de remoção
for ID in $IDS; do
  echo "Removendo documento $ID..."
  
  # Executar o comando curl para remover o documento
  RESULT=$(curl -s -X POST "https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SANITY_API_TOKEN}" \
    -d "{\"mutations\": [{\"delete\": {\"id\": \"${ID}\"}}]}")
  
  # Verificar o resultado
  if echo "$RESULT" | grep -q "transactionId"; then
    echo "✓ Documento removido com sucesso: $ID"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "✗ Erro ao remover documento: $ID"
    echo "$RESULT"
    FAILED=$((FAILED + 1))
  fi
  
  COUNT=$((COUNT + 1))
  
  # Adicionar um pequeno atraso entre as requisições para não sobrecarregar a API
  sleep 0.5
done

# Mostrar resumo
echo ""
echo "Resumo da operação:"
echo "Total de documentos: $COUNT"
echo "Removidos com sucesso: $SUCCESS"
echo "Falhas: $FAILED"

if [ $FAILED -eq 0 ]; then
  echo "Todos os documentos foram removidos com sucesso!"
else
  echo "Alguns documentos não puderam ser removidos. Verifique os erros acima."
fi