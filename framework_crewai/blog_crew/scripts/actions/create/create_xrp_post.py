"""
RESUMO DETALHADO DOS AGENTES DO FRAMEWORK CREWAI

Este documento detalha o propósito, funcionamento e ferramentas de cada agente 
no sistema de automação de blog de criptomoedas.

================================================================================
1. TRANSLATOR AGENT (translator_agent.py)
================================================================================

PROPÓSITO:
- Traduzir artigos de criptomoedas do inglês para português brasileiro
- Especializado em terminologia técnica de blockchain e criptomoedas
- Adapta expressões idiomáticas e referências culturais para o público brasileiro

CARACTERÍSTICAS:
- Role: "Tradutor de Conteúdo"
- Goal: "Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade"
- LLM: Usa GPT-4.1-nano com temperatura 0.7 (configurável)
- Fallback: Se OpenAI não estiver disponível, usa modelo padrão com capacidades limitadas

FERRAMENTAS UTILIZADAS:
1. read_from_file - Lê arquivos de entrada com artigos em inglês
2. save_to_file - Salva artigos traduzidos

BACKSTORY:
Tradutor especializado que conhece profundamente a terminologia técnica de criptomoedas
e blockchain, capaz de adaptar conteúdo para ter mais relevância cultural no Brasil.

================================================================================
2. FORMATTER AGENT (formatter_agent.py)
================================================================================

PROPÓSITO:
- Preparar conteúdo traduzido para publicação no Strapi CMS
- Converter markdown para formato Portable Text do Strapi
- Estruturar metadados, criar slugs e organizar conteúdo para SEO

CARACTERÍSTICAS:
- Role: "Formatador de Conteúdo"
- Goal: "Preparar o conteúdo traduzido para publicação no Strapi CMS"
- Suporte a modelos Pydantic para validação de dados
- Conversão automática de markdown para blocos Strapi

FERRAMENTAS UTILIZADAS:
1. read_from_file - Lê arquivos traduzidos
2. save_to_file - Salva arquivos formatados
3. create_slug - Cria slugs SEO-friendly
4. format_content_for_strapi - Formata conteúdo para estrutura do Strapi
5. convert_markdown_to_strapi_objects - Converte markdown para objetos Strapi

ESTRUTURA DE DADOS ESPERADA:
{
    "_type": "post",
    "title": "Título do artigo",
    "slug": {"_type": "slug", "current": "slug-do-artigo"},
    "publishedAt": "Data ISO",
    "excerpt": "Resumo",
    "content": [blocos Portable Text],
    "originalSource": {
        "url": "URL original",
        "title": "Título original",
        "site": "Site de origem"
    }
}

FUNCIONALIDADES ESPECIAIS:
- Detecta e formata headers (h1, h2, h3) automaticamente
- Divide conteúdo em parágrafos estruturados
- Valida dados usando modelos Pydantic quando disponíveis

================================================================================
3. PUBLISHER AGENT (publisher_agent.py)
================================================================================

PROPÓSITO:
- Publicar artigos formatados diretamente no Strapi CMS
- Garantir que todos os campos obrigatórios estejam presentes
- Adicionar metadados automaticamente (categorias, tags, autor)

CARACTERÍSTICAS:
- Role: "Publicador de Conteúdo"
- Goal: "Publicar os artigos formatados no Strapi CMS"
- Validação de posts antes da publicação
- Tratamento de erros de API

FERRAMENTAS UTILIZADAS:
1. read_from_file - Lê arquivos formatados
2. save_to_file - Salva logs de publicação
3. publish_to_strapi - Publicação básica no Strapi
4. publish_to_strapi_enhanced - Publicação avançada com detecção automática de categorias/tags

FUNCIONALIDADES DO publish_to_strapi_enhanced:
- Detecta categorias automaticamente (Bitcoin, Ethereum, DeFi, etc)
- Cria tags baseadas em criptomoedas mencionadas
- Adiciona autor padrão "Crypto Frontier"
- Cria categorias/tags inexistentes automaticamente

VALIDAÇÃO:
- Valida estrutura do post usando modelos Pydantic
- Verifica campos obrigatórios antes da publicação
- Converte dados para formato esperado pelo Strapi

================================================================================
4. IMAGE GENERATOR AGENT (image_generator_agent.py)
================================================================================

PROPÓSITO:
- Gerar imagens profissionais usando DALL-E 3 para todos os posts
- Garantir identidade visual consistente
- Fazer upload automático das imagens para o Strapi

CARACTERÍSTICAS:
- Role: "Gerador de Imagens Profissional"
- Goal: Processar TODOS os posts e gerar imagens relevantes
- Design especializado em criptomoedas e fintech
- Processamento em lote de múltiplos posts

FERRAMENTAS UTILIZADAS:
1. process_all_posts_with_images - Processa todos os posts em lote
2. generate_image_for_post - Gera imagem para post individual

PADRÕES VISUAIS OBRIGATÓRIOS:
- Fundo preto (#000000) com grid azul sutil
- Logos 3D volumétricos das criptomoedas
- Ondas de energia cyan radiantes
- Resolução 1792x1024 (16:9)
- Estilo fotorealista profissional

PROCESSO DE TRABALHO:
1. Lê posts de 'posts_formatados'
2. Gera prompts baseados no conteúdo
3. Cria imagens via DALL-E 3
4. Faz upload para Strapi
5. Salva posts com imagens em 'posts_com_imagem'
6. Reporta estatísticas (processados, sucessos, falhas)

CONHECIMENTOS ESPECIALIZADOS:
- Logos e símbolos de criptomoedas
- Design 3D fotorealista
- Composição visual editorial
- SEO e acessibilidade (alt text)

================================================================================
5. INDEXER AGENT (indexer_agent.py)
================================================================================

PROPÓSITO:
- Indexar artigos publicados no Algolia para busca
- Converter formato Strapi para formato Algolia
- Manter sincronização entre Strapi e Algolia

CARACTERÍSTICAS:
- Role: "Indexador de Conteúdo para Algolia"
- Goal: "Indexar os artigos publicados no Algolia para facilitar a busca"
- Conversão automática de formatos
- Tratamento de erros de indexação

FERRAMENTAS UTILIZADAS:
1. read_from_file - Lê arquivos publicados
2. save_to_file - Salva logs de indexação
3. index_to_algolia - Indexa conteúdo no Algolia
4. search_algolia - Busca conteúdo no Algolia
5. delete_from_algolia - Remove conteúdo do Algolia

CONVERSÃO DE FORMATO (Strapi → Algolia):
{
    "objectID": "slug ou ID único",
    "title": "Título",
    "content": "Texto extraído dos blocos",
    "date": "Data de publicação",
    "tags": ["tag1", "tag2"],
    "strapiId": "ID original do Strapi"
}

FUNCIONALIDADES ESPECIAIS:
- Extrai texto de blocos Portable Text
- Converte categorias em tags
- Mantém referência ao ID do Strapi
- Registra todas as operações para auditoria

================================================================================
6. MONITOR AGENT (monitor_agent.py)
================================================================================

PROPÓSITO:
- Monitorar feeds RSS de sites de criptomoedas
- Identificar artigos relevantes para tradução
- Evitar duplicação de conteúdo

CARACTERÍSTICAS:
- Role: "Monitor de Feeds RSS"
- Goal: "Encontrar artigos relevantes sobre criptomoedas em feeds RSS"
- Seleção criteriosa de conteúdo com maior impacto
- Verificação de duplicatas

FERRAMENTAS UTILIZADAS:
1. read_rss_feeds - Lê e processa feeds RSS
2. save_to_file - Salva artigos capturados
3. check_for_duplicates - Verifica se artigo já foi processado

PROCESSO:
- Monitora múltiplos feeds RSS configurados
- Filtra artigos por relevância
- Verifica duplicatas antes de salvar
- Prepara artigos para o pipeline de tradução

================================================================================
FLUXO GERAL DO SISTEMA
================================================================================

1. MONITOR AGENT captura artigos de feeds RSS
2. TRANSLATOR AGENT traduz artigos para português
3. FORMATTER AGENT formata para o Strapi CMS
4. IMAGE GENERATOR AGENT cria imagens profissionais
5. PUBLISHER AGENT publica no Strapi
6. INDEXER AGENT indexa no Algolia para busca

Cada agente é especializado em sua função e trabalha de forma coordenada
para automatizar completamente o processo de publicação de conteúdo.
"""