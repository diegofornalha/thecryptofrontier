# Docker MCP - Exemplos Práticos

## 🚀 Exemplos Rápidos para Começar

### 1. Nginx Simples

**Comando no Claude**:
```
Crie um servidor nginx na porta 8080
```

**Resultado**: Container nginx rodando em http://localhost:8080

### 2. Aplicação Node.js

**Comando no Claude**:
```
Crie um container com Node.js 20, monte o diretório atual em /app e rode npm start na porta 3000
```

### 3. Banco de Dados PostgreSQL

**Comando no Claude**:
```
Crie um PostgreSQL com usuário "admin", senha "secretpass" e database "myapp" na porta 5432
```

## 📦 Exemplos com Docker Compose

### 1. WordPress + MySQL

**Comando no Claude**:
```
Crie um WordPress completo com MySQL, use senhas seguras e exponha na porta 8000
```

**docker-compose.yml gerado**:
```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8000:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wp_secure_pass_123
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wp_secure_pass_123
      MYSQL_ROOT_PASSWORD: root_secure_pass_456
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
```

### 2. Stack MEAN (MongoDB, Express, Angular, Node)

**Comando no Claude**:
```
Crie uma aplicação MEAN stack com MongoDB, backend Node.js na porta 3000 e frontend Angular na porta 4200
```

### 3. Aplicação Python Flask + Redis

**Comando no Claude**:
```
Faça deploy de uma aplicação Flask com Redis para cache, 
use Python 3.11 e exponha a API na porta 5000
```

**docker-compose.yml gerado**:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    volumes:
      - .:/app

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 🔍 Debugging e Monitoramento

### 1. Verificar Logs de Erro

**Comando no Claude**:
```
O container "minha-api" está falhando. Mostre os últimos logs e me ajude a resolver
```

### 2. Listar Containers com Problemas

**Comando no Claude**:
```
Liste todos os containers e identifique quais estão com erro ou parados
```

### 3. Monitorar Recursos

**Comando no Claude**:
```
Mostre o status de todos os containers incluindo uso de CPU e memória
```

## 🎯 Casos de Uso Avançados

### 1. Microserviços com API Gateway

**Comando no Claude**:
```
Crie uma arquitetura de microserviços com:
- API Gateway (Kong ou Traefik) na porta 80
- Serviço de autenticação
- Serviço de produtos
- Banco PostgreSQL
- Cache Redis
```

### 2. Ambiente de Desenvolvimento Completo

**Comando no Claude**:
```
Configure um ambiente de desenvolvimento com:
- PostgreSQL para banco principal
- Redis para cache
- Elasticsearch para busca
- Kibana para visualização
- MinIO para storage S3-compatible
```

### 3. CI/CD Local

**Comando no Claude**:
```
Monte um ambiente CI/CD local com:
- GitLab CE
- GitLab Runner
- Registry Docker privado
- SonarQube para análise de código
```

## 💡 Dicas e Truques

### 1. Reutilizar Configurações

**Salve suas composições favoritas**:
```
Salve essa configuração do WordPress como "wp-template" para eu usar depois
```

### 2. Cleanup Automático

**Limpe recursos não utilizados**:
```
Remova todos os containers parados e imagens não utilizadas
```

### 3. Backup de Volumes

**Faça backup dos dados**:
```
Crie um backup do volume do banco de dados PostgreSQL
```

### 4. Configurações de Rede

**Crie redes customizadas**:
```
Crie uma rede Docker chamada "app-network" e conecte os containers web e db nela
```

## 🎨 Templates Prontos

### Template: API REST + Banco

```
Deploy uma API REST com:
- Node.js com Express
- PostgreSQL
- Adminer para gerenciar o banco
- Documentação Swagger
```

### Template: E-commerce

```
Crie um e-commerce com:
- Frontend React
- Backend Node.js
- MongoDB
- Redis para sessões
- Nginx como proxy reverso
```

### Template: Blog

```
Monte um blog com:
- Ghost CMS
- MySQL
- Nginx com SSL
- Backup automático
```

## 🚨 Troubleshooting Comum

### Porta já em uso

**Comando**:
```
A porta 3000 está em uso. Liste quem está usando e sugira uma alternativa
```

### Container não inicia

**Comando**:
```
O container "app" fica reiniciando. Investigue o problema
```

### Problemas de permissão

**Comando**:
```
Estou tendo erro de permissão ao montar volumes. Como resolver?
```

### Falta de espaço

**Comando**:
```
Limpe imagens e containers não utilizados para liberar espaço
```

## 📊 Monitoramento e Métricas

### Exemplo com Prometheus + Grafana

**Comando no Claude**:
```
Configure monitoramento completo com:
- Prometheus para coletar métricas
- Grafana para visualização
- Alertmanager para notificações
- Node Exporter para métricas do host
```

### Logs Centralizados

**Comando no Claude**:
```
Configure ELK stack (Elasticsearch, Logstash, Kibana) para centralizar logs de todos os containers
```

---

💡 **Dica**: Sempre que precisar de algo específico, seja detalhado no pedido. O Claude pode gerar configurações complexas baseadas em suas necessidades!

📚 **Nota**: Estes são apenas exemplos. O Docker MCP pode lidar com praticamente qualquer configuração Docker/Docker Compose que você precisar.