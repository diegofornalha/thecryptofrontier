# Integração Pydantic com CrewAI e Sanity CMS

Este documento explica como o sistema usa modelos Pydantic para garantir a estrutura de dados correta entre o CrewAI e o Sanity CMS.

## Visão Geral

O sistema implementa uma solução robusta para garantir que os posts gerados pelo CrewAI sejam compatíveis com o esquema do Sanity CMS. Isso é alcançado através do uso de modelos Pydantic que validam e formatam os dados em cada etapa do processo.

### Benefícios

- **Validação de Dados:** Garantia de que todos os campos necessários estão presentes e no formato correto
- **Tipagem Forte:** Definição clara da estrutura de dados esperada em cada etapa
- **Conversão Automática:** Transformação facilitada entre diferentes formatos de dados
- **Documentação Integrada:** Os modelos Pydantic servem como documentação da estrutura de dados
- **Detecção Precoce de Erros:** Problemas são identificados antes de chegar ao Sanity

## Arquitetura

### Modelos Pydantic

1. **Post (`models/post.py`):**
   - Modelo principal que representa a estrutura completa de um post no Sanity
   - Inclui validadores para garantir que campos obrigatórios estejam presentes
   - Lida com a conversão entre o formato interno e o formato esperado pelo Sanity

2. **Feed (`models/feed.py`):**
   - `FeedArticle`: Modelo para artigos extraídos de feeds RSS
   - `TranslatedArticle`: Modelo para artigos traduzidos para português
   - `FormattedArticle`: Modelo simplificado para artigos formatados para o Sanity

### Funções Auxiliares

- `dict_to_post`: Converte um dicionário para o modelo Pydantic `Post`
- `post_to_sanity_format`: Converte um objeto `Post` para o formato esperado pelo Sanity

## Fluxo de Dados

1. **Monitoramento de Feeds:**
   - O agente lê feeds RSS e extrai artigos relevantes
   - Os artigos são validados usando o modelo `FeedArticle`
   - Saída: Arquivos JSON em `posts_para_traduzir/`

2. **Tradução:**
   - O agente lê os arquivos JSON dos artigos a serem traduzidos
   - Traduz o conteúdo e valida usando o modelo `TranslatedArticle`
   - Saída: Arquivos JSON em `posts_traduzidos/`

3. **Formatação:**
   - O agente lê os artigos traduzidos
   - Formata o conteúdo para o Sanity e valida usando o modelo `FormattedArticle`
   - O conteúdo é dividido em blocos usando o modelo `Block` e `Span`
   - Saída: Arquivos JSON em `posts_formatados/`

4. **Publicação:**
   - O agente lê os artigos formatados
   - Valida usando o modelo `Post` antes de enviar para o Sanity
   - Usa `post_to_sanity_format` para garantir a compatibilidade
   - Saída: Artigos publicados no Sanity e arquivos em `posts_publicados/`

## Uso nas Tasks CrewAI

As tasks do CrewAI aproveitam esses modelos Pydantic através da propriedade `output_json`:

```python
task = Task(
    description="...",
    agent=agent,
    output_json=Post  # Define o formato JSON esperado
)
```

Isso garante que o resultado da task seja validado contra o modelo Pydantic especificado.

## Uso nos Agentes

Os agentes usam os modelos Pydantic para validar os dados antes de processá-los:

```python
# No formatter_agent.py
def format_post(post_data):
    # Converter para modelo Pydantic para validação
    post_model = dict_to_post(post_data)
    # Converter de volta para o formato do Sanity
    formatted_post = post_to_sanity_format(post_model)
    return formatted_post
```

## Como Testar

Um script de teste `test_pydantic.py` está disponível para verificar a validação e serialização dos modelos:

```bash
python test_pydantic.py
```

Este teste:
- Valida um post existente
- Cria um novo post a partir de dados simples
- Testa os modelos `FeedArticle`, `TranslatedArticle` e `FormattedArticle`

## Manutenção e Extensão

Para modificar o schema do Sanity:

1. Atualize os modelos Pydantic em `models/post.py`
2. Verifique a compatibilidade executando o script de teste
3. As alterações são automaticamente aplicadas em todo o sistema

## Requisitos

- Pydantic v2.5+
- CrewAI v0.28+
- Python 3.10+