# Blog Automação - Versão Modularizada

Este é o aplicativo de automação para o blog The Crypto Frontier, reestruturado seguindo princípios de código limpo e modular.

## Estrutura do Projeto

```
framework_crewai/
├── app.py             # Aplicativo Streamlit original
├── app_modular.py     # Nova versão modularizada 
├── static/            # Recursos estáticos
│   └── style.css      # CSS externalizado
├── src/
│   └── blog_automacao/
│       ├── __init__.py
│       ├── crew.py              # Definição das crews e agentes
│       ├── logic/               # Lógica de negócio
│       │   ├── __init__.py
│       │   ├── business_logic.py # Funções principais
│       │   └── session_manager.py # Gerenciamento de sessão
│       └── ui/                  # Interface do usuário
│           ├── __init__.py
│           └── components.py    # Componentes reutilizáveis
├── ... (outros arquivos)
```

## Benefícios da Refatoração

1. **Organização Lógica**: Separação clara entre lógica de negócio e interface de usuário.
2. **Reutilização de Código**: Componentes UI podem ser reutilizados em diferentes partes do aplicativo.
3. **Manutenção Simplificada**: Cada arquivo tem uma responsabilidade específica.
4. **Facilidade de Testes**: Componentes menores são mais fáceis de testar.
5. **Clareza do Código Principal**: O arquivo `app_modular.py` foca apenas na estrutura principal, importando a lógica necessária.

## Módulos Principais

### Logic
- **session_manager.py**: Centraliza o gerenciamento de estado do Streamlit
- **business_logic.py**: Contém as funções principais (monitoramento, tradução, publicação, etc.)

### UI
- **components.py**: Define componentes reutilizáveis como cards, sidebars, etc.

### Static
- **style.css**: CSS externalizado para estilização consistente

## Como Executar

```bash
streamlit run app_modular.py
```

## Funcionalidades Principais

O aplicativo mantém as mesmas funcionalidades, agora organizadas em módulos:

1. **Agente Monitor**: Monitoramento de feeds RSS e extração de artigos
2. **Agente Tradutor**: Tradução de artigos do inglês para português
3. **Agente Publisher**: Publicação no Sanity CMS com conformidade de schema
4. **Gerenciamento de RSS**: Configuração de fontes de conteúdo
5. **Gerenciamento de BD**: Interface para o banco de dados do Monitor

## Boas Práticas Implementadas

1. **Cache de Dados**: Uso do `@st.cache_data` para otimizar chamadas API
2. **Estruturas Consistentes**: Padronização de estilo e componentes
3. **Gerenciamento Centralizado de Estado**: Via `SessionManager`
4. **Configuração Externalizada**: Feeds RSS e outras configurações
5. **Tratamento de Erros**: Captura e exibição de erros de forma amigável

## Melhorias Futuras

- Adição de testes unitários
- Configuração via arquivo .env
- Logs mais detalhados e sistema de monitoramento
- Melhoria na interface mobile
- Implementação de autenticação 