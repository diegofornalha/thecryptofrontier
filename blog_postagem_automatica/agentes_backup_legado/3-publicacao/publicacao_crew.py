#!/usr/bin/env python

import os
import sys
import json
import subprocess
from pathlib import Path
import frontmatter
from agentes_backup_legado import Agent, Crew, Task, Process

# Diretórios
POSTS_DIR = Path(__file__).parent.parent / "posts_traduzidos"
POSTS_PUBLICADOS_DIR = Path(__file__).parent.parent / "posts_publicados"

# Garantir que o diretório de posts publicados existe
POSTS_PUBLICADOS_DIR.mkdir(exist_ok=True)

# Define o agente editor/revisor
def criar_agente_editor():
    return Agent(
        role="Editor de Conteúdo de Criptomoedas",
        goal="Revisar e melhorar posts de blog sobre criptomoedas",
        backstory="""Você é um editor experiente especializado em conteúdo 
        de criptomoedas para o público brasileiro. Sua missão é garantir que 
        os artigos sejam claros, precisos e envolventes, mantendo a terminologia 
        técnica correta e adaptando o conteúdo para o contexto local.""",
        verbose=True,
        allow_delegation=False,
    )

# Define o agente de SEO
def criar_agente_seo():
    return Agent(
        role="Especialista em SEO para Criptomoedas",
        goal="Otimizar conteúdo para mecanismos de busca mantendo qualidade",
        backstory="""Você é um especialista em SEO com foco no mercado brasileiro 
        de criptomoedas. Você sabe identificar palavras-chave relevantes e 
        otimizar metadados para aumentar a visibilidade do conteúdo nos 
        mecanismos de busca, sem comprometer a qualidade editorial.""",
        verbose=True,
        allow_delegation=False,
    )

# Função para processar um único artigo com CrewAI
def processar_artigo_com_crew(arquivo_path):
    """Processa um artigo usando agentes CrewAI para melhorá-lo."""
    print(f"\nProcessando artigo: {arquivo_path.name}")
    
    try:
        # Ler o artigo
        post = frontmatter.load(arquivo_path)
        
        # Extrair metadados e conteúdo
        titulo = post.get('title', 'Sem título')
        tags = post.get('tags', [])
        categoria = post.get('category', 'Criptomoedas')
        conteudo = post.content
        
        # Inicializar agentes
        agente_editor = criar_agente_editor()
        agente_seo = criar_agente_seo()
        
        # Tarefa para o editor revisar o conteúdo
        tarefa_revisao = Task(
            description=f"""
            Revise e melhore o seguinte artigo sobre criptomoedas:
            
            Título: {titulo}
            
            {conteudo}
            
            Siga estas diretrizes na revisão:
            1. Corrija erros gramaticais e de estilo
            2. Melhore a clareza e o fluxo do texto
            3. Verifique a precisão técnica dos termos de criptomoedas
            4. Adicione exemplos relevantes para o público brasileiro quando apropriado
            5. Mantenha a estrutura de parágrafos e seções
            
            Retorne o artigo completo revisado, mantendo o formato Markdown.
            """,
            agent=agente_editor,
            expected_output="Artigo revisado e melhorado em formato Markdown"
        )
        
        # Executar revisão
        crew = Crew(
            agents=[agente_editor],
            tasks=[tarefa_revisao],
            verbose=1,
            process=Process.sequential
        )
        
        resultado_revisao = crew.kickoff()
        conteudo_revisado = resultado_revisao.raw
        
        # Tarefa para o especialista em SEO otimizar metadados
        tarefa_seo = Task(
            description=f"""
            Otimize os metadados do seguinte artigo sobre criptomoedas para SEO:
            
            Título atual: {titulo}
            Tags atuais: {', '.join(tags) if isinstance(tags, list) else tags}
            Categoria atual: {categoria}
            
            Primeiros parágrafos do conteúdo:
            {conteudo_revisado[:500]}...
            
            Forneça:
            1. Um título otimizado para SEO (max 70 caracteres)
            2. Uma lista de 5-8 tags relevantes para criptomoedas
            3. Uma categoria principal mais específica (ex: DeFi, NFTs, Bitcoin, etc.)
            4. Uma meta descrição otimizada (max 160 caracteres)
            
            Retorne no formato JSON:
            {{
                "titulo_seo": "Título otimizado",
                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
                "categoria": "Categoria específica",
                "meta_descricao": "Descrição otimizada para SEO"
            }}
            """,
            agent=agente_seo,
            expected_output="Metadados otimizados para SEO em formato JSON"
        )
        
        # Executar otimização de SEO
        crew = Crew(
            agents=[agente_seo],
            tasks=[tarefa_seo],
            verbose=1,
            process=Process.sequential
        )
        
        resultado_seo = crew.kickoff()
        
        try:
            # Tentar extrair o JSON do resultado
            seo_data = None
            for line in resultado_seo.raw.split('\n'):
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    seo_data = json.loads(line)
                    break
            
            if not seo_data:
                # Tentar extrair JSON entre blocos de código
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', resultado_seo.raw, re.DOTALL)
                if json_match:
                    seo_data = json.loads(json_match.group(1))
                else:
                    json_match = re.search(r'```\s*(.*?)\s*```', resultado_seo.raw, re.DOTALL)
                    if json_match:
                        seo_data = json.loads(json_match.group(1))
            
            if seo_data:
                # Atualizar metadados com as sugestões de SEO
                post['title'] = seo_data.get('titulo_seo', titulo)
                post['tags'] = seo_data.get('tags', tags)
                post['category'] = seo_data.get('categoria', categoria)
                post['description'] = seo_data.get('meta_descricao', conteudo[:160])
                
                # Atualizar o conteúdo com a versão revisada
                post.content = conteudo_revisado
                
                # Salvar o artigo revisado e otimizado
                with open(arquivo_path, 'w', encoding='utf-8') as f:
                    f.write(frontmatter.dumps(post))
                
                print(f"✅ Artigo revisado e otimizado: {arquivo_path.name}")
                return True
            else:
                print(f"⚠️ Não foi possível extrair dados de SEO do resultado.")
                # Apenas atualizar o conteúdo revisado
                post.content = conteudo_revisado
                with open(arquivo_path, 'w', encoding='utf-8') as f:
                    f.write(frontmatter.dumps(post))
                print(f"✅ Artigo apenas revisado: {arquivo_path.name}")
                return True
                
        except json.JSONDecodeError as e:
            print(f"⚠️ Erro ao decodificar JSON de SEO: {str(e)}")
            # Apenas atualizar o conteúdo revisado
            post.content = conteudo_revisado
            with open(arquivo_path, 'w', encoding='utf-8') as f:
                f.write(frontmatter.dumps(post))
            print(f"✅ Artigo apenas revisado: {arquivo_path.name}")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao processar artigo {arquivo_path.name}: {str(e)}")
        return False

# Função principal para publicar posts no Sanity após processamento com CrewAI
def publicar_posts():
    """Publica posts no Sanity após processamento com CrewAI."""
    print("Iniciando processamento de artigos com CrewAI e publicação no Sanity...")
    
    # Listar arquivos markdown na pasta de posts traduzidos
    arquivos = list(POSTS_DIR.glob("*.json"))
    
    if not arquivos:
        print("Nenhum artigo encontrado para processar.")
        return
    
    print(f"Encontrados {len(arquivos)} artigos para processar.")
    
    # Processar cada artigo com CrewAI
    artigos_processados = 0
    for arquivo in arquivos:
        if processar_artigo_com_crew(arquivo):
            artigos_processados += 1
    
    if artigos_processados > 0:
        print(f"\n{artigos_processados} artigos processados com CrewAI.")
        
        # Agora publicar no Sanity usando o script Node.js
        print("\nPublicando artigos no Sanity...")
        try:
            resultado = subprocess.run(
                ["node", os.path.join("scripts", "publicar_posts_markdown.js")],
                capture_output=True,
                text=True,
                check=True
            )
            print(resultado.stdout)
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao executar script de publicação no Sanity: {e}")
            print(f"Saída de erro: {e.stderr}")
    else:
        print("Nenhum artigo foi processado com sucesso.")

if __name__ == "__main__":
    try:
        publicar_posts()
    except KeyboardInterrupt:
        print("\nProcessamento interrompido pelo usuário.")
        sys.exit(0) 