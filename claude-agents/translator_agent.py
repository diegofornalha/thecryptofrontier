#!/usr/bin/env python3
"""
Agente Tradutor Multi-idioma para Blog
Traduz conteúdo entre EN, PT e ES sem APIs externas
"""
import re
import json
from typing import Dict, List, Tuple
from pathlib import Path

class TranslatorAgent:
    """Agente tradutor simples sem dependências externas"""
    
    def __init__(self):
        # Dicionários de tradução básicos
        self.dictionaries = self.load_dictionaries()
        
        # Padrões comuns de tradução
        self.patterns = {
            'en_to_pt': [
                (r'\b(cryptocurrency|crypto)\b', 'criptomoeda'),
                (r'\bbitcoin\b', 'Bitcoin'),
                (r'\bethereum\b', 'Ethereum'),
                (r'\bblockchain\b', 'blockchain'),
                (r'\btoken(s)?\b', 'token$1'),
                (r'\bwallet\b', 'carteira'),
                (r'\bexchange\b', 'corretora'),
                (r'\btrading\b', 'negociação'),
                (r'\bmarket\b', 'mercado'),
                (r'\bprice\b', 'preço'),
                (r'\binvestment\b', 'investimento'),
                (r'\binvestor(s)?\b', 'investidor$1'),
                (r'\bworth\b', 'valer'),
                (r'\bgrowth\b', 'crescimento'),
                (r'\bfuture\b', 'futuro'),
                (r'\byear(s)?\b', 'ano$1'),
                (r'\bmonth(s)?\b', 'mês$1' if '$1' == '' else 'meses'),
                (r'\banalyst(s)?\b', 'analista$1'),
                (r'\bprediction(s)?\b', 'previsão' if '$1' == '' else 'previsões'),
                (r'\bforecast\b', 'previsão'),
                (r'\bif\b', 'se'),
                (r'\bcould\b', 'poderia'),
                (r'\bwould\b', 'seria'),
                (r'\bmight\b', 'pode'),
                (r'\bwill\b', 'vai'),
                (r'\bhas\b', 'tem'),
                (r'\bhave\b', 'ter'),
                (r'\babout\b', 'sobre'),
                (r'\bwith\b', 'com'),
                (r'\bfrom\b', 'de'),
                (r'\bfor\b', 'para'),
                (r'\band\b', 'e'),
                (r'\bor\b', 'ou'),
                (r'\bbut\b', 'mas'),
                (r'\bin\b', 'em'),
                (r'\bon\b', 'em'),
                (r'\bat\b', 'em'),
                (r'\bto\b', 'para'),
                (r'\bof\b', 'de'),
                (r'\bthe\b', 'o'),
                (r'\ba\b', 'um'),
                (r'\ban\b', 'um'),
            ],
            'en_to_es': [
                (r'\b(cryptocurrency|crypto)\b', 'criptomoneda'),
                (r'\bbitcoin\b', 'Bitcoin'),
                (r'\bethereum\b', 'Ethereum'),
                (r'\bblockchain\b', 'blockchain'),
                (r'\btoken(s)?\b', 'token$1'),
                (r'\bwallet\b', 'billetera'),
                (r'\bexchange\b', 'intercambio'),
                (r'\btrading\b', 'comercio'),
                (r'\bmarket\b', 'mercado'),
                (r'\bprice\b', 'precio'),
                (r'\binvestment\b', 'inversión'),
                (r'\binvestor(s)?\b', 'inversor$1' if '$1' == '' else 'inversores'),
                (r'\bworth\b', 'valer'),
                (r'\bgrowth\b', 'crecimiento'),
                (r'\bfuture\b', 'futuro'),
                (r'\byear(s)?\b', 'año$1'),
                (r'\bmonth(s)?\b', 'mes$1' if '$1' == '' else 'meses'),
            ]
        }
        
        # Frases comuns do mercado crypto
        self.crypto_phrases = {
            'en': {
                'market analysis': 'análise de mercado',
                'price prediction': 'previsão de preço',
                'technical analysis': 'análise técnica',
                'fundamental analysis': 'análise fundamentalista',
                'market cap': 'capitalização de mercado',
                'trading volume': 'volume de negociação',
                'all-time high': 'máxima histórica',
                'bear market': 'mercado em baixa',
                'bull market': 'mercado em alta',
                'hodl': 'HODL (segurar)',
                'to the moon': 'para a lua',
                'buy the dip': 'comprar na queda',
                'fear and greed': 'medo e ganância',
                'market sentiment': 'sentimento do mercado',
                'price action': 'ação do preço',
                'support level': 'nível de suporte',
                'resistance level': 'nível de resistência',
            }
        }
    
    def load_dictionaries(self) -> Dict:
        """Carrega dicionários de tradução"""
        dict_file = Path('translation_dictionaries.json')
        if dict_file.exists():
            with open(dict_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def translate(self, text: str, from_lang: str, to_lang: str) -> str:
        """Traduz texto entre idiomas"""
        if from_lang == to_lang:
            return text
        
        # Aplicar traduções baseadas em padrões
        pattern_key = f'{from_lang}_to_{to_lang}'
        if pattern_key in self.patterns:
            for pattern, replacement in self.patterns[pattern_key]:
                text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        # Traduzir frases comuns
        if from_lang == 'en' and to_lang == 'pt':
            for en_phrase, pt_phrase in self.crypto_phrases['en'].items():
                text = text.replace(en_phrase, pt_phrase)
                text = text.replace(en_phrase.title(), pt_phrase.title())
                text = text.replace(en_phrase.upper(), pt_phrase.upper())
        
        # Ajustes gramaticais básicos para PT
        if to_lang == 'pt':
            # Ajustar artigos
            text = re.sub(r'\bo\s+([aeiou])', r'o $1', text)
            text = re.sub(r'\bum\s+([aeiou])', r'um $1', text)
            
            # Capitalizar início de frases
            text = '. '.join(s.strip().capitalize() for s in text.split('.') if s.strip())
            
            # Remover espaços duplos
            text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def translate_markdown(self, content: str, from_lang: str, to_lang: str) -> str:
        """Traduz conteúdo preservando formatação Markdown"""
        lines = content.split('\n')
        translated_lines = []
        
        for line in lines:
            # Preservar linhas de código
            if line.strip().startswith('```') or line.strip().startswith('`'):
                translated_lines.append(line)
                continue
            
            # Preservar headers Markdown
            if line.strip().startswith('#'):
                header_match = re.match(r'^(#+\s+)(.*)$', line)
                if header_match:
                    prefix, text = header_match.groups()
                    translated_text = self.translate(text, from_lang, to_lang)
                    translated_lines.append(f"{prefix}{translated_text}")
                else:
                    translated_lines.append(line)
                continue
            
            # Preservar listas
            if re.match(r'^\s*[-*+]\s+', line) or re.match(r'^\s*\d+\.\s+', line):
                list_match = re.match(r'^(\s*[-*+]\s+|\s*\d+\.\s+)(.*)$', line)
                if list_match:
                    prefix, text = list_match.groups()
                    translated_text = self.translate(text, from_lang, to_lang)
                    translated_lines.append(f"{prefix}{translated_text}")
                else:
                    translated_lines.append(line)
                continue
            
            # Traduzir linha normal
            translated_lines.append(self.translate(line, from_lang, to_lang))
        
        return '\n'.join(translated_lines)
    
    def detect_language(self, text: str) -> str:
        """Detecta idioma do texto"""
        # Contadores de palavras características
        en_words = len(re.findall(r'\b(the|is|are|was|were|have|has|been|and|or|but|if|then|with|from|to|in|on|at)\b', text, re.IGNORECASE))
        pt_words = len(re.findall(r'\b(o|a|os|as|é|são|foi|foram|tem|têm|e|ou|mas|se|então|com|de|para|em|no|na)\b', text, re.IGNORECASE))
        es_words = len(re.findall(r'\b(el|la|los|las|es|son|fue|fueron|tiene|tienen|y|o|pero|si|entonces|con|de|para|en)\b', text, re.IGNORECASE))
        
        # Determinar idioma predominante
        if en_words > pt_words and en_words > es_words:
            return 'en'
        elif pt_words > es_words:
            return 'pt'
        else:
            return 'es'

# Interface CLI
if __name__ == "__main__":
    import sys
    
    translator = TranslatorAgent()
    
    if len(sys.argv) < 2:
        print("Uso: python translator_agent.py [comando] [args]")
        print("Comandos:")
        print("  translate <texto> <de> <para>  - Traduz texto")
        print("  detect <texto>                 - Detecta idioma")
        print("  file <arquivo> <de> <para>     - Traduz arquivo")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'translate':
        if len(sys.argv) < 5:
            print("Uso: translate <texto> <de> <para>")
            sys.exit(1)
        
        text = sys.argv[2]
        from_lang = sys.argv[3]
        to_lang = sys.argv[4]
        
        result = translator.translate(text, from_lang, to_lang)
        print(result)
    
    elif command == 'detect':
        if len(sys.argv) < 3:
            print("Uso: detect <texto>")
            sys.exit(1)
        
        text = ' '.join(sys.argv[2:])
        lang = translator.detect_language(text)
        print(f"Idioma detectado: {lang}")
    
    elif command == 'file':
        if len(sys.argv) < 5:
            print("Uso: file <arquivo> <de> <para>")
            sys.exit(1)
        
        file_path = sys.argv[2]
        from_lang = sys.argv[3]
        to_lang = sys.argv[4]
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        translated = translator.translate_markdown(content, from_lang, to_lang)
        
        output_path = file_path.replace('.', f'_{to_lang}.')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(translated)
        
        print(f"Tradução salva em: {output_path}")