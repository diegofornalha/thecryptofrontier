# 📅 Instruções de Configuração do Cron

## Estado Atual

### Pipeline em Execução
- **Script**: `run_pipeline.py` (pipeline unificado com imagens)
- **Horário**: 21:00 (9 PM) São Paulo
- **Frequência**: Diário
- **Artigos**: 10 por execução

### Como Mudar o Pipeline

#### Opção 1: Pipeline Padrão (Atual)
```bash
# Em daily_pipeline.sh
python run_pipeline.py --limit 10
```
- ✅ Imagens integradas
- ✅ CrewAI completo
- ✅ Publicação automática

#### Opção 2: Pipeline Otimizado (Recomendado)
```bash
# Em daily_pipeline.sh
python run_pipeline_enhanced.py --limit 10
```
- ✅ Todas funcionalidades do padrão
- ✅ Health checks automáticos
- ✅ Retry com backoff
- ✅ Processamento paralelo
- ✅ Dashboard de métricas
- ✅ Logging estruturado

#### Opção 3: Pipeline Legado (Anterior)
```bash
# Em daily_pipeline.sh
python main_auto_with_queue.py
```
- ⚠️ Sistema antigo
- ⚠️ Processamento sequencial

## 🔧 Como Atualizar o Cron

### 1. Editar Script
```bash
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew
nano daily_pipeline.sh
```

### 2. Mudar para Pipeline Otimizado
Altere linha 28 para:
```bash
python run_pipeline_enhanced.py --limit 10
```

### 3. Recarregar Cron
```bash
# Instalar nova configuração
crontab crontab_config

# Verificar
crontab -l
```

## 📊 Monitoramento

### Logs do Pipeline
```bash
# Ver execução em tempo real
tail -f pipeline.log

# Ver últimas execuções
tail -n 100 pipeline.log
```

### Verificar Última Execução
```bash
# Ver quando rodou
grep "Pipeline de blog iniciado" pipeline.log | tail -5

# Ver resultados
grep "artigos processados com sucesso" pipeline.log | tail -5
```

## 🚀 Recomendações

### Para Produção
1. **Use `run_pipeline_enhanced.py`** - Mais robusto e confiável
2. **Configure alertas** - Adicione notificações de falha
3. **Monitore métricas** - Verifique dashboard diariamente

### Ajustar Horário
```bash
# Editar crontab_config
# Mudar de 21:00 para 08:00
0 8 * * * export TZ="America/Sao_Paulo" && /home/strapi/thecryptofrontier/framework_crewai/blog_crew/daily_pipeline.sh
```

### Ajustar Quantidade
```bash
# Em daily_pipeline.sh
# Processar 20 artigos ao invés de 10
python run_pipeline_enhanced.py --limit 20
```

## ⚠️ Importante

- O cron roda com usuário `strapi`
- Certifique-se que `.env` tem todas as chaves
- Pipeline otimizado requer mais memória (~2GB)
- Logs são rotacionados automaticamente

---

**Status**: Pipeline atualizado de `main_auto_with_queue.py` → `run_pipeline.py` ✅