#!/usr/bin/env python3
"""
Exemplo de uso do ContentAPIClient - Cliente Unificado de Conteúdo

Este script demonstra todas as funcionalidades do cliente unificado,
incluindo operações CRUD, detecção automática de metadados e métricas.
"""

import sys
import os
from pathlib import Path

# Adicionar diretório src ao path
sys.path.append(str(Path(__file__).parent.parent))

from src.core.content_api_client import get_content_client, ContentAPIClient
import json
from datetime import datetime

def exemplo_basico():
    """Exemplo básico de criação de post"""
    print("\n=== EXEMPLO BÁSICO ===")
    
    client = get_content_client()
    
    # Criar um post simples
    result = client.create_post({
        "title": "Bitcoin: A Revolução Digital",
        "content": "O Bitcoin continua sendo a principal criptomoeda do mercado...",
        "excerpt": "Uma análise sobre o Bitcoin"
    })
    
    print(f"Resultado: {json.dumps(result, indent=2)}")
    return result.get("document_id")

def exemplo_deteccao_automatica():
    """Exemplo com detecção automática de categorias e tags"""
    print("\n=== DETECÇÃO AUTOMÁTICA DE METADADOS ===")
    
    client = get_content_client()
    
    # Post com conteúdo rico para detecção
    conteudo = """
    O Ethereum está revolucionando o mundo das finanças descentralizadas (DeFi).
    Protocolos como Uniswap, Aave e Compound estão criando um novo sistema financeiro.
    
    Com a implementação do Ethereum 2.0 e a mudança para Proof of Stake, 
    a rede está se tornando mais sustentável e escalável. Smart contracts
    permitem a criação de aplicações complexas sem intermediários.
    
    O trading de ETH tem mostrado padrões interessantes, com suporte forte
    em níveis chave. NFTs no OpenSea continuam populares, especialmente
    na rede Ethereum.
    """
    
    result = client.create_post({
        "title": "Ethereum e DeFi: O Futuro das Finanças",
        "content": conteudo,
        "excerpt": "Como o Ethereum está transformando o sistema financeiro global"
    }, auto_metadata=True)
    
    if result['success']:
        print(f"Post criado com sucesso!")
        print(f"ID: {result['document_id']}")
        print(f"Categorias detectadas: {result['categories']}")
        print(f"Tags detectadas: {result['tags']}")
        print(f"Autor: {result['author']}")
    else:
        print(f"Erro: {result['error']}")
    
    return result.get("document_id")

def exemplo_atualizacao():
    """Exemplo de atualização de post"""
    print("\n=== ATUALIZAÇÃO DE POST ===")
    
    client = get_content_client()
    
    # Primeiro, criar um post para atualizar
    create_result = client.create_post({
        "title": "Análise de Mercado - Versão Inicial",
        "content": "Conteúdo inicial do post...",
        "excerpt": "Resumo inicial"
    })
    
    if create_result['success']:
        post_id = create_result['document_id']
        print(f"Post criado: {post_id}")
        
        # Atualizar o post
        update_result = client.update_post(
            post_id=post_id,
            updates={
                "title": "Análise de Mercado - Atualizada",
                "content": "Conteúdo atualizado com novas informações sobre Bitcoin e Ethereum",
                "categories": ["Análise de Mercado", "Bitcoin", "Ethereum"],
                "tags": ["trading", "btc", "eth", "análise técnica"]
            }
        )
        
        print(f"Atualização: {json.dumps(update_result, indent=2)}")
        return post_id
    
    return None

def exemplo_busca_listagem():
    """Exemplo de busca e listagem de posts"""
    print("\n=== BUSCA E LISTAGEM ===")
    
    client = get_content_client()
    
    # Listar posts
    print("Listando últimos 5 posts:")
    list_result = client.list_posts(limit=5)
    
    if list_result['success']:
        print(f"Total de posts encontrados: {list_result['count']}")
        for i, post in enumerate(list_result['posts'], 1):
            print(f"{i}. {post.get('title', 'Sem título')} (ID: {post.get('_id', 'N/A')})")
    
    # Buscar post específico (se houver)
    if list_result['success'] and list_result['posts']:
        first_post = list_result['posts'][0]
        post_id = first_post.get('_id')
        
        print(f"\nBuscando post por ID: {post_id}")
        get_result = client.get_post(post_id=post_id)
        
        if get_result['success']:
            post = get_result['post']
            print(f"Título: {post.get('title')}")
            print(f"Publicado em: {post.get('publishedAt', 'N/A')}")
            print(f"Slug: {post.get('slug', {}).get('current', 'N/A')}")

def exemplo_gerenciamento_metadados():
    """Exemplo de gerenciamento direto de categorias e tags"""
    print("\n=== GERENCIAMENTO DE METADADOS ===")
    
    client = get_content_client()
    
    # Criar categorias
    print("Criando categorias...")
    categorias = ["Web3", "Metaverso", "GameFi"]
    category_refs = client.manage_categories(categorias)
    print(f"Categorias criadas: {len(category_refs)}")
    
    # Criar tags
    print("\nCriando tags...")
    tags = ["play-to-earn", "virtual-reality", "blockchain-gaming"]
    tag_refs = client.manage_tags(tags)
    print(f"Tags criadas: {len(tag_refs)}")
    
    # Garantir autor
    print("\nGarantindo autor...")
    author_ref = client.ensure_author_exists("Crypto Frontier Team")
    print(f"Autor configurado: {author_ref is not None}")

def exemplo_conversao_formatos():
    """Exemplo de conversão de formatos"""
    print("\n=== CONVERSÃO DE FORMATOS ===")
    
    # Criar slug
    titulo = "Como Investir em Criptomoedas: Guia Completo 2024"
    slug = ContentAPIClient.criar_slug(titulo)
    print(f"Título: {titulo}")
    print(f"Slug: {slug}")
    
    # Converter texto para Portable Text
    texto = """Este é o primeiro parágrafo do artigo.

Este é o segundo parágrafo com mais informações.

E aqui temos o terceiro parágrafo conclusivo."""
    
    blocks = ContentAPIClient.texto_para_portable_text(texto)
    print(f"\nTexto convertido em {len(blocks)} blocos")
    print("Primeiro bloco:")
    print(json.dumps(blocks[0], indent=2))

def exemplo_metricas():
    """Exemplo de uso de métricas"""
    print("\n=== MÉTRICAS DO CLIENTE ===")
    
    client = get_content_client()
    
    # Executar algumas operações para gerar métricas
    print("Executando operações para gerar métricas...")
    
    # Criar alguns posts
    for i in range(3):
        client.create_post({
            "title": f"Post de Teste {i+1}",
            "content": f"Conteúdo do post {i+1}",
            "excerpt": f"Resumo {i+1}"
        })
    
    # Listar posts
    client.list_posts(limit=5)
    
    # Obter métricas
    metrics = client.get_metrics()
    
    print("\nMétricas coletadas:")
    print(f"Total de requisições: {metrics['total_requests']}")
    print(f"Requisições bem-sucedidas: {metrics['successful_requests']}")
    print(f"Requisições falhadas: {metrics['failed_requests']}")
    print(f"Taxa de sucesso: {metrics['success_rate']:.2%}")
    print(f"Tempo médio de resposta: {metrics['average_response_time']:.3f}s")
    print("\nOperações por tipo:")
    for op, count in metrics['operations'].items():
        if count > 0:
            print(f"  {op}: {count}")

def exemplo_cache():
    """Exemplo de uso do cache"""
    print("\n=== USO DO CACHE ===")
    
    client = get_content_client()
    
    # Criar mesma categoria várias vezes (será cacheada)
    print("Criando categoria 'DeFi' 3 vezes...")
    for i in range(3):
        start = datetime.now()
        client.manage_categories(["DeFi"])
        end = datetime.now()
        duration = (end - start).total_seconds()
        print(f"  Tentativa {i+1}: {duration:.3f}s")
    
    print("\nLimpando cache...")
    client.reset_cache()
    
    print("Criando categoria 'DeFi' novamente após limpar cache...")
    start = datetime.now()
    client.manage_categories(["DeFi"])
    end = datetime.now()
    duration = (end - start).total_seconds()
    print(f"  Tempo: {duration:.3f}s")

def exemplo_post_completo():
    """Exemplo de criação de post completo com todos os recursos"""
    print("\n=== POST COMPLETO COM TODOS OS RECURSOS ===")
    
    client = get_content_client()
    
    # Conteúdo rico e detalhado
    conteudo = """
    # A Revolução das Criptomoedas em 2024

    O mercado de criptomoedas está passando por transformações significativas.
    Bitcoin continua liderando com sua proposta de reserva de valor digital,
    enquanto Ethereum domina o espaço de contratos inteligentes.

    ## DeFi: O Novo Sistema Financeiro

    Protocolos DeFi como Uniswap, Aave, Compound e Curve estão criando
    alternativas reais ao sistema financeiro tradicional. O yield farming
    e liquidity mining continuam atraindo bilhões em TVL.

    ## NFTs e Web3

    O mercado de NFTs evoluiu além de simples arte digital. Agora temos:
    - Gaming NFTs com utilidade real
    - Música e entretenimento tokenizados
    - Identidade digital e credenciais on-chain

    ## Regulação e Adoção Institucional

    A SEC e outros órgãos reguladores estão criando frameworks mais claros.
    Grandes empresas como Tesla, MicroStrategy e El Salvador continuam
    acumulando Bitcoin como reserva de tesouraria.

    ## Tecnologias Emergentes

    - Layer 2 solutions (Polygon, Arbitrum, Optimism)
    - Cross-chain bridges e interoperabilidade
    - Zero-knowledge proofs e privacidade
    - DAOs e governança descentralizada

    O futuro é promissor para quem entende a tecnologia blockchain!
    """
    
    # Criar post com detecção automática
    result = client.create_post({
        "title": "Criptomoedas 2024: DeFi, NFTs, Web3 e o Futuro do Dinheiro",
        "content": conteudo,
        "excerpt": "Análise completa do ecossistema cripto em 2024, cobrindo DeFi, NFTs, regulação e tecnologias emergentes",
        "originalSource": {
            "url": "https://cryptofrontier.com/original",
            "title": "Relatório Crypto 2024",
            "site": "Crypto Frontier Research"
        }
    }, auto_metadata=True)
    
    if result['success']:
        print("Post criado com sucesso!")
        print(f"ID: {result['document_id']}")
        print(f"Categorias: {', '.join(result['categories'])}")
        print(f"Tags: {', '.join(result['tags'])}")
        print(f"Autor: {result['author']}")
        
        # Buscar o post criado para ver estrutura completa
        get_result = client.get_post(post_id=result['document_id'])
        if get_result['success']:
            print("\nEstrutura completa do post:")
            print(json.dumps(get_result['post'], indent=2))
    else:
        print(f"Erro: {result['error']}")

def main():
    """Função principal que executa todos os exemplos"""
    print("=" * 60)
    print("DEMONSTRAÇÃO DO CONTENTAPICLIENT")
    print("Cliente Unificado de Conteúdo")
    print("=" * 60)
    
    try:
        # Verificar configuração
        client = get_content_client()
        if not client.project_id or not client.api_token:
            print("\n⚠️  AVISO: Credenciais não configuradas!")
            print("Configure as variáveis de ambiente:")
            print("  - SANITY_PROJECT_ID")
            print("  - SANITY_API_TOKEN")
            print("\nAlguns exemplos podem falhar sem as credenciais.")
            input("\nPressione Enter para continuar mesmo assim...")
        
        # Executar exemplos
        exemplo_basico()
        input("\nPressione Enter para continuar...")
        
        exemplo_deteccao_automatica()
        input("\nPressione Enter para continuar...")
        
        exemplo_atualizacao()
        input("\nPressione Enter para continuar...")
        
        exemplo_busca_listagem()
        input("\nPressione Enter para continuar...")
        
        exemplo_gerenciamento_metadados()
        input("\nPressione Enter para continuar...")
        
        exemplo_conversao_formatos()
        input("\nPressione Enter para continuar...")
        
        exemplo_cache()
        input("\nPressione Enter para continuar...")
        
        exemplo_post_completo()
        input("\nPressione Enter para continuar...")
        
        exemplo_metricas()
        
        print("\n" + "=" * 60)
        print("DEMONSTRAÇÃO CONCLUÍDA!")
        print("=" * 60)
        
    except KeyboardInterrupt:
        print("\n\nDemonstração interrompida pelo usuário.")
    except Exception as e:
        print(f"\n\nErro durante demonstração: {str(e)}")

if __name__ == "__main__":
    main()