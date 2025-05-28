"""
Tarefa de geração de imagens para posts
"""

from crewai import Task
import logging

logger = logging.getLogger("image_generation_task")

def create_image_generation_task(agent):
    """
    Cria a tarefa de geração de imagens
    
    Args:
        agent: O agente ImageGeneratorAgent
        
    Returns:
        Task: Tarefa configurada
    """
    return Task(
        description="""
        Para cada artigo formatado:
        1. Analise o título e resumo para identificar as criptomoedas mencionadas
        2. Gere uma imagem profissional usando DALL-E 3 seguindo o padrão visual:
           - Fundo preto (#000000) com grid azul sutil
           - Logo 3D volumétrico da(s) criptomoeda(s) detectada(s)
           - Ondas de energia cyan radiantes
           - Iluminação rim light azul (#003366)
           - Resolução 1792x1024 (16:9)
        3. Faça upload da imagem para o Sanity CMS
        4. Retorne a referência da imagem (mainImage) para ser incluída no post
        
        Use a ferramenta 'Generate and upload crypto image' que combina geração e upload.
        
        IMPORTANTE: Se a geração ou upload da imagem falhar (ex: limite de API atingido),
        NÃO interrompa o processo. Simplesmente copie o arquivo sem o campo mainImage
        para 'posts_com_imagem' para que o artigo possa ser publicado sem imagem.
        
        Os arquivos de entrada estão na pasta 'posts_formatados'.
        Salve os arquivos (com ou sem mainImage) em 'posts_com_imagem'.
        """,
        expected_output="""
        Lista de arquivos JSON atualizados com o campo mainImage preenchido,
        salvos na pasta 'posts_com_imagem'. Cada arquivo deve conter:
        - Todos os campos originais
        - Campo mainImage com a referência da imagem no Sanity
        - Informação sobre quais criptomoedas foram detectadas
        """,
        agent=agent,
        tools_to_use=["read_from_file", "save_to_file", "generate_and_upload_image"]
    )