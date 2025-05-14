FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Instalar dependências adicionais (Algolia, etc)
RUN pip install --no-cache-dir algoliasearch "sanity-io>=0.10.0" backoff

# Copiar o código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p posts_para_traduzir posts_traduzidos posts_formatados posts_publicados

# Expor a porta que o Streamlit usa
EXPOSE 8501

# Definir variáveis de ambiente
ENV PYTHONUNBUFFERED=1

# Comando para iniciar a aplicação
CMD ["streamlit", "run", "app_modular.py", "--server.port=8501", "--server.address=0.0.0.0"]