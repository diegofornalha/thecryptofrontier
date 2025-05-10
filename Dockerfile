FROM node:lts

WORKDIR /app

# Instalar PM2 globalmente
RUN npm install -g pm2

# Copiar arquivos do projeto
COPY . .

# Instalar dependências com flags para ignorar problemas comuns
RUN npm install --legacy-peer-deps --omit=optional --ignore-scripts

# Expor a porta 3000
EXPOSE 3000

# Iniciar com PM2 
CMD ["pm2-runtime", "npm", "--", "run", "dev:3200"] 