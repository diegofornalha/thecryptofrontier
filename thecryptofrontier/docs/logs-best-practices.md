# 📋 Melhores Práticas para Logs em Docker

## Solução Implementada

### 1. Script de Setup (scripts/setup-logs.sh)
- Cria diretório com permissões 755
- Define ownership para UID 1001 (nodejs user)
- Inicializa arquivo de log com permissões 644

### 2. Volume Persistente
```yaml
volumes:
  - ./logs:/app/logs
```

## Melhorias Futuras

### 1. Rotação de Logs
```bash
# Adicionar ao crontab do host
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/guardian-logs

# /etc/logrotate.d/guardian-logs
/home/strapi/thecryptofrontier/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 1001 1001
}
```

### 2. Logs Estruturados (JSON)
```javascript
// Ao invés de texto simples
console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'guardian',
    message: 'Service started',
    metadata: { version: '1.0.0' }
}));
```

### 3. Centralização de Logs
```yaml
# docker-compose com logging driver
services:
  guardian:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Monitoramento
```bash
# Script de monitoramento
#!/bin/bash
# monitor-logs.sh

LOG_FILE="/home/strapi/thecryptofrontier/logs/guardian.log"
ERROR_COUNT=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo 0)

if [ $ERROR_COUNT -gt 10 ]; then
    echo "⚠️ Alto número de erros detectado: $ERROR_COUNT"
    # Enviar alerta (email, Slack, etc)
fi
```

### 5. Logs por Serviço
```bash
# Estrutura recomendada
logs/
├── guardian.log
├── claude-code-specialist.log
├── nextjs-specialist.log
├── strapi-specialist.log
└── cleanup-specialist.log
```

## Comandos Úteis

```bash
# Ver logs em tempo real
tail -f logs/guardian.log

# Buscar erros
grep -i error logs/*.log

# Contar ocorrências
grep -c "pattern" logs/guardian.log

# Logs das últimas 24h
find logs/ -name "*.log" -mtime -1 -exec grep "ERROR" {} \;

# Tamanho dos logs
du -sh logs/

# Limpar logs antigos
find logs/ -name "*.log" -mtime +30 -delete
```

## Troubleshooting

### Problema: Permission Denied
```bash
# Verificar ownership
ls -la logs/

# Corrigir
sudo chown -R 1001:1001 logs/
```

### Problema: Disco cheio
```bash
# Ver uso
df -h

# Limpar logs
> logs/guardian.log  # Truncar arquivo
```

### Problema: Container não escreve logs
```bash
# Verificar usuário do container
docker exec guardian whoami

# Verificar permissões dentro do container
docker exec guardian ls -la /app/logs/
```