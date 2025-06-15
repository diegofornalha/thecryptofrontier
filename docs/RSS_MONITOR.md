# Monitor RSS - The Crypto Basic

Sistema de monitoramento contínuo do feed RSS do The Crypto Basic que verifica novos artigos a cada 10 minutos e processa automaticamente.

## 🚀 Como Usar

### Iniciar o Monitor

```bash
# Método 1: Script de controle
./start_monitor.sh start

# Método 2: Direto
python rss_monitor.py
```

### Comandos do Script de Controle

```bash
./start_monitor.sh start    # Inicia o monitor em background
./start_monitor.sh stop     # Para o monitor
./start_monitor.sh restart  # Reinicia o monitor
./start_monitor.sh status   # Verifica status
```

## 📋 Funcionamento

1. **Polling a cada 10 minutos**: Verifica o feed RSS automaticamente
2. **Controle de duplicatas**: Armazena GUIDs processados em `processed_articles.json`
3. **Conversão de timezone**: Converte UTC para horário de Brasília (UTC-3)
4. **Processamento automático**: Executa `run_pipeline.py` quando encontra novos artigos
5. **Logs detalhados**: Salva logs em `rss_monitor.log`

## 🗂️ Arquivos Importantes

- `rss_monitor.py`: Script principal do monitor
- `processed_articles.json`: Armazena GUIDs de artigos já processados
- `rss_monitor.log`: Log de execução do monitor
- `rss_monitor.pid`: PID do processo em execução
- `start_monitor.sh`: Script de controle do serviço

## 🔧 Configuração

No arquivo `rss_monitor.py`:
- `polling_interval`: Intervalo entre verificações (padrão: 600 segundos = 10 minutos)
- `feed_url`: URL do feed RSS (configurado para The Crypto Basic)
- `brazil_tz_offset`: Offset do fuso horário de Brasília (UTC-3)

## 📊 Logs

Acompanhar logs em tempo real:
```bash
tail -f rss_monitor.log
```

## 🛠️ Instalação como Serviço (Opcional)

Para executar automaticamente no boot:

```bash
# Criar serviço systemd
python monitor_service.py --install-service

# Ativar serviço
systemctl --user enable rss-monitor.service
systemctl --user start rss-monitor.service
```

## ⚠️ Notas Importantes

- O monitor processa TODOS os artigos novos encontrados de uma vez
- Artigos processados não são reprocessados (baseado no GUID)
- Se o pipeline falhar, os artigos NÃO são marcados como processados
- O monitor continua rodando mesmo se houver erros no processamento