# Claude Flow

Sistema autônomo de organização e automação para projetos de código.

## 🚀 Recursos

### 1. Organization Guardian Universal
Sistema de organização independente de projeto que mantém score de 100%.

```bash
npm run organize:universal
```

### 2. Auto-commit Inteligente
Gera mensagens de commit seguindo convenções (feat, fix, docs, etc).

```bash
# Docker
docker compose --profile default up -d

# Local
npm run auto-commit
```

### 3. 🧠 Memória Persistente com Mem0
O Guardian agora possui memória persistente, permitindo:
- Aprender com decisões anteriores
- Lembrar estruturas bem-sucedidas
- Aplicar padrões em novos projetos

**Configuração:**
1. Configure `MEM0_API_KEY` em `../mcp-diego-tools/.env`
2. O Guardian usa user_id "guardian"

### 4. Docker Compose Unificado
Todos os serviços em um único arquivo com profiles:

```bash
# Executar perfil específico
docker compose --profile guardian up -d

# Executar todos os serviços
docker compose --profile full up -d
```

**Profiles disponíveis:**
- `default`: auto-commit, auto-push
- `guardian`: organization-guardian
- `monitor`: enhanced-monitor
- `analyze`: code-analyzer
- `dashboard`: metrics-dashboard
- `dev`: Todos os serviços de desenvolvimento
- `full`: Todos os serviços

## 📦 Instalação

```bash
npm install
```

## 🧪 Testes

```bash
# Testar memória
npx tsx src/test-guardian-memory.ts

# Testar organização
npm run organize:universal
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` com:

```env
# GitHub
GITHUB_TOKEN=seu_token

# Mem0 (opcional)
MEM0_API_KEY=sua_chave
```

## 📊 Métricas

O Guardian gera relatórios em `docs/ORGANIZATION-SCORE.md` com:
- Score de organização (0-100%)
- Estatísticas detalhadas
- Problemas encontrados
- Recomendações

## 🤖 Agentes Disponíveis

1. **Universal Organization Guardian**: Mantém projetos organizados
2. **Enhanced Monitor**: Monitora mudanças em tempo real
3. **Code Analyzer**: Analisa qualidade do código
4. **Metrics Dashboard**: Visualiza métricas do projeto

## 📝 Convenções de Commit

O auto-commit inteligente gera mensagens como:
- `feat: adicionar nova funcionalidade`
- `fix: corrigir bug específico`
- `docs: atualizar documentação`
- `style: formatar código`
- `refactor: reestruturar código`
- `test: adicionar testes`
- `chore: tarefas de manutenção`

---

Desenvolvido com ❤️ para manter projetos sempre organizados.