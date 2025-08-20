#!/usr/bin/env python3
"""
Script para criar o post XRP com todas as chaves _key corretas
"""

import os
import json
import uuid
from datetime import datetime

# Importar o validador
from tools.strapi_key_validator import ensure_array_keys

def generate_key():
    """Gera uma chave única de 8 caracteres"""
    return str(uuid.uuid4())[:8]

# Dados do post com chaves geradas
post_data = {
    "_type": "post",
    "title": "XRP: Alta de 647x no Market Cap, de apenas US$ 17 milhões? O que sabemos?",
    "slug": {
        "_type": "slug",
        "current": "xrp-alta-de-647x-no-market-cap-de-apenas-us-17-milhoes-o-que-sabemos"
    },
    "excerpt": "Com a recuperação do XRP da queda da semana passada, analistas estão examinando a significância do pequeno influxo que impulsionou o preço do XRP para cima.",
    "publishedAt": "2025-01-09T13:18:38Z",
    "content": [
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "À medida que o XRP se recupera da queda da semana passada, analistas estão examinando a significância do pequeno influxo que impulsionou o preço do XRP para cima."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
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
                    "_key": generate_key(),
                    "text": "Notavelmente, o XRP caiu para US$ 2,0647 na semana passada, marcando uma queda de 9,4% em relação aos US$ 2,281 negociados no início da semana. A queda coincidiu com "
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "a briga entre",
                    "marks": ["link1"]
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": " o bilionário Elon Musk e o presidente dos EUA, Donald Trump, que levou a uma queda massiva nas ações da Tesla. A controvérsia se espalhou para o espaço cripto devido à associação de ambos os indivíduos com criptomoedas."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Enquanto isso, no momento da publicação, o XRP está sendo negociado a US$ 2,23, tendo se recuperado totalmente da queda da semana passada. Agora, observadores do mercado dentro da comunidade XRP estão rastreando os influxos que precederam essa recuperação."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "XRP registra influxo líquido de US$ 18,6 milhões, preço salta"
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "A figura da comunidade, Chad Steingraber, destacou a métrica de influxo em um tweet. Ele observou que o XRP subiu de US$ 2,08 para US$ 2,17 em 6 de junho após um influxo líquido de apenas US$ 18,6 milhões. Notavelmente, esse movimento adicionou US$ 10 bilhões à sua capitalização de mercado total. O multiplicador de influxo para capitalização de mercado é de aproximadamente 538x, o que significa que cada US$ 1 de influxo líquido aumentou a capitalização de mercado do XRP em cerca de US$ 538."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Comentando sobre isso, o influenciador XRP Zach Rector afirmou que os números mostram que é necessário muito pouco influxo para impulsionar o preço do XRP significativamente para cima. Ele acrescentou que os participantes do mercado podem se arrepender de não ter comprado XRP a US$ 2 se os aumentos de preço se tornarem consistentes devido a novos influxos."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Multiplicador de crescimento de 647x"
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "No entanto, em uma publicação subsequente em 8 de junho, Steingraber apontou que o XRP subiu de US$ 2,17 para US$ 2,28 com apenas US$ 17 milhões em influxos líquidos. Isso se traduz em um aumento de US$ 11 bilhões na capitalização de mercado do XRP, com base no fornecimento total de 100 bilhões, em 7 de junho."
                }
            ]
        },
        {
            "_type": "embedBlock",
            "_key": generate_key(),
            "embedType": "twitter",
            "url": "https://x.com/ChadSteingraber/status/1931733903523381637"
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Aqui, o multiplicador é de aproximadamente 647x, o que significa que cada US$ 1 de influxo líquido aumentou a capitalização de mercado do XRP em cerca de US$ 647 durante esse movimento."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "No entanto, o XRP terminou o mesmo dia com um fluxo líquido negativo de US$ 5,88 milhões, indicando um efluxo. Como resultado, o preço recuou, fechando a US$ 2,17. No dia seguinte, o XRP viu um pequeno influxo líquido de US$ 41.500, e o preço fechou a US$ 2,267. No momento da publicação, o influxo líquido para o XRP é negativo em US$ 5,45 milhões, com o preço a US$ 2,23."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Com base nessa métrica de multiplicador, o membro da comunidade Tomasz Wilkosz argumentou que o XRP poderia potencialmente atingir US$ 8,64 se houvesse um investimento de US$ 1 bilhão."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Olhos voltados para ETFs para impulsionar os preços"
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Vale ressaltar que, nos últimos meses, fluxos negativos maiores dominaram o mercado XRP. Isso pode ajudar a explicar o desempenho de preço relativamente plano do XRP nos últimos seis meses."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Em contraste, dezembro e janeiro viram influxos recorde que corresponderam de perto aos aumentos de preços. Por exemplo, em 15 de janeiro de 2025, o XRP registrou um fluxo líquido positivo de US$ 207 milhões, e o preço subiu acima de US$ 3,20 na época."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
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
                    "_key": generate_key(),
                    "text": "Essas métricas destacam como os influxos podem impactar diretamente o preço do XRP, mas influxos sustentados têm sido desafiadores. Como resultado, todos os olhos estão voltados para os "
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "ETFs spot XRP",
                    "marks": ["link2"]
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": ", que exigiriam que os emissores comprassem e mantivessem XRP como ativos subjacentes."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
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
                    "_key": generate_key(),
                    "text": "Como visto com os ETFs de Bitcoin, esses produtos experimentam fluxos positivos ou negativos diários. Usando efeitos multiplicadores semelhantes, "
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "alguns especulam",
                    "marks": ["link3"]
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": " que até mesmo US$ 4 bilhões em influxos relacionados a ETFs poderiam impulsionar o XRP para US$ 2."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "h2",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Esclarecimento"
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
            "style": "normal",
            "children": [
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "Embora os números de fluxo líquido mencionados neste relatório tenham despertado grande interesse, é importante observar que eles refletem principalmente depósitos e retiradas de bolsas. Eles não refletem o capital real entrando ou saindo do mercado XRP."
                }
            ]
        },
        {
            "_type": "block",
            "_key": generate_key(),
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
                    "_key": generate_key(),
                    "text": "Fluxos de mercado verdadeiros exigiriam a análise do volume do lado da compra nos livros de ordens de troca. Como destacado "
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
                    "text": "em um relatório anterior",
                    "marks": ["link4"]
                },
                {
                    "_type": "span",
                    "_key": generate_key(),
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

# Garantir que todas as chaves estão presentes
ensure_array_keys(post_data)

# Salvar arquivo JSON validado
output_file = 'xrp_post_validated.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(post_data, f, ensure_ascii=False, indent=2)

print(f"✅ Post criado e validado com sucesso!")
print(f"📁 Arquivo salvo: {output_file}")
print(f"🔑 Todas as chaves _key foram garantidas")
print("\n📝 Próximo passo: criar no Strapi usando:")
print(f"   npx strapi documents create {output_file} --dataset production")