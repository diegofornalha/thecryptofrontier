#!/usr/bin/env python3
"""
RSS para Sanity - Automação com CrewAI
Este script automatiza o processo de buscar conteúdo de feeds RSS,
analisar, criar conteúdo e publicar no Sanity CMS.
"""

from crewai import Agent, Crew, Task, Process
import feedparser
import json
import os
from pathlib import Path
from langchain_community.llms import Ollama

# Lista de feeds RSS de criptomoedas
RSS_FEEDS = [
    "https://thecryptobasic.com/feed/"
]

def fetch_rss(urls):
    """Busca conteúdo de feeds RSS"""
    all_entries = []
    for url in urls:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:5]:
                all_entries.append({
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", ""),
                    "summary": entry.get("summary", ""),
                    "author": entry.get("author", "")
                })
        except Exception as e:
            print(f"Erro ao buscar feed {url}: {str(e)}")
    return all_entries

def main():
    """Função principal"""
    # Criar diretório de saída
    Path("output").mkdir(exist_ok=True)
    
    # Configurar modelo Ollama local - remova se não estiver usando
    # try:
    #     local_llm = Ollama(model="llama3")
    # except:
    #     local_llm = None
    #     print("Ollama não disponível. Usando o modelo padrão.")
    
    # Dados simulados para demonstração sem API externa
    print("Modo demonstração: Usando dados simulados")
    demo_rss_entries = [
        {
            "title": "Bitcoin ultrapassa $60.000 pela primeira vez em 2024",
            "link": "https://example.com/bitcoin-60k",
            "published": "Tue, 14 May 2024 10:00:00 GMT",
            "summary": "O Bitcoin ultrapassou a marca de $60.000 pela primeira vez este ano, impulsionado por forte demanda institucional.",
            "author": "Crypto Analyst"
        },
        {
            "title": "Ethereum completa atualização importante da rede",
            "link": "https://example.com/ethereum-upgrade",
            "published": "Mon, 13 May 2024 15:30:00 GMT",
            "summary": "A rede Ethereum concluiu com sucesso uma atualização que promete melhorar escalabilidade e reduzir taxas de gás.",
            "author": "Blockchain Developer"
        },
        {
            "title": "Reguladores discutem novas diretrizes para DeFi",
            "link": "https://example.com/defi-regulations",
            "published": "Sun, 12 May 2024 08:45:00 GMT",
            "summary": "Autoridades financeiras globais estão elaborando novas diretrizes para o mercado de finanças descentralizadas.",
            "author": "Regulatory Expert"
        }
    ]
    
    # Simular análise de conteúdo
    demo_analysis = """
    Análise das notícias recentes de criptomoedas:
    
    1. Bitcoin ultrapassando $60.000:
       - Pontos principais: Forte recuperação de preço, aumento de interesse institucional
       - Impacto: Sentimento positivo no mercado, possível novo ciclo de alta
       - Tendências relacionadas: Adoção corporativa, ETFs de Bitcoin
       
    2. Atualização do Ethereum:
       - Pontos principais: Melhoria técnica, redução de taxas, maior eficiência
       - Impacto: Melhor experiência do usuário, potencial para mais aplicativos
       - Tendências relacionadas: Crescimento de Layer 2, expansão do ecossistema
       
    3. Regulação de DeFi:
       - Pontos principais: Aumento do escrutínio regulatório, busca por equilíbrio
       - Impacto: Possível limitação de alguns serviços, maior legitimidade para outros
       - Tendências relacionadas: KYC em DeFi, protocolos compatíveis com regulamentação
    """
    
    # Simular artigo criado
    demo_article = """
    # Bitcoin Alcança $60.000: O Que Isso Significa para o Mercado de Criptomoedas em 2024
    
    O mercado de criptomoedas celebra um marco significativo nesta semana, com o Bitcoin ultrapassando novamente a barreira dos $60.000. Este movimento, que não era visto desde o final de 2023, sinaliza uma renovada confiança dos investidores no ativo digital mais estabelecido do mundo.
    
    ## Um Retorno Esperado
    
    Após meses de consolidação entre $40.000 e $50.000, o Bitcoin finalmente ganhou o impulso necessário para romper resistências importantes. Analistas apontam para a combinação de vários fatores que contribuíram para esta alta:
    
    - Aumento significativo na demanda institucional, especialmente após a aprovação dos ETFs de Bitcoin
    - Redução nas vendas por parte de mineradores, que agora preferem acumular
    - Crescente adoção corporativa, com mais empresas adicionando Bitcoin aos seus balanços
    
    "Este movimento não se baseia apenas em especulação, mas em fundamentos mais sólidos do que em ciclos anteriores", explica Sarah Chen, estrategista de criptoativos da BlockView Research.
    
    ## Impacto no Ecossistema Cripto
    
    O rally do Bitcoin também está elevando o mercado de altcoins, com Ethereum e outros projetos importantes registrando ganhos significativos. Esta correlação positiva demonstra que o sentimento de mercado está melhorando de forma generalizada.
    
    No entanto, o cenário atual apresenta diferenças importantes em relação a ciclos anteriores:
    
    1. Maior maturidade da infraestrutura de mercado
    2. Participação mais significativa de investidores institucionais
    3. Ambiente regulatório mais desenvolvido, embora ainda em evolução
    
    ## Perspectivas para 2024
    
    A quebra da barreira psicológica dos $60.000 abre caminho para novas discussões sobre os próximos alvos de preço. Enquanto alguns analistas mais conservadores projetam uma consolidação na faixa dos $60.000-70.000 antes de novos movimentos, vozes mais otimistas acreditam que podemos ver o Bitcoin testando suas máximas históricas ainda este ano.
    
    Um fator crucial a se observar é como os mercados tradicionais reagirão a esse movimento. Com a crescente correlação entre criptomoedas e outras classes de ativos, eventos macroeconômicos continuarão exercendo influência sobre o comportamento do Bitcoin.
    
    ## Considerações Finais
    
    O retorno do Bitcoin aos $60.000 representa não apenas uma recuperação de preço, mas também uma validação da resiliência e maturidade deste mercado. Para investidores de longo prazo, este momento reforça a tese de que, apesar da volatilidade, a tendência de adoção institucional e reconhecimento das criptomoedas como classe de ativo legítima continua em crescimento.
    
    Como sempre, é importante lembrar que o mercado de criptomoedas permanece sujeito a flutuações significativas, e diversificação continua sendo uma estratégia prudente para todos os perfis de investidores.
    
    Tags: Bitcoin, Mercado de Criptomoedas, Investimentos, Análise de Preço, Tendências 2024
    """
    
    # Simular formato Sanity
    demo_sanity_json = {
        "slug": "bitcoin-alcanca-60000-o-que-isso-significa-para-o-mercado-de-criptomoedas-em-2024",
        "title": "Bitcoin Alcança $60.000: O Que Isso Significa para o Mercado de Criptomoedas em 2024",
        "content": [
            {
                "_type": "block",
                "style": "normal",
                "children": [
                    {
                        "_type": "span",
                        "text": "O mercado de criptomoedas celebra um marco significativo nesta semana, com o Bitcoin ultrapassando novamente a barreira dos $60.000. Este movimento, que não era visto desde o final de 2023, sinaliza uma renovada confiança dos investidores no ativo digital mais estabelecido do mundo.",
                    }
                ],
                "markDefs": []
            },
            {
                "_type": "block",
                "style": "h2",
                "children": [
                    {
                        "_type": "span",
                        "text": "Um Retorno Esperado",
                    }
                ],
                "markDefs": []
            }
            # Outros blocos de conteúdo seriam adicionados em um ambiente real
        ],
        "excerpt": "O Bitcoin ultrapassou a marca de $60.000 pela primeira vez em 2024, sinalizando uma renovada confiança dos investidores e potencialmente abrindo caminho para novos recordes de preço.",
        "author": "TheCryptoFrontier",
        "date": "2024-05-14T10:00:00Z",
        "tags": ["Bitcoin", "Mercado de Criptomoedas", "Investimentos", "Análise de Preço", "Tendências 2024"],
        "categories": ["Criptomoedas", "Blockchain", "Análise de Mercado"],
        "featuredImage": "https://example.com/images/bitcoin-60k.jpg"
    }
    
    # Salvar o JSON simulado em um arquivo
    output_file = Path("output/sanity_post.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(demo_sanity_json, f, ensure_ascii=False, indent=2)
    
    print("\n" + "="*50)
    print("Demonstração de Fluxo RSS para Sanity concluída!")
    print("="*50)
    print(f"Arquivo gerado: {output_file}")
    print("\nConteúdo gerado (resumo):")
    print(f"Título: {demo_sanity_json['title']}")
    print(f"Autor: {demo_sanity_json['author']}")
    print(f"Resumo: {demo_sanity_json['excerpt']}")
    print(f"Tags: {', '.join(demo_sanity_json['tags'])}")

if __name__ == "__main__":
    main() 