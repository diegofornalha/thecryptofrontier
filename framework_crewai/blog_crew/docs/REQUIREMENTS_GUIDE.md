# Requirements Guide

Este projeto usa um sistema hierárquico de arquivos requirements para facilitar a instalação e manutenção de dependências.

## Estrutura dos Requirements

### 📦 requirements-base.txt
**Propósito:** Dependências essenciais mínimas
- Pacotes fundamentais para funcionalidade básica
- Usado como base para todos os outros requirements
- Ideal para: Docker containers minimalistas, testes rápidos

**Instalação:**
```bash
pip install -r requirements-base.txt
```

### 🛠️ requirements-dev.txt
**Propósito:** Ambiente de desenvolvimento
- Inclui tudo de `requirements-base.txt`
- Adiciona ferramentas de desenvolvimento (pytest, black, flake8)
- LangChain e integrações avançadas
- Ideal para: Desenvolvimento local, CI/CD

**Instalação:**
```bash
pip install -r requirements-dev.txt
```

### 🚀 requirements-prod.txt
**Propósito:** Ambiente de produção completo
- Inclui tudo de `requirements-dev.txt`
- Adiciona monitoramento, logging estruturado
- Otimizações de performance (async, cache)
- Segurança adicional
- Ideal para: Deploy em produção

**Instalação:**
```bash
pip install -r requirements-prod.txt
```

## Guia de Uso

### Para Desenvolvimento Local
```bash
# Clone o repositório
git clone <repo-url>
cd framework_crewai/blog_crew

# Crie um ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instale as dependências de desenvolvimento
pip install -r requirements-dev.txt
```

### Para Produção
```bash
# Use requirements-prod.txt em seu Dockerfile ou servidor
pip install -r requirements-prod.txt
```

### Para Testes Rápidos
```bash
# Use apenas as dependências básicas
pip install -r requirements-base.txt
```

## Manutenção

### Adicionando Novas Dependências

1. **Dependência essencial** → Adicione em `requirements-base.txt`
2. **Ferramenta de desenvolvimento** → Adicione em `requirements-dev.txt`
3. **Recurso de produção** → Adicione em `requirements-prod.txt`

### Atualizando Dependências
```bash
# Atualize todas as dependências
pip install --upgrade -r requirements-prod.txt

# Congele versões atuais
pip freeze > requirements-frozen.txt
```

## Arquivos Legados (Removidos)

Os seguintes arquivos foram consolidados e devem ser removidos:
- ❌ `requirements.txt` (substituído por requirements-base.txt)
- ❌ `requirements_simple.txt` (muito básico, sem versões)
- ❌ `requirements-minimal.txt` (redundante)
- ❌ `requirements-enhanced.txt` (agora é requirements-prod.txt)