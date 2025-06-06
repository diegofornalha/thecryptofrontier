"""
Demonstração de como usar a formatação melhorada nos posts
"""

import json
from datetime import datetime

# Exemplo de post com formatação melhorada
enhanced_post = {
    "_type": "post",
    "title": "Bitcoin Atinge Novo Recorde Histórico de $75.000",
    "slug": {
        "_type": "slug",
        "current": "bitcoin-atinge-novo-recorde-historico-75000"
    },
    "publishedAt": datetime.now().isoformat(),
    "excerpt": "Bitcoin surpreende o mercado ao romper a barreira dos $75.000, impulsionado por fatores institucionais e adoção crescente. Analistas preveem continuação da tendência de alta.",
    "content": [
        # Primeiro parágrafo - será destacado com drop cap
        {
            "_type": "block",
            "_key": "intro1",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span1",
                    "text": "O Bitcoin alcançou um marco histórico nesta quinta-feira, rompendo a barreira psicológica dos $75.000 pela primeira vez em sua história. O movimento representa um aumento de 15% em apenas uma semana e consolida a posição da criptomoeda como um dos ativos de melhor desempenho em 2025.",
                    "marks": []
                }
            ]
        },
        
        # Subtítulo H2 com linha decorativa
        {
            "_type": "block",
            "_key": "h2_1",
            "style": "h2",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "h2_span1",
                    "text": "Fatores que Impulsionaram a Alta",
                    "marks": []
                }
            ]
        },
        
        # Parágrafo normal
        {
            "_type": "block",
            "_key": "p2",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span2",
                    "text": "Diversos fatores convergiram para criar o cenário perfeito para esta alta histórica:",
                    "marks": []
                }
            ]
        },
        
        # Lista com marcadores
        {
            "_type": "block",
            "_key": "list1",
            "style": "normal",
            "listItem": "bullet",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "list_span1",
                    "text": "Aprovação de novos ETFs de Bitcoin nos Estados Unidos",
                    "marks": []
                }
            ]
        },
        {
            "_type": "block",
            "_key": "list2",
            "style": "normal",
            "listItem": "bullet",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "list_span2",
                    "text": "Entrada massiva de investidores institucionais",
                    "marks": []
                }
            ]
        },
        {
            "_type": "block",
            "_key": "list3",
            "style": "normal",
            "listItem": "bullet",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "list_span3",
                    "text": "Redução da inflação global e busca por ativos alternativos",
                    "marks": []
                }
            ]
        },
        
        # Citação destacada
        {
            "_type": "block",
            "_key": "quote1",
            "style": "blockquote",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "quote_span1",
                    "text": "Este movimento não é apenas especulativo. Estamos vendo uma mudança fundamental na percepção do Bitcoin como reserva de valor digital",
                    "marks": []
                },
                {
                    "_type": "span",
                    "_key": "quote_span2",
                    "text": " - declarou Michael Saylor, CEO da MicroStrategy.",
                    "marks": ["em"]
                }
            ]
        },
        
        # Subtítulo H3
        {
            "_type": "block",
            "_key": "h3_1",
            "style": "h3",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "h3_span1",
                    "text": "Análise Técnica e Níveis Importantes",
                    "marks": []
                }
            ]
        },
        
        # Parágrafo com texto em negrito e código inline
        {
            "_type": "block",
            "_key": "p3",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span3a",
                    "text": "Do ponto de vista técnico, o ",
                    "marks": []
                },
                {
                    "_type": "span",
                    "_key": "span3b",
                    "text": "Bitcoin",
                    "marks": ["strong"]
                },
                {
                    "_type": "span",
                    "_key": "span3c",
                    "text": " rompeu uma importante resistência em ",
                    "marks": []
                },
                {
                    "_type": "span",
                    "_key": "span3d",
                    "text": "$72.000",
                    "marks": ["code"]
                },
                {
                    "_type": "span",
                    "_key": "span3e",
                    "text": ", confirmando a continuação da tendência de alta iniciada em outubro.",
                    "marks": []
                }
            ]
        },
        
        # Tabela simulada com texto
        {
            "_type": "block",
            "_key": "p4",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span4",
                    "text": "Níveis-chave a observar:",
                    "marks": ["strong"]
                }
            ]
        },
        {
            "_type": "block",
            "_key": "p5",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span5",
                    "text": "• Resistência: $78.000 - $80.000\n• Suporte imediato: $72.000\n• Suporte forte: $68.500",
                    "marks": []
                }
            ]
        },
        
        # Subtítulo H2
        {
            "_type": "block",
            "_key": "h2_2",
            "style": "h2",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "h2_span2",
                    "text": "O Que Esperar nos Próximos Dias",
                    "marks": []
                }
            ]
        },
        
        # Parágrafo final
        {
            "_type": "block",
            "_key": "p6",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "span6",
                    "text": "Analistas permanecem otimistas quanto à continuação do movimento de alta, com projeções apontando para a possibilidade do Bitcoin testar a marca dos ",
                    "marks": []
                },
                {
                    "_type": "span",
                    "_key": "span6b",
                    "text": "$80.000",
                    "marks": ["strong"]
                },
                {
                    "_type": "span",
                    "_key": "span6c",
                    "text": " antes do final do mês. No entanto, investidores devem estar preparados para volatilidade no curto prazo.",
                    "marks": []
                }
            ]
        },
        
        # Parágrafo de conclusão
        {
            "_type": "block",
            "_key": "conclusion",
            "style": "normal",
            "markDefs": [],
            "children": [
                {
                    "_type": "span",
                    "_key": "conclusion_span",
                    "text": "Com o crescente interesse institucional e a maturação do mercado de criptomoedas, o Bitcoin continua a consolidar sua posição como o 'ouro digital' do século XXI. Investidores devem acompanhar de perto os desenvolvimentos regulatórios e macroeconômicos que podem impactar o preço nos próximos meses.",
                    "marks": []
                }
            ]
        }
    ],
    "mainImage": {
        "_type": "image",
        "alt": "Bitcoin atinge recorde histórico de $75.000",
        "caption": "Bitcoin rompe barreira histórica impulsionado por fatores institucionais"
    },
    "author": {
        "_type": "reference",
        "_ref": "default-author"
    },
    "originalSource": {
        "url": "https://example.com/bitcoin-75k",
        "title": "Bitcoin Hits Historic $75K",
        "site": "Crypto News"
    }
}

# Salvar exemplo
with open('exemplo_post_formatado.json', 'w', encoding='utf-8') as f:
    json.dump(enhanced_post, f, ensure_ascii=False, indent=2)

print("✅ Exemplo de post com formatação melhorada criado!")
print("\nCaracterísticas implementadas:")
print("- Primeiro parágrafo destacado (drop cap)")
print("- Títulos H2 com linha decorativa")
print("- Citações estilizadas com fundo e borda")
print("- Listas com marcadores coloridos")
print("- Texto em negrito e código inline")
print("- Estrutura clara e escaneável")
print("\nArquivo salvo em: exemplo_post_formatado.json")

# Exemplo de como seria um FAQ
faq_example = {
    "_type": "faqSection",
    "questions": [
        {
            "question": "O Bitcoin pode continuar subindo?",
            "answer": "Sim, analistas apontam que fatores fundamentais sustentam a alta, mas volatilidade é esperada."
        },
        {
            "question": "Qual o melhor momento para investir?",
            "answer": "Especialistas recomendam estratégia de DCA (Dollar Cost Averaging) para reduzir riscos."
        },
        {
            "question": "Quais os riscos dessa alta?",
            "answer": "Correções de 10-20% são normais em mercados de alta. Invista apenas o que pode perder."
        }
    ]
}

print("\n📝 Exemplo de FAQ que poderia ser adicionado ao final dos posts educacionais")