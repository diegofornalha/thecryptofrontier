# config.py - Configurações para o monitor de RSS

# URL do feed RSS para monitorar
RSS_FEED_URL = "https://thecryptobasic.com/feed/"

# Arquivo para armazenar os posts já processados
PROCESSED_POSTS_FILE = "processados.json" 

# Configurações para o idioma de destino
TARGET_LANGUAGE = "pt-br"
# Nota: Usando Gemini para tradução, não é necessário um endpoint externo

# Configurações para o gerador HTML
HTML_TEMPLATE_PATH = "template.html"  # Caminho para o template HTML
TITLE_PLACEHOLDER = "<!--TITLE_PLACEHOLDER-->"  # Marcador para substituição do título
CONTENT_PLACEHOLDER = "<!--CONTENT_PLACEHOLDER-->"  # Marcador para substituição do conteúdo

# Configuração da API Gemini
GEMINI_API_KEY = "AIzaSyCP7txRNZXLkRC9Y0082z03w4qzx3MimaY"
GEMINI_MODEL = "gemini-2.0-flash"

# Configurações para publicação no Sanity
SANITY_PROJECT_ID = "brby2yrg"
SANITY_DATASET = "production"
SANITY_API_TOKEN = "sk0MzzutKkZoELcQnRSwhz7hqSMXlwMuQCwna9Mp90nqUU1OLb0WdouiGhXa1xWdWcNPFlLoCkrxCuq8xNVeDzJPKQOtlh22xjLsNduo7WIR138cCAiZe40cwque00dbHAx0ylF0ntLM5GinO8GKX69aF5JZw7Q5Bpq1GPGRihGhbM0cNGAm"
SANITY_API_VERSION = "2023-05-03"

# Configurações para categorização de posts
DEFAULT_CATEGORY = ""  # Categoria principal para posts (deixar vazio até configurar no Sanity)
DEFAULT_TAGS = ["bitcoin", "ethereum", "investimentos"]  # Tags padrão para os posts 

# ID do autor Alexandre Bianchi
AUTHOR_ID = "ca38a3d5-cba1-47a0-aa29-4af17a15e17c" 