#!/bin/bash

# Script para executar o fluxo completo de automação de blog
# Uso: ./executar_fluxo_completo.sh [opção]
#   Opções:
#     --monitor     Executa apenas o monitoramento RSS
#     --translate   Executa apenas a tradução de artigos selecionados
#     --publish     Executa apenas a publicação no Sanity
#     --index       Executa apenas a indexação no Algolia
#     --all         Executa o fluxo completo (padrão)
#     --use-crew    Usa os agentes do CrewAI para tarefas especiais

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variável para controlar uso do CrewAI
USE_CREW=false

# Função para exibir mensagem com cores
echo_color() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Verificação do arquivo .env
if [ ! -f .env ]; then
  echo_color $RED "ERRO: Arquivo .env não encontrado."
  echo_color $YELLOW "Por favor, crie o arquivo .env com as credenciais necessárias."
  exit 1
fi

# Função para executar o monitoramento RSS
executar_monitoramento() {
  echo_color $GREEN "=== INICIANDO MONITORAMENTO RSS ==="
  echo_color $YELLOW "Este processo continuará executando até ser interrompido com Ctrl+C."
  echo_color $YELLOW "Os artigos selecionados serão marcados para tradução."
  echo_color $YELLOW "Verificando a cada 60 minutos..."
  
  if [ "$USE_CREW" = true ]; then
    echo_color $GREEN "Usando agentes do CrewAI para análise de relevância..."
    python -m agentes_crewai.monitoramento_crew --loop 60
  else
    python main.py --loop 60
  fi
}

# Função para executar a tradução de artigos
executar_traducao() {
  echo_color $GREEN "=== INICIANDO TRADUÇÃO DE ARTIGOS ==="
  echo_color $YELLOW "Traduzindo artigos marcados na pasta 'posts_traduzidos/'..."
  
  if [ "$USE_CREW" = true ]; then
    echo_color $GREEN "Usando agentes do CrewAI para tradução e adaptação..."
    python -m agentes_crewai.translator
  else
    python -m agentes_crewai.translator
  fi
}

# Função para executar a publicação no Sanity
executar_publicacao() {
  echo_color $GREEN "=== INICIANDO PUBLICAÇÃO NO SANITY ==="
  echo_color $YELLOW "Publicando posts da pasta 'posts_traduzidos/' no Sanity CMS..."
  
  if [ "$USE_CREW" = true ]; then
    echo_color $GREEN "Usando agentes do CrewAI para melhorar e formatar conteúdo..."
    python -m agentes_crewai.publicacao_crew
  else
    node scripts/publicar_posts_markdown.js
  fi
}

# Função para executar a indexação no Algolia
executar_indexacao() {
  echo_color $GREEN "=== INICIANDO INDEXAÇÃO NO ALGOLIA ==="
  echo_color $YELLOW "Indexando posts do Sanity no Algolia..."
  node scripts/indexar-sanity-para-algolia.js
}

# Função para executar o fluxo completo
executar_fluxo_completo() {
  echo_color $GREEN "=== EXECUTANDO FLUXO COMPLETO ==="
  
  # Passo 1: Buscar e selecionar novos artigos
  echo_color $YELLOW "Passo 1: Buscando e selecionando novos artigos..."
  if [ "$USE_CREW" = true ]; then
    python -m agentes_crewai.monitoramento_crew
  else
    python main.py
  fi
  
  # Verificar se há artigos para traduzir
  if [ "$(ls -A posts_traduzidos/para_traduzir_*.json 2>/dev/null)" ]; then
    # Passo 2: Traduzir artigos selecionados
    echo_color $YELLOW "Passo 2: Traduzindo artigos selecionados..."
    if [ "$USE_CREW" = true ]; then
      python -m agentes_crewai.translator
    else
      python -m agentes_crewai.translator
    fi
  else
    echo_color $YELLOW "Nenhum novo artigo para traduzir."
  fi
  
  # Verificar se há artigos traduzidos para publicar (sem o prefixo para_traduzir_)
  if [ "$(ls -A posts_traduzidos/*.json 2>/dev/null | grep -v "para_traduzir_")" ]; then
    # Passo 3: Publicar artigos no Sanity
    echo_color $YELLOW "Passo 3: Publicando artigos no Sanity..."
    if [ "$USE_CREW" = true ]; then
      python -m agentes_crewai.publicacao_crew
    else
      node scripts/publicar_posts_markdown.js
    fi
    
    # Passo 4: Indexar no Algolia
    echo_color $YELLOW "Passo 4: Indexando conteúdo no Algolia..."
    node scripts/indexar-sanity-para-algolia.js
  else
    echo_color $YELLOW "Nenhum artigo traduzido para publicar."
  fi
  
  echo_color $GREEN "=== FLUXO COMPLETO FINALIZADO ==="
}

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case "$1" in
    --monitor)
      COMMAND="monitor"
      shift
      ;;
    --translate)
      COMMAND="translate"
      shift
      ;;
    --publish)
      COMMAND="publish"
      shift
      ;;
    --index)
      COMMAND="index"
      shift
      ;;
    --all)
      COMMAND="all"
      shift
      ;;
    --use-crew)
      USE_CREW=true
      shift
      ;;
    *)
      echo_color $RED "Opção inválida: $1"
      echo_color $YELLOW "Uso: ./executar_fluxo_completo.sh [--monitor|--translate|--publish|--index|--all] [--use-crew]"
      exit 1
      ;;
  esac
done

# Executar comando selecionado
if [ "$USE_CREW" = true ]; then
  echo_color $GREEN "Modo CrewAI ativado: Usando agentes inteligentes para processamento"
fi

case "$COMMAND" in
  "monitor")
    executar_monitoramento
    ;;
  "translate")
    executar_traducao
    ;;
  "publish")
    executar_publicacao
    ;;
  "index")
    executar_indexacao
    ;;
  *)
    # Padrão é executar fluxo completo
    executar_fluxo_completo
    ;;
esac 