from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Garantir que a API Key do Gemini está definida
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Criar o LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

class FormatterAgent:
    """Agente formatador responsável por preparar o conteúdo para o Sanity CMS"""
    
    @staticmethod
    def create(tools):
        """Cria o agente formatador com as ferramentas necessárias"""
        return Agent(
            role="Formatador de Conteúdo",
            goal="Preparar o conteúdo traduzido para publicação no Sanity CMS",
            backstory="""Você é especialista em formatação de conteúdo para CMS. 
            Seu trabalho é transformar o artigo traduzido em um formato compatível com o Sanity CMS,
            organizando metadados, conteúdo e criando slugs apropriados. 
            Você conhece as boas práticas de SEO e sabe como estruturar o conteúdo 
            para maximizar a visibilidade nos mecanismos de busca.""",
            verbose=True,
            tools=[
                tools["read_from_file"], 
                tools["save_to_file"],
                tools["create_slug"],
                tools["format_content_for_sanity"]
            ],
            llm=llm
        )