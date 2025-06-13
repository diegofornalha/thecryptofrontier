# 🔑 Variáveis de Ambiente - Blog Crew

## 📋 Visão Geral

O Blog Crew usa um arquivo `.env` para gerenciar todas as configurações sensíveis e chaves de API.

## 🔧 Configuração

### Arquivo .env

O sistema carrega automaticamente as variáveis do arquivo `.env` usando `python-dotenv`.

### Variáveis Necessárias

| Variável | Descrição | Obrigatória | Exemplo |
|----------|-----------|-------------|---------|
| `OPENAI_API_KEY` | Chave da API OpenAI para DALL-E | ✅ | sk-... |
| `GOOGLE_API_KEY` | Chave da API Google para Gemini | ✅ | AIza... |
| `SANITY_PROJECT_ID` | ID do projeto Sanity | ✅ | z4sx85c6 |
| `SANITY_API_TOKEN` | Token de escrita do Sanity | ✅ | sk... |
| `SANITY_DATASET` | Dataset do Sanity | ✅ | production |
| `ALGOLIA_APP_ID` | ID da aplicação Algolia | ⚠️ | 42TZW... |
| `ALGOLIA_API_KEY` | Chave de admin Algolia | ⚠️ | d0cb5... |
| `ALGOLIA_INDEX_NAME` | Nome do índice Algolia | ⚠️ | development_mcpx_content |

**Legenda**: ✅ = Obrigatória | ⚠️ = Opcional (para sincronização com Algolia)

## 🔄 Sincronização

### Script de Sincronização
```bash
# Sincronizar .env do diretório pai
./sync_env.sh
```

### Localização do .env

1. **Diretório do Blog Crew**: `/blog_crew/.env`
2. **Diretório Principal**: `/thecryptofrontier/.env` (fonte)

## 📊 Dashboard Streamlit

O dashboard carrega automaticamente o `.env`:

```python
from dotenv import load_dotenv
load_dotenv()  # Carrega .env automaticamente
```

### Verificar Variáveis no Dashboard

1. Abra o dashboard: `./run_dashboard.sh`
2. Vá para a aba "⚙️ Configuração"
3. Veja o status de cada variável
4. Use "🔄 Recarregar .env" se fizer alterações

## 🚀 Uso nos Pipelines

### run_pipeline.py
```python
# Carrega automaticamente do .env
load_dotenv()

# Verifica se estão configuradas
if not os.getenv("OPENAI_API_KEY"):
    logger.error("OPENAI_API_KEY não configurada!")
```

### simple_pipeline.py
```python
# Também usa .env
load_dotenv()

# Acessa as variáveis
api_key = os.getenv("GOOGLE_API_KEY")
```

### Cron (daily_pipeline.sh)
```bash
# O cron pode sobrescrever algumas variáveis
export ALGOLIA_API_KEY="..."  # Opcional

# Mas o Python ainda carrega do .env
python run_pipeline.py
```

## 🛡️ Segurança

### Boas Práticas

1. **Nunca commitar .env**: Está no `.gitignore`
2. **Use .env.example**: Para documentar variáveis necessárias
3. **Rotação de chaves**: Troque periodicamente
4. **Permissões**: `chmod 600 .env` (apenas owner)

### Exemplo de .env
```env
# API Keys
OPENAI_API_KEY=sk-proj-abc123...
GOOGLE_API_KEY=AIzaSyB...

# Sanity
SANITY_PROJECT_ID=z4sx85c6
SANITY_API_TOKEN=skRW...
SANITY_DATASET=production

# Algolia (opcional)
ALGOLIA_APP_ID=42TZWHW8UP
ALGOLIA_API_KEY=d0cb55ec...
ALGOLIA_INDEX_NAME=development_mcpx_content
```

## 🔍 Troubleshooting

### Variável não carregando?

1. **Verificar arquivo**:
   ```bash
   cat .env | grep VARIAVEL_NAME
   ```

2. **Recarregar no Python**:
   ```python
   load_dotenv(override=True)
   ```

3. **Debug no dashboard**:
   - Clique em "🔄 Recarregar .env"
   - Verifique o caminho mostrado

### Erro de permissão?

```bash
# Ajustar permissões
chmod 644 .env  # Leitura para todos
# ou
chmod 600 .env  # Apenas owner
```

---

**Nota**: O dashboard e todos os pipelines usam o mesmo `.env`, garantindo consistência!