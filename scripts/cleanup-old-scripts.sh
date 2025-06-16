#!/bin/bash
# Script de limpeza de scripts antigos e desnecessários
# Gerado em: $(date)

echo "🧹 Limpeza de Scripts Desnecessários"
echo "===================================="
echo ""
echo "Este script irá mover scripts antigos para um diretório de arquivo."
echo ""

# Criar diretório de arquivo
ARCHIVE_DIR="/home/strapi/thecryptofrontier/.archive/scripts-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

# Função para arquivar script
archive_script() {
    local script=$1
    local reason=$2
    
    if [ -f "$script" ]; then
        echo "📦 Arquivando: $(basename "$script") - $reason"
        mv "$script" "$ARCHIVE_DIR/"
    fi
}

echo "Deseja prosseguir com a limpeza? (s/N)"
read -r response

if [[ "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo "🗑️ Iniciando limpeza..."
    
    # Scripts de teste antigos
    find /home/strapi/thecryptofrontier/scripts -name "test-*.js" -mtime +7 | while read -r script; do
        archive_script "$script" "Script de teste >7 dias"
    done
    
    # Scripts de fix antigos
    find /home/strapi/thecryptofrontier/scripts -name "fix-*.sh" -mtime +30 | while read -r script; do
        archive_script "$script" "Script de correção >30 dias"
    done
    
    # Scripts de ensino
    for script in /home/strapi/thecryptofrontier/scripts/teach-*.js; do
        [ -f "$script" ] && archive_script "$script" "Script de ensino"
    done
    
    echo ""
    echo "✅ Limpeza concluída!"
    echo "📁 Scripts arquivados em: $ARCHIVE_DIR"
    echo ""
    echo "Para restaurar: mv $ARCHIVE_DIR/* /home/strapi/thecryptofrontier/scripts/"
else
    echo "❌ Limpeza cancelada"
fi
