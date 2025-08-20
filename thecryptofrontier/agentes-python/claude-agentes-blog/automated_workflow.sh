#!/bin/bash
# Workflow automatizado com Agentes Híbridos (Claude/Gemini)

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
RED='\033[0;31m'

echo -e "${BLUE}🤖 Agente de Blog Híbrido - Workflow Automatizado${NC}"
echo "================================================"

# Diretório de tarefas (mantido para compatibilidade, pode ser removido se não for mais usado)
TASKS_DIR="/home/strapi/thecryptofrontier/claude-agents/tasks"
mkdir -p "$TASKS_DIR/processed"

# Função para criar post
create_post() {
    local llm_choice="$1"
    local topic="$2"
    local keywords="$3"
    echo -e "\n${YELLOW}📝 Criando tarefa para: $topic usando ${llm_choice}${NC}"
    
    # Executa Python para criar tarefa usando o agente híbrido
    python3 /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog/simple_hybrid_blog_agent.py "$llm_choice" "$topic" "$keywords"
    
    echo -e "${GREEN}✅ Processo de criação de post concluído.${NC}"
}

# Menu principal
show_menu() {
    echo -e "\n${BLUE}Escolha uma opção:${NC}"
    echo "1) Criar novo post"
    echo "2) Listar tarefas pendentes (legado)"
    echo "3) Listar posts processados (legado)"
    echo "4) Sair"
    
    read -p "Opção: " choice
    
    case $choice in
        1)
            read -p "Escolha o LLM (gemini/claude): " llm_choice
            if [[ "$llm_choice" != "gemini" && "$llm_choice" != "claude" ]]; then
                echo -e "${RED}Escolha de LLM inválida. Use 'gemini' ou 'claude'.${NC}"
                show_menu
                return
            fi
            read -p "Digite o tópico do post: " topic
            read -p "Digite as palavras-chave (separadas por vírgula): " keywords
            create_post "$llm_choice" "$topic" "$keywords"
            show_menu
            ;;
        2)
            echo -e "\n${YELLOW}📋 Tarefas pendentes (legado):${NC}"
            ls -la $TASKS_DIR/*.md 2>/dev/null || echo "Nenhuma tarefa pendente"
            show_menu
            ;;
        3)
            echo -e "\n${GREEN}✅ Posts processados (legado):${NC}"
            ls -la $TASKS_DIR/processed/*.json 2>/dev/null || echo "Nenhum post processado"
            show_menu
            ;;
        4)
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
