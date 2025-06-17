#!/bin/bash
# Script para limpeza manual de arquivos JSON temporários

# Diretório do projeto
PROJECT_DIR="/home/strapi/thecryptofrontier/framework_crewai/blog_crew"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Limpeza de Arquivos JSON Temporários ===${NC}"
echo "Diretório: $PROJECT_DIR"
echo ""

# Função para mostrar estatísticas de um diretório
show_dir_stats() {
    local dir=$1
    local count=$(find "$dir" -name "*.json" -type f 2>/dev/null | wc -l)
    local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}$dir:${NC} $count arquivos, $size"
    fi
}

# Mostrar estatísticas antes da limpeza
echo "📊 Estado atual dos diretórios:"
show_dir_stats "$PROJECT_DIR/posts_para_traduzir"
show_dir_stats "$PROJECT_DIR/posts_traduzidos"
show_dir_stats "$PROJECT_DIR/posts_formatados"
show_dir_stats "$PROJECT_DIR/posts_publicados"
echo ""

# Perguntar ao usuário
echo -e "${YELLOW}Opções de limpeza:${NC}"
echo "1) Limpar arquivos com mais de 7 dias"
echo "2) Limpar arquivos com mais de 1 dia"
echo "3) Limpar TODOS os arquivos (incluindo posts_publicados)"
echo "4) Limpar apenas diretórios específicos"
echo "5) Cancelar"
echo ""
read -p "Escolha uma opção (1-5): " option

case $option in
    1)
        DAYS=7
        echo -e "\n${GREEN}Removendo arquivos com mais de $DAYS dias...${NC}"
        ;;
    2)
        DAYS=1
        echo -e "\n${GREEN}Removendo arquivos com mais de $DAYS dia...${NC}"
        ;;
    3)
        echo -e "\n${RED}⚠️  ATENÇÃO: Isso removerá TODOS os arquivos temporários!${NC}"
        read -p "Tem certeza? (s/N): " confirm
        if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
            echo "Operação cancelada."
            exit 0
        fi
        DAYS=0
        ;;
    4)
        echo "Selecione os diretórios para limpar:"
        echo "1) posts_para_traduzir"
        echo "2) posts_traduzidos"
        echo "3) posts_formatados"
        echo "4) posts_publicados"
        read -p "Digite os números separados por espaço: " dirs
        ;;
    5)
        echo "Operação cancelada."
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

# Função para limpar diretório
clean_directory() {
    local dir=$1
    local days=$2
    local count_before=$(find "$dir" -name "*.json" -type f 2>/dev/null | wc -l)
    
    if [ "$days" -eq 0 ]; then
        # Remover todos os arquivos
        find "$dir" -name "*.json" -type f -exec rm -v {} \; 2>/dev/null
    else
        # Remover arquivos mais antigos que X dias
        find "$dir" -name "*.json" -type f -mtime +$days -exec rm -v {} \; 2>/dev/null
    fi
    
    local count_after=$(find "$dir" -name "*.json" -type f 2>/dev/null | wc -l)
    local removed=$((count_before - count_after))
    
    if [ $removed -gt 0 ]; then
        echo -e "${GREEN}✓ $dir: $removed arquivos removidos${NC}"
    else
        echo -e "${YELLOW}○ $dir: nenhum arquivo removido${NC}"
    fi
}

# Executar limpeza
echo ""
if [ "$option" -eq 4 ]; then
    # Limpar diretórios específicos
    for num in $dirs; do
        case $num in
            1) clean_directory "$PROJECT_DIR/posts_para_traduzir" 7 ;;
            2) clean_directory "$PROJECT_DIR/posts_traduzidos" 7 ;;
            3) clean_directory "$PROJECT_DIR/posts_formatados" 7 ;;
            4) clean_directory "$PROJECT_DIR/posts_publicados" 7 ;;
        esac
    done
else
    # Limpar todos os diretórios (incluindo posts_publicados)
    clean_directory "$PROJECT_DIR/posts_para_traduzir" $DAYS
    clean_directory "$PROJECT_DIR/posts_traduzidos" $DAYS
    clean_directory "$PROJECT_DIR/posts_formatados" $DAYS
    clean_directory "$PROJECT_DIR/posts_publicados" $DAYS
fi

# Mostrar estatísticas após limpeza
echo -e "\n📊 Estado após limpeza:"
show_dir_stats "$PROJECT_DIR/posts_para_traduzir"
show_dir_stats "$PROJECT_DIR/posts_traduzidos"
show_dir_stats "$PROJECT_DIR/posts_formatados"
show_dir_stats "$PROJECT_DIR/posts_publicados"

# Mostrar espaço em disco
echo -e "\n💾 Espaço em disco:"
df -h "$PROJECT_DIR" | grep -E "Filesystem|/"

echo -e "\n${GREEN}✅ Limpeza concluída!${NC}"