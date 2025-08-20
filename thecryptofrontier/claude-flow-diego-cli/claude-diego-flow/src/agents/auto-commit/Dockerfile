# Dockerfile para Auto Commit Agent
FROM node:18-alpine

# Instalar git e openssh
RUN apk add --no-cache git openssh-client

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY src/agents/auto-commit ./src/agents/auto-commit
COPY src/core ./src/core
COPY src/services ./src/services
COPY src/utils ./src/utils

# Criar diretório para chaves SSH
RUN mkdir -p /app/.diego-tools && chmod 700 /app/.diego-tools

# Compilar TypeScript
RUN npm run build || npx tsc

# Expor porta do dashboard
EXPOSE 3030

# Volume para o projeto a ser monitorado
VOLUME ["/workspace"]

# Volume para persistência de dados
VOLUME ["/app/.diego-tools"]

# Variáveis de ambiente
ENV PROJECT_PATH=/workspace
ENV DASHBOARD_PORT=3030
ENV NODE_ENV=production

# Comando padrão
CMD ["node", "dist/agents/auto-commit/cli.js"]