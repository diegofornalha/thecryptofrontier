#!/usr/bin/env python3
"""
BrazilianCryptoWriter - Agente especializado em conteúdo crypto em português brasileiro
Adapta conteúdo para o mercado brasileiro com contexto local
"""
import re
from typing import Dict, List
from datetime import datetime

class BrazilianCryptoWriter:
    """Escritor especializado no mercado crypto brasileiro"""
    
    def __init__(self):
        # Termos e expressões do mercado brasileiro
        self.crypto_glossary = {
            # Moedas
            'bitcoin': 'Bitcoin',
            'ethereum': 'Ethereum', 
            'BTC': 'BTC',
            'ETH': 'ETH',
            'altcoin': 'altcoin',
            'stablecoin': 'stablecoin',
            
            # Termos de mercado
            'bull market': 'mercado em alta (bull market)',
            'bear market': 'mercado em baixa (bear market)',
            'pump': 'pump (alta repentina)',
            'dump': 'dump (queda brusca)',
            'whale': 'baleia (grande investidor)',
            'hodl': 'HODL (segurar a moeda)',
            'dip': 'queda',
            'ATH': 'máxima histórica (ATH)',
            'market cap': 'capitalização de mercado',
            'trading': 'negociação',
            'trader': 'trader',
            'exchange': 'corretora',
            'wallet': 'carteira',
            'cold wallet': 'carteira fria',
            'hot wallet': 'carteira quente',
            'DeFi': 'DeFi (finanças descentralizadas)',
            'NFT': 'NFT',
            'mining': 'mineração',
            'staking': 'staking',
            'yield farming': 'yield farming',
            'liquidity': 'liquidez',
            'volatility': 'volatilidade',
            'portfolio': 'portfólio',
            'diversification': 'diversificação',
        }
        
        # Exchanges brasileiras
        self.brazilian_exchanges = [
            'Mercado Bitcoin',
            'Foxbit',
            'NovaDAX',
            'BitcoinTrade',
            'Binance Brasil'
        ]
        
        # Moeda local
        self.local_currency = 'BRL'
        self.currency_symbol = 'R$'
        
        # Expressões típicas do mercado brasileiro
        self.brazilian_expressions = {
            'to the moon': 'rumo à lua 🚀',
            'buy the dip': 'comprar na baixa',
            'DYOR': 'DYOR (faça sua própria pesquisa)',
            'paper hands': 'mãos de papel (vendedor no pânico)',
            'diamond hands': 'mãos de diamante (holder forte)',
            'rekt': 'rekt (perdeu muito dinheiro)',
            'FUD': 'FUD (medo, incerteza e dúvida)',
            'FOMO': 'FOMO (medo de ficar de fora)',
            'shill': 'shill (promover uma moeda)',
            'bag holder': 'holder de moeda desvalorizada',
        }
        
    def adapt_content(self, content: str, title: str) -> Dict[str, str]:
        """Adapta conteúdo para o público brasileiro"""
        
        # Adaptar título
        adapted_title = self.adapt_title(title)
        
        # Adaptar conteúdo
        adapted_content = self.adapt_text(content)
        
        # Adicionar contexto brasileiro
        adapted_content = self.add_brazilian_context(adapted_content)
        
        # Formatar em estilo brasileiro
        formatted_content = self.format_brazilian_style(adapted_content, adapted_title)
        
        # Criar excerpt
        excerpt = self.create_excerpt(formatted_content)
        
        return {
            'title': adapted_title,
            'content': formatted_content,
            'excerpt': excerpt,
            'tags': self.generate_tags(adapted_title, formatted_content),
            'seo': self.generate_seo(adapted_title, excerpt)
        }
    
    def adapt_title(self, title: str) -> str:
        """Adapta título para português brasileiro"""
        # Remover indicadores de idioma
        title = re.sub(r'^\[.*?\]\s*', '', title)
        
        # Traduções comuns em títulos
        title_adaptations = {
            r'\b(How|how)\s+(Much|much)\b': 'Quanto',
            r'\b(Here\'s|Here is)\b': 'Veja',
            r'\b(What|what)\b': 'O que',
            r'\b(Why|why)\b': 'Por que',
            r'\b(When|when)\b': 'Quando',
            r'\b(If|if)\b': 'Se',
            r'\b(Could|could)\b': 'Poderia',
            r'\b(Would|would)\b': 'Seria',
            r'\b(Will|will)\b': 'Vai',
            r'\b(Can|can)\b': 'Pode',
            r'\bworth\b': 'valer',
            r'\binvestment\b': 'investimento',
            r'\bprice\b': 'preço',
            r'\bprediction\b': 'previsão',
            r'\byears?\b': 'anos',
            r'\bCrypto\b': 'Cripto',
            r'\bMarket\b': 'Mercado',
        }
        
        for pattern, replacement in title_adaptations.items():
            title = re.sub(pattern, replacement, title, flags=re.IGNORECASE)
        
        # Capitalizar apropriadamente
        title = title[0].upper() + title[1:] if title else title
        
        return title
    
    def adapt_text(self, text: str) -> str:
        """Adapta texto principal para português brasileiro"""
        
        # Aplicar glossário
        for eng_term, pt_term in self.crypto_glossary.items():
            # Preservar termos técnicos entre aspas
            text = re.sub(
                rf'\b{eng_term}\b(?!["\'])',
                pt_term,
                text,
                flags=re.IGNORECASE
            )
        
        # Adaptar valores monetários
        text = self.adapt_currency_values(text)
        
        # Adaptar expressões
        for eng_expr, pt_expr in self.brazilian_expressions.items():
            text = text.replace(eng_expr, pt_expr)
            text = text.replace(eng_expr.lower(), pt_expr)
        
        return text
    
    def adapt_currency_values(self, text: str) -> str:
        """Converte valores em dólares para reais com contexto"""
        
        # Padrão para valores em dólar
        dollar_pattern = r'\$\s?([\d,]+(?:\.\d{2})?)'
        
        def convert_to_brl(match):
            value_str = match.group(1).replace(',', '')
            try:
                value = float(value_str)
                # Taxa aproximada (deve ser atualizada)
                brl_value = value * 5.0
                
                # Formatar valor
                if brl_value >= 1000000:
                    return f"R$ {brl_value/1000000:.1f} milhões"
                elif brl_value >= 1000:
                    return f"R$ {brl_value/1000:.0f} mil"
                else:
                    return f"R$ {brl_value:.2f}"
                    
            except ValueError:
                return match.group(0)
        
        # Substituir valores mantendo o original entre parênteses
        def replace_with_context(match):
            original = match.group(0)
            converted = convert_to_brl(match)
            return f"{converted} ({original})"
        
        return re.sub(dollar_pattern, replace_with_context, text)
    
    def add_brazilian_context(self, content: str) -> str:
        """Adiciona contexto específico do mercado brasileiro"""
        
        # Mencionar exchanges brasileiras quando relevante
        if 'exchange' in content.lower() or 'corretora' in content.lower():
            exchange_note = "\n\n💡 **No Brasil**: Você pode negociar em corretoras como "
            exchange_note += ", ".join(self.brazilian_exchanges[:3]) + " entre outras."
            content += exchange_note
        
        # Adicionar nota sobre impostos quando mencionar lucros
        if any(word in content.lower() for word in ['lucro', 'ganho', 'profit', 'gain']):
            tax_note = "\n\n📊 **Importante**: No Brasil, lucros com criptomoedas são tributados. "
            tax_note += "Vendas acima de R$ 35.000 por mês devem pagar 15% de imposto sobre o ganho."
            content += tax_note
        
        # Adicionar aviso regulatório
        if any(word in content.lower() for word in ['investir', 'investimento', 'invest']):
            regulatory_note = "\n\n⚖️ **Regulamentação**: A CVM e o Banco Central do Brasil "
            regulatory_note += "regulamentam o mercado de criptoativos. Sempre verifique se "
            regulatory_note += "a plataforma escolhida está em conformidade."
            content += regulatory_note
        
        return content
    
    def format_brazilian_style(self, content: str, title: str) -> str:
        """Formata conteúdo no estilo brasileiro"""
        
        # Criar estrutura em Markdown
        formatted = f"# {title}\n\n"
        
        # Adicionar data em formato brasileiro
        data_atual = datetime.now().strftime('%d de %B de %Y')
        formatted += f"📅 *{data_atual}*\n\n"
        
        # Adicionar introdução contextualizada
        formatted += "## 📈 Visão Geral\n\n"
        
        # Processar parágrafos
        paragraphs = content.split('\n\n')
        
        for i, para in enumerate(paragraphs):
            if i == 0:
                # Primeiro parágrafo como introdução
                formatted += para + "\n\n"
            elif i == 1:
                formatted += "## 💰 Análise do Mercado\n\n" + para + "\n\n"
            elif i % 3 == 0 and i < len(paragraphs) - 2:
                formatted += "## 🔍 Pontos Importantes\n\n" + para + "\n\n"
            else:
                formatted += para + "\n\n"
        
        # Adicionar seção final
        formatted += "\n## 🚨 Avisos Importantes\n\n"
        formatted += "- **Volatilidade**: O mercado de criptomoedas é altamente volátil\n"
        formatted += "- **Pesquise**: Sempre faça sua própria pesquisa (DYOR)\n"
        formatted += "- **Diversifique**: Não coloque todos os ovos na mesma cesta\n"
        formatted += "- **Invista com consciência**: Apenas o que pode perder\n"
        
        # Adicionar chamada para ação
        formatted += "\n---\n\n"
        formatted += "💬 **Participe da discussão**: O que você acha dessa análise? "
        formatted += "Compartilhe sua opinião nos comentários!\n"
        
        return formatted
    
    def create_excerpt(self, content: str) -> str:
        """Cria resumo atrativo em português"""
        # Pegar primeiro parágrafo significativo
        paragraphs = content.split('\n\n')
        for para in paragraphs:
            # Ignorar headers e listas
            if not para.startswith('#') and not para.startswith('-') and len(para) > 50:
                # Limpar markdown
                excerpt = re.sub(r'[*_#\[\]()]', '', para)
                # Limitar tamanho
                if len(excerpt) > 160:
                    excerpt = excerpt[:157] + '...'
                return excerpt
        
        return "Análise completa sobre o mercado de criptomoedas..."
    
    def generate_tags(self, title: str, content: str) -> List[str]:
        """Gera tags relevantes em português"""
        tags = ['criptomoedas', 'blockchain', 'investimento']
        
        # Adicionar moedas mencionadas
        if 'bitcoin' in content.lower():
            tags.append('bitcoin')
        if 'ethereum' in content.lower():
            tags.append('ethereum')
        if 'defi' in content.lower():
            tags.append('defi')
        if 'nft' in content.lower():
            tags.append('nft')
        
        # Tags baseadas no conteúdo
        if 'previsão' in title.lower() or 'preço' in title.lower():
            tags.append('análise-de-preço')
        if 'mercado' in content.lower():
            tags.append('análise-mercado')
        if 'brasil' in content.lower():
            tags.append('mercado-brasileiro')
        
        return tags[:8]  # Limitar a 8 tags
    
    def generate_seo(self, title: str, excerpt: str) -> Dict[str, str]:
        """Gera dados SEO otimizados para Brasil"""
        return {
            'metaTitle': f"{title} | Análise Cripto Brasil",
            'metaDescription': excerpt[:155] if len(excerpt) > 155 else excerpt,
            'keywords': 'criptomoedas brasil, bitcoin brasil, investimento cripto, blockchain brasil'
        }

# Exemplo de uso
if __name__ == "__main__":
    writer = BrazilianCryptoWriter()
    
    # Teste com conteúdo em inglês
    test_content = """
    Bitcoin could reach $100,000 by 2025 according to analysts.
    
    The bull market shows strong momentum with institutional investment growing.
    Major exchanges report record trading volumes.
    
    Investors should DYOR before making any investment decisions.
    """
    
    test_title = "Here's How Much Bitcoin Could Be Worth in 5 Years"
    
    result = writer.adapt_content(test_content, test_title)
    
    print("=== Título Adaptado ===")
    print(result['title'])
    print("\n=== Conteúdo ===")
    print(result['content'])
    print("\n=== Tags ===")
    print(result['tags'])