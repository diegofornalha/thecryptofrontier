# Mem0 API Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Skip build - use tsx for runtime
# RUN npm run build

# Expose port
EXPOSE 8000

# Start the application with tsx - using simple version
CMD ["npx", "tsx", "src/index-simple.ts"]