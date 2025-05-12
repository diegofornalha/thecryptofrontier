#!/bin/bash

# Executar Fluxo Completo - The Crypto Frontier
# Este script executa o fluxo completo de monitoramento, tradução e publicação
# de artigos para o blog The Crypto Frontier

# Definição de cores
COLOR_RESET="\033[0m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_BLUE="\033[34m"
COLOR_MAGENTA="\033[35m"

# Funções de ajuda
print_header() {
    echo -e "${COLOR_MAGENTA}=============================================${COLOR_RESET}"
    echo -e "${COLOR_MAGENTA}${1}${COLOR_RESET}"
    echo -e "${COLOR_MAGENTA}=============================================${COLOR_RESET}"
}

print_step() {
    echo -e "${COLOR_BLUE}[${1}] ${2}${COLOR_RESET}"
}

print_success() {
    echo -e "${COLOR_GREEN}✓ ${1}${COLOR_RESET}"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠ ${1}${COLOR_RESET}"
}

print_error() {
    echo -e "${COLOR_RED}✗ ${1}${COLOR_RESET}"
    return 1
}

# Função para verificar se um comando existe
check_command() {
    command -v "$1" >/dev/null 2>&1 || { 
        print_error "Comando '$1' não encontrado. Verifique a instalação."; 
        exit 1; 
    }
}

# Verificar requisitos
check_requisitos() {
    print_step "VERIFICAÇÃO" "Verificando requisitos..."
    
    # Verificar se o Python está instalado
    check_command python
    check_command python3
    
    # Verificar se o Node.js está instalado
    check_command node
    check_command npm
    
    # Verificar se os diretórios necessários existem
    mkdir -p posts_traduzidos posts_publicados
    
    # Verificar se o arquivo .env existe
    if [ ! -f .env ]; then
        print_error "Arquivo .env não encontrado. Configure as credenciais do Sanity e Algolia."
        exit 1
    fi
    
    print_success "Requisitos verificados com sucesso!"
}

# Função para monitorar feeds RSS e baixar novos artigos
monitorar_feeds() {
    print_header "MONITORAMENTO RSS"
    
    if [ "$1" == "--loop" ]; then
        # Modo loop contínuo
        LOOP_MINUTES=$2
        print_step "MONITORAMENTO" "Iniciando monitoramento em loop a cada ${LOOP_MINUTES} minutos..."
        python main.py --loop "$LOOP_MINUTES"
    else
        # Execução única
        print_step "MONITORAMENTO" "Iniciando monitoramento (execução única)..."
        python main.py
    fi
}

# Função para traduzir artigos pendentes
traduzir_artigos() {
    print_header "TRADUÇÃO DE ARTIGOS"
    print_step "TRADUÇÃO" "Iniciando processo de tradução..."
    
    # Verificar se existem artigos para traduzir
    if [ ! "$(ls -A posts_para_traduzir 2>/dev/null)" ]; then
        print_warning "Nenhum artigo pendente para tradução."
        return 0
    fi
    
    python main.py --traducao
    
    print_success "Processo de tradução concluído!"
}

# Função para publicar artigos traduzidos no Sanity
publicar_artigos() {
    print_header "PUBLICAÇÃO NO SANITY"
    print_step "PUBLICAÇÃO" "Iniciando publicação no Sanity CMS..."
    
    # Verificar se existem artigos traduzidos
    if [ ! "$(ls -A posts_traduzidos 2>/dev/null)" ]; then
        print_warning "Nenhum artigo traduzido para publicar."
        return 0
    fi
    
    node publicar_posts_markdown.js
    
    print_success "Processo de publicação concluído!"
}

# Função para indexar artigos no Algolia
indexar_artigos() {
    print_header "INDEXAÇÃO NO ALGOLIA"
    print_step "INDEXAÇÃO" "Iniciando indexação no Algolia..."
    
    node scripts/indexar-sanity-para-algolia.js
    
    print_success "Processo de indexação concluído!"
}

# Função para executar o fluxo completo
executar_fluxo_completo() {
    print_header "FLUXO COMPLETO INICIADO"
    print_step "FLUXO" "Iniciando execução do fluxo completo..."
    
    # Etapa 1: Monitoramento
    monitorar_feeds
    
    # Etapa 2: Tradução
    traduzir_artigos
    
    # Etapa 3: Publicação
    publicar_artigos
    
    # Etapa 4: Indexação
    indexar_artigos
    
    print_header "FLUXO COMPLETO FINALIZADO"
    print_success "Todas as etapas do fluxo completo foram executadas com sucesso!"
}

# Exibir versão e informações
exibir_info() {
    print_header "THE CRYPTO FRONTIER - AUTOMAÇÃO"
    echo -e "Versão: 1.0.0"
    echo -e "Automação para blog de criptomoedas"
    echo -e ""
    echo -e "Uso:"
    echo -e "  $0                    - Executa o fluxo completo uma vez"
    echo -e "  $0 --monitor [min]    - Executa apenas o monitoramento (--loop para contínuo)"
    echo -e "  $0 --translate        - Executa apenas a tradução de artigos pendentes"
    echo -e "  $0 --publish          - Executa apenas a publicação de artigos traduzidos"
    echo -e "  $0 --index            - Executa apenas a indexação no Algolia"
    echo -e "  $0 --help             - Exibe esta ajuda"
    echo -e ""
}

# Função principal que processa os argumentos
main() {
    # Verificar requisitos
    check_requisitos
    
    # Processar argumentos
    if [ $# -eq 0 ]; then
        # Sem argumentos, executar fluxo completo
        executar_fluxo_completo
    else
        case "$1" in
            --monitor)
                shift
                if [ "$1" == "--loop" ] && [ -n "$2" ]; then
                    monitorar_feeds --loop "$2"
                else
                    monitorar_feeds
                fi
                ;;
            --translate)
                traduzir_artigos
                ;;
            --publish)
                publicar_artigos
                ;;
            --index)
                indexar_artigos
                ;;
            --help)
                exibir_info
                ;;
            *)
                print_error "Opção inválida: $1"
                exibir_info
                exit 1
                ;;
        esac
    fi
}

# Executar função principal com todos os argumentos
main "$@" 