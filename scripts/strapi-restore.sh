#!/bin/bash

# Script de Restauração de Backup para Strapi
# Autor: Guardian
# Data: 2025-06-15
# Descrição: Restaura backups do Strapi incluindo banco de dados, uploads e configurações

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${PROJECT_ROOT}/backups"
TEMP_RESTORE_DIR="/tmp/strapi_restore_$$"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Verificar se está rodando dentro do container ou no host
check_environment() {
    if [ -f /.dockerenv ]; then
        error "Este script deve ser executado no host, não dentro de um container Docker"
        exit 1
    fi
}

# Listar backups disponíveis
list_backups() {
    echo -e "\n${CYAN}=== Backups Disponíveis ===${NC}"
    
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
    
    # Solicitar seleção
    while true; do
        read -p "Selecione o número do backup para restaurar (1-${#BACKUPS[@]}) ou 'q' para sair: " SELECTION
        
        if [[ "$SELECTION" == "q" || "$SELECTION" == "Q" ]]; then
            echo "Operação cancelada."
            exit 0
        fi
        
        if [[ "$SELECTION" =~ ^[0-9]+$ ]] && [ "$SELECTION" -ge 1 ] && [ "$SELECTION" -le ${#BACKUPS[@]} ]; then
            SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
            break
        else
            error "Seleção inválida. Por favor, escolha um número entre 1 e ${#BACKUPS[@]}"
        fi
    done
    
    echo -e "\n${GREEN}Backup selecionado:${NC} $(basename "$SELECTED_BACKUP")"
}

# Extrair backup
extract_backup() {
    log "Extraindo backup..."
    
    # Criar diretório temporário
    mkdir -p "$TEMP_RESTORE_DIR"
    
    # Extrair arquivo ZIP
    unzip -q "$SELECTED_BACKUP" -d "$TEMP_RESTORE_DIR"
    
    if [ $? -eq 0 ]; then
        success "Backup extraído com sucesso"
        
        # Encontrar o diretório do backup (deve ser o timestamp)
        BACKUP_CONTENT_DIR=$(find "$TEMP_RESTORE_DIR" -maxdepth 1 -type d | grep -v "^$TEMP_RESTORE_DIR$" | head -1)
        
        if [ -z "$BACKUP_CONTENT_DIR" ]; then
            error "Estrutura do backup inválida"
            cleanup_temp
            exit 1
        fi
    else
        error "Falha ao extrair backup"
        cleanup_temp
        exit 1
    fi
}

# Ler metadados do backup
read_metadata() {
    log "Lendo metadados do backup..."
    
    METADATA_FILE="${BACKUP_CONTENT_DIR}/metadata.json"
    
    if [ -f "$METADATA_FILE" ]; then
        info "Informações do backup:"
        echo -e "${CYAN}Data do backup:${NC} $(jq -r '.date' "$METADATA_FILE" 2>/dev/null || echo "Desconhecida")"
        echo -e "${CYAN}Componentes:${NC}"
        
        # Verificar componentes disponíveis
        HAS_DATABASE=$(jq -r '.components.database' "$METADATA_FILE" 2>/dev/null || echo "false")
        HAS_UPLOADS=$(jq -r '.components.uploads' "$METADATA_FILE" 2>/dev/null || echo "false")
        HAS_CONFIGS=$(jq -r '.components.configs' "$METADATA_FILE" 2>/dev/null || echo "false")
        HAS_API=$(jq -r '.components.api' "$METADATA_FILE" 2>/dev/null || echo "false")
        HAS_COMPONENTS=$(jq -r '.components.components' "$METADATA_FILE" 2>/dev/null || echo "false")
        
        [ "$HAS_DATABASE" == "true" ] && echo "  ✓ Banco de dados"
        [ "$HAS_UPLOADS" == "true" ] && echo "  ✓ Arquivos de upload"
        [ "$HAS_CONFIGS" == "true" ] && echo "  ✓ Configurações"
        [ "$HAS_API" == "true" ] && echo "  ✓ Tipos de conteúdo (API)"
        [ "$HAS_COMPONENTS" == "true" ] && echo "  ✓ Componentes"
    else
        warning "Arquivo de metadados não encontrado. Continuando com detecção automática..."
    fi
}

# Confirmar restauração
confirm_restore() {
    echo -e "\n${YELLOW}⚠️  ATENÇÃO: A restauração irá sobrescrever os dados atuais!${NC}"
    echo "Certifique-se de ter um backup dos dados atuais antes de continuar."
    echo ""
    
    while true; do
        read -p "Deseja continuar com a restauração? (s/N): " CONFIRM
        case $CONFIRM in
            [Ss]* ) 
                log "Restauração confirmada pelo usuário"
                break
                ;;
            [Nn]* | "" )
                echo "Restauração cancelada."
                cleanup_temp
                exit 0
                ;;
            * )
                echo "Por favor, responda 's' para sim ou 'n' para não."
                ;;
        esac
    done
}

# Parar containers
stop_containers() {
    log "Parando containers Docker..."
    
    cd "${PROJECT_ROOT}/strapi"
    
    if [ -f "docker-compose-v4.yml" ]; then
        docker-compose -f docker-compose-v4.yml down
        success "Containers parados"
    else
        warning "docker-compose-v4.yml não encontrado, tentando parar containers individualmente..."
        docker stop strapi-v4-cms strapi-postgres 2>/dev/null || true
    fi
}

# Restaurar banco de dados
restore_database() {
    if [ ! -f "${BACKUP_CONTENT_DIR}/database.sql.gz" ]; then
        warning "Backup do banco de dados não encontrado, pulando..."
        return
    fi
    
    log "Restaurando banco de dados..."
    
    # Iniciar apenas o container do PostgreSQL
    cd "${PROJECT_ROOT}/strapi"
    docker-compose -f docker-compose-v4.yml up -d strapi-postgres
    
    # Aguardar PostgreSQL ficar pronto
    log "Aguardando PostgreSQL ficar pronto..."
    sleep 10
    
    # Verificar se está pronto
    MAX_ATTEMPTS=30
    ATTEMPT=0
    while ! docker exec strapi-postgres pg_isready -U strapi > /dev/null 2>&1; do
        ATTEMPT=$((ATTEMPT + 1))
        if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
            error "PostgreSQL não ficou pronto a tempo"
            return 1
        fi
        sleep 2
    done
    
    # Descomprimir e restaurar banco
    log "Importando dados do banco..."
    gunzip -c "${BACKUP_CONTENT_DIR}/database.sql.gz" | docker exec -i strapi-postgres psql -U strapi -d strapi_v4
    
    if [ $? -eq 0 ]; then
        success "Banco de dados restaurado com sucesso"
    else
        error "Falha ao restaurar banco de dados"
        return 1
    fi
}

# Restaurar uploads
restore_uploads() {
    if [ ! -f "${BACKUP_CONTENT_DIR}/uploads.tar.gz" ]; then
        warning "Backup de uploads não encontrado, pulando..."
        return
    fi
    
    log "Restaurando arquivos de upload..."
    
    UPLOADS_DIR="${PROJECT_ROOT}/strapi/app/public"
    
    # Criar diretório se não existir
    mkdir -p "$UPLOADS_DIR"
    
    # Remover uploads existentes
    if [ -d "$UPLOADS_DIR/uploads" ]; then
        warning "Removendo uploads existentes..."
        rm -rf "$UPLOADS_DIR/uploads"
    fi
    
    # Extrair uploads
    tar -xzf "${BACKUP_CONTENT_DIR}/uploads.tar.gz" -C "$UPLOADS_DIR"
    
    if [ $? -eq 0 ]; then
        success "Uploads restaurados com sucesso"
        
        # Ajustar permissões
        chmod -R 755 "$UPLOADS_DIR/uploads"
    else
        error "Falha ao restaurar uploads"
        return 1
    fi
}

# Restaurar configurações
restore_configs() {
    if [ ! -f "${BACKUP_CONTENT_DIR}/configs.tar.gz" ]; then
        warning "Backup de configurações não encontrado, pulando..."
        return
    fi
    
    log "Restaurando configurações..."
    
    # Extrair para diretório temporário
    TEMP_CONFIG_DIR="${TEMP_RESTORE_DIR}/configs_extract"
    mkdir -p "$TEMP_CONFIG_DIR"
    tar -xzf "${BACKUP_CONTENT_DIR}/configs.tar.gz" -C "$TEMP_CONFIG_DIR"
    
    # Mostrar configurações disponíveis
    echo -e "\n${CYAN}Configurações disponíveis para restauração:${NC}"
    find "$TEMP_CONFIG_DIR" -type f -name "*.js" -o -name "*.json" -o -name ".env" | while read file; do
        REL_PATH=${file#$TEMP_CONFIG_DIR/configs/}
        echo "  - $REL_PATH"
    done
    
    echo ""
    read -p "Restaurar todas as configurações? (s/N): " RESTORE_CONFIGS
    
    if [[ "$RESTORE_CONFIGS" =~ ^[Ss]$ ]]; then
        # Copiar configurações
        cp -r "$TEMP_CONFIG_DIR/configs/"* "$PROJECT_ROOT/" 2>/dev/null
        success "Configurações restauradas"
    else
        info "Restauração de configurações pulada"
    fi
}

# Restaurar tipos de conteúdo
restore_content_types() {
    RESTORED=false
    
    # Restaurar API
    if [ -f "${BACKUP_CONTENT_DIR}/api.tar.gz" ]; then
        log "Restaurando tipos de conteúdo (API)..."
        
        read -p "Restaurar tipos de conteúdo (API)? Isso sobrescreverá os tipos existentes (s/N): " RESTORE_API
        
        if [[ "$RESTORE_API" =~ ^[Ss]$ ]]; then
            # Fazer backup do diretório atual
            if [ -d "${PROJECT_ROOT}/strapi/app/api" ]; then
                mv "${PROJECT_ROOT}/strapi/app/api" "${PROJECT_ROOT}/strapi/app/api.bak.$(date +%s)"
            fi
            
            # Extrair API
            tar -xzf "${BACKUP_CONTENT_DIR}/api.tar.gz" -C "${PROJECT_ROOT}/strapi/app"
            success "Tipos de conteúdo (API) restaurados"
            RESTORED=true
        fi
    fi
    
    # Restaurar componentes
    if [ -f "${BACKUP_CONTENT_DIR}/components.tar.gz" ]; then
        log "Restaurando componentes..."
        
        read -p "Restaurar componentes? Isso sobrescreverá os componentes existentes (s/N): " RESTORE_COMPONENTS
        
        if [[ "$RESTORE_COMPONENTS" =~ ^[Ss]$ ]]; then
            # Fazer backup do diretório atual
            if [ -d "${PROJECT_ROOT}/strapi/app/components" ]; then
                mv "${PROJECT_ROOT}/strapi/app/components" "${PROJECT_ROOT}/strapi/app/components.bak.$(date +%s)"
            fi
            
            # Extrair componentes
            tar -xzf "${BACKUP_CONTENT_DIR}/components.tar.gz" -C "${PROJECT_ROOT}/strapi/app"
            success "Componentes restaurados"
            RESTORED=true
        fi
    fi
    
    if [ "$RESTORED" = true ]; then
        warning "Você precisará reconstruir o Strapi após restaurar tipos de conteúdo"
    fi
}

# Iniciar containers
start_containers() {
    log "Iniciando containers Docker..."
    
    cd "${PROJECT_ROOT}/strapi"
    
    if [ -f "docker-compose-v4.yml" ]; then
        docker-compose -f docker-compose-v4.yml up -d
        
        # Aguardar Strapi ficar pronto
        log "Aguardando Strapi inicializar..."
        sleep 30
        
        # Verificar se está rodando
        if docker ps | grep -q "strapi-v4-cms"; then
            success "Containers iniciados com sucesso"
            info "Strapi disponível em: http://localhost:1338"
        else
            error "Falha ao iniciar Strapi"
            docker-compose -f docker-compose-v4.yml logs --tail=50
        fi
    else
        error "docker-compose-v4.yml não encontrado"
    fi
}

# Limpar arquivos temporários
cleanup_temp() {
    if [ -d "$TEMP_RESTORE_DIR" ]; then
        log "Limpando arquivos temporários..."
        rm -rf "$TEMP_RESTORE_DIR"
    fi
}

# Função principal
main() {
    echo -e "${BLUE}=== Script de Restauração do Strapi ===${NC}"
    
    # Verificações iniciais
    check_environment
    
    # Listar e selecionar backup
    list_backups
    
    # Extrair backup selecionado
    extract_backup
    
    # Ler metadados
    read_metadata
    
    # Confirmar restauração
    confirm_restore
    
    # Parar containers
    stop_containers
    
    # Executar restaurações
    restore_database
    restore_uploads
    restore_configs
    restore_content_types
    
    # Reiniciar containers
    start_containers
    
    # Limpar temporários
    cleanup_temp
    
    echo -e "\n${GREEN}✓ Restauração concluída!${NC}"
    echo -e "\n${CYAN}Próximos passos:${NC}"
    echo "1. Verifique se o Strapi está funcionando corretamente"
    echo "2. Teste o login no admin panel"
    echo "3. Verifique se os conteúdos foram restaurados"
    echo "4. Se restaurou tipos de conteúdo, pode ser necessário reconstruir o Strapi"
}

# Executar script principal
main