from crewai import Agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

# Garantir que a API Key do Gemini está definida
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")

# Criar o LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)

class MonitorAgent:
    """Agente monitor responsável por capturar artigos de feeds RSS"""
    
    @staticmethod
    def create(tools):
        """Cria o agente monitor com as ferramentas necessárias"""
        return Agent(
            role="Monitor de Feeds RSS",
            goal="Encontrar artigos relevantes sobre criptomoedas em feeds RSS",
            backstory="""Você é um especialista em monitoramento de notícias e feeds RSS.
            Sua função é verificar feeds de notícias de criptomoedas e identificar artigos
            relevantes e interessantes para serem traduzidos para o público brasileiro.
            Você tem um olhar aguçado para selecionar conteúdo que terá maior impacto.""",
            verbose=True,
            tools=[tools["read_rss_feeds"], tools["save_to_file"]],
            llm=llm
        )