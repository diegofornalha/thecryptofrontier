#!/bin/bash

# Script de Backup Automatizado para Strapi
# Autor: Guardian
# Data: 2025-06-15
# Descrição: Realiza backup completo do Strapi incluindo banco de dados, uploads e configurações

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
BACKUP_NAME="strapi_backup_${TIMESTAMP}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se está rodando dentro do container ou no host
check_environment() {
    if [ -f /.dockerenv ]; then
        error "Este script deve ser executado no host, não dentro de um container Docker"
        exit 1
    fi
}

# Criar diretório de backup
create_backup_directory() {
    log "Criando diretório de backup: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
    
    if [ ! -d "${BACKUP_DIR}" ]; then
        error "Falha ao criar diretório de backup"
        exit 1
    fi
}

# Backup do banco de dados PostgreSQL
backup_database() {
    log "Iniciando backup do banco de dados PostgreSQL..."
    
    # Verificar se o container está rodando
    if ! docker ps | grep -q "strapi-postgres"; then
        error "Container strapi-postgres não está rodando"
        return 1
    fi
    
    # Fazer dump do banco
    docker exec strapi-postgres pg_dump \
        -U strapi \
        -d strapi \
        --no-owner \
        --no-acl \
        --if-exists \
        --clean \
        > "${BACKUP_DIR}/database.sql"
    
    if [ $? -eq 0 ]; then
        success "Backup do banco de dados concluído"
        # Comprimir o dump
        gzip "${BACKUP_DIR}/database.sql"
        log "Dump do banco comprimido: database.sql.gz"
    else
        error "Falha no backup do banco de dados"
        return 1
    fi
}

# Backup dos arquivos de upload
backup_uploads() {
    log "Iniciando backup dos arquivos de upload..."
    
    # Verificar se o diretório de uploads existe
    UPLOADS_DIR="${PROJECT_ROOT}/strapi/app/public/uploads"
    
    if [ -d "${UPLOADS_DIR}" ]; then
        # Criar arquivo tar dos uploads
        tar -czf "${BACKUP_DIR}/uploads.tar.gz" -C "${PROJECT_ROOT}/strapi/app/public" uploads
        
        if [ $? -eq 0 ]; then
            success "Backup dos uploads concluído"
            UPLOADS_SIZE=$(du -sh "${BACKUP_DIR}/uploads.tar.gz" | cut -f1)
            log "Tamanho do arquivo de uploads: ${UPLOADS_SIZE}"
        else
            error "Falha no backup dos uploads"
            return 1
        fi
    else
        warning "Diretório de uploads não encontrado, pulando..."
    fi
}

# Backup das configurações
backup_configs() {
    log "Iniciando backup das configurações..."
    
    # Lista de arquivos de configuração para fazer backup
    CONFIG_FILES=(
        "strapi/app/.env"
        "strapi/app/config/database.js"
        "strapi/app/config/server.js"
        "strapi/app/config/plugins.js"
        "strapi/app/package.json"
        "strapi/app/package-lock.json"
        "strapi/docker-compose-v4.yml"
    )
    
    # Criar diretório de configurações no backup
    mkdir -p "${BACKUP_DIR}/configs"
    
    # Copiar cada arquivo de configuração
    for config in "${CONFIG_FILES[@]}"; do
        CONFIG_PATH="${PROJECT_ROOT}/${config}"
        if [ -f "${CONFIG_PATH}" ]; then
            # Manter a estrutura de diretórios
            DEST_DIR="${BACKUP_DIR}/configs/$(dirname "${config}")"
            mkdir -p "${DEST_DIR}"
            cp "${CONFIG_PATH}" "${DEST_DIR}/"
            log "Copiado: ${config}"
        else
            warning "Arquivo não encontrado: ${config}"
        fi
    done
    
    # Comprimir configurações
    tar -czf "${BACKUP_DIR}/configs.tar.gz" -C "${BACKUP_DIR}" configs
    rm -rf "${BACKUP_DIR}/configs"
    
    success "Backup das configurações concluído"
}

# Backup dos schemas e tipos de conteúdo
backup_content_types() {
    log "Iniciando backup dos tipos de conteúdo..."
    
    # Diretórios de API
    API_DIR="${PROJECT_ROOT}/strapi/app/api"
    COMPONENTS_DIR="${PROJECT_ROOT}/strapi/app/components"
    
    if [ -d "${API_DIR}" ]; then
        tar -czf "${BACKUP_DIR}/api.tar.gz" -C "${PROJECT_ROOT}/strapi/app" api
        success "Backup dos tipos de conteúdo (API) concluído"
    else
        warning "Diretório API não encontrado"
    fi
    
    if [ -d "${COMPONENTS_DIR}" ]; then
        tar -czf "${BACKUP_DIR}/components.tar.gz" -C "${PROJECT_ROOT}/strapi/app" components
        success "Backup dos componentes concluído"
    else
        warning "Diretório de componentes não encontrado"
    fi
}

# Criar arquivo de metadados do backup
create_metadata() {
    log "Criando arquivo de metadados..."
    
    cat > "${BACKUP_DIR}/metadata.json" <<EOF
{
    "timestamp": "${TIMESTAMP}",
    "date": "$(date -Iseconds)",
    "strapi_version": "4",
    "backup_version": "1.0",
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "project_root": "${PROJECT_ROOT}",
    "components": {
        "database": $([ -f "${BACKUP_DIR}/database.sql.gz" ] && echo "true" || echo "false"),
        "uploads": $([ -f "${BACKUP_DIR}/uploads.tar.gz" ] && echo "true" || echo "false"),
        "configs": $([ -f "${BACKUP_DIR}/configs.tar.gz" ] && echo "true" || echo "false"),
        "api": $([ -f "${BACKUP_DIR}/api.tar.gz" ] && echo "true" || echo "false"),
        "components": $([ -f "${BACKUP_DIR}/components.tar.gz" ] && echo "true" || echo "false")
    },
    "docker_info": {
        "strapi_container": "$(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep strapi-v4-cms | awk '{print $2,$3,$4}' || echo 'not running')",
        "postgres_container": "$(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep strapi-postgres | awk '{print $2,$3,$4}' || echo 'not running')"
    }
}
EOF
    
    success "Metadados do backup criados"
}

# Criar arquivo ZIP final
create_final_archive() {
    log "Criando arquivo ZIP final..."
    
    cd "${BACKUP_ROOT}"
    zip -r "${BACKUP_NAME}.zip" "${TIMESTAMP}"
    
    if [ $? -eq 0 ]; then
        # Calcular tamanho do backup
        BACKUP_SIZE=$(du -sh "${BACKUP_NAME}.zip" | cut -f1)
        success "Arquivo de backup criado: ${BACKUP_NAME}.zip (${BACKUP_SIZE})"
        
        # Remover diretório temporário
        rm -rf "${TIMESTAMP}"
        
        # Caminho completo do backup
        echo -e "\n${GREEN}Backup completo salvo em:${NC}"
        echo "${BACKUP_ROOT}/${BACKUP_NAME}.zip"
    else
        error "Falha ao criar arquivo ZIP"
        return 1
    fi
}

# Limpeza de backups antigos (manter apenas os últimos N backups)
cleanup_old_backups() {
    KEEP_BACKUPS=7  # Manter os últimos 7 backups
    
    log "Verificando backups antigos..."
    
    # Contar backups existentes
    BACKUP_COUNT=$(find "${BACKUP_ROOT}" -name "strapi_backup_*.zip" 2>/dev/null | wc -l)
    
    if [ $BACKUP_COUNT -gt $KEEP_BACKUPS ]; then
        log "Removendo backups antigos (mantendo os últimos ${KEEP_BACKUPS})..."
        
        # Listar e remover backups antigos
        find "${BACKUP_ROOT}" -name "strapi_backup_*.zip" -type f | \
        sort | \
        head -n -${KEEP_BACKUPS} | \
        while read backup; do
            log "Removendo: $(basename "$backup")"
            rm "$backup"
        done
        
        success "Limpeza de backups antigos concluída"
    else
        log "Número de backups (${BACKUP_COUNT}) dentro do limite"
    fi
}

# Função principal
main() {
    echo -e "${BLUE}=== Script de Backup do Strapi ===${NC}"
    echo -e "Timestamp: ${TIMESTAMP}\n"
    
    # Verificações iniciais
    check_environment
    
    # Criar estrutura de backup
    create_backup_directory
    
    # Executar backups
    backup_database
    backup_uploads
    backup_configs
    backup_content_types
    
    # Criar metadados
    create_metadata
    
    # Criar arquivo final
    create_final_archive
    
    # Limpeza opcional
    cleanup_old_backups
    
    echo -e "\n${GREEN}✓ Backup concluído com sucesso!${NC}"
}

# Executar script principal
main