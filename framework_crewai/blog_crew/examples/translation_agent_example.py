#!/usr/bin/env python3
"""
Exemplo de como usar a ferramenta de tradução com um agente do CrewAI.
Execute este arquivo para testar a tradução como uma ferramenta de agente.
"""

import os
import logging
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("translation_example")

# Carrega as variáveis de ambiente
load_dotenv()

# Importa a ferramenta de tradução
from tools.translation_tool import GoogleTranslateTool, ArticleTranslatorTool

def main():
    """Executa o exemplo do agente tradutor."""
    logger.info("Iniciando exemplo do agente tradutor...")
    
    # Verificar se a chave da OpenAI está definida
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("Variável de ambiente OPENAI_API_KEY não definida!")
        return
    
    # Criar a ferramenta de tradução
    translate_tool = GoogleTranslateTool()
    article_translator = ArticleTranslatorTool()
    
    # Criar o agente tradutor
    translator_agent = Agent(
        role="Tradutor Profissional",
        goal="Traduzir texto de inglês para português com alta qualidade e precisão",
        backstory=("Você é um tradutor experiente especializado em tradução de inglês "
                  "para português. Você tem profundo conhecimento de ambos os idiomas "
                  "e é capaz de realizar traduções que mantêm o sentido original e "
                  "soam naturais no idioma de destino."),
        tools=[translate_tool, article_translator],
        verbose=True
    )
    
    # Criar tarefa de tradução
    translation_task = Task(
        description=(
            "Traduza o seguinte texto do inglês para o português: "
            "'{text}'. Utilize a ferramenta de tradução para obter o melhor resultado."
        ),
        expected_output="A tradução do texto fornecido para português brasileiro.",
        agent=translator_agent
    )
    
    # Criar equipe
    crew = Crew(
        agents=[translator_agent],
        tasks=[translation_task],
        process=Process.sequential,
        verbose=True
    )
    
    # Iniciar a tarefa
    result = crew.kickoff(inputs={
        "text": ("Artificial intelligence is transforming our world in ways we never "
                "imagined. From self-driving cars to advanced medical diagnostics, "
                "AI is opening new possibilities across every industry. However, this "
                "rapid advancement also brings challenges that we need to address carefully.")
    })
    
    logger.info(f"Resultado da tradução: {result}")
    return result

if __name__ == "__main__":
    main()