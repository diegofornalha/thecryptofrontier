from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool, FileReadTool, FileWriteTool
import feedparser
import sys
import os

# Adiciona o diretório raiz ao path para poder importar o módulo redis_tools
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backup_legado_aprendizados.redis_tools import RedisFeedCache, RedisMemoryTool, RedisArticleQueue

class RSSFeedTool:
    """Ferramenta para buscar e processar feeds RSS."""
    
    def __init__(self):
        self.name = "RSSFeedTool"
        self.description = "Ferramenta para buscar conteúdo de feeds RSS."
        self.feed_cache = RedisFeedCache()
    
    def fetch_rss(self, url):
        """Busca conteúdo de um feed RSS específico com cache Redis."""
        try:
            feed_data = self.feed_cache.fetch_feed(url)
            entries = feed_data.get("entries", [])
            return entries
        except Exception as e:
            return f"Erro ao buscar feed RSS: {str(e)}"
    
    def fetch_multiple_feeds(self, urls):
        """Busca conteúdo de múltiplos feeds RSS com cache Redis."""
        all_entries = []
        for url in urls:
            entries = self.fetch_rss(url)
            if isinstance(entries, list):
                all_entries.extend(entries)
        
        # Ordenar por data de publicação, se disponível
        return all_entries

@CrewBase
class RSSToSanityCrew:
    """Crew para automação de RSS até publicação no Sanity"""

    @agent
    def rss_reader(self) -> Agent:
        rss_tool = RSSFeedTool()
        memory_tool = RedisMemoryTool()
        
        return Agent(
            config=self.agents_config['rss_reader'],
            verbose=True,
            tools=[
                rss_tool.fetch_rss, 
                rss_tool.fetch_multiple_feeds,
                memory_tool.save_context,
                memory_tool.get_context
            ]
        )

    @agent
    def content_analyst(self) -> Agent:
        memory_tool = RedisMemoryTool()
        
        return Agent(
            config=self.agents_config['content_analyst'],
            verbose=True,
            tools=[
                SerperDevTool(), 
                memory_tool.save_context,
                memory_tool.get_context
            ]
        )

    @agent
    def content_writer(self) -> Agent:
        memory_tool = RedisMemoryTool()
        
        return Agent(
            config=self.agents_config['content_writer'],
            verbose=True,
            tools=[
                memory_tool.save_context,
                memory_tool.get_context
            ]
        )

    @agent
    def sanity_publisher(self) -> Agent:
        memory_tool = RedisMemoryTool()
        article_queue = RedisArticleQueue()
        
        return Agent(
            config=self.agents_config['sanity_publisher'],
            verbose=True,
            tools=[
                FileWriteTool(),
                memory_tool.save_context,
                memory_tool.get_context,
                article_queue.queue_article,
                article_queue.mark_completed
            ]
        )

    @task
    def fetch_rss_task(self) -> Task:
        return Task(
            config=self.tasks_config['fetch_rss_task']
        )

    @task
    def analyze_content_task(self) -> Task:
        return Task(
            config=self.tasks_config['analyze_content_task']
        )

    @task
    def write_post_task(self) -> Task:
        return Task(
            config=self.tasks_config['write_post_task']
        )

    @task
    def format_for_sanity_task(self) -> Task:
        return Task(
            config=self.tasks_config['format_for_sanity_task'],
            output_file='output/sanity_post.json'
        )

    @crew
    def crew(self) -> Crew:
        """Cria a crew para o fluxo RSS até Sanity"""
        return Crew(
            agents=[
                self.rss_reader(),
                self.content_analyst(),
                self.content_writer(),
                self.sanity_publisher()
            ],
            tasks=[
                self.fetch_rss_task(),
                self.analyze_content_task(),
                self.write_post_task(),
                self.format_for_sanity_task()
            ],
            verbose=2,
            process=Process.sequential
        ) 