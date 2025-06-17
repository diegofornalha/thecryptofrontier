FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    git \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de requisitos
COPY requirements*.txt ./

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements-base.txt

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs \
    src/pipelines/simple/posts_processados \
    src/pipelines/simple/posts_imagens

# Dar permissões de execução aos scripts
RUN chmod +x scripts/shell/*.sh

# Criar arquivo de log do cron
RUN touch /var/log/cron.log

# Configurar cron job
RUN echo "0 20 * * * cd /app && python src/pipelines/simple/simple_pipeline.py >> /var/log/cron.log 2>&1" | crontab -

# Expor porta para monitoramento (opcional)
EXPOSE 8080

# Script de entrada
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]