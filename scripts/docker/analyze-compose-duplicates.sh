#!/bin/bash
# Script para analisar duplicações nos docker-compose files

echo "🔍 Analisando duplicações nos arquivos docker-compose..."
echo "=================================================="
echo ""

# Função para extrair serviços de um arquivo
extract_services() {
    local file=$1
    if [ -f "$file" ]; then
        grep -E "^  [a-zA-Z0-9_-]+:" "$file" | sed 's/://g' | sed 's/^  //g' | sort
    fi
}

# Arquivos na raiz (legados)
echo "📁 ARQUIVOS NA RAIZ (Legados):"
echo "------------------------------"
for file in /home/strapi/thecryptofrontier/docker-compose*.yml; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        echo ""
        echo "📄 $basename_file:"
        services=$(extract_services "$file")
        if [ -n "$services" ]; then
            echo "$services" | sed 's/^/   - /'
        else
            echo "   (nenhum serviço encontrado)"
        fi
    fi
done

echo ""
echo ""
echo "📁 ARQUIVOS EM /infrastructure/docker (Novos):"
echo "----------------------------------------------"
for file in /home/strapi/thecryptofrontier/infrastructure/docker/docker-compose*.yml; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        echo ""
        echo "📄 $basename_file:"
        services=$(extract_services "$file")
        if [ -n "$services" ]; then
            echo "$services" | sed 's/^/   - /'
        else
            echo "   (nenhum serviço encontrado)"
        fi
    fi
done

echo ""
echo ""
echo "🔄 ANÁLISE DE DUPLICAÇÕES:"
echo "--------------------------"

# Coletar todos os serviços
all_services=$(mktemp)
for file in /home/strapi/thecryptofrontier/docker-compose*.yml /home/strapi/thecryptofrontier/infrastructure/docker/docker-compose*.yml; do
    if [ -f "$file" ]; then
        extract_services "$file" >> "$all_services"
    fi
done

# Encontrar duplicados
duplicates=$(sort "$all_services" | uniq -d)

if [ -n "$duplicates" ]; then
    echo "⚠️  Serviços duplicados encontrados:"
    echo "$duplicates" | while read service; do
        echo ""
        echo "   🔸 $service encontrado em:"
        grep -l "^  $service:" /home/strapi/thecryptofrontier/docker-compose*.yml /home/strapi/thecryptofrontier/infrastructure/docker/docker-compose*.yml 2>/dev/null | sed 's/^/      - /'
    done
else
    echo "✅ Nenhuma duplicação encontrada!"
fi

rm -f "$all_services"

echo ""
echo "=================================================="
echo "✅ Análise concluída"