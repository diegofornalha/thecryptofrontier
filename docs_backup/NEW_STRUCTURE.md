# Nova Estrutura do Projeto Blog Crew 2.0

## 🚀 Visão Geral

O projeto foi completamente reestruturado seguindo as melhores práticas de engenharia de software Python, com foco em clareza, manutenibilidade e escalabilidade.

## 📁 Estrutura de Diretórios

```
blog_crew/
├── src/                      # 🎯 Código-fonte principal
│   ├── agents/              # Agentes especializados do CrewAI
│   ├── crews/               # Definições de equipes (antigo crew/)
│   ├── tasks/               # Tarefas para os agentes
│   ├── tools/               # Ferramentas unificadas (antigo utilities/ + tools/)
│   ├── pipelines/           # Fluxos de execução
│   ├── logic/               # Lógica de negócio
│   ├── config/              # Configurações
│   ├── models/              # Modelos de dados
│   ├── schemas/             # Schemas do Strapi
│   ├── monitoring/          # Monitoramento e métricas
│   └── utils/               # Utilitários e helpers
│
├── scripts/                  # 📜 Scripts e utilitários
│   ├── actions/             # Scripts de ação consolidados
│   │   ├── publish/         # Scripts de publicação
│   │   ├── update/          # Scripts de atualização
│   │   ├── run/             # Scripts de execução
│   │   └── create/          # Scripts de criação
│   ├── fixes/               # Scripts de correção
│   ├── monitoring/          # Scripts de monitoramento
│   ├── shell/               # Scripts shell
│   └── validation/          # Scripts de validação
│
├── data/                     # 📊 Arquivos de dados
├── logs/                     # 📝 Logs centralizados
├── tests/                    # 🧪 Testes
├── docs/                     # 📚 Documentação
├── backup/                   # 🗄️ Arquivos antigos (temporário)
│
├── main.py                   # 🎯 PONTO DE ENTRADA ÚNICO
├── requirements-base.txt     # 📦 Dependências essenciais
├── requirements-dev.txt      # 📦 Dependências de desenvolvimento
├── requirements-prod.txt     # 📦 Dependências de produção
└── README.md                 # 📖 Documentação principal
```

## 🔄 Principais Mudanças

### 1. **Criação do diretório `src/`**
- Todo código-fonte agora está em `src/`
- Separação clara entre código e outros arquivos
- Facilita importações e testes

### 2. **Consolidação de ferramentas**
- `utilities/` + `tools/` → `src/tools/`
- Elimina duplicação e confusão
- Nome único e claro para ferramentas

### 3. **Renomeação de diretórios**
- `crew/` → `src/crews/` (plural, múltiplas equipes)
- `utils/` permanece em `src/utils/` (helpers)

### 4. **Scripts consolidados**
- Todos os scripts de ação em `scripts/actions/`
- Organização por tipo de ação
- Fácil localização

### 5. **Ponto de entrada único: `main.py`**
```bash
# Executar crew completo
python main.py run-crew

# Pipeline simplificado
python main.py simple-pipeline --limit 5 --with-images

# Monitorar RSS
python main.py monitor-rss

# Publicar posts
python main.py publish-posts --with-images

# Sincronizar Algolia
python main.py sync-algolia
```

## 🛠️ Como Usar

### Desenvolvimento Local
```bash
# Instalar dependências
pip install -r requirements-dev.txt

# Executar pipeline simples
python main.py simple-pipeline

# Ver todas as opções
python main.py --help
```

### Importações
```python
# Novo padrão de importação
from src.agents import TranslatorAgent
from src.tools import strapi_tools
from src.utils.log_config import setup_logger
from src.pipelines.simple import simple_pipeline
```

## 📋 Checklist de Migração

- [x] Criar estrutura `src/`
- [x] Mover código-fonte para `src/`
- [x] Consolidar `utilities/` + `tools/` → `src/tools/`
- [x] Renomear `crew/` → `src/crews/`
- [x] Consolidar scripts em `scripts/actions/`
- [x] Criar `main.py` como ponto de entrada
- [x] Criar script de atualização de imports
- [ ] Executar `scripts/update_imports.py`
- [ ] Testar todos os comandos principais
- [ ] Remover diretório `backup/` após validação

## 🔧 Próximos Passos

1. **Atualizar imports:**
   ```bash
   python scripts/update_imports.py
   ```

2. **Testar comandos principais:**
   ```bash
   python main.py --help
   python main.py simple-pipeline --limit 1
   ```

3. **Limpar backups (após validação):**
   ```bash
   rm -rf backup/
   ```

## 💡 Benefícios da Nova Estrutura

1. **Clareza:** Separação clara entre código, scripts e dados
2. **Manutenibilidade:** Fácil localizar e modificar componentes
3. **Escalabilidade:** Estrutura preparada para crescimento
4. **Padrões Python:** Segue convenções da comunidade
5. **DRY (Don't Repeat Yourself):** Elimina duplicações
6. **Ponto de entrada único:** Simplifica execução e documentação

## 🚨 Notas Importantes

- O diretório `backup/` contém arquivos antigos e pode ser removido após validação
- Todos os logs agora vão para `logs/` automaticamente
- Use `main.py` como ponto de entrada principal
- A estrutura segue o padrão de projetos Python modernos