#!/bin/bash
# Workflow automatizado com Claude CLI

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Claude CLI Blog Agent - Workflow Automatizado${NC}"
echo "================================================"

# Diretório de tarefas
TASKS_DIR="/home/strapi/thecryptofrontier/claude-agents/tasks"
mkdir -p "$TASKS_DIR/processed"

# Função para criar post
create_post() {
    local topic="$1"
    echo -e "\n${YELLOW}📝 Criando tarefa para: $topic${NC}"
    
    # Executa Python para criar tarefa
    python3 /home/strapi/thecryptofrontier/claude-agents/claude_cli_blog_agent.py <<EOF
$topic
EOF
    
    # Encontra o arquivo de tarefa mais recente
    TASK_FILE=$(ls -t $TASKS_DIR/create_post_*.md | head -1)
    
    if [ -f "$TASK_FILE" ]; then
        echo -e "${GREEN}✅ Tarefa criada: $TASK_FILE${NC}"
        echo -e "\n${YELLOW}Conteúdo da tarefa:${NC}"
        echo "-----------------------------------"
        cat "$TASK_FILE"
        echo "-----------------------------------"
        
        echo -e "\n${BLUE}🚀 Próximos passos:${NC}"
        echo "1. Copie o conteúdo acima"
        echo "2. Cole no Claude CLI"
        echo "3. Salve o resultado JSON no arquivo de output especificado"
        echo "4. O monitor publicará automaticamente no Strapi"
    fi
}

# Função para monitorar outputs
monitor_outputs() {
    echo -e "\n${YELLOW}👀 Monitorando outputs do Claude...${NC}"
    echo "(Pressione Ctrl+C para parar)"
    
    python3 -c "
import asyncio
from claude_cli_blog_agent import monitor_outputs
asyncio.run(monitor_outputs())
"
}

# Menu principal
show_menu() {
    echo -e "\n${BLUE}Escolha uma opção:${NC}"
    echo "1) Criar novo post"
    echo "2) Monitorar outputs"
    echo "3) Listar tarefas pendentes"
    echo "4) Listar posts processados"
    echo "5) Sair"
    
    read -p "Opção: " choice
    
    case $choice in
        1)
            read -p "Digite o tópico do post: " topic
            create_post "$topic"
            show_menu
            ;;
        2)
            monitor_outputs
            ;;
        3)
            echo -e "\n${YELLOW}📋 Tarefas pendentes:${NC}"
            ls -la $TASKS_DIR/*.md 2>/dev/null || echo "Nenhuma tarefa pendente"
            show_menu
            ;;
        4)
            echo -e "\n${GREEN}✅ Posts processados:${NC}"
            ls -la $TASKS_DIR/processed/*.json 2>/dev/null || echo "Nenhum post processado"
            show_menu
            ;;
        5)
            echo -e "${GREEN}Até logo!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida${NC}"
            show_menu
            ;;
    esac
}

# Inicia o menu
show_menu