# 📊 Dashboard Streamlit - Blog Crew

## 🎯 Visão Geral

Dashboard simples em Streamlit para monitorar e controlar o pipeline do Blog Crew.

## ✨ Funcionalidades

### 1. Métricas em Tempo Real
- 📰 Total de artigos RSS capturados
- 🌐 Artigos traduzidos
- 🖼️ Artigos com imagens geradas
- ✅ Artigos publicados no Strapi

### 2. Visualização de Posts
- Ver últimos posts em cada estágio
- Expandir para ver detalhes completos
- Filtrar por diretório/estágio

### 3. Monitoramento de Logs
- Visualizar logs em tempo real
- Escolher entre diferentes arquivos de log
- Ajustar número de linhas exibidas

### 4. Verificação de Configuração
- Status das variáveis de ambiente
- Verificação de diretórios
- Lista de feeds RSS ativos

### 5. Execução Manual
- Executar qualquer pipeline diretamente
- Configurar número de artigos
- Opção de limpar arquivos antigos

## 🚀 Como Executar

### Método 1: Script Automatizado
```bash
cd /home/strapi/thecryptofrontier/framework_crewai/blog_crew
./run_dashboard.sh
```

### Método 2: Comando Direto
```bash
# Instalar streamlit se necessário
pip install streamlit pandas

# Executar dashboard
streamlit run dashboard_streamlit.py
```

## 🔗 Acesso

Após executar, acesse:
```
http://localhost:8501
```

## 📸 Screenshots do Dashboard

### Página Principal
```
┌─────────────────────────────────────────────┐
│       📊 Blog Crew - Dashboard              │
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │  📰  │ │  🌐  │ │  🖼️  │ │  ✅  │       │
│ │  45  │ │  42  │ │  40  │ │  38  │       │
│ └──────┘ └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────────────┘
```

### Tabs Disponíveis
1. **📈 Últimos Posts** - Visualizar posts processados
2. **📋 Logs** - Monitorar logs do sistema
3. **⚙️ Configuração** - Verificar setup
4. **🚀 Executar Pipeline** - Rodar pipelines manualmente

## 🔄 Auto-Refresh

O dashboard atualiza automaticamente a cada 5 minutos.

## 🛠️ Personalização

### Alterar Porta
```bash
streamlit run dashboard_streamlit.py --server.port 8502
```

### Expor para Rede
```bash
streamlit run dashboard_streamlit.py --server.address 0.0.0.0
```

## 📊 Métricas Monitoradas

| Métrica | Descrição | Diretório |
|---------|-----------|-----------|
| Artigos RSS | Posts capturados dos feeds | posts_para_traduzir/ |
| Traduzidos | Posts em português | posts_traduzidos/ |
| Com Imagem | Posts com DALL-E | posts_com_imagem/ |
| Publicados | Posts no Strapi | posts_publicados/ |

## ⚠️ Avisos

1. **Execução de Pipeline**: Use com cuidado em produção
2. **Timeout**: Pipelines têm timeout de 5 minutos no dashboard
3. **Logs**: Mostra apenas últimas linhas (configurável)

## 🔧 Requisitos

- Python 3.8+
- streamlit
- pandas

## 📝 Notas

- Dashboard é read-only exceto para execução manual
- Ideal para monitoramento e debugging
- Não substitui logs completos ou monitoramento profissional

---

**Dica**: Para produção, considere adicionar autenticação ao Streamlit!