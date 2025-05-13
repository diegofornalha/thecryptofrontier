#!/usr/bin/env python
# src/blog_automacao/crew.py

import os
from pathlib import Path
import google.generativeai as genai
from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task, tool
from crewai.llm import LLM
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
# from langchain_google_genai import ChatGoogleGenerativeAI
import litellm
import json
import importlib.util

# Ferramentas
from .tools.rss_tools import RssFeedTool
from .tools.sanity_tools import SanityPublishTool
# Importar outros tools conforme necessário

# Tentativa de carregar configurações do arquivo legado se as variáveis de ambiente não estiverem definidas
def load_legacy_config():
    config = {}
    legacy_config_path = Path(__file__).parent.parent.parent / 'agentes_backup_legado' / 'config.py'
    if legacy_config_path.exists():
        try:
            spec = importlib.util.spec_from_file_location("legacy_config", legacy_config_path)
            legacy_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(legacy_module)
            
            # Carregar variáveis relevantes
            config['GEMINI_API_KEY'] = getattr(legacy_module, 'GEMINI_API_KEY', None)
            config['GEMINI_MODEL'] = getattr(legacy_module, 'GEMINI_MODEL', 'gemini-1.5-flash') # Default para flash
            config['SANITY_PROJECT_ID'] = getattr(legacy_module, 'SANITY_PROJECT_ID', None)
            config['SANITY_DATASET'] = getattr(legacy_module, 'SANITY_DATASET', 'production')
            config['SANITY_API_TOKEN'] = getattr(legacy_module, 'SANITY_API_TOKEN', None)
            config['SANITY_API_VERSION'] = getattr(legacy_module, 'SANITY_API_VERSION', '2023-05-03')
            
        except Exception as e:
            print(f"Aviso: Não foi possível carregar ou ler o arquivo de configuração legado {legacy_config_path}: {e}")
    else:
        print(f"Aviso: Arquivo de configuração legado não encontrado em {legacy_config_path}")
    return config

# Carregar configurações legadas (se necessário)
legacy_cfg = load_legacy_config()

# Definir variáveis de ambiente se não estiverem definidas
# GEMINI
if not os.getenv('GEMINI_API_KEY') and legacy_cfg.get('GEMINI_API_KEY'):
    os.environ['GEMINI_API_KEY'] = legacy_cfg['GEMINI_API_KEY']
    print("GEMINI_API_KEY carregada do config legado.")

# Garantir que GOOGLE_API_KEY também seja definida se GEMINI_API_KEY estiver presente
gemini_api_key_from_env = os.getenv("GEMINI_API_KEY")
if gemini_api_key_from_env and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = gemini_api_key_from_env
    print("GOOGLE_API_KEY definida a partir de GEMINI_API_KEY.")

# SANITY
if not os.getenv('SANITY_PROJECT_ID') and legacy_cfg.get('SANITY_PROJECT_ID'):
    os.environ['SANITY_PROJECT_ID'] = legacy_cfg['SANITY_PROJECT_ID']
    print("SANITY_PROJECT_ID carregado do config legado.")
if not os.getenv('SANITY_DATASET') and legacy_cfg.get('SANITY_DATASET'):
    os.environ['SANITY_DATASET'] = legacy_cfg['SANITY_DATASET']
    print("SANITY_DATASET carregado do config legado.")
if not os.getenv('SANITY_API_TOKEN') and legacy_cfg.get('SANITY_API_TOKEN'):
    os.environ['SANITY_API_TOKEN'] = legacy_cfg['SANITY_API_TOKEN']
    print("SANITY_API_TOKEN carregado do config legado.")
if not os.getenv('SANITY_API_VERSION') and legacy_cfg.get('SANITY_API_VERSION'):
    os.environ['SANITY_API_VERSION'] = legacy_cfg['SANITY_API_VERSION']
    print("SANITY_API_VERSION carregado do config legado.")

# Garante que a chave API Gemini está disponível
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    print("ERRO CRÍTICO: A variável de ambiente GEMINI_API_KEY não está definida.")
    # Você pode querer lançar uma exceção aqui ou parar a execução
    # raise ValueError("GEMINI_API_KEY não definida.")

# Configurações LiteLLM para forçar o modelo Gemini
# Usar o nome do modelo que será passado para ChatGoogleGenerativeAI
LITELLM_GEMINI_MODEL_NAME = "gemini/gemini-1.5-flash"

# Definir um mapa de custos para o LiteLLM pode ajudar no reconhecimento
# os.environ["LITELLM_MODEL_COST_MAP"] = json.dumps({
#     LITELLM_GEMINI_MODEL_NAME: {"max_tokens": 8192, "input_cost_per_token": 0.00000035, "output_cost_per_token": 0.00000105}
# })
# print(f"LITELLM_MODEL_COST_MAP configurado para {LITELLM_GEMINI_MODEL_NAME}")

# Tentar forçar o modelo Gemini para o provedor Google no LiteLLM
# Embora ChatGoogleGenerativeAI deva lidar com isso, é uma tentativa extra
# os.environ["GOOGLE_GEMINI_MODEL"] = LITELLM_GEMINI_MODEL_NAME # ou "gemini-1.5-flash" sem o prefixo
# print(f"GOOGLE_GEMINI_MODEL configurado como {os.getenv('GOOGLE_GEMINI_MODEL')}")

# litellm.set_verbose=True # Ativar logs detalhados do LiteLLM
# print("Verbose mode do LiteLLM ativado.")

# Classe base para inicializar LLM e ferramentas comuns
class BaseCrewComponents:
    def __init__(self):
        # <<< RE-INTRODUZIR INICIALIZAÇÃO DO LLM DAQUI
        self.llm = LLM(
            model="gemini/gemini-1.5-flash", 
            config={'api_key': gemini_api_key, 'temperature': 0.7}
        )
        # pass # Apenas inicializa ferramentas REMOVIDO
        
        self.rss_feed_tool = RssFeedTool()
        self.sanity_publish_tool = SanityPublishTool()

@CrewBase
class BlogAutomacaoCrew(BaseCrewComponents):
    """Crew para automação completa de blog sobre criptomoedas."""

    agents_config = 'config/agents.yaml' # Adicionado para carregar config
    tasks_config = 'config/tasks.yaml'   # Adicionado para carregar config

    def __init__(self):
        """Inicializar a crew com configurações necessárias."""
        super().__init__() # Inicializa LLM (agora LLM do CrewAI) e ferramentas da classe base
        
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # ... (código legado de carregamento de chave, pode permanecer para definir env var)
            pass # A lógica principal de carregamento da chave API já está no topo do arquivo
        
        if api_key:
            os.environ["LANGCHAIN_TRACING_V2"] = "false"  
            os.environ["GOOGLE_API_KEY"] = api_key # Garantir que GOOGLE_API_KEY está definida
            print("LLM foi configurado explicitamente em BaseCrewComponents.")
        else:
            print("ATENÇÃO: Nenhuma chave API GEMINI_API_KEY encontrada...")
        
        # Criar diretórios necessários (movido para main.py onde faz mais sentido para o fluxo)
        # os.makedirs("posts_traduzidos", exist_ok=True)
        # os.makedirs("posts_publicados", exist_ok=True)

    # ----- Definição dos Agentes -----    
    @agent
    def monitor(self) -> Agent:
        """Agente para monitorar feeds RSS."""
        return Agent(
            config=self.agents_config["monitor"],
            tools=[self.rss_feed_tool], # Passa a instância da ferramenta
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def selector(self) -> Agent:
        """Agente para selecionar conteúdo relevante."""
        return Agent(
            config=self.agents_config["selector"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def translator(self) -> Agent:
        """Agente para traduzir conteúdo."""
        return Agent(
            config=self.agents_config["translator"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def localizer(self) -> Agent:
        """Agente para adaptar o conteúdo para o público brasileiro."""
        return Agent(
            config=self.agents_config["localizer"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def editor(self) -> Agent:
        """Agente para editar e revisar o conteúdo."""
        return Agent(
            config=self.agents_config["editor"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def formatter(self) -> Agent:
        """Agente para formatar o conteúdo em Markdown."""
        return Agent(
            config=self.agents_config["formatter"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def seo_analyst(self) -> Agent:
        """Agente para otimizar o conteúdo para SEO."""
        return Agent(
            config=self.agents_config["seo_analyst"],
            verbose=True,
            llm=self.llm
        )
    
    @agent
    def publisher(self) -> Agent:
        """Agente para publicar o conteúdo no CMS."""
        return Agent(
            config=self.agents_config["publisher"],
            tools=[self.sanity_publish_tool], # Passa a instância da ferramenta
            verbose=True,
            llm=self.llm
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
            agent=self.editor(), # Associar agente
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
            agents=[self.monitor(), self.selector()], # Readicionar selector
            tasks=[self.monitoring_task(), self.selection_task()], # Readicionar selection_task
            verbose=True,
            process=Process.sequential,
            llm=self.llm
        )
    
    @crew
    def traducao_crew(self) -> Crew:
        """Crew específica para tradução e adaptação de conteúdo."""
        return Crew(
            agents=[self.translator(), self.localizer(), self.editor()],
            tasks=[self.translation_task(), self.localization_task(), self.editing_task()],
            verbose=True,
            process=Process.sequential,
            llm=self.llm
        )
    
    @crew
    def publicacao_crew(self) -> Crew:
        """Crew específica para revisão, otimização e publicação."""
        return Crew(
            agents=[self.formatter(), self.seo_analyst(), self.publisher()],
            tasks=[self.editing_task(), self.seo_optimization_task(), self.publish_task()],
            verbose=True,
            process=Process.sequential,
            llm=self.llm
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
            process=Process.sequential,
            llm=self.llm
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