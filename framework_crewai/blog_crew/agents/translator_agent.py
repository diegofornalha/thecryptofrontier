from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Garantir que a API Key do Gemini está definida
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Criar o LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

class TranslatorAgent:
    """Agente tradutor responsável por traduzir artigos para português brasileiro"""
    
    @staticmethod
    def create(tools):
        """Cria o agente tradutor com as ferramentas necessárias"""
        return Agent(
            role="Tradutor de Conteúdo",
            goal="Traduzir artigos de criptomoedas do inglês para português brasileiro com precisão e naturalidade",
            backstory="""Você é um tradutor especializado em criptomoedas e tecnologia blockchain.
            Você conhece a terminologia técnica e sabe adaptá-la para o público brasileiro.
            Sua tradução é fluida e natural, preservando o significado original do texto.
            Você sabe adaptar expressões idiomáticas e referências culturais para que o 
            conteúdo tenha mais relevância para o público brasileiro.""",
            verbose=True,
            tools=[tools["read_from_file"], tools["save_to_file"]],
            llm=llm
        )