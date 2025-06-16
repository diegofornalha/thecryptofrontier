# Workflow de Blog com Claude Code (Sem Custo de API)

## 🎯 Como Funciona

Em vez de chamar a API do Claude (paga), usamos o Claude Code como agente através de:

1. **Ferramentas MCP** - Claude Code executa tarefas via ferramentas
2. **Prompts Estruturados** - Instruções claras para o Claude Code
3. **Integração com Strapi** - Apenas a publicação usa API real

## 📝 Exemplo de Workflow

### 1. Criar Post via Claude Code

```markdown
# Prompt para Claude Code

Usando as ferramentas MCP disponíveis, crie um post completo sobre "IA no Marketing Digital":

1. Use `create_blog_post` para estruturar o post
2. Pesquise o tópico e crie conteúdo original
3. Otimize para SEO com palavras-chave: "IA marketing", "automação", "marketing digital"
4. Use `enhance_content` para refinar o texto
5. Use `publish_to_strapi` para publicar

O post deve ter:
- 1500-2000 palavras
- Tom profissional mas acessível
- Exemplos práticos
- Conclusão com CTA
```

### 2. Pipeline Automatizado

```python
# webhook_handler_for_claude.py
async def handle_strapi_webhook(event_type, payload):
    """
    Quando receber webhook do Strapi, 
    cria arquivo de instrução para Claude Code
    """
    
    if event_type == "entry.create" and not payload['entry'].get('content'):
        # Post vazio - precisa de conteúdo
        
        instruction_file = f"""
        # Tarefa: Completar Post ID {payload['entry']['id']}
        
        Título: {payload['entry']['title']}
        
        Por favor:
        1. Pesquise sobre este tópico
        2. Crie conteúdo completo (1500+ palavras)
        3. Adicione meta descrição SEO
        4. Sugira 5-7 tags relevantes
        5. Publique o conteúdo atualizado
        
        Use as ferramentas MCP disponíveis.
        """
        
        # Salva instrução para Claude Code processar
        with open(f"tasks/post_{payload['entry']['id']}.md", "w") as f:
            f.write(instruction_file)
```

## 🤖 Agentes Especializados com Claude Code

### 1. **Research Agent**
```markdown
# Instrução: research_agent.md

Você é um Research Agent especializado. Sua tarefa:

1. Pesquise tendências sobre [TOPIC]
2. Compile estatísticas relevantes
3. Identifique 3-5 insights únicos
4. Liste fontes confiáveis
5. Crie um resumo executivo

Output: JSON estruturado com findings
```

### 2. **Writer Agent**
```markdown
# Instrução: writer_agent.md

Você é um Writer Agent criativo. Com base na pesquisa fornecida:

1. Crie título atrativo (máx 60 chars)
2. Escreva introdução engajante
3. Desenvolva 5-7 seções com subtítulos
4. Inclua exemplos práticos
5. Conclua com CTA claro

Estilo: Profissional mas conversacional
```

### 3. **SEO Agent**
```markdown
# Instrução: seo_agent.md

Você é um SEO Agent. Otimize o conteúdo:

1. Meta título (50-60 chars)
2. Meta descrição (150-160 chars)
3. Densidade de palavras-chave: 1-2%
4. Headers otimizados (H2, H3)
5. Alt text para imagens sugeridas
6. Schema markup recomendado
```

## 🔄 Integração com CrewAI Existente

```python
# hybrid_agent.py
class HybridBlogAgent:
    """
    Combina CrewAI (Gemini) com Claude Code
    """
    
    def __init__(self):
        self.crewai_agent = ExistingCrewAI()  # Usa Gemini
        self.claude_tools = MCPBlogTools()     # Usa Claude Code
    
    async def create_post(self, topic):
        # 1. Pesquisa inicial com CrewAI/Gemini (barato)
        research = await self.crewai_agent.research(topic)
        
        # 2. Criação de conteúdo com Claude Code (grátis)
        # Salva contexto para Claude Code processar
        context = {
            "research": research,
            "topic": topic,
            "task": "create_comprehensive_post"
        }
        
        with open("tasks/current_post.json", "w") as f:
            json.dump(context, f)
        
        # 3. Claude Code processa e retorna resultado
        # (executado manualmente ou via automação)
        
        return "Task created for Claude Code"
```

## 🚀 Vantagens desta Abordagem

1. **Custo Zero** - Usa Claude Code, não API
2. **Qualidade Superior** - Claude > Gemini para escrita
3. **Flexibilidade** - Combina múltiplos agentes
4. **Controle Total** - Você revisa antes de publicar

## 📊 Comparação

| Aspecto | CrewAI + Gemini | Claude Code + MCP |
|---------|----------------|-------------------|
| Custo | ~$0.10/post | $0 |
| Qualidade | Boa | Excelente |
| Velocidade | Automático | Semi-automático |
| Controle | Limitado | Total |
| Manutenção | Complexa | Simples |

## 🔧 Setup Rápido

1. **Instalar dependências**:
```bash
pip install aiohttp asyncio python-dotenv
```

2. **Configurar MCP Tools**:
```bash
# Adicionar ao Claude Code MCP config
{
  "tools": {
    "blog_tools": {
      "command": "python mcp_blog_server.py",
      "schema": "blog_tools_schema.json"
    }
  }
}
```

3. **Criar pasta de tarefas**:
```bash
mkdir -p /home/strapi/thecryptofrontier/claude-agents/tasks
```

4. **Automatizar com cron** (opcional):
```bash
# Checa novas tarefas a cada 5 minutos
*/5 * * * * /usr/bin/process_claude_tasks.sh
```

---

*Esta abordagem permite usar o poder do Claude sem custos de API!*