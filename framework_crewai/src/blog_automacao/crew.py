#!/usr/bin/env python
# src/blog_automacao/crew.py

import os
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task, tool
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
from langchain_google_genai import ChatGoogleGenerativeAI
import litellm

@CrewBase
class BlogAutomacaoCrew:
    """Crew para automação completa de blog sobre criptomoedas."""

    agents_config = 'config/agents.yaml' # Adicionado para carregar config
    tasks_config = 'config/tasks.yaml'   # Adicionado para carregar config

    def __init__(self):
        """Inicializar a crew com configurações necessárias."""
        # Inicializar llm com None
        self.llm = None
        
        # Configurar API Gemini se a chave estiver disponível
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # Tentar carregar de agentes_backup_legado/config.py
            try:
                import sys
                # Este caminho pode precisar de ajuste dependendo de onde o script é executado
                # Se src/blog_automacao/crew.py, então agentes_backup_legado estaria em ../../agentes_backup_legado
                # Vamos assumir que está na raiz do projeto para simplificar por enquanto, ou que o PYTHONPATH está configurado
                # sys.path.append(str(Path(__file__).parent.parent / "agentes_backup_legado"))
                from config import GEMINI_API_KEY, GEMINI_MODEL # Esta linha pode falhar se config.py não estiver no path
                api_key = GEMINI_API_KEY
                os.environ["GEMINI_API_KEY"] = api_key
                print(f"Carregada chave API Gemini do arquivo de configuração legado.")
            except ImportError:
                print("Aviso: Não foi possível importar configurações do Gemini de agentes_backup_legado/config.py.")
        
        if api_key:
            # Configurar Gemini
            genai.configure(api_key=api_key)
            
            # Configuração especial para CrewAI - necessária chave OpenAI mesmo usando Gemini
            # os.environ["OPENAI_API_KEY"] = "sk-123"  # Chave fictícia para evitar erros. Removido para ver se o CrewAI lida bem sem.
            os.environ["LANGCHAIN_TRACING_V2"] = "false"  # Desativar rastreamento
            
            # Configuração correta do LiteLLM e Gemini
            # Definir API key do Google no ambiente
            os.environ["GOOGLE_API_KEY"] = api_key
            
            # Configurando o modelo para os agentes usando LangChain
            try:
                # LangChain API com modelo correto (sem prefixo models/)
                self.llm = ChatGoogleGenerativeAI(
                    model="google/gemini-1.5-flash", # Adicionar prefixo do provedor para LiteLLM
                    google_api_key=api_key,
                    temperature=0.7,
                    convert_system_message_to_human=True,
                )
                
                # Configurar diretamente o LiteLLM
                litellm.drop_params = True  # Ignorar parâmetros não suportados
                # litellm.model = "google/gemini-1.5-flash" # Removido, pois self.llm é passado aos agentes
                
                print("Modelo Gemini configurado com sucesso para os agentes.")
            except Exception as e:
                print(f"Erro ao configurar modelo Gemini: {str(e)}")
                print("Recomendação: Use o modo direto com --direto para monitoramento sem depender do Gemini.")
        else:
            print("ATENÇÃO: Nenhuma chave API encontrada para Gemini. O sistema não funcionará corretamente sem um LLM configurado.")
            print("Recomendação: Use o modo direto com --direto para monitoramento sem depender do Gemini.")
        
        # Criar diretórios necessários (movido para main.py onde faz mais sentido para o fluxo)
        # os.makedirs("posts_traduzidos", exist_ok=True)
        # os.makedirs("posts_publicados", exist_ok=True)

    # ----- Definição dos Agentes -----    
    @agent
    def monitor(self) -> Agent:
        """Agente para monitorar feeds RSS."""
        return Agent(
            config=self.agents_config["monitor"],
            verbose=True,
            tools=[self.rss_feed_tool()], # Definir ferramenta explicitamente
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def selector(self) -> Agent:
        """Agente para selecionar conteúdo relevante."""
        return Agent(
            config=self.agents_config["selector"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def translator(self) -> Agent:
        """Agente para traduzir conteúdo."""
        return Agent(
            config=self.agents_config["translator"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def localizer(self) -> Agent:
        """Agente para adaptar o conteúdo para o público brasileiro."""
        return Agent(
            config=self.agents_config["localizer"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def editor(self) -> Agent:
        """Agente para editar e revisar o conteúdo."""
        return Agent(
            config=self.agents_config["editor"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def formatter(self) -> Agent:
        """Agente para formatar o conteúdo em Markdown."""
        return Agent(
            config=self.agents_config["formatter"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def seo_analyst(self) -> Agent:
        """Agente para otimizar o conteúdo para SEO."""
        return Agent(
            config=self.agents_config["seo_analyst"],
            verbose=True,
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    @agent
    def publisher(self) -> Agent:
        """Agente para publicar o conteúdo no CMS."""
        return Agent(
            config=self.agents_config["publisher"],
            verbose=True,
            tools=[self.sanity_publish_tool()], # Definir ferramenta explicitamente
            llm=self.llm if hasattr(self, 'llm') and self.llm is not None else None
        )
    
    # ----- Definição das Ferramentas (agora como métodos) -----
    def sanity_publish_tool(self) -> SanityPublishTool:
        """Retorna uma instância da ferramenta para publicar no Sanity."""
        return SanityPublishTool()

    def rss_feed_tool(self) -> RssFeedTool:
        """Retorna uma instância da ferramenta de RSS."""
        return RssFeedTool()
    
    # ----- Definição das Tarefas -----    
    @task
    def monitoring_task(self) -> Task:
        """Tarefa para analisar artigos de feeds RSS."""
        return Task(
            config=self.tasks_config["monitoring_task"],
            agent=self.monitor() # Associar agente
        )
    
    @task
    def selection_task(self) -> Task:
        """Tarefa para selecionar artigos relevantes."""
        return Task(
            config=self.tasks_config["selection_task"],
            agent=self.selector(), # Associar agente
            context=[self.monitoring_task()] # Definir dependência
        )
    
    @task
    def translation_task(self) -> Task:
        """Tarefa para traduzir artigos selecionados."""
        return Task(
            config=self.tasks_config["translation_task"],
            agent=self.translator() # Associar agente
        )
    
    @task
    def localization_task(self) -> Task:
        """Tarefa para adaptar o conteúdo para o público brasileiro."""
        return Task(
            config=self.tasks_config["localization_task"],
            agent=self.localizer(), # Associar agente
            context=[self.translation_task()] # Definir dependência
        )
    
    @task
    def editing_task(self) -> Task:
        """Tarefa para revisar e editar o conteúdo."""
        return Task(
            config=self.tasks_config["editing_task"],
            agent=self.editor() # Associar agente
            # O contexto (output da localization_task) é passado pelo main.py via input da crew
            # ou se a localization_task salvar em arquivo e esta ler.
            # Para fluxo em memória, precisaria de `context=[self.localization_task()]` se fizesse parte da MESMA crew
        )
    
    @task
    def seo_optimization_task(self) -> Task:
        """Tarefa para otimizar o conteúdo para SEO."""
        return Task(
            config=self.tasks_config["seo_optimization_task"],
            agent=self.seo_analyst(), # Associar agente
            context=[self.editing_task()] # Definir dependência
        )
    
    @task
    def publish_task(self) -> Task:
        """Tarefa para publicar o conteúdo no CMS."""
        return Task(
            config=self.tasks_config["publish_task"],
            agent=self.publisher(), # Associar agente
            context=[self.seo_optimization_task()] # Definir dependência
        )
    
    # ----- Configuração da Crew -----    
    @crew
    def monitoramento_crew(self) -> Crew:
        """Crew específica para monitoramento e seleção de conteúdo."""
        return Crew(
            agents=[self.monitor(), self.selector()],
            tasks=[self.monitoring_task(), self.selection_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def traducao_crew(self) -> Crew:
        """Crew específica para tradução e adaptação de conteúdo."""
        return Crew(
            agents=[self.translator(), self.localizer()],
            tasks=[self.translation_task(), self.localization_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def publicacao_crew(self) -> Crew:
        """Crew específica para revisão, otimização e publicação."""
        return Crew(
            agents=[self.editor(), self.seo_analyst(), self.publisher()],
            tasks=[self.editing_task(), self.seo_optimization_task(), self.publish_task()],
            verbose=True,
            process=Process.sequential
        )
    
    @crew
    def crew_completa(self) -> Crew:
        """Crew completa com todos os agentes e tarefas em sequência lógica."""
        # Esta crew assume que os dados são passados via sistema de arquivos entre as etapas,
        # conforme orquestrado pelo main.py. Portanto, as dependências de contexto aqui
        # são mais para a ordem lógica dentro de uma etapa, se aplicável.
        return Crew(
            agents=[
                self.monitor(), self.selector(),
                self.translator(), self.localizer(),
                self.editor(), self.formatter(), self.seo_analyst(), self.publisher()
            ],
            tasks=[
                self.monitoring_task(), self.selection_task(),
                self.translation_task(), self.localization_task(),
                self.editing_task(), # self.formatting_task(), # Adicionar se tiver agente formatter na crew completa
                self.seo_optimization_task(), self.publish_task()
            ],
            verbose=True,
            process=Process.sequential
        )

# Este bloco é útil se você quiser executar este arquivo diretamente para teste
# Ele não é o ponto de entrada padrão do `crewai run`
if __name__ == "__main__":
    print("## Bem-vindo à Crew de Automação de Blog! ##")
    print('-----------------------------------------------')

    # Exemplo de como receber input (substitua pela sua lógica real)
    # A string do input foi corrigida para ser uma linha única.
    markdown_input = input("Cole o conteúdo markdown completo do post original (com frontmatter): ")

    # Montar os inputs para a crew
    inputs = {
        'markdown_original': markdown_input
        # Adicione outros inputs globais se necessário
    }

    # Criar e executar a crew
    blog_crew = BlogAutomacaoCrew()

    # Exemplo de como executar uma sub-crew (ex: traducao_crew)
    # Esta parte precisa de um 'markdown_original' ou um 'arquivo_markdown'
    # dependendo de como a primeira tarefa da traducao_crew (translation_task) espera o input.
    # Conforme tasks.yaml, translation_task espera {arquivo_markdown}
    # Este bloco if __name__ precisaria criar um arquivo temporário para testar.

    # print("\nIniciando uma sub-crew de exemplo (traducao_crew)...")
    # Supondo que você queira testar a traducao_crew aqui:
    # temp_file_path = Path("temp_test_article_for_crew_py.md")
    # with open(temp_file_path, 'w') as f:
    #     f.write(markdown_input)
    # test_inputs = {'arquivo_markdown': str(temp_file_path)}
    # result = blog_crew.traducao_crew().kickoff(inputs=test_inputs)
    # temp_file_path.unlink() # Limpar arquivo temporário

    print("\nO bloco if __name__ == '__main__' em crew.py é para testes diretos deste arquivo.")
    print("Para executar o fluxo principal, use o script main.py.")
    # print("Resultado da sub-crew de exemplo:")
    # print(result)

    print("\n\n########################")
    # print("## Resultado da Execução da Crew:")
    # print(result)
    print("########################") 