#!/bin/bash

# Script para sincronizar componentes do shadcn/ui
# Uso: ./scripts/sync-shadcn.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log() {
  echo -e "${BLUE}[SYNC-SHADCN]${NC} $1"
}

error() {
  echo -e "${RED}[ERRO]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
  echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos na raiz do projeto
if [ ! -f "components.json" ]; then
  error "Este script deve ser executado na raiz do projeto."
  exit 1
fi

# Verificar atualizações do shadcn/ui
log "Verificando atualizações do shadcn/ui..."
npx shadcn-ui@latest check || {
  error "Falha ao verificar atualizações."
  exit 1
}

# Perguntar ao usuário se deseja atualizar
read -p "Deseja atualizar os componentes do shadcn/ui? (s/N): " RESPOSTA
if [[ ! "$RESPOSTA" =~ ^[Ss]$ ]]; then
  log "Operação cancelada pelo usuário."
  exit 0
fi

# Criar branch para atualização
BRANCH="update/shadcn-ui-$(date +%Y%m%d)"
log "Criando branch para atualização: $BRANCH"
git checkout -b "$BRANCH" || {
  error "Falha ao criar branch."
  exit 1
}

# Atualizar componentes
log "Atualizando componentes do shadcn/ui..."
npx shadcn-ui@latest upgrade || {
  error "Falha ao atualizar componentes."
  exit 1
}

# Executar testes
log "Executando testes após atualização..."
npm run test || {
  warning "Testes falharam. Correções podem ser necessárias antes de continuar."
  read -p "Deseja continuar mesmo assim? (s/N): " CONTINUAR
  if [[ ! "$CONTINUAR" =~ ^[Ss]$ ]]; then
    log "Atualização cancelada. Retornando à branch principal."
    git checkout main
    git branch -D "$BRANCH"
    exit 1
  fi
}

# Atualizar documentação (opcional)
if [ -d "docs" ]; then
  log "Atualizando documentação..."
  if [ -f "package.json" ] && grep -q "docs:build" "package.json"; then
    npm run docs:build || warning "Falha ao gerar documentação."
  else
    warning "Comando de build da documentação não encontrado."
  fi
fi

# Commitar alterações
log "Commitando alterações..."
git add .
git commit -m "chore: atualizar shadcn/ui para a versão mais recente" || {
  error "Falha ao commitar alterações."
  exit 1
}

# Instruções finais
success "Atualização concluída com sucesso!"
log "Branch criada: $BRANCH"
log "Para enviar as alterações, execute:"
echo "  git push -u origin $BRANCH"
log "Em seguida, crie um Pull Request para revisar as alterações." 