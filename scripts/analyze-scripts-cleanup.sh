#!/bin/bash
# Script para analisar e sugerir limpeza de scripts desnecessários

echo "🔍 Análise de Scripts para Limpeza"
echo "==================================="
echo ""

SCRIPTS_DIR="/home/strapi/thecryptofrontier/scripts"
TEMP_ANALYSIS="/tmp/scripts-analysis-$(date +%s)"
mkdir -p "$TEMP_ANALYSIS"

# Categorias de scripts
declare -A CATEGORIES
CATEGORIES["test"]="Scripts de teste que podem ser obsoletos"
CATEGORIES["fix"]="Scripts de correção temporária"
CATEGORIES["setup"]="Scripts de setup únicos"
CATEGORIES["teach"]="Scripts de ensino/treinamento"
CATEGORIES["check"]="Scripts de verificação"

# Função para categorizar scripts
categorize_script() {
    local script=$1
    local basename=$(basename "$script")
    
    # Identificar categoria pelo prefixo
    for prefix in "${!CATEGORIES[@]}"; do
        if [[ "$basename" == "$prefix"* ]] || [[ "$basename" == *"-$prefix"* ]]; then
            echo "$prefix"
            return
        fi
    done
    echo "other"
}

# Função para verificar última modificação
get_age_days() {
    local file=$1
    local current_time=$(date +%s)
    local file_time=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
    local age_seconds=$((current_time - file_time))
    echo $((age_seconds / 86400))
}

# Analisar scripts
echo "📊 Análise por Categoria:"
echo "------------------------"

# Coletar scripts por categoria
declare -A SCRIPT_COUNTS
declare -A OLD_SCRIPTS
declare -A DUPLICATE_PATTERNS

find "$SCRIPTS_DIR" -name "*.sh" -o -name "*.js" -o -name "*.ts" -o -name "*.py" | while read -r script; do
    if [[ "$script" == *"node_modules"* ]]; then
        continue
    fi
    
    category=$(categorize_script "$script")
    age_days=$(get_age_days "$script")
    
    # Contar por categoria
    echo "$script|$category|$age_days" >> "$TEMP_ANALYSIS/all-scripts.txt"
    
    # Scripts antigos (>30 dias)
    if [ "$age_days" -gt 30 ]; then
        echo "$script" >> "$TEMP_ANALYSIS/old-$category.txt"
    fi
done

# Mostrar resumo por categoria
for cat in test fix setup teach check other; do
    count=$(grep "|$cat|" "$TEMP_ANALYSIS/all-scripts.txt" 2>/dev/null | wc -l)
    old_count=$([ -f "$TEMP_ANALYSIS/old-$cat.txt" ] && wc -l < "$TEMP_ANALYSIS/old-$cat.txt" || echo 0)
    
    if [ "$count" -gt 0 ]; then
        echo ""
        echo "📁 $cat: $count scripts (${old_count} com >30 dias)"
        if [ -n "${CATEGORIES[$cat]}" ]; then
            echo "   ${CATEGORIES[$cat]}"
        fi
    fi
done

echo ""
echo ""
echo "🗑️ Scripts Candidatos à Remoção:"
echo "--------------------------------"

# Scripts de teste
echo ""
echo "1️⃣ Scripts de Teste (geralmente podem ser removidos após uso):"
find "$SCRIPTS_DIR" -name "test-*.js" -o -name "test-*.sh" | grep -v "tests/" | while read -r script; do
    age=$(get_age_days "$script")
    echo "   - $(basename "$script") (${age} dias)"
done

# Scripts de fix temporários
echo ""
echo "2️⃣ Scripts de Correção Temporária:"
find "$SCRIPTS_DIR" -name "fix-*.sh" -o -name "fix-*.js" | while read -r script; do
    age=$(get_age_days "$script")
    echo "   - $(basename "$script") (${age} dias)"
done

# Scripts de ensino
echo ""
echo "3️⃣ Scripts de Ensino/Treinamento (após documentação):"
find "$SCRIPTS_DIR" -name "teach-*.js" -o -name "teach-*.sh" | while read -r script; do
    age=$(get_age_days "$script")
    echo "   - $(basename "$script") (${age} dias)"
done

# Scripts duplicados
echo ""
echo "4️⃣ Possíveis Duplicatas (mesmo padrão):"
echo "   Strapi tests: $(ls "$SCRIPTS_DIR"/test-strapi*.js 2>/dev/null | wc -l) arquivos"
echo "   Strapi setup: $(ls "$SCRIPTS_DIR"/setup-strapi*.js 2>/dev/null | wc -l) arquivos"
echo "   Docker fixes: $(ls "$SCRIPTS_DIR"/docker/fix-*.sh 2>/dev/null | wc -l) arquivos"

# Estatísticas finais
echo ""
echo ""
echo "📈 Estatísticas Gerais:"
echo "----------------------"
total_scripts=$(find "$SCRIPTS_DIR" -name "*.sh" -o -name "*.js" -o -name "*.ts" -o -name "*.py" | wc -l)
test_scripts=$(find "$SCRIPTS_DIR" -name "test-*" | wc -l)
fix_scripts=$(find "$SCRIPTS_DIR" -name "fix-*" | wc -l)
old_scripts=$(find "$SCRIPTS_DIR" -name "*.sh" -o -name "*.js" -mtime +30 | wc -l)

echo "Total de scripts: $total_scripts"
echo "Scripts de teste: $test_scripts"
echo "Scripts de fix: $fix_scripts"
echo "Scripts >30 dias: $old_scripts"
echo ""
potential_removal=$((test_scripts + fix_scripts))
echo "🎯 Potencial de remoção: ~${potential_removal} scripts"

# Criar script de limpeza
echo ""
echo ""
echo "💡 Gerando script de limpeza..."
cat > "$SCRIPTS_DIR/cleanup-old-scripts.sh" << 'EOF'
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
EOF

chmod +x "$SCRIPTS_DIR/cleanup-old-scripts.sh"

# Limpar arquivos temporários
rm -rf "$TEMP_ANALYSIS"

echo "✅ Script de limpeza criado: $SCRIPTS_DIR/cleanup-old-scripts.sh"
echo ""
echo "Para executar a limpeza: ./scripts/cleanup-old-scripts.sh"