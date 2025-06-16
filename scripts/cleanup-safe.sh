#!/bin/bash
# Script de limpeza segura do projeto
# Criado: 2025-06-16
# ATENÇÃO: Este script move arquivos para lixeira ao invés de deletar

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório de lixeira
TRASH_DIR="/tmp/thecryptofrontier-trash-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$TRASH_DIR"

echo -e "${GREEN}=== Limpeza Segura do Projeto ===${NC}"
echo -e "${YELLOW}Arquivos serão movidos para: $TRASH_DIR${NC}"
echo ""

# Função para mover arquivos com segurança
move_to_trash() {
    local file="$1"
    local dest_dir="$TRASH_DIR/$(dirname "$file")"
    mkdir -p "$dest_dir"
    mv "$file" "$dest_dir/" && echo -e "${GREEN}✓${NC} Movido: $file"
}

# 1. Limpar arquivos de backup
echo -e "${YELLOW}1. Limpando arquivos de backup...${NC}"
find . -type f \( -name "*.backup" -o -name "*.bak" -o -name "*.old" -o -name "*~" \) \
    | grep -v node_modules \
    | while read -r file; do
        move_to_trash "$file"
    done

# 2. Limpar logs antigos (mais de 7 dias)
echo -e "\n${YELLOW}2. Limpando logs antigos...${NC}"
find . -type f -name "*.log" -mtime +7 \
    | grep -v node_modules \
    | while read -r file; do
        move_to_trash "$file"
    done

# 3. Limpar arquivos temporários
echo -e "\n${YELLOW}3. Limpando arquivos temporários...${NC}"
find . -type f \( -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.tmp" \) \
    | while read -r file; do
        move_to_trash "$file"
    done

# 4. Limpar caches do Next.js (mantém estrutura)
echo -e "\n${YELLOW}4. Limpando cache do Next.js...${NC}"
if [ -d "./src/.next/cache" ]; then
    find ./src/.next/cache -type f -name "*.old" -o -name "*.gz.old" \
        | while read -r file; do
            move_to_trash "$file"
        done
fi

# 5. Remover node_modules duplicados
echo -e "\n${YELLOW}5. Verificando node_modules duplicados...${NC}"
find . -type d -name "node_modules" | grep -v "^\./node_modules$" | head -10

# 6. Limpar arquivos de teste órfãos
echo -e "\n${YELLOW}6. Verificando arquivos de teste órfãos...${NC}"
find . -type f \( -name "test-*.js" -o -name "test-*.ts" \) \
    | grep -v node_modules \
    | grep -v "src/tests" \
    | grep -v "scripts/tests" \
    | head -20

# Relatório final
echo -e "\n${GREEN}=== Relatório de Limpeza ===${NC}"
echo -e "Arquivos movidos para: ${YELLOW}$TRASH_DIR${NC}"
echo -e "Espaço liberado: $(du -sh "$TRASH_DIR" 2>/dev/null | cut -f1)"
echo ""
echo -e "${YELLOW}Para restaurar arquivos:${NC}"
echo "cp -r $TRASH_DIR/* ."
echo ""
echo -e "${YELLOW}Para deletar permanentemente:${NC}"
echo "rm -rf $TRASH_DIR"