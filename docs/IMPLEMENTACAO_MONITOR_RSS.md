# 📚 Implementação do Monitor RSS - Documentação Completa

## 🎯 Objetivo do Projeto

Criar um sistema de monitoramento contínuo do feed RSS do The Crypto Basic que:
- Verifica automaticamente novos artigos a cada 10 minutos
- Processa apenas artigos não publicados anteriormente
- Executa o pipeline completo de tradução e publicação
- Funciona 24/7 sem intervenção manual

## 🔧 Arquivos Criados

### 1. `rss_monitor.py` - Monitor Principal
Script Python que implementa o loop de monitoramento contínuo.

**Funcionalidades:**
- Classe `RSSMonitor` com toda a lógica de monitoramento
- Verifica feed RSS a cada 10 minutos (configurável)
- Armazena GUIDs processados em `processed_articles.json`
- Converte timestamps UTC para horário de Brasília (UTC-3)
- Executa `run_pipeline.py` quando encontra novos artigos
- Sistema de logs detalhado
- Tratamento de erros com retry automático

**Fluxo de execução:**
```
1. Carrega artigos já processados
2. Entra em loop infinito:
   a. Verifica feed RSS
   b. Compara com GUIDs já processados
   c. Se encontrar novos artigos:
      - Executa pipeline
      - Marca como processados
   d. Aguarda 10 minutos
   e. Repete
```

### 2. `start_monitor.sh` - Script de Controle
Script bash para gerenciar o monitor como um serviço.

**Comandos disponíveis:**
- `start` - Inicia o monitor em background usando `nohup`
- `stop` - Para o monitor usando o PID salvo
- `restart` - Reinicia o monitor
- `status` - Mostra se está rodando e o PID

**Características:**
- Salva PID em `rss_monitor.pid`
- Logs de startup em `monitor_startup.log`
- Verifica se já está rodando antes de iniciar
- Mantém processo ativo após desconexão SSH

### 3. `monitor_service.py` - Instalador de Serviço
Script para criar configuração systemd do monitor.

**Funcionalidades:**
- Gera arquivo `.service` para systemd
- Configura reinicialização automática em caso de falha
- Define diretórios de trabalho e logs
- Permite execução como serviço do sistema

### 4. `RSS_MONITOR.md` - Documentação de Uso
Guia rápido de como usar o monitor RSS.

**Conteúdo:**
- Instruções de inicialização
- Explicação do funcionamento
- Arquivos importantes
- Configurações disponíveis
- Opções de instalação

### 5. `MONITOR_COMMANDS.md` - Referência de Comandos
Lista completa de comandos úteis para gerenciar o monitor.

**Seções:**
- Controle do monitor
- Uso do screen
- Monitoramento de logs
- Verificação de processos
- Troubleshooting
- Comandos rápidos

## 🚀 Como o Sistema Funciona

### 1. Detecção de Novos Artigos
```python
def check_new_articles(self) -> List[Dict]:
    # 1. Faz parse do feed RSS
    feed = feedparser.parse(self.feed_url)
    
    # 2. Para cada entrada no feed:
    for entry in feed.entries:
        guid = entry.get('id')
        
        # 3. Verifica se já foi processado
        if guid not in self.processed_guids:
            # 4. Converte horário UTC → Brasília
            pub_date_br = self.convert_to_brazil_time(pub_date_utc)
            
            # 5. Adiciona à lista de novos
            new_articles.append(article_info)
```

### 2. Processamento de Artigos
```python
def process_new_articles(self, articles: List[Dict]):
    # 1. Executa pipeline do CrewAI
    subprocess.run(["python", "run_pipeline.py"])
    
    # 2. Marca artigos como processados
    for article in articles:
        self.processed_guids.add(article['guid'])
    
    # 3. Salva estado atualizado
    self.save_processed_articles()
```

### 3. Controle de Duplicatas
O arquivo `processed_articles.json` mantém registro de todos os artigos já processados:
```json
{
  "guids": [
    "https://thecryptobasic.com/?p=12345",
    "https://thecryptobasic.com/?p=12346"
  ],
  "last_update": "2025-05-23T16:21:04"
}
```

## 📊 Logs e Monitoramento

### Arquivos de Log
- `rss_monitor.log` - Log principal do monitor
- `monitor_startup.log` - Log de inicialização
- `rss_monitor_error.log` - Erros (quando usando systemd)

### Exemplo de Logs
```
2025-05-23 16:21:04 - INFO - Verificando novos artigos...
2025-05-23 16:21:04 - INFO - Novo artigo encontrado: Bitcoin Hits New ATH
2025-05-23 16:21:04 - INFO - Publicado em: 23/05/2025 13:35:39 (Brasília)
2025-05-23 16:21:04 - INFO - Iniciando pipeline do CrewAI...
```

## 🔄 Integração com Pipeline Existente

O monitor se integra perfeitamente com o pipeline existente:

1. **Monitor detecta novos artigos** → Chama `run_pipeline.py`
2. **Pipeline processa normalmente**:
   - Lê feeds RSS
   - Traduz artigos
   - Formata para Strapi
   - Publica no CMS
   - Sincroniza com Algolia

## 🛡️ Tratamento de Erros

### Erros de Rede
- Retry automático após 1 minuto
- Logs detalhados do erro
- Continua tentando indefinidamente

### Erros no Pipeline
- Artigos NÃO são marcados como processados se houver erro
- Serão tentados novamente no próximo ciclo
- Logs completos em `rss_monitor.log`

## 🔧 Configurações

### No arquivo `rss_monitor.py`:
```python
self.polling_interval = 600  # 10 minutos
self.brazil_tz_offset = timedelta(hours=-3)  # UTC-3
```

### Variáveis de Ambiente Necessárias:
- `strapi_API_TOKEN`
- `strapi_PROJECT_ID`
- `ALGOLIA_APP_ID`
- `ALGOLIA_ADMIN_API_KEY`
- `ALGOLIA_INDEX_NAME`

## 📈 Melhorias Futuras Possíveis

1. **Notificações**:
   - Enviar email/Telegram quando publicar
   - Alertas de erro

2. **Dashboard**:
   - Interface web para monitorar status
   - Estatísticas de publicação

3. **Configuração Dinâmica**:
   - Alterar intervalo sem reiniciar
   - Adicionar/remover feeds

4. **Otimização**:
   - Processar apenas artigos detectados (não reprocessar todo feed)
   - Cache mais inteligente

## 🚨 Solução de Problemas

### Monitor não inicia
```bash
# Verificar se já está rodando
ps aux | grep rss_monitor

# Remover PID órfão
rm -f rss_monitor.pid

# Tentar novamente
./start_monitor.sh start
```

### Artigos duplicados
```bash
# Verificar arquivo de controle
cat processed_articles.json

# Em caso extremo, limpar e recomeçar
rm processed_articles.json
./start_monitor.sh restart
```

### Logs crescendo muito
```bash
# Rotacionar logs manualmente
mv rss_monitor.log rss_monitor.log.old
./start_monitor.sh restart
```

## 📝 Resumo

O sistema implementado resolve completamente a necessidade de monitoramento contínuo:
- ✅ Verifica feed automaticamente a cada 10 minutos
- ✅ Processa apenas artigos novos
- ✅ Continua rodando após desconexão SSH
- ✅ Logs detalhados para debug
- ✅ Múltiplas opções de execução (script, screen, systemd)
- ✅ Integração perfeita com pipeline existente

O monitor está atualmente **ATIVO** e processando artigos automaticamente!