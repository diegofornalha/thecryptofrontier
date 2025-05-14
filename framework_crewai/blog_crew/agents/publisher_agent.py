from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Garantir que a API Key do Gemini está definida
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Criar o LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

class PublisherAgent:
    """Agente publicador responsável por publicar artigos no Sanity CMS"""
    
    @staticmethod
    def create(tools):
        """Cria o agente publicador com as ferramentas necessárias"""
        return Agent(
            role="Publicador de Conteúdo",
            goal="Publicar artigos formatados no Sanity CMS",
            backstory="""Você é responsável pela publicação final dos artigos no CMS.
            Você verifica se tudo está correto e realiza a publicação, garantindo que
            o conteúdo esteja disponível no blog. Você se orgulha de garantir que apenas
            conteúdo de alta qualidade seja publicado, fazendo uma verificação final
            de erros, formatação e consistência antes da publicação.""",
            verbose=True,
            tools=[tools["read_from_file"], tools["publish_to_sanity"], tools["save_to_file"]],
            llm=llm
        )