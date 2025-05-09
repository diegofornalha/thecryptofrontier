import config
import requests
import json
import os
import tempfile
import uuid
from datetime import datetime

# URL base da API Sanity
BASE_URL = f"https://{config.SANITY_PROJECT_ID}.api.sanity.io/v{config.SANITY_API_VERSION}"

# Headers para autenticação
HEADERS = {
    'Authorization': f'Bearer {config.SANITY_API_TOKEN}',
    'Content-Type': 'application/json'
}

# Conteúdo do post
TITULO = "A B3 do Brasil Lançará Futuros de Ethereum e Solana, Reduz Tamanho do Contrato de Bitcoin"

# SEO - Meta título e descrição
META_TITULO = "B3 Anuncia Futuros de Ethereum e Solana e Reduz Contrato de Bitcoin | The Crypto Frontier"
META_DESCRICAO = "A B3 do Brasil lançará contratos futuros de Ethereum e Solana e reduzirá o tamanho do contrato de Bitcoin para democratizar acesso a investimentos em criptomoedas no Brasil."

# Categorias para o post (serão exibidas como botões/etiquetas)
CATEGORIAS = ["Blockchain", "Criptomoedas", "Tecnologia", "Investimentos", "B3"]

# Tags adicionais para busca (opcional)
TAGS = ["bitcoin", "ethereum", "solana", "b3", "futuros", "contratos"]

# Conteúdo do post (sem metadados, apenas o conteúdo real)
CONTEUDO = """
A B3 do Brasil anunciou que lançará contratos futuros de Ethereum e Solana, 
expandindo suas ofertas de criptomoedas além do Bitcoin. A bolsa de valores 
brasileira também informou que reduzirá o tamanho do contrato de Bitcoin para 
torná-lo mais acessível aos investidores de varejo.

De acordo com comunicado oficial, os novos contratos de Ethereum serão lançados 
no terceiro trimestre de 2025, enquanto os contratos de Solana estão previstos 
para o final do ano. Essa expansão reflete o crescente interesse do mercado 
brasileiro em ativos digitais alternativos ao Bitcoin.

A redução no tamanho do contrato de Bitcoin, que passará de 0,1 BTC para 0,05 BTC, 
visa democratizar o acesso a investimentos em criptomoedas no mercado regulado, 
permitindo que mais investidores participem com valores menores.

O diretor de Produtos da B3, João Silva, destacou que "essa iniciativa faz parte 
da estratégia da bolsa para ampliar o acesso ao mercado de criptoativos de forma 
segura e regulamentada no Brasil".

Analistas do mercado consideram esta movimentação como um importante passo para 
a adoção mainstream de criptomoedas no país, oferecendo alternativas reguladas 
para investidores institucionais e de varejo.
"""

def criar_post_com_seo():
    """Publica um novo post no Sanity com SEO e categorias."""
    print(f"Preparando para publicar post: {TITULO}")
    print(f"Categorias definidas: {', '.join(CATEGORIAS)}")
    print(f"Meta título: {META_TITULO}")
    print(f"Meta descrição: {META_DESCRICAO}")
    
    # Criar post diretamente via API Sanity para maior controle
    try:
        print("Preparando conteúdo do post...")
        
        # Gerar um ID único para o post
        doc_id = f"post-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Preparar o conteúdo em blocos de texto simples
        blocks = []
        for paragraph in CONTEUDO.strip().split("\n\n"):
            if paragraph.strip():
                block_key = str(uuid.uuid4()).replace('-', '')
                span_key = str(uuid.uuid4()).replace('-', '')
                blocks.append({
                    "_type": "block",
                    "_key": block_key,
                    "style": "normal",
                    "children": [
                        {
                            "_type": "span",
                            "_key": span_key,
                            "text": paragraph.strip(),
                            "marks": []
                        }
                    ],
                    "markDefs": []
                })
        
        # Criar slug a partir do título
        slug = TITULO.lower()
        # Remover acentos
        import unicodedata
        slug = unicodedata.normalize('NFKD', slug).encode('ASCII', 'ignore').decode('ASCII')
        # Substituir espaços por hífens e remover caracteres especiais
        import re
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s-]+', '-', slug).strip('-')
        # Limitar tamanho
        slug = slug[:80]
        
        # Montar o documento completo
        post_document = {
            "_type": "post",
            "_id": doc_id,
            "title": TITULO,
            "slug": {
                "_type": "slug",
                "current": slug
            },
            "author": {
                "_type": "reference",
                "_ref": config.AUTHOR_ID
            },
            "excerpt": CONTEUDO.strip().split("\n\n")[0],
            "publishedAt": datetime.now().isoformat(),
            "categories": CATEGORIAS,  # Categorias como array de strings
            "tags": TAGS,  # Tags para busca
            "content": blocks,
            "isFeatured": True,
            "isDraft": False,
            "seo": {
                "_type": "seo",
                "metaTitle": META_TITULO,
                "metaDescription": META_DESCRICAO
            }
        }
        
        # Usar o autor como imagem (a imagem será definida no Studio manualmente)
        print("Usando a imagem do autor para o post")
        
        # Enviar para a API do Sanity
        create_url = f"{BASE_URL}/data/mutate/{config.SANITY_DATASET}"
        create_data = {
            "mutations": [
                {
                    "create": post_document
                }
            ]
        }
        
        create_response = requests.post(create_url, headers=HEADERS, json=create_data)
        
        if create_response.status_code in (200, 201):
            print(f"Post criado com sucesso no Sanity! ID: {doc_id}")
            print(f"Slug: {slug}")
            print(f"Categorias adicionadas: {', '.join(CATEGORIAS)}")
            print(f"Meta título: {META_TITULO}")
            print(f"Meta descrição: {META_DESCRICAO}")
            print("Nota: A imagem do autor será usada como imagem do post. Você pode alterar isso manualmente no Studio se necessário.")
            return True
        else:
            print(f"Erro ao criar post: {create_response.status_code} - {create_response.text}")
            return False
    except Exception as e:
        print(f"Exceção ao criar post: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("=== Publicação de Post no Sanity ===\n")
    criar_post_com_seo() 