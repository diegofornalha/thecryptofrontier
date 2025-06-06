# Dockerfile para Blog Crew
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    curl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Atualizar pip
RUN pip install --no-cache-dir --upgrade pip

# Copiar arquivos de requisitos primeiro (para cache do Docker)
COPY requirements.txt .
COPY pyproject.toml .

# Instalar dependências Python em camadas para melhor cache
# Primeiro instalar dependências mais estáveis
RUN pip install --no-cache-dir \
    requests \
    python-dotenv \
    pydantic \
    redis \
    Pillow

# Depois instalar outras dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código do projeto
COPY . .

# Criar diretórios necessários
RUN mkdir -p posts_para_traduzir \
    posts_traduzidos \
    posts_formatados \
    posts_com_imagem \
    posts_publicados \
    posts_imagens \
    logs

# Definir variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1
ENV TZ=America/Sao_Paulo

# Copiar script de entrada
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


# Definir entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Comando padrão
CMD ["python", "run_pipeline.py", "--limit", "3"]