# Workflow de Blog com Agentes Híbridos (Claude/Gemini)

## 🎯 Como Funciona

Esta nova arquitetura permite a flexibilidade de usar diferentes Modelos de Linguagem (LLMs) para a criação de conteúdo, seja o Claude (via CLI simulada para custo zero) ou o Gemini (via API, com simulação para este exemplo).

1. **Interface de LLM Abstrata** (`llm_interface.py`): Define uma interface comum para interagir com diferentes LLMs.
2. **Agentes Híbridos** (`hybrid_blog_agent.py`, `simple_hybrid_blog_agent.py`): Utilizam a interface de LLM para gerar conteúdo, abstraindo a complexidade de cada LLM.
3. **Integração com Strapi** - A publicação do conteúdo gerado no Strapi continua usando a API real.

## 📝 Exemplo de Workflow

### 1. Criar Post via Agente Híbrido

Agora, você pode escolher qual LLM usar para gerar o conteúdo. O `simple_hybrid_blog_agent.py` é um exemplo de como fazer isso.

```bash
# Exemplo usando Gemini (simulado)
python3 /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog/simple_hybrid_blog_agent.py gemini "O futuro da IA no marketing" "IA,marketing,automação"

# Exemplo usando Claude (simulado)
python3 /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog/simple_hybrid_blog_agent.py claude "Impacto da regulamentação de cripto no Brasil" "regulamentação,cripto,Brasil"
```

### 2. Estrutura dos Agentes Híbridos

- **`llm_interface.py`**: Define as classes `LLMInterface`, `ClaudeLLM` e `GeminiLLM`. `ClaudeLLM` simula a interação com o Claude CLI, enquanto `GeminiLLM` está preparado para integrar com a API real do Gemini.

- **`hybrid_blog_agent.py`**: Um agente mais completo que pode ser estendido para diferentes tipos de tarefas (criar post, melhorar conteúdo, pesquisar tópico) e utiliza a `LLMInterface` para a geração de conteúdo.

- **`simple_hybrid_blog_agent.py`**: Uma versão simplificada para a criação direta de posts, demonstrando a facilidade de alternar entre LLMs.

## 🚀 Vantagens desta Abordagem

1. **Flexibilidade**: Alterne facilmente entre diferentes LLMs (Claude, Gemini, etc.) sem alterar a lógica principal do agente.
2. **Custo Otimizado**: Continue usando o Claude CLI para cenários de custo zero, ou integre com APIs pagas quando necessário.
3. **Manutenção Simplificada**: A abstração da interface LLM torna o código mais modular e fácil de manter.
4. **Escalabilidade**: Adicione novos LLMs simplesmente implementando a `LLMInterface`.

## 🔧 Setup Rápido

1. **Instalar dependências**:
```bash
pip install aiohttp asyncio python-dotenv
# Se for usar a API real do Gemini, instale:
# pip install google-generativeai
```

2. **Configurar variáveis de ambiente**:
   - `STRAPI_URL`: URL da sua instância Strapi.
   - `STRAPI_API_TOKEN`: Token de API do Strapi.
   - `GEMINI_API_KEY`: (Opcional) Sua chave de API do Gemini, se for usar a integração real.

3. **Executar o workflow automatizado**:
```bash
bash automated_workflow.sh
```

---

*Esta abordagem oferece o melhor dos dois mundos: flexibilidade e otimização de custos!*