# Como Postar Artigos RSS no Strapi (Híbrido Gemini/Claude)

Este documento detalha o processo de como os artigos RSS são importados e publicados no Strapi usando o agente híbrido, incluindo os desafios encontrados e as soluções implementadas.

## 🎯 Objetivo

O objetivo principal era permitir a importação automática de artigos de feeds RSS e sua publicação no Strapi, mantendo o idioma original do artigo. Além disso, o sistema deveria ser flexível para permitir a criação de novas postagens usando diferentes Modelos de Linguagem (LLMs), como Gemini e Claude.

## 🚀 Arquitetura Híbrida

Para alcançar a flexibilidade desejada, foi implementada uma arquitetura híbrida:

1.  **`llm_interface.py`**: Uma camada de abstração foi criada para definir uma interface comum (`LLMInterface`) para interagir com diferentes LLMs. Isso permite que o sistema alterne entre Claude (simulado via CLI para custo zero) e Gemini (simulado via API para este exemplo) de forma transparente.
    *   `ClaudeLLM`: Simula a interação com o Claude CLI.
    *   `GeminiLLM`: Prepara a integração com a API real do Gemini (atualmente simulada).

2.  **Agentes Híbridos**:
    *   **`hybrid_blog_agent.py`**: Um agente mais abrangente, capaz de lidar com diferentes tipos de tarefas (criação de posts, melhoria de conteúdo, pesquisa) utilizando a `LLMInterface`.
    *   **`simple_hybrid_blog_agent.py`**: Uma versão simplificada para a criação direta de posts, demonstrando a facilidade de alternar entre LLMs.

3.  **`rss_blog_agent.py`**: O agente responsável por monitorar feeds RSS, processar os artigos e publicá-los no Strapi. Ele foi adaptado para trabalhar com a nova arquitetura.

4.  **`main_agent.py`**: Um agente orquestrador centralizado que fornece uma interface de linha de comando para o usuário escolher entre as diferentes funcionalidades (criar postagem ou importar RSS).

## 🛠️ Desafios e Soluções

Durante o desenvolvimento e teste, alguns desafios foram encontrados, principalmente relacionados à validação de dados do Strapi:

### 1. Campo 'author' Inválido

**Problema**: Ao tentar publicar artigos importados via RSS, o Strapi retornava um erro `Invalid key author`. Isso indicava que o campo `author` estava sendo explicitamente definido como `'RSS Bot'` no `rss_blog_agent.py`.

**Solução**: Foi identificado que o esquema do Strapi não esperava esse campo ou exigia um formato específico que não estava sendo atendido. A solução foi **remover a inclusão explícita do campo `author`** dos dados enviados ao Strapi.

### 2. Validação de 'slug' Incorreta

**Problema**: Após a correção do campo `author`, um novo erro de validação no `slug` surgiu: `slug must match the following: "/^[A-Za-z0-9-_.~]*$/"`. Isso significava que o slug gerado não estava em conformidade com o padrão de caracteres permitidos pelo Strapi. O problema persistiu em várias tentativas, indicando uma complexidade na geração do slug.

**Soluções Iterativas**:
*   **Aprimoramento da Expressão Regular**: A função `generate_slug` no `rss_blog_agent.py` foi aprimorada para uma abordagem mais rigorosa:
    1.  Converter o título para minúsculas e normalizar caracteres Unicode.
    2.  Substituir qualquer caractere que *não* seja uma letra (a-z), número (0-9) ou espaço por um espaço.
    3.  Substituir múltiplos espaços por um único hífen.
    4.  Remover qualquer caractere que *não* seja letra (a-z), número (0-9), hífen (`-`), sublinhado (`_`), ponto (`.`) ou til (`~`).
    5.  Remover hífens no início e no fim da string.
*   **Ajuste na Lógica de Prefixo**: No `rss_blog_agent.py`, a lógica de geração do slug foi ajustada para **não adicionar o prefixo de idioma** quando a estratégia de publicação é `original_only`, garantindo que o slug enviado ao Strapi esteja em conformidade com suas regras de validação.

### 3. Republicação e Atualização de Artigos RSS

**Problema**: Inicialmente, o agente RSS não republicava artigos que já haviam sido processados (mesmo que tivessem sido deletados do Strapi), pois ele mantinha um cache local de GUIDs processados. Além disso, era necessário garantir que as correções no slug e a ausência do prefixo `[EN]` fossem aplicadas em republicações.

**Solução**: Para permitir a republicação e atualização de artigos, as seguintes melhorias foram implementadas no `rss_blog_agent.py`:
*   **Remoção da Verificação de Cache Local**: A verificação `if guid in self.processed_guids:` em `check_feeds` foi removida. Isso faz com que o agente considere todos os artigos do feed para processamento, independentemente de terem sido vistos antes.
*   **Verificação de Existência no Strapi**: Uma nova função `check_post_exists_in_strapi(self, slug: str)` foi adicionada. Antes de criar um post, o agente agora consulta o Strapi para verificar se um post com o mesmo slug já existe.
*   **Lógica de Criação/Atualização**: A função `create_post_from_article` foi modificada para:
    *   Se o post **já existir** no Strapi (verificado pelo slug), ele será **atualizado** (requisição `PUT`) com os dados mais recentes do feed RSS. Isso garante que as correções no slug e no título (sem `[EN]`) sejam aplicadas.
    *   Se o post **não existir** no Strapi, ele será criado (requisição `POST`).
*   **Garantia de Idioma e Formato**: As postagens em inglês são publicadas sem o prefixo `[EN]` no título, e o `excerpt` é gerado diretamente do conteúdo original do RSS, garantindo que esteja no idioma correto.

## ✅ Verificação

Após as correções e melhorias, o `main_agent.py` foi testado com sucesso:

*   **Criação de Postagem (Gemini Simulado)**: A funcionalidade de criar uma nova postagem usando o LLM Gemini (simulado) funcionou conforme o esperado, gerando o conteúdo e preparando-o para publicação.
*   **Importação e Republicação de Postagens RSS**: A importação de artigos RSS e sua publicação/atualização no Strapi foi concluída com sucesso. Os slugs foram gerados corretamente, os títulos não continham o prefixo `[EN]`, os `excerpts` estavam no idioma original, e os artigos foram publicados ou atualizados no Strapi conforme a necessidade.

## 💡 Como Usar

Para utilizar o agente orquestrador e postar artigos:

1.  **Certifique-se de que as variáveis de ambiente estão configuradas**:
    *   `STRAPI_URL`: URL da sua instância Strapi.
    *   `STRAPI_API_TOKEN`: Token de API do Strapi.
    *   `GEMINI_API_KEY`: (Opcional) Sua chave de API do Gemini, se for usar a integração real.

2.  **Execute o agente principal**:
    ```bash
    python3 /home/strapi/thecryptofrontier/agentes-python/claude-agentes-blog/main_agent.py
    ```

3.  **Siga as instruções no menu**:
    *   Escolha `1` para criar uma nova postagem e selecione o LLM (`gemini` ou `claude`).
    *   Escolha `2` para importar postagens via RSS. Para forçar a republicação de artigos (mesmo que já tenham sido processados ou deletados do Strapi), certifique-se de que o arquivo `processed_rss_posts.json` esteja vazio ou não exista antes de executar a importação.

Este sistema agora oferece uma solução robusta e flexível para a gestão de conteúdo de blog, aproveitando o poder de diferentes LLMs e automatizando a importação e atualização de feeds RSS.