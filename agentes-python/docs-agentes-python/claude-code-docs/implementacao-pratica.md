# Implementação Prática com Claude Code

## 🚀 Guia de Implementação Rápida

### 1. Setup Inicial

#### Pré-requisitos
```bash
# Python 3.8+
python3 --version

# Pip
pip install aiohttp asyncio python-dotenv

# Claude CLI instalado e configurado
claude --version
```

#### Estrutura de Diretórios
```bash
# Criar estrutura necessária
mkdir -p /home/strapi/thecryptofrontier/claude-agents/tasks/processed
mkdir -p /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog
```

### 2. Configuração do Ambiente

#### `.env` file
```bash
# Strapi Configuration
STRAPI_URL=https://ale-blog.agentesintegrados.com
STRAPI_API_TOKEN=seu_token_aqui

# Paths
TASKS_DIR=/home/strapi/thecryptofrontier/claude-agents/tasks
```

### 3. Implementação Básica

#### Exemplo 1: Criar Post Simples
```python
import asyncio
from claude_cli_blog_agent import ClaudeCLIBlogAgent

async def criar_post_basico():
    agent = ClaudeCLIBlogAgent()
    
    # Definir contexto do post
    context = {
        'topic': 'Tendências de IA para 2025',
        'keywords': ['inteligência artificial', 'tendências', '2025', 'tecnologia'],
        'style': 'informativo e acessível'
    }
    
    # Criar tarefa
    task_file = agent.create_task_file('create_post', context)
    print(f"Tarefa criada: {task_file}")
    
    # Instruções para o usuário
    print("\n📋 Próximos passos:")
    print("1. Abra o arquivo de tarefa")
    print("2. Copie o conteúdo")
    print("3. Cole no Claude CLI")
    print("4. Salve o resultado como JSON")

# Executar
asyncio.run(criar_post_basico())
```

#### Exemplo 2: Monitor Automático
```python
# monitor.py
import asyncio
from claude_cli_blog_agent import monitor_outputs

async def main():
    print("🤖 Monitor de Posts Iniciado")
    print("Verificando novos outputs a cada 30 segundos...")
    print("Pressione Ctrl+C para parar\n")
    
    await monitor_outputs()

if __name__ == "__main__":
    asyncio.run(main())
```

### 4. Workflow Completo

#### Script de Workflow (`workflow.py`)
```python
#!/usr/bin/env python3
import asyncio
import os
import json
from pathlib import Path
from datetime import datetime
from claude_cli_blog_agent import ClaudeCLIBlogAgent

class BlogWorkflow:
    def __init__(self):
        self.agent = ClaudeCLIBlogAgent()
        self.tasks_dir = Path(os.getenv('TASKS_DIR', './tasks'))
        
    async def criar_serie_posts(self, topicos):
        """Cria múltiplos posts em sequência"""
        tarefas = []
        
        for topico in topicos:
            print(f"\n📝 Criando tarefa para: {topico['titulo']}")
            
            context = {
                'topic': topico['titulo'],
                'keywords': topico['keywords'],
                'style': topico.get('estilo', 'profissional')
            }
            
            task_file = self.agent.create_task_file('create_post', context)
            tarefas.append(task_file)
            
            # Pequeno delay entre criações
            await asyncio.sleep(1)
        
        print(f"\n✅ {len(tarefas)} tarefas criadas!")
        return tarefas
    
    async def verificar_status(self):
        """Verifica status das tarefas"""
        pendentes = list(self.tasks_dir.glob('create_post_*.md'))
        outputs = list(self.tasks_dir.glob('output_*.json'))
        processados = list((self.tasks_dir / 'processed').glob('*.json'))
        
        print("\n📊 Status do Sistema:")
        print(f"  📋 Tarefas pendentes: {len(pendentes)}")
        print(f"  📄 Outputs aguardando: {len(outputs)}")
        print(f"  ✅ Posts processados: {len(processados)}")
        
        return {
            'pendentes': len(pendentes),
            'outputs': len(outputs),
            'processados': len(processados)
        }

# Uso
async def main():
    workflow = BlogWorkflow()
    
    # Criar série de posts sobre IA
    topicos = [
        {
            'titulo': 'ChatGPT vs Claude: Comparação Completa',
            'keywords': ['chatgpt', 'claude', 'ia', 'comparação'],
            'estilo': 'comparativo e objetivo'
        },
        {
            'titulo': 'Como Usar IA para Marketing Digital',
            'keywords': ['ia marketing', 'automação', 'digital'],
            'estilo': 'prático com exemplos'
        }
    ]
    
    await workflow.criar_serie_posts(topicos)
    await workflow.verificar_status()

if __name__ == "__main__":
    asyncio.run(main())
```

### 5. Templates Customizados

#### Template para Review de Produtos
```python
def create_review_template(product_name, category):
    return f"""
# Tarefa: Review Completo de Produto

## Produto: {product_name}
## Categoria: {category}

## Estrutura Requerida:

### 1. Introdução (200 palavras)
- Contexto do produto
- Importância no mercado
- Primeira impressão

### 2. Características Principais (400 palavras)
- Especificações técnicas
- Diferenciais
- Comparação com concorrentes

### 3. Prós e Contras (300 palavras)
- Lista detalhada de vantagens
- Pontos de melhoria
- Para quem é indicado

### 4. Experiência de Uso (400 palavras)
- Casos práticos
- Performance real
- Facilidade de uso

### 5. Preço e Custo-Benefício (200 palavras)
- Análise de preço
- Comparação de mercado
- Vale a pena?

### 6. Conclusão (200 palavras)
- Resumo geral
- Nota final (0-10)
- Recomendação

## Requisitos SEO:
- Título: máx 60 caracteres
- Meta descrição: 150-160 caracteres
- Palavras-chave: {product_name}, review, análise, {category}
- Usar heading tags apropriadas

## Formato de Saída:
JSON estruturado conforme padrão
"""
```

### 6. Integração com RSS

#### RSS + Claude Code
```python
# rss_claude_integration.py
import feedparser
from claude_cli_blog_agent import ClaudeCLIBlogAgent

class RSSClaudeIntegration:
    def __init__(self):
        self.agent = ClaudeCLIBlogAgent()
        
    async def processar_feed_rss(self, feed_url):
        """Cria posts baseados em feed RSS"""
        feed = feedparser.parse(feed_url)
        
        for entry in feed.entries[:5]:  # Limitar a 5 posts
            context = {
                'topic': f"Análise: {entry.title}",
                'keywords': self.extrair_keywords(entry),
                'style': 'análise jornalística',
                'source_url': entry.link,
                'original_summary': entry.summary
            }
            
            # Criar tarefa de análise
            task_file = self.agent.create_task_file('analyze_article', context)
            print(f"Tarefa criada para: {entry.title}")
            
    def extrair_keywords(self, entry):
        """Extrai palavras-chave do entry RSS"""
        # Lógica simplificada
        title_words = entry.title.lower().split()
        keywords = [w for w in title_words if len(w) > 4]
        return keywords[:5]
```

### 7. Automação com Cron

#### Script de Automação (`auto_blog.sh`)
```bash
#!/bin/bash
# Automação de blog com Claude Code

# Configurações
PYTHON_PATH="/usr/bin/python3"
SCRIPT_DIR="/home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog"
LOG_DIR="/var/log/claude-blog"

# Criar diretório de logs
mkdir -p $LOG_DIR

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/auto_blog.log"
}

# Verificar novos tópicos para posts
check_new_topics() {
    log "Verificando novos tópicos..."
    
    # Executar script Python que verifica tópicos
    $PYTHON_PATH $SCRIPT_DIR/check_topics.py
}

# Processar outputs pendentes
process_outputs() {
    log "Processando outputs do Claude..."
    
    # Executar monitor por 5 minutos
    timeout 300 $PYTHON_PATH $SCRIPT_DIR/monitor.py
}

# Executar workflow
log "Iniciando workflow automático"
check_new_topics
process_outputs
log "Workflow concluído"
```

#### Configurar no Cron
```bash
# Editar crontab
crontab -e

# Adicionar linha para executar a cada 4 horas
0 */4 * * * /home/strapi/scripts/auto_blog.sh

# Verificar outputs a cada 30 minutos
*/30 * * * * cd /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog && python3 monitor.py
```

### 8. Debugging e Troubleshooting

#### Debug Mode
```python
# debug_mode.py
import logging
from claude_cli_blog_agent import ClaudeCLIBlogAgent

# Configurar logging detalhado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('claude_blog_debug.log'),
        logging.StreamHandler()
    ]
)

class DebugClaudeAgent(ClaudeCLIBlogAgent):
    def create_task_file(self, task_type, context):
        logging.debug(f"Criando tarefa: {task_type}")
        logging.debug(f"Contexto: {context}")
        
        result = super().create_task_file(task_type, context)
        
        logging.info(f"Tarefa criada: {result}")
        return result
```

### 9. Métricas e Analytics

#### Coletor de Métricas
```python
# metrics_collector.py
import json
from datetime import datetime
from pathlib import Path

class BlogMetrics:
    def __init__(self):
        self.metrics_file = Path('blog_metrics.json')
        self.load_metrics()
    
    def load_metrics(self):
        if self.metrics_file.exists():
            with open(self.metrics_file, 'r') as f:
                self.metrics = json.load(f)
        else:
            self.metrics = {
                'total_posts': 0,
                'posts_by_topic': {},
                'average_processing_time': 0,
                'success_rate': 100
            }
    
    def track_post(self, topic, processing_time, success=True):
        self.metrics['total_posts'] += 1
        
        # Track por tópico
        if topic not in self.metrics['posts_by_topic']:
            self.metrics['posts_by_topic'][topic] = 0
        self.metrics['posts_by_topic'][topic] += 1
        
        # Atualizar taxa de sucesso
        if not success:
            total = self.metrics['total_posts']
            successful = int(total * self.metrics['success_rate'] / 100)
            self.metrics['success_rate'] = (successful / total) * 100
        
        # Salvar métricas
        self.save_metrics()
    
    def save_metrics(self):
        with open(self.metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2)
    
    def get_report(self):
        return f"""
        📊 Relatório de Métricas do Blog
        
        Total de Posts: {self.metrics['total_posts']}
        Taxa de Sucesso: {self.metrics['success_rate']:.1f}%
        
        Posts por Tópico:
        {json.dumps(self.metrics['posts_by_topic'], indent=2)}
        """
```

### 10. Boas Práticas

#### Checklist de Qualidade
```python
def validar_output_claude(output_json):
    """Valida output antes de publicar"""
    required_fields = ['title', 'content', 'slug', 'excerpt']
    
    # Verificar campos obrigatórios
    for field in required_fields:
        if field not in output_json:
            return False, f"Campo obrigatório ausente: {field}"
    
    # Verificar tamanhos
    if len(output_json['title']) > 60:
        return False, "Título muito longo (máx 60 caracteres)"
    
    if len(output_json['content']) < 500:
        return False, "Conteúdo muito curto (mín 500 caracteres)"
    
    if len(output_json['excerpt']) > 160:
        return False, "Excerpt muito longo (máx 160 caracteres)"
    
    return True, "Output válido"
```

### 🎯 Dicas Finais

1. **Sempre revisar**: Mesmo com Claude, revisar antes de publicar
2. **Backup regular**: Manter cópias das tarefas e outputs
3. **Monitorar logs**: Verificar regularmente por erros
4. **Otimizar prompts**: Refinar templates baseado nos resultados
5. **Medir performance**: Usar métricas para melhorar o processo