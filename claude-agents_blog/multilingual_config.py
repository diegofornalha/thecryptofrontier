#!/usr/bin/env python3
"""
Configuração Multi-idioma para o Sistema de Blog
Define estratégias de tradução e publicação
"""

class MultilingualConfig:
    """Configuração para sistema multi-idioma"""
    
    # Idiomas suportados
    SUPPORTED_LANGUAGES = {
        'pt': {
            'name': 'Português',
            'locale': 'pt-BR',
            'default': True,
            'slug_prefix': '',  # Sem prefixo para idioma padrão
        },
        'en': {
            'name': 'English',
            'locale': 'en-US',
            'default': False,
            'slug_prefix': 'en/',
        },
        'es': {
            'name': 'Español',
            'locale': 'es-ES',
            'default': False,
            'slug_prefix': 'es/',
        }
    }
    
    # Estratégias de publicação
    PUBLISHING_STRATEGIES = {
        'single_language': {
            'description': 'Publica apenas em um idioma (PT por padrão)',
            'target_languages': ['pt'],
            'translate': True,
            'keep_original': False
        },
        'bilingual': {
            'description': 'Publica em PT e mantém versão original',
            'target_languages': ['pt', '{original}'],
            'translate': True,
            'keep_original': True
        },
        'multilingual': {
            'description': 'Publica em todos os idiomas suportados',
            'target_languages': ['pt', 'en', 'es'],
            'translate': True,
            'keep_original': True
        },
        'original_only': {
            'description': 'Mantém apenas no idioma original',
            'target_languages': ['{original}'],
            'translate': False,
            'keep_original': True
        }
    }
    
    # Estratégia padrão
    DEFAULT_STRATEGY = 'single_language'
    
    @classmethod
    def get_strategy(cls, strategy_name=None):
        """Retorna estratégia de publicação"""
        if not strategy_name:
            strategy_name = cls.DEFAULT_STRATEGY
        
        return cls.PUBLISHING_STRATEGIES.get(
            strategy_name, 
            cls.PUBLISHING_STRATEGIES[cls.DEFAULT_STRATEGY]
        )
    
    @classmethod
    def should_translate(cls, from_lang, to_lang, strategy=None):
        """Determina se deve traduzir"""
        if from_lang == to_lang:
            return False
        
        strategy_config = cls.get_strategy(strategy)
        return strategy_config['translate']
    
    @classmethod
    def get_target_languages(cls, original_lang, strategy=None):
        """Retorna idiomas alvo para publicação"""
        strategy_config = cls.get_strategy(strategy)
        target_langs = []
        
        for lang in strategy_config['target_languages']:
            if lang == '{original}':
                target_langs.append(original_lang)
            else:
                target_langs.append(lang)
        
        # Remove duplicatas mantendo ordem
        seen = set()
        result = []
        for lang in target_langs:
            if lang not in seen and lang in cls.SUPPORTED_LANGUAGES:
                seen.add(lang)
                result.append(lang)
        
        return result
    
    @classmethod
    def format_slug_for_language(cls, base_slug, language):
        """Formata slug com prefixo de idioma se necessário"""
        lang_config = cls.SUPPORTED_LANGUAGES.get(language, {})
        prefix = lang_config.get('slug_prefix', '')
        
        if prefix:
            return f"{prefix}{base_slug}"
        return base_slug
    
    @classmethod
    def get_locale_code(cls, language):
        """Retorna código locale para o idioma"""
        lang_config = cls.SUPPORTED_LANGUAGES.get(language, {})
        return lang_config.get('locale', 'pt-BR')


# Exemplo de uso
if __name__ == "__main__":
    config = MultilingualConfig()
    
    print("=== Configuração Multi-idioma ===")
    print("\nIdiomas suportados:")
    for lang, info in config.SUPPORTED_LANGUAGES.items():
        print(f"  {lang}: {info['name']} ({info['locale']})")
    
    print("\nEstratégias disponíveis:")
    for name, strategy in config.PUBLISHING_STRATEGIES.items():
        print(f"  {name}: {strategy['description']}")
    
    # Teste de estratégias
    print("\n=== Testes de Estratégia ===")
    
    # Teste 1: Single language (PT apenas)
    langs = config.get_target_languages('en', 'single_language')
    print(f"\nSingle language (EN -> ?): {langs}")
    
    # Teste 2: Bilingual
    langs = config.get_target_languages('en', 'bilingual')
    print(f"Bilingual (EN -> ?): {langs}")
    
    # Teste 3: Multilingual
    langs = config.get_target_languages('en', 'multilingual')
    print(f"Multilingual (EN -> ?): {langs}")
    
    # Teste de slugs
    print("\n=== Testes de Slug ===")
    base_slug = "bitcoin-atinge-nova-maxima"
    for lang in ['pt', 'en', 'es']:
        slug = config.format_slug_for_language(base_slug, lang)
        print(f"{lang}: /{slug}")