"""
Definição das tarefas para o fluxo de automação de blog
"""

from crewai import Task

def create_monitoring_task(agent):
    """Cria a tarefa de monitoramento de feeds RSS"""
    return Task(
        description="""
        Monitore os feeds RSS definidos no arquivo feeds.json e encontre os 3 artigos mais relevantes
        e interessantes para o público brasileiro. 
        
        Para cada artigo:
        1. Avalie a relevância e interesse para o público brasileiro
        2. Verifique se o conteúdo é atual e informativo
        3. Colete título, link, resumo e data de publicação
        
        Salve cada artigo selecionado em um arquivo separado na pasta 'posts_para_traduzir'
        com nome 'para_traduzir_{timestamp}_{index}.json'
        
        Retorne a lista dos arquivos salvos.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON salvos na pasta 'posts_para_traduzir'"
    )

def create_translation_task(agent):
    """Cria a tarefa de tradução de artigos"""
    return Task(
        description="""
        Traduza os artigos encontrados na pasta 'posts_para_traduzir'.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo original
        2. Traduza o título, resumo e conteúdo para português brasileiro
        3. Adapte o texto para o público brasileiro, mantendo os termos técnicos conforme necessário
        4. Salve o artigo traduzido em um arquivo na pasta 'posts_traduzidos'
           com nome 'traduzido_{nome_original}'
        
        Retorne a lista dos arquivos traduzidos.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON traduzidos na pasta 'posts_traduzidos'"
    )

def create_formatting_task(agent):
    """Cria a tarefa de formatação para o Sanity CMS"""
    return Task(
        description="""
        Formate os artigos traduzidos da pasta 'posts_traduzidos' para o formato do Sanity CMS.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo traduzido
        2. Crie um slug a partir do título (remova acentos, substitua espaços por hífens, use letras minúsculas)
        3. Formate o conteúdo para o Sanity, separando em parágrafos
        4. Adicione metadados: título, slug, resumo, data de publicação
        5. Salve o artigo formatado em um arquivo na pasta 'posts_formatados'
           com nome 'formatado_{nome_original}'
        
        Retorne a lista dos arquivos formatados.
        """,
        agent=agent,
        expected_output="Lista de arquivos JSON formatados na pasta 'posts_formatados'"
    )

def create_publishing_task(agent):
    """Cria a tarefa de publicação no Sanity CMS"""
    return Task(
        description="""
        Publique os artigos formatados da pasta 'posts_formatados' no Sanity CMS.
        
        Para cada arquivo:
        1. Leia o arquivo JSON com o artigo formatado
        2. Publique o artigo no Sanity usando a ferramenta publish_to_sanity
        3. Verifique se a publicação foi bem-sucedida
        4. Se publicado com sucesso, mova o arquivo para 'posts_publicados'
           com nome 'publicado_{nome_original}'
        
        Retorne um relatório dos artigos publicados com sucesso.
        """,
        agent=agent,
        expected_output="Relatório de publicação dos artigos no Sanity CMS"
    )