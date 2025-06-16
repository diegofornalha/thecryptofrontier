#!/usr/bin/env python3
"""
SpanishCryptoWriter - Agente especializado en contenido crypto para mercado hispanohablante
Adapta contenido para España y América Latina
"""
import re
from typing import Dict, List
from datetime import datetime

class SpanishCryptoWriter:
    """Escritor especializado en el mercado crypto hispanohablante"""
    
    def __init__(self):
        # Glosario crypto en español
        self.crypto_glossary = {
            'bitcoin': 'Bitcoin',
            'ethereum': 'Ethereum',
            'cryptocurrency': 'criptomoneda',
            'blockchain': 'blockchain (cadena de bloques)',
            'wallet': 'monedero',
            'exchange': 'exchange (casa de cambio)',
            'trading': 'trading',
            'trader': 'trader',
            'mining': 'minería',
            'miner': 'minero',
            'staking': 'staking',
            'yield farming': 'yield farming (agricultura de rendimiento)',
            'smart contract': 'contrato inteligente',
            'token': 'token',
            'altcoin': 'altcoin',
            'stablecoin': 'moneda estable (stablecoin)',
            'DeFi': 'DeFi (finanzas descentralizadas)',
            'NFT': 'NFT (token no fungible)',
            'bull market': 'mercado alcista',
            'bear market': 'mercado bajista',
            'whale': 'ballena',
            'hodl': 'HODL (mantener)',
            'pump': 'subida repentina (pump)',
            'dump': 'caída brusca (dump)',
            'market cap': 'capitalización de mercado',
            'volatility': 'volatilidad',
            'liquidity': 'liquidez',
            'portfolio': 'portafolio',
            'ATH': 'máximo histórico (ATH)',
            'dip': 'caída',
            'FOMO': 'FOMO (miedo a perderse algo)',
            'FUD': 'FUD (miedo, incertidumbre y duda)',
            'DYOR': 'DYOR (haz tu propia investigación)',
        }
        
        # Exchanges populares en países hispanohablantes
        self.spanish_exchanges = {
            'España': ['Bit2Me', 'Coinbase', 'Kraken', 'Binance'],
            'México': ['Bitso', 'Binance', 'Coinbase', 'Volabit'],
            'Argentina': ['Ripio', 'Binance', 'SatoshiTango', 'Lemon'],
            'Colombia': ['Buda', 'Binance', 'Panda Exchange'],
            'Chile': ['Buda', 'CryptoMarket', 'Binance'],
            'General': ['Binance', 'Coinbase', 'KuCoin', 'Gate.io']
        }
        
        # Expresiones típicas del mercado hispanohablante
        self.spanish_expressions = {
            'to the moon': 'a la luna 🚀',
            'buy the dip': 'comprar en la caída',
            'paper hands': 'manos de papel',
            'diamond hands': 'manos de diamante',
            'rekt': 'rekt (arruinado)',
            'when lambo': 'cuándo lambo',
            'bag holder': 'holder de bolsa pesada',
            'shill': 'hacer shill (promocionar)',
            'moon boy': 'moon boy (optimista extremo)',
            'no coiner': 'no coiner (sin criptos)',
        }
        
        # Monedas locales principales
        self.local_currencies = {
            'EUR': '€',  # España
            'MXN': '$',  # México
            'ARS': '$',  # Argentina
            'COP': '$',  # Colombia
            'CLP': '$',  # Chile
            'PEN': 'S/',  # Perú
            'UYU': '$',  # Uruguay
        }
        
    def adapt_content(self, content: str, title: str, target_region: str = 'general') -> Dict[str, str]:
        """Adapta contenido para audiencia hispanohablante"""
        
        # Adaptar título
        adapted_title = self.adapt_title(title)
        
        # Adaptar contenido
        adapted_content = self.adapt_text(content)
        
        # Añadir contexto regional
        adapted_content = self.add_regional_context(adapted_content, target_region)
        
        # Formatear en estilo hispanohablante
        formatted_content = self.format_spanish_style(adapted_content, adapted_title)
        
        # Crear extracto
        excerpt = self.create_excerpt(formatted_content)
        
        return {
            'title': adapted_title,
            'content': formatted_content,
            'excerpt': excerpt,
            'tags': self.generate_tags(adapted_title, formatted_content),
            'seo': self.generate_seo(adapted_title, excerpt)
        }
    
    def adapt_title(self, title: str) -> str:
        """Adapta título al español"""
        # Eliminar indicadores de idioma
        title = re.sub(r'^\[.*?\]\s*', '', title)
        
        # Traducciones comunes en títulos
        title_adaptations = {
            r'\b(How|how)\s+(Much|much)\b': 'Cuánto',
            r'\b(Here\'s|Here is)\b': 'Así es como',
            r'\b(What|what)\b': 'Qué',
            r'\b(Why|why)\b': 'Por qué',
            r'\b(When|when)\b': 'Cuándo',
            r'\b(If|if)\b': 'Si',
            r'\b(Could|could)\b': 'Podría',
            r'\b(Would|would)\b': 'Sería',
            r'\b(Will|will)\b': 'Será',
            r'\b(Can|can)\b': 'Puede',
            r'\bworth\b': 'valer',
            r'\binvestment\b': 'inversión',
            r'\bprice\b': 'precio',
            r'\bprediction\b': 'predicción',
            r'\byears?\b': 'años',
            r'\bCrypto\b': 'Cripto',
            r'\bMarket\b': 'Mercado',
            r'\bBe\b': 'Ser',
            r'\bIn\b': 'En',
        }
        
        for pattern, replacement in title_adaptations.items():
            title = re.sub(pattern, replacement, title, flags=re.IGNORECASE)
        
        # Ajustar gramática española
        title = self.adjust_spanish_grammar(title)
        
        return title
    
    def adjust_spanish_grammar(self, text: str) -> str:
        """Ajusta gramática para español correcto"""
        # Ajustes gramaticales específicos
        text = re.sub(r'\bde el\b', 'del', text)
        text = re.sub(r'\ba el\b', 'al', text)
        
        # Capitalización apropiada
        text = text[0].upper() + text[1:] if text else text
        
        return text
    
    def adapt_text(self, text: str) -> str:
        """Adapta texto principal al español"""
        
        # Aplicar glosario
        for eng_term, es_term in self.crypto_glossary.items():
            text = re.sub(
                rf'\b{eng_term}\b(?!["\'])',
                es_term,
                text,
                flags=re.IGNORECASE
            )
        
        # Adaptar expresiones
        for eng_expr, es_expr in self.spanish_expressions.items():
            text = text.replace(eng_expr, es_expr)
            text = text.replace(eng_expr.lower(), es_expr)
        
        # Adaptar valores monetarios
        text = self.adapt_currency_values(text)
        
        return text
    
    def adapt_currency_values(self, text: str) -> str:
        """Convierte valores en dólares con contexto"""
        # Por ahora mantener dólares pero añadir contexto
        dollar_pattern = r'\$\s?([\d,]+(?:\.\d{2})?)'
        
        def add_context(match):
            value = match.group(0)
            # Añadir aproximación en euros para España
            try:
                num_value = float(match.group(1).replace(',', ''))
                eur_value = num_value * 0.92  # Tasa aproximada
                return f"{value} (≈ €{eur_value:,.0f})"
            except:
                return value
        
        return re.sub(dollar_pattern, add_context, text)
    
    def add_regional_context(self, content: str, region: str) -> str:
        """Añade contexto específico por región"""
        
        # Mencionar exchanges regionales
        if 'exchange' in content.lower() or 'casa de cambio' in content.lower():
            if region in self.spanish_exchanges:
                exchanges = self.spanish_exchanges[region]
            else:
                exchanges = self.spanish_exchanges['General']
            
            exchange_note = f"\n\n💱 **Exchanges recomendados**: "
            exchange_note += ", ".join(exchanges[:3]) + " son populares en la región."
            content += exchange_note
        
        # Añadir información fiscal general
        if any(word in content.lower() for word in ['ganancia', 'beneficio', 'profit']):
            tax_note = "\n\n💼 **Consideraciones fiscales**: Las criptomonedas están sujetas a "
            tax_note += "impuestos en la mayoría de países hispanohablantes. Consulta con un "
            tax_note += "asesor fiscal local sobre tus obligaciones tributarias."
            content += tax_note
        
        # Información regulatoria
        if 'regulación' in content.lower() or 'legal' in content.lower():
            regulatory_note = "\n\n⚖️ **Marco regulatorio**: La regulación de criptomonedas varía "
            regulatory_note += "significativamente entre países hispanohablantes. Algunos tienen "
            regulatory_note += "marcos claros mientras otros están en desarrollo."
            content += regulatory_note
        
        return content
    
    def format_spanish_style(self, content: str, title: str) -> str:
        """Formatea contenido en estilo hispanohablante"""
        
        formatted = f"# {title}\n\n"
        
        # Fecha en español
        meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
        ahora = datetime.now()
        fecha = f"{ahora.day} de {meses[ahora.month-1]} de {ahora.year}"
        formatted += f"📅 *{fecha}*\n\n"
        
        # Resumen ejecutivo
        formatted += "## 📌 Resumen Ejecutivo\n\n"
        formatted += "Los puntos clave de este análisis incluyen:\n\n"
        
        # Contenido principal
        formatted += "## 📊 Análisis del Mercado\n\n"
        
        paragraphs = content.split('\n\n')
        for i, para in enumerate(paragraphs):
            if i == 0:
                formatted += para + "\n\n"
            elif i == 1:
                formatted += "## 💡 Puntos Clave\n\n" + para + "\n\n"
            elif i % 3 == 0 and i < len(paragraphs) - 2:
                formatted += "## 🔍 Análisis Detallado\n\n" + para + "\n\n"
            else:
                formatted += para + "\n\n"
        
        # Consideraciones importantes
        formatted += "\n## ⚠️ Consideraciones Importantes\n\n"
        formatted += "- **Volatilidad**: El mercado cripto es altamente volátil\n"
        formatted += "- **Investigación**: Siempre haz tu propia investigación (DYOR)\n"
        formatted += "- **Diversificación**: No pongas todos los huevos en la misma cesta\n"
        formatted += "- **Inversión responsable**: Solo invierte lo que puedas perder\n"
        formatted += "- **Asesoría**: Consulta con profesionales cuando sea necesario\n"
        
        # Disclaimer
        formatted += "\n## 📋 Aviso Legal\n\n"
        formatted += "*Este contenido es únicamente informativo y no constituye asesoría financiera, "
        formatted += "de inversión o fiscal. Las criptomonedas son activos volátiles y de alto riesgo. "
        formatted += "Realiza tu propia investigación antes de tomar decisiones de inversión.*\n"
        
        # Llamada a la acción
        formatted += "\n---\n\n"
        formatted += "💬 **¿Qué opinas?** Comparte tu análisis en los comentarios y únete a nuestra "
        formatted += "comunidad de inversores crypto hispanohablantes.\n"
        
        return formatted
    
    def create_excerpt(self, content: str) -> str:
        """Crea extracto atractivo en español"""
        paragraphs = content.split('\n\n')
        for para in paragraphs:
            if not para.startswith('#') and not para.startswith('-') and len(para) > 50:
                excerpt = re.sub(r'[*_#\[\]()]', '', para)
                if len(excerpt) > 160:
                    excerpt = excerpt[:157] + '...'
                return excerpt
        
        return "Análisis completo del mercado de criptomonedas..."
    
    def generate_tags(self, title: str, content: str) -> List[str]:
        """Genera etiquetas relevantes en español"""
        tags = ['criptomonedas', 'blockchain', 'inversión-cripto']
        
        # Añadir criptomonedas específicas
        if 'bitcoin' in content.lower():
            tags.append('bitcoin')
        if 'ethereum' in content.lower():
            tags.append('ethereum')
        if 'defi' in content.lower():
            tags.append('defi')
        if 'nft' in content.lower():
            tags.append('nft')
        
        # Tags basadas en contenido
        if 'precio' in title.lower() or 'predicción' in title.lower():
            tags.append('análisis-precio')
        if 'mercado' in content.lower():
            tags.append('análisis-mercado')
        
        tags.append('español')
        tags.append('cripto-español')
        
        return tags[:8]
    
    def generate_seo(self, title: str, excerpt: str) -> Dict[str, str]:
        """Genera datos SEO optimizados para búsquedas en español"""
        return {
            'metaTitle': f"{title} | Análisis Cripto en Español",
            'metaDescription': excerpt[:155] if len(excerpt) > 155 else excerpt,
            'keywords': 'criptomonedas español, bitcoin españa, inversión cripto, blockchain español, análisis mercado'
        }

# Ejemplo de uso
if __name__ == "__main__":
    writer = SpanishCryptoWriter()
    
    # Contenido de prueba
    test_content = """
    Bitcoin could reach $100,000 by 2025 according to analysts.
    
    The bull market shows strong momentum with institutional investment growing.
    Major exchanges report record trading volumes.
    
    Investors should DYOR before making any investment decisions.
    """
    
    test_title = "Here's How Much Bitcoin Could Be Worth in 5 Years"
    
    # Probar para diferentes regiones
    for region in ['España', 'México', 'general']:
        print(f"\n{'='*60}")
        print(f"REGIÓN: {region}")
        print('='*60)
        
        result = writer.adapt_content(test_content, test_title, region)
        
        print("\n=== Título Adaptado ===")
        print(result['title'])
        print("\n=== Extracto ===")
        print(result['excerpt'])