# 📝 Comandos Úteis - Monitor RSS

## 🚀 Controle do Monitor (Método Principal)

### Iniciar o monitor
```bash
./start_monitor.sh start
```

### Parar o monitor
```bash
./start_monitor.sh stop
```

### Verificar status
```bash
./start_monitor.sh status
```

### Reiniciar o monitor
```bash
./start_monitor.sh restart
```

## 📺 Usando Screen (Sessões Interativas)

### Criar nova sessão screen
```bash
screen -S rss_monitor
```

### Dentro do screen, rodar o monitor
```bash
python rss_monitor.py
```

### Sair do screen mantendo o processo
```
Pressione: Ctrl+A, depois D
```

### Voltar para a sessão screen
```bash
screen -r rss_monitor
```

### Listar todas as sessões screen
```bash
screen -ls
```

### Matar uma sessão screen
```bash
screen -X -S rss_monitor quit
```

## 📊 Monitoramento de Logs

### Ver logs em tempo real
```bash
tail -f rss_monitor.log
```

### Ver últimas 50 linhas
```bash
tail -n 50 rss_monitor.log
```

### Buscar erros nos logs
```bash
grep ERROR rss_monitor.log
```

### Ver apenas novos artigos encontrados
```bash
grep "Novo artigo encontrado" rss_monitor.log
```

## 🔍 Verificação de Processos

### Ver se o monitor está rodando
```bash
ps aux | grep rss_monitor
```

### Ver PID do monitor
```bash
cat rss_monitor.pid
```

### Matar o processo manualmente (emergência)
```bash
kill $(cat rss_monitor.pid)
```

## 📁 Arquivos Importantes

### Ver artigos já processados
```bash
cat processed_articles.json | jq .
```

### Limpar lista de artigos processados (CUIDADO!)
```bash
rm processed_articles.json
```

### Ver log de inicialização
```bash
cat monitor_startup.log
```

## 🔧 Troubleshooting

### Se o monitor não iniciar
```bash
# Verificar se há outro processo rodando
ps aux | grep rss_monitor

# Remover arquivo PID órfão
rm -f rss_monitor.pid

# Tentar iniciar novamente
./start_monitor.sh start
```

### Para debug detalhado
```bash
# Rodar manualmente para ver erros
python rss_monitor.py
```

## ⚡ Comandos Rápidos

### Status completo do sistema
```bash
echo "=== STATUS DO MONITOR ==="
./start_monitor.sh status
echo -e "\n=== ÚLTIMOS LOGS ==="
tail -n 10 rss_monitor.log
echo -e "\n=== ARTIGOS PROCESSADOS ==="
cat processed_articles.json | jq '.guids | length' 2>/dev/null || echo "0"
```

### Reiniciar e acompanhar logs
```bash
./start_monitor.sh restart && tail -f rss_monitor.log
```