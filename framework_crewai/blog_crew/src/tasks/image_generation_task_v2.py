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
        Processe TODAS as imagens para os artigos formatados usando a ferramenta 'process_all_posts_with_images'.
        
        IMPORTANTE: Use SOMENTE a ferramenta 'process_all_posts_with_images' (não 'process_all_formatted_posts').
        
        Esta ferramenta irá automaticamente:
        1. Listar todos os posts em 'posts_formatados'
        2. Detectar criptomoedas mencionadas nos títulos
        3. Gerar prompts otimizados para cada contexto
        4. Criar imagens com DALL-E 3 (1792x1024, HD)
        5. Fazer upload direto para o Strapi
        6. Salvar posts atualizados em 'posts_com_imagem'
        7. Salvar backup das imagens em 'posts_imagens'
        
        A ferramenta irá retornar estatísticas completas:
        - Total processados
        - Sucessos e falhas
        - Detalhes de cada operação
        
        Se houver falhas, você pode usar 'generate_image_for_post' para tentar novamente posts específicos.
        """,
        expected_output="""
        Relatório completo do processamento de imagens:
        - Total de posts processados: X
        - Imagens geradas com sucesso: Y
        - Falhas: Z (se houver)
        - Lista detalhada com status de cada post
        - Asset IDs das imagens no Strapi
        """,
        agent=agent,
        tools_to_use=["process_all_posts_with_images", "generate_image_for_post"]
    )