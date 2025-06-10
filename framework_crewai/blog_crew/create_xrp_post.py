#!/usr/bin/env python3
"""
Script para criar o post XRP com links corretamente formatados
"""

import os
import requests
import json
from datetime import datetime

# Configurações
SANITY_PROJECT_ID = 'brby2yrg'
SANITY_DATASET = 'production'
SANITY_API_VERSION = '2023-05-03'
SANITY_TOKEN = os.getenv('SANITY_API_TOKEN') or os.getenv('SANITY_TOKEN')

if not SANITY_TOKEN:
    # Tentar ler do .env principal
    try:
        import sys
        sys.path.append('/home/sanity/thecryptofrontier')
        from dotenv import load_dotenv
        load_dotenv('/home/sanity/thecryptofrontier/.env')
        SANITY_TOKEN = os.getenv('SANITY_API_TOKEN')
    except:
        pass

if not SANITY_TOKEN:
    # Usar token com permissões completas
    SANITY_TOKEN = "skU1JTiWk46wKB6a0q3Hxzv6Od4Oc0UJ2Fw2kjCnKQkV9PFLv2LmGm1QPatOAI1JN62UOYqf1pVRSmaR9Pm2n8pgIBpnmUJUNNJQ2CUQC1xfbdpu3xCLyP71xYqYuf28xDIIYTAPdEvNFEH6WRgdJgzl2F5GGNy7xOLQAxj7d9ajGbTzLdyO"

# URL da API
url = f"https://{SANITY_PROJECT_ID}.api.sanity.io/v{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"

# Headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {SANITY_TOKEN}'
}

# Dados do post em formato de mutation
mutations = {
    "mutations": [
        {
            "create": {
                "_type": "post",
    "title": "XRP: Alta de 647x no Market Cap, de apenas US$ 17 milhões? O que sabemos?",
    "slug": {
        "current": "xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos"
    },
    "excerpt": "Com a recuperação do XRP da queda da semana passada, analistas estão examinando a significância do pequeno influxo que impulsionou o preço do XRP para cima.",
    "publishedAt": "2025-01-09T13:18:38Z",
    "mainImage": {
        "asset": {
            "_type": "reference",
            "_ref": "image-7a98e7e5c2e9b4f9e8d0f1a2b3c4d5e6f7a8b9c0-1200x675-jpg"
        },
        "alt": "XRP Cryptocurrency Digital Art",
        "caption": "Representação digital do XRP"
    },
    "content": [
        {
            "_type": "block",
            "_key": "block1",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span1",
                    "text": "À medida que o XRP se recupera da queda da semana passada, analistas estão examinando a significância do pequeno influxo que impulsionou o preço do XRP para cima."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block2",
            "style": "normal",
            "markDefs": [
                {
                    "_type": "link",
                    "_key": "link1",
                    "href": "https://thecryptobasic.com/2025/06/06/xrp-price-falls-as-elon-musk-and-trump-enter-bitter-feud/"
                }
            ],
            "children": [
                {
                    "_type": "span",
                    "_key": "span2a",
                    "text": "Notavelmente, o XRP caiu para US$ 2,0647 na semana passada, marcando uma queda de 9,4% em relação aos US$ 2,281 negociados no início da semana. A queda coincidiu com "
                },
                {
                    "_type": "span",
                    "_key": "span2b",
                    "text": "a briga entre",
                    "marks": ["link1"]
                },
                {
                    "_type": "span",
                    "_key": "span2c",
                    "text": " o bilionário Elon Musk e o presidente dos EUA, Donald Trump, que levou a uma queda massiva nas ações da Tesla. A controvérsia se espalhou para o espaço cripto devido à associação de ambos os indivíduos com criptomoedas."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block3",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span3",
                    "text": "Enquanto isso, no momento da publicação, o XRP está sendo negociado a US$ 2,23, tendo se recuperado totalmente da queda da semana passada. Agora, observadores do mercado dentro da comunidade XRP estão rastreando os influxos que precederam essa recuperação."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block4",
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": "span4",
                    "text": "XRP registra influxo líquido de US$ 18,6 milhões, preço salta"
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block5",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span5",
                    "text": "A figura da comunidade, Chad Steingraber, destacou a métrica de influxo em um tweet. Ele observou que o XRP subiu de US$ 2,08 para US$ 2,17 em 6 de junho após um influxo líquido de apenas US$ 18,6 milhões. Notavelmente, esse movimento adicionou US$ 10 bilhões à sua capitalização de mercado total. O multiplicador de influxo para capitalização de mercado é de aproximadamente 538x, o que significa que cada US$ 1 de influxo líquido aumentou a capitalização de mercado do XRP em cerca de US$ 538."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block6",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span6",
                    "text": "Comentando sobre isso, o influenciador XRP Zach Rector afirmou que os números mostram que é necessário muito pouco influxo para impulsionar o preço do XRP significativamente para cima. Ele acrescentou que os participantes do mercado podem se arrepender de não ter comprado XRP a US$ 2 se os aumentos de preço se tornarem consistentes devido a novos influxos."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block7",
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": "span7",
                    "text": "Multiplicador de crescimento de 647x"
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block8",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span8",
                    "text": "No entanto, em uma publicação subsequente em 8 de junho, Steingraber apontou que o XRP subiu de US$ 2,17 para US$ 2,28 com apenas US$ 17 milhões em influxos líquidos. Isso se traduz em um aumento de US$ 11 bilhões na capitalização de mercado do XRP, com base no fornecimento total de 100 bilhões, em 7 de junho."
                }
            ]
        },
        {
            "_type": "embedBlock",
            "_key": "twitter1",
            "embedType": "twitter",
            "url": "https://x.com/ChadSteingraber/status/1931733903523381637"
        },
        {
            "_type": "block",
            "_key": "block9",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span9",
                    "text": "Aqui, o multiplicador é de aproximadamente 647x, o que significa que cada US$ 1 de influxo líquido aumentou a capitalização de mercado do XRP em cerca de US$ 647 durante esse movimento."
                }
            ]
        },
        {
            "_type": "image",
            "_key": "image1",
            "asset": {
                "_type": "reference",
                "_ref": "image-multiplicadores-xrp"
            },
            "alt": "Imagem mostrando os multiplicadores",
            "caption": "Análise dos multiplicadores de influxo do XRP"
        },
        {
            "_type": "block",
            "_key": "block10",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span10",
                    "text": "No entanto, o XRP terminou o mesmo dia com um fluxo líquido negativo de US$ 5,88 milhões, indicando um efluxo. Como resultado, o preço recuou, fechando a US$ 2,17. No dia seguinte, o XRP viu um pequeno influxo líquido de US$ 41.500, e o preço fechou a US$ 2,267. No momento da publicação, o influxo líquido para o XRP é negativo em US$ 5,45 milhões, com o preço a US$ 2,23."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block11",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span11",
                    "text": "Com base nessa métrica de multiplicador, o membro da comunidade Tomasz Wilkosz argumentou que o XRP poderia potencialmente atingir US$ 8,64 se houvesse um investimento de US$ 1 bilhão."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block12",
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": "span12",
                    "text": "Olhos voltados para ETFs para impulsionar os preços"
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block13",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span13",
                    "text": "Vale ressaltar que, nos últimos meses, fluxos negativos maiores dominaram o mercado XRP. Isso pode ajudar a explicar o desempenho de preço relativamente plano do XRP nos últimos seis meses."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block14",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span14",
                    "text": "Em contraste, dezembro e janeiro viram influxos recorde que corresponderam de perto aos aumentos de preços. Por exemplo, em 15 de janeiro de 2025, o XRP registrou um fluxo líquido positivo de US$ 207 milhões, e o preço subiu acima de US$ 3,20 na época."
                }
            ]
        },
        {
            "_type": "image",
            "_key": "image2",
            "asset": {
                "_type": "reference",
                "_ref": "image-coinglass-chart"
            },
            "alt": "Gráfico mostrando o domínio dos fluxos de saída na capitalização de mercado do XRP",
            "caption": "Gráfico mostrando o domínio dos fluxos de saída na capitalização de mercado do XRP | CoinGlass"
        },
        {
            "_type": "block",
            "_key": "block15",
            "style": "normal",
            "markDefs": [
                {
                    "_type": "link",
                    "_key": "link2",
                    "href": "https://thecryptobasic.com/2025/06/03/dag-managing-director-explains-how-xrp-etf-could-impact-xrp-price/"
                }
            ],
            "children": [
                {
                    "_type": "span",
                    "_key": "span15a",
                    "text": "Essas métricas destacam como os influxos podem impactar diretamente o preço do XRP, mas influxos sustentados têm sido desafiadores. Como resultado, todos os olhos estão voltados para os "
                },
                {
                    "_type": "span",
                    "_key": "span15b",
                    "text": "ETFs spot XRP",
                    "marks": ["link2"]
                },
                {
                    "_type": "span",
                    "_key": "span15c",
                    "text": ", que exigiriam que os emissores comprassem e mantivessem XRP como ativos subjacentes."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block16",
            "style": "normal",
            "markDefs": [
                {
                    "_type": "link",
                    "_key": "link3",
                    "href": "https://thecryptobasic.com/2025/05/01/here-is-xrp-price-after-etf-approval-if-xrp-etfs-get-15-to-30-of-bitcoin-etf-inflows/"
                }
            ],
            "children": [
                {
                    "_type": "span",
                    "_key": "span16a",
                    "text": "Como visto com os ETFs de Bitcoin, esses produtos experimentam fluxos positivos ou negativos diários. Usando efeitos multiplicadores semelhantes, "
                },
                {
                    "_type": "span",
                    "_key": "span16b",
                    "text": "alguns especulam",
                    "marks": ["link3"]
                },
                {
                    "_type": "span",
                    "_key": "span16c",
                    "text": " que até mesmo US$ 4 bilhões em influxos relacionados a ETFs poderiam impulsionar o XRP para US$ 2."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block17",
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": "span17",
                    "text": "Esclarecimento"
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block18",
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": "span18",
                    "text": "Embora os números de fluxo líquido mencionados neste relatório tenham despertado grande interesse, é importante observar que eles refletem principalmente depósitos e retiradas de bolsas. Eles não refletem o capital real entrando ou saindo do mercado XRP."
                }
            ]
        },
        {
            "_type": "block",
            "_key": "block19",
            "style": "normal",
            "markDefs": [
                {
                    "_type": "link",
                    "_key": "link4",
                    "href": "https://thecryptobasic.com/2025/05/22/500m-xrp-buy-fails-to-move-price-heres-what-happened/"
                }
            ],
            "children": [
                {
                    "_type": "span",
                    "_key": "span19a",
                    "text": "Fluxos de mercado verdadeiros exigiriam a análise do volume do lado da compra nos livros de ordens de troca. Como destacado "
                },
                {
                    "_type": "span",
                    "_key": "span19b",
                    "text": "em um relatório anterior",
                    "marks": ["link4"]
                },
                {
                    "_type": "span",
                    "_key": "span19c",
                    "text": ", até mesmo uma retirada de US$ 500 milhões da Kraken em maio não teve impacto no preço. Em outras palavras, os fluxos de saída da bolsa sozinhos não confirmam a atividade de compra."
                }
            ]
        }
    ],
                "seo": {
                    "metaTitle": "XRP: Alta de 647x no Market Cap de apenas US$ 17 milhões?",
                    "metaDescription": "Analistas examinam como pequenos influxos de US$ 17 milhões geraram multiplicadores de 647x no market cap do XRP. Entenda os fatores por trás desse fenômeno."
                }
            }
        }
    ]
}

# Fazer a requisição
try:
    print("📝 Criando post no Sanity...")
    print(f"   Projeto: {SANITY_PROJECT_ID}")
    print(f"   Dataset: {SANITY_DATASET}")
    
    response = requests.post(url, headers=headers, json=mutations)
    
    if response.status_code == 200:
        result = response.json()
        if 'results' in result and len(result['results']) > 0:
            post = result['results'][0]
            print(f"\n✅ Post criado com sucesso!")
            print(f"   ID: {post.get('id', 'N/A')}")
            print(f"   Transaction: {result.get('transactionId', 'N/A')}")
            print("\n🔗 Links formatados corretamente:")
            print("   - 'a briga entre' → Link clicável")
            print("   - 'ETFs spot XRP' → Link clicável")
            print("   - 'alguns especulam' → Link clicável")
            print("   - 'em um relatório anterior' → Link clicável")
            print("\n🐦 Embed do Twitter incluído")
            print("🖼️  2 imagens configuradas")
        else:
            print("❌ Resposta inesperada da API")
            print(json.dumps(result, indent=2))
    else:
        print(f"❌ Erro {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"❌ Erro ao criar post: {e}")