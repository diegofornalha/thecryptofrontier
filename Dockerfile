FROM node:lts

WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Instalar dependências com flags para ignorar problemas comuns
RUN npm install --legacy-peer-deps --omit=optional --ignore-scripts

# Expor a porta 3000
EXPOSE 3000

# Iniciar diretamente com npm
CMD ["npm", "run", "dev:3200"] 