# 🔧 Otimização dos Mecanismos de Ativação Automática

## Situação Atual

O sistema possui 3 mecanismos de ativação que estão se sobrepondo:

1. **RSS Monitor** - Verifica feeds a cada 10 minutos
2. **Cron Job Diário** - Executa às 21:00
3. **Systemd Service** - Configurado mas não ativo

## Recomendação de Configuração

### Opção 1: RSS Monitor como Principal (RECOMENDADO)

Esta opção processa artigos em tempo quase real, ideal para um portal de notícias.

#### 1. Parar o monitor atual e corrigir PID:
```bash
# Parar o processo atual
kill $(cat rss_monitor.pid)

# Atualizar com o PID correto se ainda estiver rodando
ps aux | grep rss_monitor.py
echo "NOVO_PID" > rss_monitor.pid
```

#### 2. Habilitar o serviço systemd:
```bash
# Copiar o arquivo de serviço
sudo cp /home/strapi/thecryptofrontier/framework_crewai/blog_crew/systemd/rss-monitor.service /etc/systemd/system/

# Atualizar caminhos no arquivo
sudo nano /etc/systemd/system/rss-monitor.service

# Habilitar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable rss-monitor
sudo systemctl start rss-monitor
sudo systemctl status rss-monitor
```

#### 3. Modificar crontab para apenas manutenção:
```bash
crontab -e
```

Remover a linha do pipeline diário e manter apenas:
```cron
# Limpeza semanal - Domingos às 3:00 AM
0 3 * * 0 cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew && python delete_strapi_duplicates.py >> /home/strapi/logs/cleanup.log 2>&1

# Limpeza de logs antigos - Diariamente às 2:00 AM
0 2 * * * cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew && ./clean_old_logs.sh >> /home/strapi/logs/cleanup.log 2>&1

# Sincronização Strapi-Algolia - Domingos às 4:00 AM
0 4 * * 0 cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew && python sync_strapi_to_algolia.py >> /home/strapi/logs/sync.log 2>&1
```

### Opção 2: Cron Job como Principal

Esta opção dá mais controle sobre quando processar artigos.

#### 1. Parar o RSS Monitor:
```bash
kill $(cat rss_monitor.pid)
rm rss_monitor.pid
```

#### 2. Otimizar crontab para múltiplas execuções:
```bash
crontab -e
```

```cron
# Pipeline 3x ao dia - 8:00, 14:00, 21:00 (horário São Paulo)
0 8,14,21 * * * cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew && ./daily_pipeline.sh >> /home/strapi/logs/pipeline.log 2>&1

# Limpeza e manutenção continuam iguais...
```

## Pipeline Unificado Recomendado

### Consolidar em um único script principal:

```bash
#!/bin/bash
# unified_pipeline.sh

cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew

# Configurar ambiente
export TZ='America/Sao_Paulo'
source venv/bin/activate

# Variável para tipo de execução
MODE=${1:-"auto"}  # auto, manual, completo

case $MODE in
  "auto")
    # Pipeline automático com CrewAI + Imagens
    python main_auto.py
    ;;
  "manual")
    # Pipeline manual sem CrewAI
    python pipeline_manual.py
    ;;
  "completo")
    # Pipeline completo com todas as etapas
    python pipeline_completo.py
    ;;
  *)
    echo "Modo inválido. Use: auto, manual ou completo"
    exit 1
    ;;
esac

# Sempre fazer limpeza após execução
python clean_json_files.py

# Sincronizar com Algolia se houver novos posts
if [ -d "posts_publicados" ] && [ "$(ls -A posts_publicados)" ]; then
    python sync_direct_algolia.py
fi
```

## Monitoramento e Logs

### Estrutura de logs recomendada:
```
/home/strapi/logs/
├── rss-monitor/
│   ├── monitor.log      # Log principal do RSS Monitor
│   └── monitor.error    # Erros do RSS Monitor
├── pipeline/
│   ├── pipeline.log     # Log do pipeline
│   └── pipeline.error   # Erros do pipeline
├── cleanup.log          # Logs de limpeza
└── sync.log            # Logs de sincronização
```

### Rotação de logs:
```bash
# /etc/logrotate.d/crewai
/home/strapi/logs/*/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0644 strapi strapi
}
```

## Verificação de Saúde

### Script de monitoramento:
```bash
#!/bin/bash
# health_check.sh

# Verificar se o RSS Monitor está rodando (se escolhido)
if systemctl is-active --quiet rss-monitor; then
    echo "✅ RSS Monitor está ativo"
else
    echo "❌ RSS Monitor está inativo"
fi

# Verificar últimos posts processados
LAST_PROCESSED=$(find posts_publicados -type f -name "*.json" -mtime -1 | wc -l)
echo "📊 Posts processados nas últimas 24h: $LAST_PROCESSED"

# Verificar espaço em disco
DISK_USAGE=$(df -h /home/strapi | tail -1 | awk '{print $5}')
echo "💾 Uso de disco: $DISK_USAGE"

# Verificar logs de erro
ERRORS_TODAY=$(grep -c "ERROR" /home/strapi/logs/pipeline/pipeline.log 2>/dev/null || echo "0")
echo "⚠️  Erros hoje: $ERRORS_TODAY"
```

## Decisão Final

Recomendo usar a **Opção 1 (RSS Monitor via systemd)** porque:
- ✅ Processa notícias em tempo quase real
- ✅ Mais adequado para um portal de notícias
- ✅ Systemd garante alta disponibilidade
- ✅ Logs estruturados e rotação automática

Para implementar, siga os passos da Opção 1 acima.