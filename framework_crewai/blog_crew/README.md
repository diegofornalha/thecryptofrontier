# Blog Crew - Sistema de Automação de Blog sobre Criptomoedas

Sistema completo de automação para blog sobre criptomoedas, desde a captura de conteúdo até a publicação final com imagens e metadados.


## 🚀 Pipeline Oficial

### Comando Único
```bash
python run_pipeline.py --limit 10 --clean
```

### Comando Único sem images
```bash
python3 run_pipeline_no_images.py --limit 10 --clean
```

### Opções Disponíveis
- `--limit N` : Número de artigos para processar (padrão: 3)
- `--clean` : Limpa arquivos de execuções anteriores
- `--verbose` : Modo verboso com logs detalhados

## 📋 Fluxo de Trabalho

O sistema executa 5 agentes em sequência:

1. **Monitor RSS** → Captura artigos de feeds configurados
2. **Tradutor** → Traduz para português brasileiro (Gemini)
3. **Formatador** → Prepara conteúdo para Sanity CMS
4. **Gerador de Imagens** → Cria imagens com DALL-E 3
5. **Publicador** → Publica no Sanity com categorias e tags

### Fluxo de Dados
```
posts_para_traduzir/ → posts_traduzidos/ → posts_formatados/ → posts_com_imagem/ → posts_publicados/
```

## 🛠️ Configuração

### Variáveis de Ambiente Necessárias
```env
OPENAI_API_KEY=sk-...          # Para DALL-E 3
GOOGLE_API_KEY=...             # Para Gemini (tradução)
SANITY_PROJECT_ID=brby2yrg     # Projeto Sanity
SANITY_API_TOKEN=sk...         # Token do Sanity
ALGOLIA_APP_ID=...             # (Opcional) Para busca
ALGOLIA_API_KEY=...            # (Opcional) Para busca
```

### Configuração de Feeds RSS
Edite `feeds.json` para adicionar/remover feeds:
```json
{
  "feeds": [
    {
      "name": "The Crypto Basic",
      "url": "https://thecryptobasic.com/feed/",
      "language": "en",
      "category": "crypto",
      "priority": 1
    }
  ]
}
```

### Geração de Imagens
- Resolução: 1792x1024 (16:9)
- Estilo: Fundo preto, grid azul, logos 3D volumétricos
- Detecta automaticamente criptomoedas para visual apropriado

### Filtros e Blacklist
- Remove conteúdo patrocinado automaticamente
- Verifica duplicatas antes de processar
- Palavras bloqueadas: "sponsored", "advertisement", etc.

## 📁 Estrutura do Projeto

```
blog_crew/
├── run_pipeline.py        # Pipeline principal (USE ESTE!)
├── crew.py               # Configuração dos agentes
├── agents/               # Implementação dos 5 agentes
├── tasks/                # Definição das tarefas
├── tools/                # Ferramentas disponíveis
├── config/               # Configurações do sistema
├── models/               # Modelos de dados (Pydantic)
├── feeds.json            # Configuração dos feeds RSS
└── legacy/               # Scripts antigos (não usar)
```

## 🔧 Comandos Úteis

### Execução Básica
```bash
# Processar 3 artigos (padrão)
python run_pipeline.py

# Processar 10 artigos com limpeza
python run_pipeline.py --limit 10 --clean

# Modo debug
python run_pipeline.py --verbose
```

### Manutenção
```bash
# Limpar duplicatas no Sanity
python tools/maintenance/delete_sanity_duplicates.py

# Listar posts publicados
python tools/maintenance/list_sanity_documents.py

# Sincronizar com Algolia
python tools/maintenance/sync_last_10_articles.py
```

## ⚠️ Importante

- **NÃO USE** scripts da pasta `legacy/` - estão obsoletos
- **SEMPRE USE** `run_pipeline.py` como ponto de entrada
- O sistema detecta e cria categorias/tags automaticamente
- Imagens são geradas e enviadas automaticamente

## 🐛 Solução de Problemas

### Erro de API Key
Verifique se todas as variáveis de ambiente estão configuradas no `.env`

### Posts não publicando
Verifique se o token do Sanity tem permissões de escrita

### Imagens não gerando
Confirme que OPENAI_API_KEY está válida e tem créditos

### Tradução falhando
Verifique GOOGLE_API_KEY e quota da API Gemini

## 📈 Monitoramento

Logs são salvos automaticamente:
- `pipeline_YYYYMMDD_HHMMSS.log` - Log de cada execução
- Console mostra progresso em tempo real
- Estatísticas finais mostram taxa de sucesso

## 🤝 Contribuindo

1. Sempre teste mudanças com `--limit 1` primeiro
2. Mantenha o fluxo de dados consistente
3. Não crie novos scripts de pipeline - melhore o existente
4. Documente novas ferramentas em `tools/`

---

**Versão**: 2.0.0  
**Última Atualização**: Junho 2025  
**Mantido por**: The Crypto Frontier Team