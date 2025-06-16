#!/bin/bash
# Script para limpar scripts de teste que não são mais necessários

echo "🧹 Limpeza de Scripts de Teste e Temporários"
echo "==========================================="
echo ""

ARCHIVE_DIR="/home/strapi/thecryptofrontier/.archive/scripts-test-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Contar scripts a serem arquivados
TEST_COUNT=$(find /home/strapi/thecryptofrontier/scripts -name "test-*.js" -o -name "test-*.sh" | grep -v "/tests/" | wc -l)
FIX_COUNT=$(find /home/strapi/thecryptofrontier/scripts -name "fix-*.js" -o -name "fix-*.sh" | wc -l)
TOTAL=$((TEST_COUNT + FIX_COUNT))

echo "📊 Scripts identificados para arquivamento:"
echo "   - Scripts de teste: $TEST_COUNT"
echo "   - Scripts de correção: $FIX_COUNT"
echo "   - Total: $TOTAL scripts"
echo ""

if [ $TOTAL -eq 0 ]; then
    echo "✅ Nenhum script para limpar!"
    exit 0
fi

echo "📦 Arquivando scripts..."
echo ""

# Arquivar scripts de teste
find /home/strapi/thecryptofrontier/scripts -name "test-*.js" -o -name "test-*.sh" | grep -v "/tests/" | while read -r script; do
    if [ -f "$script" ]; then
        echo "   🗑️  $(basename "$script")"
        mv "$script" "$ARCHIVE_DIR/"
    fi
done

# Arquivar scripts de correção temporária
find /home/strapi/thecryptofrontier/scripts -name "fix-*.js" -o -name "fix-*.sh" | while read -r script; do
    if [ -f "$script" ]; then
        echo "   🗑️  $(basename "$script")"
        mv "$script" "$ARCHIVE_DIR/"
    fi
done

# Arquivar scripts de configuração únicos já executados
for script in \
    "configure-post-permissions.js" \
    "setup-strapi-api.js" \
    "setup-strapi-development.js" \
    "fix-strapi5-permissions.js" \
    "orquestrar-integracao.js" \
    "publish-article.js" \
    "check-strapi-content-types.js" \
    "create-strapi-content-types.js"
do
    if [ -f "/home/strapi/thecryptofrontier/scripts/$script" ]; then
        echo "   🗑️  $script (setup único)"
        mv "/home/strapi/thecryptofrontier/scripts/$script" "$ARCHIVE_DIR/"
    fi
done

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📁 Scripts arquivados em:"
echo "   $ARCHIVE_DIR"
echo ""
echo "📊 Resumo:"
ARCHIVED=$(ls -1 "$ARCHIVE_DIR" | wc -l)
REMAINING=$(find /home/strapi/thecryptofrontier/scripts -name "*.sh" -o -name "*.js" -o -name "*.ts" -o -name "*.py" | wc -l)
echo "   - Scripts arquivados: $ARCHIVED"
echo "   - Scripts restantes: $REMAINING"
echo ""
echo "💡 Para restaurar (se necessário):"
echo "   mv $ARCHIVE_DIR/* /home/strapi/thecryptofrontier/scripts/"