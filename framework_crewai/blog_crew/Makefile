# Makefile para CrewAI Blog Pipeline Docker

.PHONY: help build up down logs status shell pipeline clean

# Cores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

help: ## Mostra esta ajuda
	@echo "$(GREEN)CrewAI Blog Pipeline - Comandos Docker$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Constrói a imagem Docker
	@echo "$(GREEN)🔨 Construindo imagem Docker...$(NC)"
	docker compose build

up: ## Inicia os containers em modo daemon
	@echo "$(GREEN)🚀 Iniciando containers...$(NC)"
	docker compose up -d

down: ## Para e remove os containers
	@echo "$(RED)🛑 Parando containers...$(NC)"
	docker compose down

logs: ## Mostra os logs do container principal
	@echo "$(GREEN)📋 Logs do container principal:$(NC)"
	docker compose logs -f blog-crew

logs-monitor: ## Mostra os logs do monitor
	@echo "$(GREEN)📊 Logs do monitor:$(NC)"
	docker compose logs -f blog-crew-monitor

status: ## Mostra o status dos containers
	@echo "$(GREEN)📊 Status dos containers:$(NC)"
	docker compose ps

shell: ## Acessa o shell do container principal
	@echo "$(GREEN)🐚 Acessando shell do container...$(NC)"
	docker compose run --rm blog-crew shell

pipeline: ## Executa o pipeline para 10 artigos (padrão)
	@echo "$(GREEN)🔄 Executando pipeline para 10 artigos...$(NC)"
	docker compose run --rm blog-crew once

pipeline-1: ## Executa o pipeline para 1 artigo
	@echo "$(GREEN)🔄 Processando 1 artigo...$(NC)"
	docker compose run --rm -e ARTICLE_LIMIT=1 blog-crew once

pipeline-5: ## Executa o pipeline para 5 artigos
	@echo "$(GREEN)🔄 Processando 5 artigos...$(NC)"
	docker compose run --rm -e ARTICLE_LIMIT=5 blog-crew once

pipeline-images: ## Executa o pipeline com geração de imagens
	@echo "$(GREEN)🖼️  Executando pipeline com imagens...$(NC)"
	docker compose run --rm -e GENERATE_IMAGES=true blog-crew once

clean: ## Remove volumes e limpa dados
	@echo "$(RED)🗑️  Limpando volumes e dados...$(NC)"
	docker compose down -v
	rm -f processed_articles.json strapi_assets.json
	rm -rf src/pipelines/simple/posts_processados/*
	rm -rf src/pipelines/simple/posts_imagens/*

restart: down up ## Reinicia os containers

rebuild: down build up ## Reconstrói e reinicia tudo

monitor: ## Abre o monitor no navegador
	@echo "$(GREEN)🌐 Abrindo monitor em http://localhost:8080$(NC)"
	@open http://localhost:8080 || xdg-open http://localhost:8080 || echo "Acesse: http://localhost:8080"

test: ## Testa a configuração
	@echo "$(GREEN)🧪 Testando configuração...$(NC)"
	@docker compose run --rm blog-crew python -c "import os; print('✅ strapi_PROJECT_ID:', 'OK' if os.getenv('strapi_PROJECT_ID') else '❌ MISSING')"
	@docker compose run --rm blog-crew python -c "import os; print('✅ OPENAI_API_KEY:', 'OK' if os.getenv('OPENAI_API_KEY') else '❌ MISSING')"
	@docker compose run --rm blog-crew python -c "import os; print('✅ GEMINI_API_KEY:', 'OK' if os.getenv('GEMINI_API_KEY') else '❌ MISSING')"