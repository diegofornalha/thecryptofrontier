"""
Configuração para usar o novo tipo de documento 'agentPost' no Sanity
"""

# Tipo de documento a ser usado pelo agente
SANITY_DOCUMENT_TYPE = "agentPost"

# Campos simplificados para o agente
AGENT_POST_FIELDS = {
    "_type": SANITY_DOCUMENT_TYPE,
    "required_fields": [
        "title",
        "slug",
        "content",
        "excerpt",
        "publishedAt",
        "mainImage"
    ],
    "optional_fields": [
        "author",
        "originalSource"
    ],
    # Campos removidos temporariamente
    "removed_fields": [
        "categories",
        "tags", 
        "seo"
    ]
}

# Template para criar posts do agente
AGENT_POST_TEMPLATE = {
    "_type": SANITY_DOCUMENT_TYPE,
    "publishedAt": None,  # Será preenchido com datetime atual
    "author": {
        "_type": "reference",
        "_ref": None  # ID do autor padrão do agente
    }
}

# Instruções para o agente
AGENT_INSTRUCTIONS = """
IMPORTANTE: Ao publicar posts no Sanity, use o tipo 'agentPost' ao invés de 'post'.

Campos obrigatórios:
- title: Título do artigo (10-100 caracteres)
- slug: URL amigável (será gerado automaticamente do título)
- content: Conteúdo em formato Portable Text
- excerpt: Resumo do artigo (máximo 300 caracteres)
- publishedAt: Data/hora de publicação (use datetime atual)
- mainImage: Imagem principal (você já está gerando e fazendo upload)

Campos opcionais:
- author: Referência ao autor (use o ID do autor padrão se disponível)
- originalSource: Informações da fonte original (url, title, site)

NÃO PREENCHA estes campos (foram temporariamente removidos):
- categories
- tags
- seo
"""