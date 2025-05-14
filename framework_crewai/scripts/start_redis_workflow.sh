#!/bin/bash

# Script para iniciar o fluxo de trabalho Redis com Docker

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções utilitárias
print_header() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verifica se o Docker está instalado e em execução
check_docker() {
    print_header "VERIFICANDO PRÉ-REQUISITOS"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker não encontrado. Por favor, instale o Docker primeiro."
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker não está em execução. Por favor, inicie o serviço Docker."
        return 1
    fi
    
    print_success "Docker está instalado e em execução."
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose não encontrado. Usando docker compose como comando."
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
        print_success "Docker Compose está instalado."
    fi
    
    return 0
}

# Verificar configuração de ambiente
check_env() {
    print_header "VERIFICANDO VARIÁVEIS DE AMBIENTE"
    
    # Verificar arquivo .env
    if [ ! -f ".env" ]; then
        print_warning "Arquivo .env não encontrado. Criando um modelo..."
        
        cat > .env << EOL
# Configuração do Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Configuração do Sanity CMS
# SANITY_PROJECT_ID=seu_id_do_projeto
# SANITY_API_TOKEN=seu_token_da_api

# Configuração do Gemini (para CrewAI)
# GEMINI_API_KEY=sua_chave_api_gemini
EOL
        
        print_success "Arquivo .env criado. Por favor, edite-o com suas credenciais."
        print_warning "Você precisará reiniciar este script após editar o .env"
        return 1
    fi
    
    # Verificar credenciais do Gemini
    if ! grep -q "GEMINI_API_KEY=" .env || grep -q "GEMINI_API_KEY=sua_chave_api_gemini" .env; then
        print_warning "GEMINI_API_KEY não configurada no arquivo .env."
        print_warning "A funcionalidade de IA pode não funcionar corretamente."
    else
        print_success "GEMINI_API_KEY configurada."
    fi
    
    # Verificar credenciais do Sanity
    if ! grep -q "SANITY_PROJECT_ID=" .env || grep -q "SANITY_PROJECT_ID=seu_id_do_projeto" .env; then
        print_warning "SANITY_PROJECT_ID não configurada no arquivo .env."
        print_warning "A publicação para o Sanity CMS pode não funcionar."
    else
        print_success "SANITY_PROJECT_ID configurada."
    fi
    
    return 0
}

# Verifica se o Redis já está em execução
check_redis() {
    print_header "VERIFICANDO SERVIDOR REDIS"
    
    if docker ps | grep -q "redis-crewai-cache"; then
        print_success "Redis já está em execução no container redis-crewai-cache."
        
        # Verificar conexão com nosso script Python
        echo "Testando conexão com o Redis..."
        if python ../tests/test_redis_connection.py > /dev/null; then
            print_success "Conexão com Redis funcionando corretamente."
            return 0
        else
            print_error "Erro na conexão com Redis. Verificando container..."
            if docker logs redis-crewai-cache | grep -q "Ready to accept connections"; then
                print_warning "Container Redis está em execução mas nosso script não consegue conectar."
                print_warning "Verifique a configuração da porta no arquivo redis_tools.py"
                return 1
            else
                print_error "Container Redis apresenta problemas. Reiniciando..."
                docker stop redis-crewai-cache
                docker rm redis-crewai-cache
                return 1
            fi
        fi
    else
        print_warning "Redis não está em execução."
        return 1
    fi
}

# Inicia o Redis com Docker
start_redis() {
    print_header "INICIANDO REDIS COM DOCKER"
    
    # Verificar se Docker Compose está configurado
    if [ -f "../docker/docker-compose.yml" ]; then
        print_success "Arquivo docker-compose.yml encontrado."
        
        echo "Iniciando serviços com Docker Compose..."
        cd ../docker && $DOCKER_COMPOSE up -d redis
        
        if [ $? -eq 0 ]; then
            print_success "Redis iniciado com Docker Compose."
        else
            print_error "Erro ao iniciar Redis com Docker Compose."
            
            # Tentar abordagem alternativa com docker run
            print_warning "Tentando iniciar Redis diretamente com docker run..."
            docker run -d --name redis-crewai-cache -p 6380:6379 redis
            
            if [ $? -eq 0 ]; then
                print_success "Redis iniciado com docker run."
            else
                print_error "Erro ao iniciar Redis com docker run."
                return 1
            fi
        fi
    else
        print_warning "Arquivo docker-compose.yml não encontrado."
        print_warning "Iniciando Redis diretamente com docker run..."
        
        docker run -d --name redis-crewai-cache -p 6380:6379 redis
        
        if [ $? -eq 0 ]; then
            print_success "Redis iniciado com docker run."
        else
            print_error "Erro ao iniciar Redis com docker run."
            return 1
        fi
    fi
    
    # Aguardar inicialização
    echo "Aguardando inicialização do Redis..."
    sleep 5
    
    # Verificar se Redis está em execução
    if docker ps | grep -q "redis-crewai-cache"; then
        print_success "Redis está em execução no container redis-crewai-cache."
        
        # Verificar conexão
        echo "Testando conexão com o Redis..."
        if python ../tests/test_redis_connection.py > /dev/null; then
            print_success "Conexão com Redis funcionando corretamente."
            return 0
        else
            print_error "Falha na conexão com Redis."
            print_error "Verifique os logs do container: docker logs redis-crewai-cache"
            return 1
        fi
    else
        print_error "Redis não foi iniciado corretamente."
        return 1
    fi
}

# Inicia o processador de filas
start_processor() {
    print_header "INICIANDO PROCESSADOR DE FILAS"
    
    # Verificar se Docker Compose está configurado
    if [ -f "../docker/docker-compose.yml" ]; then
        echo "Iniciando processador com Docker Compose..."
        cd ../docker && $DOCKER_COMPOSE up -d queue-processor
        
        if [ $? -eq 0 ]; then
            print_success "Processador de filas iniciado com Docker Compose."
            echo "Logs do processador: docker logs -f crewai-queue-processor"
        else
            print_error "Erro ao iniciar processador com Docker Compose."
            
            # Tentar iniciar manualmente
            print_warning "Tentando iniciar processador manualmente..."
            echo "Executando: python process_article_queue.py --loop 30"
            
            # Iniciar em background ou em outra janela de terminal
            if [ -f "../utils/process_article_queue.py" ]; then
                nohup python ../utils/process_article_queue.py --loop 30 > logs/processor.log 2>&1 &
                PROCESSOR_PID=$!
                echo "Processador iniciado com PID: $PROCESSOR_PID"
                echo "Logs: tail -f logs/processor.log"
                print_success "Processador de filas iniciado manualmente."
            else
                print_error "Arquivo process_article_queue.py não encontrado."
                return 1
            fi
        fi
    else
        print_warning "Arquivo docker-compose.yml não encontrado."
        print_warning "Iniciando processador manualmente..."
        
        # Criar diretório de logs se não existir
        mkdir -p logs
        
        # Iniciar processador
        if [ -f "../utils/process_article_queue.py" ]; then
            nohup python ../utils/process_article_queue.py --loop 30 > logs/processor.log 2>&1 &
            PROCESSOR_PID=$!
            echo "Processador iniciado com PID: $PROCESSOR_PID"
            echo "Logs: tail -f logs/processor.log"
            print_success "Processador de filas iniciado manualmente."
        else
            print_error "Arquivo process_article_queue.py não encontrado."
            return 1
        fi
    fi
    
    return 0
}

# Inicia o Streamlit
start_streamlit() {
    print_header "INICIANDO INTERFACE STREAMLIT"
    
    # Verificar se o arquivo app_modular.py existe
    if [ ! -f "../app_modular.py" ]; then
        print_error "Arquivo app_modular.py não encontrado."
        return 1
    fi
    
    print_warning "Iniciando interface Streamlit..."
    print_warning "Para acessar a interface, abra o navegador em http://localhost:8501"
    
    # Iniciar Streamlit
    if command -v streamlit &> /dev/null; then
        # Iniciar em background ou em outra janela de terminal
        nohup streamlit run ../app_modular.py > logs/streamlit.log 2>&1 &
        STREAMLIT_PID=$!
        echo "Streamlit iniciado com PID: $STREAMLIT_PID"
        echo "Logs: tail -f logs/streamlit.log"
        print_success "Interface Streamlit iniciada."
    else
        print_error "Streamlit não está instalado."
        print_warning "Instalando Streamlit..."
        pip install streamlit
        
        if [ $? -eq 0 ]; then
            print_success "Streamlit instalado."
            # Iniciar em background ou em outra janela de terminal
            nohup streamlit run ../app_modular.py > logs/streamlit.log 2>&1 &
            STREAMLIT_PID=$!
            echo "Streamlit iniciado com PID: $STREAMLIT_PID"
            echo "Logs: tail -f logs/streamlit.log"
            print_success "Interface Streamlit iniciada."
        else
            print_error "Erro ao instalar Streamlit."
            return 1
        fi
    fi
    
    return 0
}

# Função principal
main() {
    print_header "INICIANDO FLUXO DE TRABALHO REDIS + CREWAI"
    
    # Verificar pré-requisitos
    check_docker
    if [ $? -ne 0 ]; then
        print_error "Verifique os pré-requisitos e tente novamente."
        exit 1
    fi
    
    # Verificar ambiente
    check_env
    
    # Verificar Redis
    check_redis
    if [ $? -ne 0 ]; then
        # Se Redis não estiver em execução, iniciar
        start_redis
        if [ $? -ne 0 ]; then
            print_error "Falha ao iniciar Redis. Encerrando script."
            exit 1
        fi
    fi
    
    # Iniciar processador
    start_processor
    
    # Iniciar Streamlit (opcional)
    read -p "Deseja iniciar a interface Streamlit? (s/N): " start_ui
    if [[ "$start_ui" =~ ^([sS]|[sS][iI][mM])$ ]]; then
        start_streamlit
    fi
    
    print_header "SISTEMA INICIADO COM SUCESSO"
    echo -e "Redis em execução: ${GREEN}✅${NC}"
    echo -e "Processador de filas: ${GREEN}✅${NC}"
    
    if [[ "$start_ui" =~ ^([sS]|[sS][iI][mM])$ ]]; then
        echo -e "Interface Streamlit: ${GREEN}✅${NC} (http://localhost:8501)"
    else
        echo -e "Interface Streamlit: ${YELLOW}⚠️ Não iniciada${NC}"
    fi
    
    echo
    echo -e "${BLUE}Para enfileirar artigos manualmente:${NC}"
    echo "python enqueue_demo_article.py -g 3"
    
    echo
    echo -e "${BLUE}Para visualizar logs:${NC}"
    echo "Redis: docker logs redis-crewai-cache"
    echo "Processador: tail -f logs/processor.log"
    
    if [[ "$start_ui" =~ ^([sS]|[sS][iI][mM])$ ]]; then
        echo "Streamlit: tail -f logs/streamlit.log"
    fi
    
    echo
    echo -e "${BLUE}Para parar os serviços:${NC}"
    echo "Redis: docker stop redis-crewai-cache"
    echo "Processador: pkill -f process_article_queue.py"
    
    if [[ "$start_ui" =~ ^([sS]|[sS][iI][mM])$ ]]; then
        echo "Streamlit: pkill -f streamlit"
    fi
    
    echo
    echo -e "${GREEN}Ambiente pronto para uso!${NC}"
}

# Executar a função principal
main