"""
Tarefa de geração de imagens para posts - Versão 2 Simplificada
"""

from crewai import Task
import logging

logger = logging.getLogger("image_generation_task")

def create_image_generation_task(agent):
    """
    Cria a tarefa de geração de imagens simplificada
    
    Args:
        agent: O agente ImageGeneratorAgent
        
    Returns:
        Task: Tarefa configurada
    """
    return Task(
        description="""
        Processe TODAS as imagens para os artigos formatados usando a ferramenta 'process_all_formatted_posts'.
        
        Esta ferramenta irá automaticamente:
        1. Listar todos os posts em 'posts_formatados'
        2. Gerar imagens com DALL-E 3 para cada post
        3. Fazer upload das imagens para o Sanity
        4. Salvar os posts atualizados em 'posts_com_imagem'
        
        Simplesmente execute: process_all_formatted_posts()
        
        A ferramenta irá retornar um relatório com:
        - Total de posts processados
        - Quantidade de sucessos e falhas
        - Detalhes de cada processamento
        """,
        expected_output="""
        Relatório completo do processamento de imagens mostrando:
        - Total de posts processados
        - Quantidade de posts com imagem gerada com sucesso
        - Quantidade de falhas (se houver)
        - Lista detalhada dos resultados
        """,
        agent=agent,
        tools_to_use=["process_all_formatted_posts"]
    )