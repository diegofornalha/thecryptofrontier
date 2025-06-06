# Makefile para Blog Crew Docker

# Variáveis
DOCKER_COMPOSE = docker compose
PROJECT_NAME = blog-crew

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help build up down logs shell clean pipeline monitor status

help: ## Mostra esta ajuda
	@echo "$(GREEN)Blog Crew - Comandos Docker$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Constrói as imagens Docker
	@echo "$(GREEN)Construindo imagens...$(NC)"
	$(DOCKER_COMPOSE) build

up: ## Inicia os containers
	@echo "$(GREEN)Iniciando containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Blog Crew rodando!$(NC)"

down: ## Para os containers
	@echo "$(YELLOW)Parando containers...$(NC)"
	$(DOCKER_COMPOSE) down

logs: ## Mostra logs dos containers
	$(DOCKER_COMPOSE) logs -f

shell: ## Acessa o shell do container principal
	@echo "$(GREEN)Acessando shell do blog-crew...$(NC)"
	$(DOCKER_COMPOSE) exec blog-crew /bin/bash

clean: ## Limpa volumes e containers
	@echo "$(RED)Limpando tudo...$(NC)"
	$(DOCKER_COMPOSE) down -v
	rm -rf posts_*/

pipeline: ## Executa o pipeline uma vez
	@echo "$(GREEN)Executando pipeline...$(NC)"
	$(DOCKER_COMPOSE) run --rm blog-crew python run_pipeline.py --limit 3 --clean

pipeline-1: ## Processa apenas 1 artigo
	@echo "$(GREEN)Processando 1 artigo...$(NC)"
	$(DOCKER_COMPOSE) run --rm blog-crew python run_pipeline.py --limit 1 --clean

pipeline-10: ## Processa 10 artigos
	@echo "$(GREEN)Processando 10 artigos...$(NC)"
	$(DOCKER_COMPOSE) run --rm blog-crew python run_pipeline.py --limit 10 --clean

monitor: ## Inicia o monitor RSS
	@echo "$(GREEN)Iniciando monitor RSS...$(NC)"
	$(DOCKER_COMPOSE) --profile monitor up -d blog-crew-monitor

status: ## Mostra status dos containers
	@echo "$(GREEN)Status dos containers:$(NC)"
	$(DOCKER_COMPOSE) ps

restart: ## Reinicia os containers
	@echo "$(YELLOW)Reiniciando containers...$(NC)"
	$(DOCKER_COMPOSE) restart

env-example: ## Cria arquivo .env de exemplo
	@echo "$(GREEN)Criando .env.example...$(NC)"
	@echo "# API Keys" > .env.example
	@echo "OPENAI_API_KEY=sk-..." >> .env.example
	@echo "GOOGLE_API_KEY=..." >> .env.example
	@echo "" >> .env.example
	@echo "# Sanity" >> .env.example
	@echo "SANITY_PROJECT_ID=brby2yrg" >> .env.example
	@echo "SANITY_API_TOKEN=sk..." >> .env.example
	@echo "SANITY_DATASET=production" >> .env.example
	@echo "" >> .env.example
	@echo "# Algolia (opcional)" >> .env.example
	@echo "ALGOLIA_APP_ID=..." >> .env.example
	@echo "ALGOLIA_API_KEY=..." >> .env.example
	@echo "ALGOLIA_INDEX_NAME=..." >> .env.example
	@echo "$(GREEN)✅ Arquivo .env.example criado!$(NC)"