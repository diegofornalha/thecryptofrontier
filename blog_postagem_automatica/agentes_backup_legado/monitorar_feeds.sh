#!/bin/bash
# Script para monitoramento contínuo de feeds RSS
# Uso: ./monitorar_feeds.sh [--loop minutos] [--direto]

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valores padrão
LOOP_MINUTES=60
MODO="direto"  # Usar modo direto por padrão (mais estável)

# Processar argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --loop)
      LOOP_MINUTES="$2"
      shift 2
      ;;
    --crew)
      MODO="crew"  # Usar modo CrewAI
      shift
      ;;
    --direto)
      MODO="direto"  # Usar modo direto
      shift
      ;;
    --help)
      echo -e "${BLUE}=== Monitoramento de Feeds RSS - The Crypto Frontier ===${NC}"
      echo ""
      echo "Uso: ./monitorar_feeds.sh [--loop minutos] [--crew|--direto]"
      echo ""
      echo "Opções:"
      echo "  --loop minutos    Verifica feeds a cada X minutos (padrão: 60)"
      echo "  --crew            Usa o modo CrewAI com Gemini (requer API key)"
      echo "  --direto          Usa o modo direto sem CrewAI (padrão, mais estável)"
      echo "  --help            Exibe esta ajuda"
      echo ""
      echo -e "${YELLOW}Recomendação:${NC}"
      echo " - Para monitoramento estável: ./monitorar_feeds.sh --direto --loop 60"
      echo " - Para usar com IA (requer API key): ./monitorar_feeds.sh --crew --loop 60"
      exit 0
      ;;
    *)
      echo -e "${RED}Opção desconhecida: $1${NC}"
      echo "Use --help para ver as opções disponíveis"
      exit 1
      ;;
  esac
done

# Configurar ambiente Python
if [[ -d "venv" ]]; then
  echo -e "${BLUE}Ativando ambiente virtual (venv)...${NC}"
  source venv/bin/activate
elif [[ -d ".venv" ]]; then
  echo -e "${BLUE}Ativando ambiente virtual (.venv)...${NC}"
  source .venv/bin/activate
fi

# Definir PYTHONPATH
export PYTHONPATH="$PWD"

# Verificar e criar diretórios necessários
if [[ ! -d "posts_para_traduzir" ]]; then
  echo -e "${YELLOW}Criando diretório posts_para_traduzir...${NC}"
  mkdir -p posts_para_traduzir
fi

# Verificar se pasta posts_traduzidos existe
if [[ ! -d "posts_traduzidos" ]]; then
  echo -e "${YELLOW}Criando diretório posts_traduzidos...${NC}"
  mkdir -p posts_traduzidos
fi

# Verificar se pasta posts_publicados existe
if [[ ! -d "posts_publicados" ]]; then
  echo -e "${YELLOW}Criando diretório posts_publicados...${NC}"
  mkdir -p posts_publicados
fi

# Iniciar monitoramento
echo -e "${GREEN}=== Iniciando monitoramento de feeds RSS ===${NC}"
echo -e "${BLUE}Modo:${NC} ${YELLOW}$MODO${NC}"
echo -e "${BLUE}Intervalo:${NC} ${YELLOW}$LOOP_MINUTES minutos${NC}"
echo -e "${BLUE}Data/Hora:${NC} ${YELLOW}$(date)${NC}"
echo -e "${BLUE}Estrutura de arquivos:${NC}"
echo -e "  ${YELLOW}posts_para_traduzir/${NC} - Artigos encontrados, aguardando tradução"
echo -e "  ${YELLOW}posts_traduzidos/${NC} - Artigos traduzidos, aguardando publicação"
echo -e "  ${YELLOW}posts_publicados/${NC} - Artigos já publicados no Sanity CMS"
echo -e "${BLUE}===================================================${NC}"

if [[ "$MODO" == "direto" ]]; then
  echo -e "${YELLOW}Executando monitoramento direto (sem depender de CrewAI/Gemini)${NC}"
  python -m src.blog_automacao.main --direto --loop $LOOP_MINUTES
else
  echo -e "${YELLOW}Executando monitoramento com CrewAI e Gemini (requer API key configurada)${NC}"
  python -m src.blog_automacao.main --monitoramento --loop $LOOP_MINUTES
fi 