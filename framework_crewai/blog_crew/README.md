# Blog Crew - Sistema de Automação de Blog sobre Criptomoedas

Sistema completo de automação para blog sobre criptomoedas, desde a captura de conteúdo até a publicação final com imagens e metadados.

## 🚀 Nova Estrutura e Comandos

### Ponto de Entrada Único: `main.py`

```bash
# Ver todos os comandos disponíveis
python main.py --help

# Pipeline simplificado (recomendado)
python main.py simple-pipeline --limit 3 --with-images

# Executar crew completo
python main.py run-crew

# Monitorar feeds RSS
python main.py monitor-rss

# Publicar posts pendentes
python main.py publish-posts --with-images

# Sincronizar com Algolia
python main.py sync-algolia
```

## 📁 Estrutura do Projeto

```
blog_crew/
├── src/                      # Código-fonte principal
│   ├── agents/              # Agentes do CrewAI
│   ├── crews/               # Definições de equipes
│   ├── tasks/               # Tarefas
│   ├── tools/               # Ferramentas
│   ├── pipelines/           # Pipelines de execução
│   ├── utils/               # Utilitários
│   └── config/              # Configurações
├── scripts/                  # Scripts e utilitários
├── data/                     # Dados (feeds.json)
├── logs/                     # Logs centralizados
├── tests/                    # Testes
├── docs/                     # Documentação
└── main.py                   # PONTO DE ENTRADA PRINCIPAL
```

## 📋 Fluxo de Trabalho

O sistema executa 5 agentes em sequência:

1. **Monitor RSS** → Captura artigos de feeds configurados
2. **Tradutor** → Traduz para português brasileiro
3. **Formatador** → Prepara conteúdo para Sanity CMS
4. **Gerador de Imagens** → Cria imagens com DALL-E 3 (opcional)
5. **Publicador** → Publica no Sanity com categorias e tags

### Fluxo de Dados
```
RSS Feed → Tradução → Formatação → Geração de Imagens → Publicação
```

## 🛠️ Instalação

### 1. Clonar o repositório
```bash
git clone <repo-url>
cd framework_crewai/blog_crew
```

### 2. Criar ambiente virtual
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Instalar dependências
```bash
# Para desenvolvimento
pip install -r requirements-dev.txt

# Para produção
pip install -r requirements-prod.txt
```

### 4. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
```env
# APIs de IA
OPENAI_API_KEY=sk-...          # Para DALL-E 3
GOOGLE_API_KEY=...             # Para Gemini (tradução)

# Sanity CMS
SANITY_PROJECT_ID=uvuq2a47     # ID do projeto
SANITY_API_TOKEN=sk...         # Token de API

# Algolia (opcional)
ALGOLIA_APP_ID=...             # Para busca
ALGOLIA_API_KEY=...            # Para busca
```

### Configuração de Feeds RSS
Editar `data/feeds.json`:
```json
{
  "feeds": [
    {
      "name": "The Crypto Basic",
      "url": "https://thecryptobasic.com/feed/",
      "enabled": true
    }
  ]
}
```

## 🚀 Uso Rápido

### Pipeline Simplificado (Recomendado)
```bash
# Processar 5 artigos com imagens
python main.py simple-pipeline --limit 5 --with-images

# Processar 3 artigos sem imagens (mais rápido)
python main.py simple-pipeline --limit 3
```

### Monitoramento Contínuo
```bash
# Iniciar monitor de RSS
python main.py monitor-rss --continuous
```

## 📊 Monitoramento

### Logs
Todos os logs são salvos em `logs/`:
- `main.log` - Log principal
- `pipeline.log` - Logs de pipeline
- `monitor_YYYY-MM-DD.log` - Logs diários

### Dashboard (Em desenvolvimento)
```bash
streamlit run scripts/monitoring/dashboard.py
```

## 🧪 Testes

```bash
# Executar todos os testes
pytest tests/

# Teste específico
pytest tests/test_simple_image.py
```

## 🐳 Docker

```bash
# Build
docker-compose build

# Executar
docker-compose up

# Executar comando específico
docker-compose run app python main.py simple-pipeline
```

## 📚 Documentação

- [Estrutura do Projeto](docs/NEW_STRUCTURE.md)
- [Guia de Requirements](docs/REQUIREMENTS_GUIDE.md)
- [Fluxo Funcional](docs/README_FLUXO_FUNCIONAL.md)
- [Variáveis de Ambiente](docs/VARIAVEIS_AMBIENTE.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- Issues: [GitHub Issues](https://github.com/seu-usuario/blog-crew/issues)
- Email: seu-email@exemplo.com

---

**Blog Crew v2.0** - Sistema de Automação de Blog com IA 🤖