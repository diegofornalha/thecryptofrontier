FROM node:18

# Set working directory
WORKDIR /app

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (PostgreSQL client will be used instead of better-sqlite3)
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p public/uploads

# Build the application
RUN npm run build

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:1337/admin || exit 1

# Start the application
CMD ["npm", "start"] 