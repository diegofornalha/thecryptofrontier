"""
Definição das tarefas para o fluxo de automação de blog
"""

from crewai import Task
from typing import List, Dict, Any
from pydantic import BaseModel, Field

# Modelos Pydantic para saída das tarefas
class MonitoringResult(BaseModel):
    """Resultado da tarefa de monitoramento de feeds RSS"""
    files: List[str] = Field(..., description="Lista de arquivos JSON salvos na pasta 'posts_para_traduzir'")

class TranslationResult(BaseModel):
    """Resultado da tarefa de tradução de artigos"""
    files: List[str] = Field(..., description="Lista de arquivos JSON traduzidos salvos na pasta 'posts_traduzidos'")

class FormattingResult(BaseModel):
    """Resultado da tarefa de formatação para o Strapi CMS"""
    files: List[str] = Field(..., description="Lista de arquivos JSON formatados salvos na pasta 'posts_formatados'")

class PublishingResult(BaseModel):
    """Resultado da tarefa de publicação no Strapi CMS"""
    published_files: List[str] = Field(..., description="Lista dos arquivos que foram publicados e movidos para 'posts_publicados'")
    success_count: int = Field(..., description="Número de artigos publicados com sucesso")
    failed_count: int = Field(0, description="Número de artigos que falharam na publicação")
    failed_files: List[Dict[str, Any]] = Field(default_factory=list, description="Detalhes dos arquivos que falharam, incluindo mensagem de erro")

def create_monitoring_task(agent):
    """Cria a tarefa de monitoramento de feeds RSS"""
    from models.feed import FeedArticle
    
    return Task(
        description="""
        Monitore os feeds RSS definidos no arquivo feeds.json e encontre os 3 artigos mais relevantes
        e interessantes para o público brasileiro.
        
        IMPORTANTE: Verifique duplicatas e conteúdo inadequado
        1. Use a ferramenta check_for_duplicates para remover artigos duplicados ou de propaganda
        2. Rejeite artigos com as palavras-chave da blacklist (LiteFinance, Partner Application, etc.)
        3. Nunca processe o mesmo artigo mais de uma vez (verifique título e URL)
        
        Para cada artigo:
        1. Avalie a relevância e interesse para o público brasileiro
        2. Verifique se o conteúdo é atual e informativo
        3. Colete título, link, resumo e data de publicação
        
        Salve cada artigo selecionado em um arquivo separado na pasta 'posts_para_traduzir'
        com nome 'para_traduzir_TIMESTAMP_INDEX.json' (onde TIMESTAMP é a data/hora atual e INDEX é o número do artigo)
        
        O formato do JSON deve seguir a estrutura:
        {
            "title": "Título do artigo",
            "link": "URL do artigo",
            "summary": "Resumo do artigo",
            "published": "Data de publicação",
            "content": "Conteúdo completo do artigo",
            "source": "Nome do site de origem"
        }
        
        Retorne a lista dos arquivos salvos, incluindo apenas artigos únicos e relevantes.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON salvos na pasta 'posts_para_traduzir'",
        output_pydantic=MonitoringResult
    )

def create_translation_task(agent):
    """Cria a tarefa de tradução de artigos"""
    from models.feed import TranslatedArticle
    
    return Task(
        description="""
        Usando a lista de nomes de arquivos JSON fornecida pela tarefa anterior (localizados na pasta 'posts_para_traduzir'),
        processe cada arquivo da lista.
        
        Para cada arquivo na lista fornecida:
        1. Leia o arquivo JSON usando o nome do arquivo.
        2. Traduza o título, resumo e conteúdo para português brasileiro.
        3. Adapte o texto para o público brasileiro, mantendo os termos técnicos conforme necessário.
        4. Salve o artigo traduzido em um arquivo na pasta 'posts_traduzidos'
           com nome 'traduzido_NOME_ORIGINAL_DO_ARQUIVO.json'. (Ex: se o arquivo original era 'artigo_xyz.json', salve como 'traduzido_artigo_xyz.json')
        
        O formato do JSON deve seguir a estrutura:
        {
            "title": "Título traduzido",
            "link": "URL original do artigo",
            "summary": "Resumo traduzido",
            "published": "Data de publicação",
            "content": "Conteúdo completo traduzido",
            "source": "Nome do site de origem",
            "original_title": "Título original (não traduzido)"
        }
        
        Certifique-se de que o nome do arquivo salvo preserve o nome original após 'traduzido_'.
        Retorne a lista dos novos arquivos traduzidos salvos.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON traduzidos salvos na pasta 'posts_traduzidos'",
        output_pydantic=TranslationResult
    )

def create_formatting_task(agent):
    """Cria a tarefa de formatação para o Strapi CMS"""
    from models.feed import FormattedArticle
    
    return Task(
        description="""
        Usando a lista de nomes de arquivos JSON traduzidos fornecida pela tarefa anterior (localizados na pasta 'posts_traduzidos'),
        processe cada arquivo da lista.

        Para cada arquivo na lista fornecida:
        1. Leia o arquivo JSON com o artigo traduzido usando o nome do arquivo.
        2. Crie um slug a partir do título (remova acentos, substitua espaços por hífens, use letras minúsculas).
        3. Formate o conteúdo para o Strapi, separando em parágrafos.
        4. Adicione metadados: título, slug, resumo, data de publicação (use a data atual se não houver uma no arquivo).
        5. Salve o artigo formatado em um arquivo na pasta 'posts_formatados'
           com nome 'formatado_{nome_original_do_arquivo.json}'. (Ex: se o arquivo traduzido era 'traduzido_artigo_xyz.json', salve como 'formatado_artigo_xyz.json')
        
        O formato do JSON deve seguir a estrutura:
        {
            "_type": "post",
            "title": "Título do artigo",
            "slug": {"_type": "slug", "current": "slug-do-artigo"},
            "publishedAt": "Data ISO formatada",
            "excerpt": "Resumo do artigo",
            "content": [
                {
                    "_type": "block",
                    "_key": "chave-única",
                    "style": "normal|h1|h2|h3|blockquote",
                    "children": [
                        {
                            "_type": "span",
                            "_key": "chave-única",
                            "text": "Texto do parágrafo ou cabeçalho"
                        }
                    ]
                },
                ... outros blocos de conteúdo
            ],
            "originalSource": {
                "url": "URL original",
                "title": "Título original",
                "site": "Nome do site de origem"
            }
        }
        
        Certifique-se de que o nome do arquivo salvo preserve o nome original após 'formatado_'.
        Retorne a lista dos novos arquivos formatados salvos.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON formatados salvos na pasta 'posts_formatados'",
        output_pydantic=FormattingResult
    )

def create_publishing_task(agent):
    """Cria a tarefa de publicação no Strapi CMS"""
    from models.post import Post
    
    return Task(
        description="""
        Usando a lista de nomes de arquivos JSON com imagens fornecida pela tarefa anterior (localizados na pasta 'posts_com_imagem'),
        processe cada arquivo da lista.

        Para cada arquivo na lista fornecida:
        1. Leia o arquivo JSON com o artigo formatado e com imagem usando o nome do arquivo da pasta 'posts_com_imagem'.
        2. Use a ferramenta 'publish_to_strapi_enhanced' para publicar com metadados completos.
           Esta ferramenta:
           - Detecta automaticamente categorias baseadas no conteúdo
           - Extrai tags relevantes de criptomoedas mencionadas
           - Adiciona autor padrão "Crypto Frontier"
           - Cria categorias e tags automaticamente se necessário
        3. Passe apenas o conteúdo JSON do arquivo como parâmetro 'post_data'.
        4. Verifique se a publicação foi bem-sucedida através do retorno:
           - success: booleano indicando sucesso
           - document_id: ID do documento no Strapi
           - categories: lista de categorias detectadas
           - tags: lista de tags extraídas
           - error: mensagem de erro (se falhar)
        
        IMPORTANTE: Os arquivos devem ser lidos da pasta 'posts_com_imagem' que já contém as imagens processadas.
        Após publicação bem-sucedida, mova o arquivo para 'posts_publicados' com prefixo 'publicado_'.
        
        Retorne um relatório completo com:
        - Lista de arquivos publicados com sucesso
        - Total de sucessos e falhas
        - Categorias e tags detectadas para cada post
        """,
        agent=agent,
        expected_output="Relatório de publicação dos artigos no Strapi CMS, incluindo uma lista dos arquivos que foram publicados e movidos.",
        output_pydantic=PublishingResult
    )