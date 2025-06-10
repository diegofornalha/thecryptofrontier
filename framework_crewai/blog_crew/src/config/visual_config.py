"""
Configurações visuais para geração de imagens com identidade consistente
Migrado do projeto dalle-image-generation
"""

# Identidade Visual Base
BRAND_STYLE = {
    "style": "3D photorealistic cryptocurrency rendering",
    "background": "Pure black (#000000) with subtle blue tech grid",
    "lighting": "Blue rim lighting (#003366) with top-down key light",
    "effects": "Circular cyan energy waves radiating from center",
    "composition": "Logo centered, floating with volumetric 3D appearance",
    "quality": "ultra high definition, sharp details, professional rendering"
}

# Templates de prompt para diferentes contextos
PROMPT_TEMPLATES = {
    "single_crypto": """
    {crypto_symbol} centered and floating
    Visual style: {style}
    Color: {crypto_color}
    Background: {background}
    Lighting: {lighting}
    Effects: {effects}
    Composition: {composition}
    Format: 1792x1024 landscape with 20% margin safety zone
    Quality: {quality}
    """,
    
    "multiple_cryptos": """
    {main_crypto} and {secondary_crypto} in dynamic composition
    Visual style: {style}
    Main element: {main_crypto} with {main_color}
    Secondary element: {secondary_crypto} with {secondary_color}
    Background: {background}
    Lighting: {lighting}
    Effects: Energy connection between logos, {effects}
    Composition: Two logos in balanced arrangement, connected by energy streams
    Format: 1792x1024 landscape with 20% margin safety zone
    Quality: {quality}
    """,
    
    "generic_crypto": """
    Multiple cryptocurrency logos floating in 3D space
    Visual style: {style}
    Background: {background}
    Lighting: {lighting}
    Effects: {effects}
    Composition: Various crypto symbols arranged dynamically
    Format: 1792x1024 landscape with 20% margin safety zone
    Quality: {quality}
    """
}

# Configurações técnicas DALL-E
TECHNICAL_SPECS = {
    "model": "dall-e-3",
    "size": "1792x1024",  # 16:9 landscape
    "quality": "hd",
    "n": 1
}

# Mapeamento de criptomoedas para descrições visuais
CRYPTO_VISUALS = {
    "bitcoin": {
        "symbol": "Bitcoin logo 3D volumetric orange coin with B symbol",
        "color": "golden orange metallic",
        "keywords": ["bitcoin", "btc"]
    },
    "ethereum": {
        "symbol": "Ethereum logo 3D volumetric diamond shape",
        "color": "silver and blue metallic",
        "keywords": ["ethereum", "eth"]
    },
    "xrp": {
        "symbol": "XRP logo 3D volumetric black sphere with white X",
        "color": "black and white contrast",
        "keywords": ["xrp", "ripple"]
    },
    "bnb": {
        "symbol": "BNB logo 3D volumetric golden diamond",
        "color": "golden yellow metallic",
        "keywords": ["bnb", "binance"]
    },
    "dogecoin": {
        "symbol": "Dogecoin logo 3D volumetric coin with Shiba Inu",
        "color": "golden yellow with brown accents",
        "keywords": ["dogecoin", "doge"]
    },
    "solana": {
        "symbol": "Solana logo 3D volumetric three angular bars",
        "color": "purple to turquoise gradient metallic",
        "keywords": ["solana", "sol"]
    },
    "chainlink": {
        "symbol": "Chainlink logo 3D volumetric blue hexagon",
        "color": "deep blue with white center",
        "keywords": ["chainlink", "link"]
    },
    "shiba": {
        "symbol": "Shiba Inu logo 3D volumetric red coin",
        "color": "red and orange metallic",
        "keywords": ["shiba", "shib"]
    },
    "sui": {
        "symbol": "Sui logo 3D volumetric water drop",
        "color": "light blue translucent",
        "keywords": ["sui"]
    },
    "usdt": {
        "symbol": "Tether USDT logo 3D volumetric hexagon with T",
        "color": "teal and white",
        "keywords": ["usdt", "tether"]
    },
    "tron": {
        "symbol": "Tron TRX logo 3D volumetric angular design",
        "color": "red geometric metallic",
        "keywords": ["tron", "trx"]
    },
    "pepe": {
        "symbol": "PEPE logo 3D volumetric green frog face",
        "color": "green with orange accents",
        "keywords": ["pepe"]
    },
    "mastercard": {
        "symbol": "MasterCard logo 3D volumetric two intersecting circles",
        "color": "red and yellow circles",
        "keywords": ["mastercard"]
    },
    "airdrop": {
        "symbol": "Parachute with golden coins 3D volumetric",
        "color": "blue parachute with golden coins",
        "keywords": ["airdrop"]
    },
    "kraken": {
        "symbol": "Kraken logo 3D volumetric purple octopus",
        "color": "purple tentacles",
        "keywords": ["kraken"]
    }
}

# Regras de consistência visual
CONSISTENCY_RULES = [
    "Always include 15-20% margin for safe viewing area",
    "Maintain consistent lighting direction (top-left)",
    "Use the same perspective angle for 3D elements",
    "Keep background dark to match brand identity",
    "Ensure high contrast for readability",
    "Apply consistent shadow and reflection effects",
    "Use branded color palette exclusively"
]