# The Crypto Frontier - Docker Setup

## 🐳 Executando com Docker

Este projeto está configurado para rodar em Docker, oferecendo melhor isolamento, portabilidade e facilidade de deploy.

## 📋 Pré-requisitos

- Docker instalado e rodando
- Docker Compose (geralmente vem com Docker)

## 🚀 Início Rápido

### 1. Build da imagem
```bash
./docker-start.sh build
```

### 2. Iniciar o container
```bash
./docker-start.sh start
```

### 3. Verificar status
```bash
./docker-start.sh status
```

## 📖 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `./docker-start.sh build` | Constrói a imagem Docker |
| `./docker-start.sh start` | Inicia o container |
| `./docker-start.sh stop` | Para o container |
| `./docker-start.sh restart` | Reinicia o container |
| `./docker-start.sh logs` | Mostra logs em tempo real |
| `./docker-start.sh status` | Mostra status e recursos |
| `./docker-start.sh clean` | Limpa containers não utilizados |

## 🌐 Acessos

- **Local**: http://localhost:3200
- **Produção**: https://thecryptofrontier.agentesintegrados.com

## ⚙️ Configuração

### Variáveis de Ambiente

As principais variáveis são configuradas no `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_STRAPI_PROJECT_ID=z4sx85c6
  - NEXT_PUBLIC_strapi_DATASET=production
  - NEXT_PUBLIC_strapi_API_VERSION=2023-05-03
  - TZ=America/Sao_Paulo
```

### Portas

- **Container**: Porta 3200 (configurada para o Caddy)
- **Host**: Porta 3200 (mapeada automaticamente)

## 🔧 Integração com Caddy

O Caddy já está configurado no `/etc/caddy/Caddyfile` para:

```caddyfile
thecryptofrontier.agentesintegrados.com {
    reverse_proxy 127.0.0.1:3200
}
```

## 📊 Monitoramento

### Verificar logs
```bash
./docker-start.sh logs
```

### Verificar recursos
```bash
./docker-start.sh status
```

### Health Check
O container possui health check automático que verifica:
- Resposta HTTP na porta 3200
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Tentativas: 3

## 🛠️ Desenvolvimento vs Produção

### Produção (atual)
- Build otimizado
- Container isolado
- Restart automático
- Health checks

### Desenvolvimento (opcional)
Para habilitar modo desenvolvimento, descomente as linhas no `docker-compose.yml`:

```yaml
# Descomente para desenvolvimento
thecryptofrontier-dev:
  # ...configurações...
  command: npm run dev
```

## 🔄 Deploy e Atualizações

### Para atualizar o código:
```bash
./docker-start.sh stop
./docker-start.sh build
./docker-start.sh start
```

### Para apenas reiniciar:
```bash
./docker-start.sh restart
```

## 🐛 Troubleshooting

### Container não inicia
```bash
./docker-start.sh logs
```

### Porta ocupada
O script automaticamente para processos na porta 3200, mas você pode verificar manualmente:
```bash
sudo netstat -tlnp | grep :3200
```

### Limpar cache Docker
```bash
./docker-start.sh clean
```

### Reconstruir do zero
```bash
./docker-start.sh stop
./docker-start.sh clean
./docker-start.sh build
./docker-start.sh start
```

## 📋 Vantagens do Docker

✅ **Isolamento**: Ambiente controlado e reproduzível  
✅ **Portabilidade**: Funciona igual em qualquer servidor  
✅ **Facilidade**: Deploy simplificado  
✅ **Recursos**: Controle de CPU/memória  
✅ **Logs**: Centralizados e estruturados  
✅ **Health Checks**: Monitoramento automático  
✅ **Auto-restart**: Recuperação automática de falhas  

## 🆚 Docker vs PM2

| Aspecto | Docker | PM2 |
|---------|--------|-----|
| Isolamento | ✅ Completo | ❌ Compartilha OS |
| Portabilidade | ✅ Total | ⚠️ Depende do ambiente |
| Recursos | ✅ Controlados | ⚠️ Limitado |
| Deploy | ✅ Simples | ⚠️ Manual |
| Rollback | ✅ Fácil | ❌ Complexo |

O Docker oferece melhor controle e portabilidade para produção. 