#!/bin/bash

echo "Script de migração do PM2 para Docker"
echo "======================================"

# Função para encerrar processo que está usando uma porta específica
stop_process_on_port() {
    local port=$1
    echo "Verificando processos na porta $port..."
    
    # Encontrar o PID do processo usando a porta
    pid=$(lsof -t -i:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo "Encontrado processo PID $pid usando a porta $port. Encerrando..."
        kill -9 $pid
        sleep 1
        echo "Processo encerrado."
    else
        echo "Nenhum processo encontrado usando a porta $port."
    fi
}

# Verificar se o PM2 está instalado
if command -v pm2 &> /dev/null; then
    echo "PM2 está instalado. Verificando processos em execução..."
    
    # Listar processos PM2
    pm2 list
    
    # Parar todos os processos PM2 relacionados ao projeto
    echo "Parando processos PM2 relacionados ao The Crypto Frontier..."
    pm2 stop all
    
    # Salvar a lista de processos (opcional, para referência)
    pm2 save
    
    echo "Processos PM2 parados com sucesso."
    
    # Perguntar se deseja desinstalar o PM2
    read -p "Deseja desinstalar o PM2? (s/n): " resposta
    
    if [[ "$resposta" == "s" || "$resposta" == "S" ]]; then
        echo "Desinstalando o PM2..."
        npm uninstall -g pm2
        echo "PM2 desinstalado com sucesso."
    fi
else
    echo "PM2 não está instalado neste sistema."
fi

# Encerrar processos que possam estar usando as portas necessárias
echo "Encerrando processos que possam estar usando as portas necessárias..."
stop_process_on_port 3200  # Porta para o serviço Next.js
stop_process_on_port 9080  # Porta HTTP do Caddy
stop_process_on_port 9443  # Porta HTTPS do Caddy

# Verificar se o Docker está instalado e rodando
if command -v docker &> /dev/null; then
    echo "Docker está instalado. Verificando se está rodando..."
    
    if docker info &> /dev/null; then
        echo "Docker está rodando. Verificando se o Docker Compose está instalado..."
        
        if command -v docker-compose &> /dev/null; then
            echo "Docker Compose está instalado."
            
            # Parar quaisquer contêineres antigos do projeto
            echo "Parando quaisquer contêineres antigos..."
            docker-compose down
            
            # Iniciar os serviços com Docker Compose
            echo "Iniciando serviços com Docker Compose..."
            if docker-compose up -d; then
                echo "Serviços iniciados com sucesso via Docker Compose."
                
                # Verificar se os contêineres estão realmente em execução
                echo "Verificando status dos contêineres..."
                docker-compose ps
                
                # Dar tempo para os serviços inicializarem
                echo "Aguardando 10 segundos para os serviços inicializarem..."
                sleep 10
                
                # Verificar se o serviço principal está respondendo
                if curl -s http://localhost:3200 > /dev/null; then
                    echo "Serviço principal está acessível em http://localhost:3200"
                else
                    echo "AVISO: Serviço principal não está respondendo em http://localhost:3200"
                    echo "Verifique os logs com: docker-compose logs tenant1-frontier"
                fi
            else
                echo "ERRO: Falha ao iniciar os serviços com Docker Compose."
                echo "Verifique se não há conflitos de porta ou outros problemas."
                exit 1
            fi
        else
            echo "ERRO: Docker Compose não está instalado. Por favor, instale-o e tente novamente."
            exit 1
        fi
    else
        echo "ERRO: Docker não está rodando. Por favor, inicie o serviço Docker e tente novamente."
        exit 1
    fi
else
    echo "ERRO: Docker não está instalado. Por favor, instale o Docker e tente novamente."
    exit 1
fi

echo ""
echo "Migração concluída!"
echo "Para verificar o status dos contêineres, execute: docker-compose ps"
echo "Para visualizar os logs, execute: docker-compose logs -f"
echo ""
echo "=======================================" 