# 📝 Correção de Permissões de Logs no Docker

## Problema
Containers rodando com usuários não-root não conseguem escrever em diretórios criados como root.

## Soluções

### 1. Criar diretório com ownership correto (RECOMENDADO)
```dockerfile
# Criar diretórios com ownership correto
RUN mkdir -p logs /workspace && \
    chown -R nodejs:nodejs /app/logs /workspace
```

### 2. Usar volume com permissões
```yaml
# docker-compose.yml
volumes:
  - ./logs:/app/logs:rw
  
# Criar diretório local com permissões
mkdir -p logs && chmod 777 logs
```

### 3. Criar diretório temporário no container
```dockerfile
# Usar /tmp que sempre tem permissão de escrita
ENV LOG_DIR=/tmp/logs
RUN mkdir -p $LOG_DIR
```

### 4. Usar stdout/stderr ao invés de arquivos
```javascript
// Ao invés de escrever em arquivo
fs.writeFileSync('/app/logs/app.log', message);

// Use console que vai para Docker logs
console.log(message);
console.error(error);

// Visualizar com:
// docker logs container-name
```

## Por que não afeta o funcionamento?

1. **Logs são opcionais**: O agente funciona sem gravar logs em arquivo
2. **Fallback para console**: Erros vão para stderr capturado pelo Docker
3. **Health check independente**: Usa processo Node, não depende de logs
4. **Funcionalidade principal intacta**: O serviço HTTP continua respondendo

## Melhores Práticas

### ✅ Faça:
- Use volumes para dados persistentes
- Configure ownership no Dockerfile
- Use `docker logs` para debugging
- Considere logging centralizado (ELK, Fluentd)

### ❌ Evite:
- chmod 777 em produção
- Rodar containers como root
- Ignorar erros de permissão
- Logs excessivos em containers

## Exemplo Corrigido

```dockerfile
# Dockerfile
FROM node:20-alpine

# Criar usuário
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar arquivos
COPY --chown=nodejs:nodejs . .

# Criar diretórios COM ownership correto
RUN mkdir -p logs && \
    chown -R nodejs:nodejs /app

# Mudar para usuário
USER nodejs

# Agora pode escrever logs!
CMD ["node", "app.js"]
```

## Monitoramento sem Arquivos

```javascript
// Use estrutura de logs JSON
console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'claude-code-specialist',
    message: 'Service started',
    version: '4.1.0'
}));

// Docker captura automaticamente
// docker logs --follow container-name | jq
```

## Volumes Persistentes

```yaml
# docker-compose.yml
services:
  claude-code-specialist:
    volumes:
      # Logs persistentes com permissões
      - type: volume
        source: specialist-logs
        target: /app/logs
      # Ou bind mount
      - ./logs:/app/logs:rw
    
volumes:
  specialist-logs:
    driver: local
```

## Debug de Permissões

```bash
# Ver permissões dentro do container
docker exec container-name ls -la /app/

# Ver usuário rodando
docker exec container-name whoami

# Testar escrita
docker exec container-name touch /app/logs/test.log

# Ver processos e seus usuários
docker exec container-name ps aux
```