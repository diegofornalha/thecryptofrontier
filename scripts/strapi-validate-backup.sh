#!/bin/bash

# Script de Validação de Backup para Strapi
# Autor: Guardian
# Data: 2025-06-15
# Descrição: Valida a integridade e conteúdo dos backups do Strapi

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${PROJECT_ROOT}/backups"
TEMP_VALIDATE_DIR="/tmp/strapi_validate_$$"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Contadores para validação
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Função para exibir mensagens
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1" >&2
    ((FAILED_CHECKS++))
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

check() {
    echo -e "${MAGENTA}[CHECK]${NC} $1"
    ((TOTAL_CHECKS++))
}

# Listar backups disponíveis
list_backups() {
    echo -e "\n${CYAN}=== Backups Disponíveis para Validação ===${NC}"
    
    if [ ! -d "${BACKUP_ROOT}" ]; then
        error "Diretório de backups não encontrado: ${BACKUP_ROOT}"
        exit 1
    fi
    
    # Procurar por arquivos de backup
    BACKUPS=($(find "${BACKUP_ROOT}" -name "strapi_backup_*.zip" -type f | sort -r))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        error "Nenhum backup encontrado em ${BACKUP_ROOT}"
        exit 1
    fi
    
    # Mostrar lista numerada
    for i in "${!BACKUPS[@]}"; do
        BACKUP_FILE="${BACKUPS[$i]}"
        BACKUP_NAME=$(basename "$BACKUP_FILE")
        BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
        BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" 2>/dev/null | cut -d' ' -f1-2 || stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$BACKUP_FILE" 2>/dev/null || echo "Data desconhecida")
        
        echo -e "${YELLOW}[$((i+1))]${NC} ${BACKUP_NAME}"
        echo -e "    Tamanho: ${BACKUP_SIZE}"
        echo -e "    Data: ${BACKUP_DATE}"
        echo ""
    done
    
    # Adicionar opção para validar todos
    echo -e "${YELLOW}[A]${NC} Validar TODOS os backups"
    echo ""
    
    # Solicitar seleção
    while true; do
        read -p "Selecione o backup para validar (1-${#BACKUPS[@]}), 'A' para todos, ou 'q' para sair: " SELECTION
        
        if [[ "$SELECTION" == "q" || "$SELECTION" == "Q" ]]; then
            echo "Operação cancelada."
            exit 0
        fi
        
        if [[ "$SELECTION" == "a" || "$SELECTION" == "A" ]]; then
            VALIDATE_ALL=true
            break
        fi
        
        if [[ "$SELECTION" =~ ^[0-9]+$ ]] && [ "$SELECTION" -ge 1 ] && [ "$SELECTION" -le ${#BACKUPS[@]} ]; then
            SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
            VALIDATE_ALL=false
            break
        else
            error "Seleção inválida."
            ((FAILED_CHECKS--))  # Não contar erro de seleção
        fi
    done
}

# Validar integridade do arquivo ZIP
validate_zip_integrity() {
    local backup_file="$1"
    local backup_name=$(basename "$backup_file")
    
    check "Validando integridade do arquivo ZIP: $backup_name"
    
    # Testar integridade do ZIP
    if unzip -t "$backup_file" > /dev/null 2>&1; then
        success "Arquivo ZIP íntegro"
    else
        error "Arquivo ZIP corrompido ou inválido"
        return 1
    fi
    
    # Verificar tamanho
    local file_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file" 2>/dev/null || echo "0")
    if [ "$file_size" -lt 1024 ]; then
        warning "Arquivo muito pequeno (menos de 1KB)"
    fi
    
    return 0
}

# Extrair e validar conteúdo
validate_backup_content() {
    local backup_file="$1"
    local backup_name=$(basename "$backup_file")
    
    info "Validando conteúdo do backup: $backup_name"
    
    # Criar diretório temporário
    local temp_dir="${TEMP_VALIDATE_DIR}/${backup_name%.zip}"
    mkdir -p "$temp_dir"
    
    # Extrair backup
    if ! unzip -q "$backup_file" -d "$temp_dir"; then
        error "Falha ao extrair backup"
        return 1
    fi
    
    # Encontrar diretório do conteúdo
    local content_dir=$(find "$temp_dir" -maxdepth 1 -type d | grep -v "^$temp_dir$" | head -1)
    
    if [ -z "$content_dir" ]; then
        error "Estrutura de diretório inválida no backup"
        return 1
    fi
    
    # Validar metadados
    check "Verificando arquivo de metadados"
    if [ -f "$content_dir/metadata.json" ]; then
        success "Arquivo de metadados encontrado"
        
        # Validar JSON
        if jq empty "$content_dir/metadata.json" 2>/dev/null; then
            success "Metadados em formato JSON válido"
            
            # Extrair informações
            local backup_date=$(jq -r '.date' "$content_dir/metadata.json" 2>/dev/null)
            local strapi_version=$(jq -r '.strapi_version' "$content_dir/metadata.json" 2>/dev/null)
            
            info "Data do backup: $backup_date"
            info "Versão do Strapi: $strapi_version"
        else
            error "Arquivo de metadados com JSON inválido"
        fi
    else
        warning "Arquivo de metadados não encontrado"
    fi
    
    # Validar componentes
    echo -e "\n${CYAN}Componentes do backup:${NC}"
    
    # Banco de dados
    check "Verificando backup do banco de dados"
    if [ -f "$content_dir/database.sql.gz" ]; then
        success "Backup do banco de dados encontrado"
        
        # Verificar integridade do gzip
        if gzip -t "$content_dir/database.sql.gz" 2>/dev/null; then
            success "Arquivo database.sql.gz íntegro"
            
            # Tamanho descomprimido estimado
            local compressed_size=$(stat -c%s "$content_dir/database.sql.gz" 2>/dev/null || stat -f%z "$content_dir/database.sql.gz" 2>/dev/null)
            local compressed_size_mb=$((compressed_size / 1024 / 1024))
            info "Tamanho comprimido: ${compressed_size_mb}MB"
            
            # Verificar conteúdo básico
            if zcat "$content_dir/database.sql.gz" | head -20 | grep -q "PostgreSQL"; then
                success "Dump PostgreSQL válido detectado"
            else
                warning "Formato do dump não reconhecido"
            fi
        else
            error "Arquivo database.sql.gz corrompido"
        fi
    else
        warning "Backup do banco de dados não encontrado"
    fi
    
    # Uploads
    check "Verificando backup de uploads"
    if [ -f "$content_dir/uploads.tar.gz" ]; then
        success "Backup de uploads encontrado"
        
        # Verificar integridade
        if tar -tzf "$content_dir/uploads.tar.gz" > /dev/null 2>&1; then
            success "Arquivo uploads.tar.gz íntegro"
            
            # Contar arquivos
            local file_count=$(tar -tzf "$content_dir/uploads.tar.gz" | grep -v '/$' | wc -l)
            info "Número de arquivos no upload: $file_count"
            
            # Listar tipos de arquivo
            echo "  Tipos de arquivo encontrados:"
            tar -tzf "$content_dir/uploads.tar.gz" | grep -v '/$' | \
                awk -F. '{print $NF}' | sort | uniq -c | sort -rn | head -10 | \
                while read count ext; do
                    echo "    - .$ext: $count arquivos"
                done
        else
            error "Arquivo uploads.tar.gz corrompido"
        fi
    else
        info "Backup de uploads não incluído"
    fi
    
    # Configurações
    check "Verificando backup de configurações"
    if [ -f "$content_dir/configs.tar.gz" ]; then
        success "Backup de configurações encontrado"
        
        # Verificar integridade
        if tar -tzf "$content_dir/configs.tar.gz" > /dev/null 2>&1; then
            success "Arquivo configs.tar.gz íntegro"
            
            # Listar configurações
            echo "  Configurações incluídas:"
            tar -tzf "$content_dir/configs.tar.gz" | grep -E '\.(js|json|env)$' | \
                while read file; do
                    echo "    - $(basename "$file")"
                done
        else
            error "Arquivo configs.tar.gz corrompido"
        fi
    else
        warning "Backup de configurações não encontrado"
    fi
    
    # API/Content Types
    check "Verificando backup de tipos de conteúdo"
    if [ -f "$content_dir/api.tar.gz" ]; then
        success "Backup de tipos de conteúdo encontrado"
        
        # Verificar integridade
        if tar -tzf "$content_dir/api.tar.gz" > /dev/null 2>&1; then
            success "Arquivo api.tar.gz íntegro"
            
            # Listar APIs
            echo "  APIs incluídas:"
            tar -tzf "$content_dir/api.tar.gz" | grep -E '^api/[^/]+/$' | \
                sed 's|api/||g' | sed 's|/$||g' | sort -u | \
                while read api; do
                    echo "    - $api"
                done
        else
            error "Arquivo api.tar.gz corrompido"
        fi
    else
        info "Backup de tipos de conteúdo não incluído"
    fi
    
    # Componentes
    check "Verificando backup de componentes"
    if [ -f "$content_dir/components.tar.gz" ]; then
        success "Backup de componentes encontrado"
        
        # Verificar integridade
        if tar -tzf "$content_dir/components.tar.gz" > /dev/null 2>&1; then
            success "Arquivo components.tar.gz íntegro"
        else
            error "Arquivo components.tar.gz corrompido"
        fi
    else
        info "Backup de componentes não incluído"
    fi
    
    # Calcular tamanho total descomprimido
    echo -e "\n${CYAN}Estatísticas do backup:${NC}"
    local total_size=0
    for file in "$content_dir"/*; do
        if [ -f "$file" ]; then
            local file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
            total_size=$((total_size + file_size))
        fi
    done
    
    local total_size_mb=$((total_size / 1024 / 1024))
    info "Tamanho total dos componentes: ${total_size_mb}MB"
    
    # Limpar diretório temporário
    rm -rf "$temp_dir"
}

# Gerar relatório de validação
generate_report() {
    echo -e "\n${CYAN}=== Relatório de Validação ===${NC}"
    echo -e "Total de verificações: ${TOTAL_CHECKS}"
    echo -e "${GREEN}Verificações bem-sucedidas: ${PASSED_CHECKS}${NC}"
    echo -e "${YELLOW}Avisos: ${WARNINGS}${NC}"
    echo -e "${RED}Falhas: ${FAILED_CHECKS}${NC}"
    
    # Calcular taxa de sucesso
    if [ $TOTAL_CHECKS -gt 0 ]; then
        local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        echo -e "\nTaxa de sucesso: ${success_rate}%"
        
        if [ $success_rate -eq 100 ] && [ $WARNINGS -eq 0 ]; then
            echo -e "\n${GREEN}✓ Backup totalmente válido e íntegro!${NC}"
        elif [ $success_rate -ge 80 ]; then
            echo -e "\n${YELLOW}⚠ Backup válido com alguns avisos${NC}"
        else
            echo -e "\n${RED}✗ Backup com problemas críticos${NC}"
        fi
    fi
}

# Limpar arquivos temporários
cleanup_temp() {
    if [ -d "$TEMP_VALIDATE_DIR" ]; then
        log "Limpando arquivos temporários..."
        rm -rf "$TEMP_VALIDATE_DIR"
    fi
}

# Função principal
main() {
    echo -e "${BLUE}=== Validador de Backup do Strapi ===${NC}"
    
    # Listar e selecionar backup(s)
    list_backups
    
    # Validar backup(s)
    if [ "$VALIDATE_ALL" = true ]; then
        echo -e "\n${CYAN}Validando todos os backups...${NC}\n"
        
        for backup in "${BACKUPS[@]}"; do
            echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            
            # Resetar contadores para cada backup
            TOTAL_CHECKS=0
            PASSED_CHECKS=0
            FAILED_CHECKS=0
            WARNINGS=0
            
            # Validar
            if validate_zip_integrity "$backup"; then
                validate_backup_content "$backup"
            fi
            
            # Relatório individual
            generate_report
        done
    else
        # Validar backup único
        if validate_zip_integrity "$SELECTED_BACKUP"; then
            validate_backup_content "$SELECTED_BACKUP"
        fi
        
        # Gerar relatório
        generate_report
    fi
    
    # Limpar temporários
    cleanup_temp
    
    echo -e "\n${GREEN}Validação concluída!${NC}"
}

# Trap para limpar em caso de interrupção
trap cleanup_temp EXIT

# Executar script principal
main