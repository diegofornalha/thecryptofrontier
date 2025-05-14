import os
import json
from crewai import Agent # Importar Agent
from crewai.llm import LLM # Importação específica da classe LLM do CrewAI

# Carregar configuração centralizada
from config import config as app_config

# Importar modelos Pydantic para estruturação dos dados
try:
    from models import Post, dict_to_post, post_to_sanity_format
    from models.feed import FormattedArticle
    from models.post import Block, Span, SlugField
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False
    print("AVISO: Modelos Pydantic não encontrados!")

# Obter a chave da API.
api_key = os.getenv("GOOGLE_API_KEY") 
if not api_key:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("AVISO: GEMINI_API_KEY ou GOOGLE_API_KEY não encontradas no ambiente.")

# Criar o LLM usando a classe nativa do CrewAI com base na configuração
llm_settings = app_config.get('llm', {})
model_name_from_yaml = llm_settings.get('model', 'gemini-pro') 
temperature_from_yaml = llm_settings.get('temperature', 0.7)

prefixed_model_name = f"gemini/{model_name_from_yaml}"

llm_crew_config_dict = {
    'api_key': api_key, 
    'temperature': temperature_from_yaml,
}

llm = LLM(
    model=prefixed_model_name,
    config=llm_crew_config_dict
)

class FormatterAgent:
    """Agente formatador responsável por preparar o conteúdo para o Sanity CMS"""
    
    @staticmethod
    def create(tools):
        """Cria o agente formatador com as ferramentas necessárias"""
        # Filtrar ferramentas relevantes para este agente
        formatter_tools = [tool for tool in tools if tool.name in [
            "read_from_file", 
            "save_to_file",
            "create_slug",
            "format_content_for_sanity"
        ]]
        
        return Agent(
            role="Formatador de Conteúdo",
            goal="Preparar o conteúdo traduzido para publicação no Sanity CMS",
            backstory="""Você é especialista em formatação de conteúdo para CMS. 
            Seu trabalho é transformar o artigo traduzido em um formato compatível com o Sanity CMS,
            organizando metadados, conteúdo e criando slugs apropriados. 
            Você conhece as boas práticas de SEO e sabe como estruturar o conteúdo 
            para maximizar a visibilidade nos mecanismos de busca.
            
            Você é meticuloso e garante que os dados formatados estejam em conformidade 
            com o modelo Post da Pydantic, que reflete a estrutura de dados esperada pelo Sanity CMS.
            
            Você sabe como criar conteúdo no formato Portable Text do Sanity, dividindo o texto
            em blocos apropriados e aplicando formatação quando necessário.
            
            Você segue rigorosamente a estrutura de dados definida pelo formato JSON esperado:
            
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
                        "style": "normal|h1|h2|h3",
                        "children": [
                            {
                                "_type": "span",
                                "_key": "chave-única",
                                "text": "Texto do parágrafo"
                            }
                        ]
                    }
                ],
                "originalSource": {
                    "url": "URL original",
                    "title": "Título original",
                    "site": "Nome do site de origem"
                }
            }""",
            verbose=True,
            tools=formatter_tools,
            llm=llm
        )
        
    @staticmethod
    def format_post(post_data):
        """
        Formata os dados do post para o modelo Post do Pydantic
        
        Args:
            post_data: Dicionário com os dados do post
            
        Returns:
            Objeto Post formatado para o Sanity CMS
        """
        if not PYDANTIC_AVAILABLE:
            return post_data
            
        try:
            # Converter para modelo Pydantic
            if isinstance(post_data, dict) and "_type" not in post_data:
                # Formatar conteúdo se não estiver no formato Portable Text
                if "content" in post_data and isinstance(post_data["content"], str):
                    # Dividir em parágrafos
                    paragraphs = [p.strip() for p in post_data["content"].split('\n\n') if p.strip()]
                    if not paragraphs:
                        paragraphs = [p.strip() for p in post_data["content"].split('\n') if p.strip()]
                    if not paragraphs:
                        paragraphs = [post_data["content"].strip()]
                    
                    # Converter para blocos
                    blocks = []
                    for p in paragraphs:
                        if p.startswith('# '):
                            blocks.append(Block(
                                style="h1",
                                children=[Span(text=p[2:].strip())]
                            ).dict())
                        elif p.startswith('## '):
                            blocks.append(Block(
                                style="h2",
                                children=[Span(text=p[3:].strip())]
                            ).dict())
                        elif p.startswith('### '):
                            blocks.append(Block(
                                style="h3",
                                children=[Span(text=p[4:].strip())]
                            ).dict())
                        else:
                            blocks.append(Block(
                                style="normal",
                                children=[Span(text=p)]
                            ).dict())
                    
                    post_data["content"] = blocks
                
                # Criar slug se não existir
                if "slug" not in post_data and "title" in post_data:
                    from tools.formatter_tools import create_slug
                    slug_result = create_slug(post_data["title"])
                    if slug_result["success"]:
                        post_data["slug"] = {"_type": "slug", "current": slug_result["slug"]}
                
                # Adicionar tipo
                post_data["_type"] = "post"
            
            # Converter para modelo Pydantic
            if "_type" in post_data and post_data["_type"] == "post":
                post_model = dict_to_post(post_data)
                formatted_post = post_to_sanity_format(post_model)
                return formatted_post
            else:
                # Tentar formatar como FormattedArticle
                formatted_article = FormattedArticle(**post_data)
                return formatted_article.dict()
                
        except Exception as e:
            print(f"Erro ao formatar post: {str(e)}")
            return post_data  # Retornar dados originais em caso de erro