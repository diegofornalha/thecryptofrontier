#!/usr/bin/env python3
"""
USCryptoWriter - Agent specialized in crypto content for US market
Maintains original English with US market context and regulations
"""
import re
from typing import Dict, List
from datetime import datetime

class USCryptoWriter:
    """Writer specialized in US crypto market"""
    
    def __init__(self):
        # US market terminology
        self.us_terminology = {
            'SEC': 'Securities and Exchange Commission (SEC)',
            'IRS': 'Internal Revenue Service (IRS)',
            'CFTC': 'Commodity Futures Trading Commission (CFTC)',
            'FinCEN': 'Financial Crimes Enforcement Network (FinCEN)',
            'ETF': 'Exchange-Traded Fund (ETF)',
            'spot ETF': 'spot ETF',
            'futures': 'futures',
            'options': 'options',
            'accredited investor': 'accredited investor',
            'qualified custodian': 'qualified custodian',
            'wash sale': 'wash sale rule',
            'capital gains': 'capital gains',
            'short-term gains': 'short-term capital gains',
            'long-term gains': 'long-term capital gains',
            '1099': 'Form 1099',
            'KYC': 'Know Your Customer (KYC)',
            'AML': 'Anti-Money Laundering (AML)',
        }
        
        # Major US exchanges
        self.us_exchanges = [
            'Coinbase',
            'Kraken',
            'Gemini',
            'Binance.US',
            'Crypto.com',
            'KuCoin',
            'Bitstamp'
        ]
        
        # US regulatory landscape
        self.regulatory_context = {
            'securities': 'may be classified as securities under US law',
            'commodities': 'treated as commodities by the CFTC',
            'property': 'treated as property for tax purposes by the IRS',
            'reporting': 'subject to reporting requirements',
            'licensing': 'requires appropriate licensing in most states'
        }
        
        # State-specific mentions
        self.crypto_friendly_states = [
            'Wyoming', 'Texas', 'Florida', 'Colorado', 'Nevada'
        ]
        
        self.restrictive_states = [
            'New York (BitLicense)', 'Hawaii', 'Connecticut'
        ]
        
    def enhance_content(self, content: str, title: str) -> Dict[str, str]:
        """Enhance content for US audience"""
        
        # Keep title in English but make it more engaging
        enhanced_title = self.enhance_title(title)
        
        # Add US market context
        enhanced_content = self.add_us_context(content)
        
        # Add regulatory awareness
        enhanced_content = self.add_regulatory_info(enhanced_content)
        
        # Format in US style
        formatted_content = self.format_us_style(enhanced_content, enhanced_title)
        
        # Create excerpt
        excerpt = self.create_excerpt(formatted_content)
        
        return {
            'title': enhanced_title,
            'content': formatted_content,
            'excerpt': excerpt,
            'tags': self.generate_tags(enhanced_title, formatted_content),
            'seo': self.generate_seo(enhanced_title, excerpt)
        }
    
    def enhance_title(self, title: str) -> str:
        """Enhance title for US audience"""
        # Remove language indicators
        title = re.sub(r'^\[.*?\]\s*', '', title)
        
        # Add power words for US market
        if 'price' in title.lower():
            title = title.replace('Price', 'Price Target')
        if 'could' in title.lower():
            title = title.replace('Could', 'Could Potentially')
        
        # Add year if prediction
        if 'prediction' in title.lower() and '2024' not in title and '2025' not in title:
            title += ' (2025 Analysis)'
        
        return title
    
    def add_us_context(self, content: str) -> str:
        """Add US-specific market context"""
        
        # Add exchange context
        if 'exchange' in content.lower():
            content += f"\n\n🏢 **US Exchanges**: Popular platforms include {', '.join(self.us_exchanges[:4])}. "
            content += "Each offers different features, fees, and state availability."
        
        # Add tax context for gains
        if any(word in content.lower() for word in ['profit', 'gain', 'worth', 'investment']):
            content += "\n\n💰 **Tax Implications**: In the US, cryptocurrency is treated as property by the IRS. "
            content += "Profits are subject to capital gains tax:\n"
            content += "- **Short-term** (held <1 year): Taxed as ordinary income (10-37%)\n"
            content += "- **Long-term** (held >1 year): Preferential rates (0-20%)"
        
        # Add state-specific info
        if 'regulation' in content.lower() or 'legal' in content.lower():
            content += f"\n\n🏛️ **State Regulations**: Crypto-friendly states include {', '.join(self.crypto_friendly_states[:3])}. "
            content += f"More restrictive states include {', '.join(self.restrictive_states[:2])}."
        
        return content
    
    def add_regulatory_info(self, content: str) -> str:
        """Add regulatory awareness information"""
        
        # SEC context
        if any(word in content.lower() for word in ['security', 'token', 'ico']):
            content += "\n\n⚖️ **SEC Considerations**: Some cryptocurrencies may be considered securities. "
            content += "The Howey Test determines if an asset is a security under US law."
        
        # ETF context
        if 'etf' in content.lower():
            content += "\n\n📈 **ETF Status**: The SEC has approved several Bitcoin futures ETFs. "
            content += "Spot Bitcoin ETFs are still under review as of 2024."
        
        # Staking/DeFi context
        if any(word in content.lower() for word in ['staking', 'defi', 'yield']):
            content += "\n\n🌾 **DeFi Regulations**: DeFi and staking rewards are taxable events. "
            content += "The SEC and CFTC are actively developing frameworks for DeFi regulation."
        
        return content
    
    def format_us_style(self, content: str, title: str) -> str:
        """Format content in US style"""
        
        formatted = f"# {title}\n\n"
        
        # Add publication date
        date_str = datetime.now().strftime('%B %d, %Y')
        formatted += f"*Published: {date_str} | Updated: {date_str}*\n\n"
        
        # Key takeaways section (US readers love summaries)
        formatted += "## 🔑 Key Takeaways\n\n"
        formatted += "- Current market analysis and price predictions\n"
        formatted += "- Regulatory considerations for US investors\n"
        formatted += "- Tax implications and reporting requirements\n"
        formatted += "- State-specific regulations to consider\n\n"
        
        # Main content
        formatted += "## 📊 Market Analysis\n\n"
        
        # Process paragraphs
        paragraphs = content.split('\n\n')
        for i, para in enumerate(paragraphs):
            if i < len(paragraphs) - 3:  # Skip sections we'll add manually
                formatted += para + "\n\n"
        
        # Risk disclosure (required for US market)
        formatted += "\n## ⚠️ Risk Disclosure\n\n"
        formatted += "**Important**: Cryptocurrency investments carry significant risks:\n\n"
        formatted += "- **Volatility**: Prices can fluctuate dramatically\n"
        formatted += "- **Regulatory Risk**: Rules may change at federal or state level\n"
        formatted += "- **Security Risk**: Digital assets can be lost or stolen\n"
        formatted += "- **Tax Obligations**: All transactions may have tax consequences\n\n"
        
        # Investment disclaimer
        formatted += "## 📝 Disclaimer\n\n"
        formatted += "*This content is for informational purposes only and does not constitute financial, "
        formatted += "investment, legal, or tax advice. Consult with qualified professionals before making "
        formatted += "any investment decisions. Past performance does not guarantee future results.*\n"
        
        # Call to action
        formatted += "\n---\n\n"
        formatted += "**Stay Informed**: Subscribe to our newsletter for the latest crypto market analysis "
        formatted += "and regulatory updates tailored for US investors.\n"
        
        return formatted
    
    def create_excerpt(self, content: str) -> str:
        """Create compelling excerpt for US audience"""
        # Extract first meaningful paragraph
        paragraphs = content.split('\n\n')
        for para in paragraphs:
            if not para.startswith('#') and not para.startswith('-') and len(para) > 50:
                excerpt = re.sub(r'[*_#\[\]()]', '', para)
                if len(excerpt) > 160:
                    excerpt = excerpt[:157] + '...'
                return excerpt
        
        return "Complete cryptocurrency market analysis for US investors..."
    
    def generate_tags(self, title: str, content: str) -> List[str]:
        """Generate relevant tags for US market"""
        tags = ['cryptocurrency', 'crypto-investing', 'blockchain', 'digital-assets']
        
        # Add specific cryptocurrencies
        if 'bitcoin' in content.lower():
            tags.append('bitcoin')
        if 'ethereum' in content.lower():
            tags.append('ethereum')
        if 'xrp' in content.lower():
            tags.append('xrp')
        
        # Add US-specific tags
        if 'tax' in content.lower():
            tags.append('crypto-taxes')
        if 'sec' in content.lower():
            tags.append('sec-regulation')
        if 'etf' in content.lower():
            tags.append('crypto-etf')
        
        # Market tags
        if 'price' in title.lower():
            tags.append('price-prediction')
        if 'defi' in content.lower():
            tags.append('defi')
        
        tags.append('us-market')
        
        return tags[:10]
    
    def generate_seo(self, title: str, excerpt: str) -> Dict[str, str]:
        """Generate SEO data optimized for US search"""
        return {
            'metaTitle': f"{title} | US Crypto Market Analysis",
            'metaDescription': excerpt[:155] if len(excerpt) > 155 else excerpt,
            'keywords': 'cryptocurrency USA, bitcoin investment, crypto taxes, SEC regulation, digital assets'
        }

# Example usage
if __name__ == "__main__":
    writer = USCryptoWriter()
    
    # Test content
    test_content = """
    Bitcoin could reach $100,000 by 2025 according to analysts.
    
    The bull market shows strong momentum with institutional investment growing.
    Major exchanges report record trading volumes.
    
    Investors should consider the regulatory landscape before investing.
    """
    
    test_title = "Bitcoin Price Prediction: Path to $100K"
    
    result = writer.enhance_content(test_content, test_title)
    
    print("=== Enhanced Title ===")
    print(result['title'])
    print("\n=== Content ===")
    print(result['content'])
    print("\n=== Tags ===")
    print(result['tags'])