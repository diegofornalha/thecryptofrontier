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
        Processe imagens para os artigos formatados seguindo estes passos:
        
        1. Use 'list_directory_files' para listar todos os arquivos em 'posts_formatados'
        2. Para cada arquivo encontrado:
           a) Use 'read_from_file' com o caminho completo do arquivo
           b) Analise o título e resumo para identificar criptomoedas mencionadas
           c) Use 'Generate and upload crypto image' para gerar e fazer upload da imagem
           d) Adicione o campo mainImage ao post com a referência da imagem
           e) Use 'save_to_file' para salvar o arquivo atualizado em 'posts_com_imagem'
        
        Padrão visual das imagens:
        - Fundo preto (#000000) com grid azul sutil
        - Logo 3D volumétrico da(s) criptomoeda(s) detectada(s)
        - Ondas de energia cyan radiantes
        - Iluminação rim light azul (#003366)
        - Resolução 1792x1024 (16:9)
        
        IMPORTANTE: Se a geração ou upload da imagem falhar (ex: limite de API atingido),
        NÃO interrompa o processo. Simplesmente copie o arquivo sem o campo mainImage
        para 'posts_com_imagem' para que o artigo possa ser publicado sem imagem.
        """,
        expected_output="""
        Lista de arquivos JSON atualizados com o campo mainImage preenchido,
        salvos na pasta 'posts_com_imagem'. Cada arquivo deve conter:
        - Todos os campos originais
        - Campo mainImage com a referência da imagem no Sanity
        - Informação sobre quais criptomoedas foram detectadas
        """,
        agent=agent,
        tools_to_use=["list_directory_files", "read_from_file", "save_to_file", "generate_and_upload_image"]
    )