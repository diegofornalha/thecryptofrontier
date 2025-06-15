# Solução do Problema de Upload de Imagens para o Strapi

## Problema Identificado

O upload de imagens para o Strapi estava falhando com o erro:
```
"Input buffer contains unsupported image format"
```

Este erro ocorria mesmo quando as imagens eram válidas (PNG/JPEG).

## Causa Raiz

O problema estava no método de upload. Estávamos enviando as imagens como `multipart/form-data` em vez de enviar os bytes diretamente no corpo da requisição.

### Método Incorreto (multipart/form-data):
```python
files = {
    'file': (filename, f, 'image/png')
}
response = requests.post(upload_url, headers=headers, files=files)
```

### Método Correto (binary upload):
```python
headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "image/png"  # Especificar o tipo MIME correto
}
with open(image_path, 'rb') as f:
    response = requests.post(upload_url, headers=headers, data=f)
```

## Solução Implementada

### 1. Script Standalone: `process_images_working.py`

Este script processa posts formatados, gera imagens com DALL-E 3 e faz upload para o Strapi:

```python
def upload_image_to_strapi_binary(image_path, alt_text):
    """Upload binário direto para Strapi (método correto da documentação)"""
    # URL da API - usando v2021-06-07 como na documentação
    upload_url = f"https://{project_id}.api.strapi.io/v2021-06-07/assets/images/{dataset}"
    
    # Headers com Content-Type específico
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": content_type  # image/png, image/jpeg, etc.
    }
    
    # Upload binário direto
    with open(image_path, 'rb') as f:
        response = requests.post(upload_url, headers=headers, data=f)
```

### 2. Ferramenta para CrewAI: `image_generation_tools_fixed.py`

Criamos ferramentas compatíveis com o CrewAI:
- `generate_and_upload_image`: Processa um único post
- `process_all_formatted_posts`: Processa todos os posts de uma vez

### 3. Script de Publicação: `publish_com_imagem.py`

Script para publicar posts que já têm imagens no Strapi.

## Fluxo Completo Funcional

1. **Geração de Posts**: RSS → Formatação → Tradução
2. **Geração de Imagens**: 
   - Detecta criptomoeda mencionada
   - Gera prompt específico
   - Cria imagem com DALL-E 3
   - Upload binário para Strapi
3. **Publicação**: Post com imagem é publicado no Strapi

## Configurações Necessárias

### Variáveis de Ambiente:
- `OPENAI_API_KEY`: Para DALL-E 3
- `STRAPI_PROJECT_ID`: ID do projeto Strapi
- `strapi_API_TOKEN`: Token de autenticação
- `strapi_DATASET`: Dataset (geralmente "production")

### Estrutura de Diretórios:
```
posts_formatados/    # Posts prontos para imagem
posts_com_imagem/    # Posts com imagem adicionada
posts_imagens/       # Backup das imagens geradas
posts_publicados/    # Posts publicados no Strapi
```

## Templates de Imagem

O sistema detecta automaticamente a criptomoeda mencionada e usa templates específicos:

- **Bitcoin**: Logo 3D volumétrico laranja com símbolo B
- **Ethereum**: Logo 3D volumétrico em forma de diamante
- **Genérico**: Múltiplas moedas 3D flutuando

Estilo visual padrão:
- Fundo preto (#000000) com grid azul sutil
- Iluminação rim light azul (#003366)
- Ondas de energia cyan radiantes
- Resolução 1792x1024 (16:9)

## Comandos de Uso

### Processar imagens manualmente:
```bash
cd framework_crewai/blog_crew
source venv/bin/activate
python process_images_working.py
```

### Publicar posts com imagem:
```bash
python publish_com_imagem.py
```

### Executar pipeline completo:
```bash
python main.py  # Gera posts formatados
python process_images_working.py  # Adiciona imagens
python publish_com_imagem.py  # Publica no Strapi
```

## Troubleshooting

### Erro "Input buffer contains unsupported image format"
- Certifique-se de usar upload binário, não multipart
- Verifique o Content-Type no header

### Erro 401 Unauthorized
- Verifique o strapi_API_TOKEN
- Token deve ter permissões de escrita

### Imagem não aparece no Strapi
- Verifique se o asset_id foi retornado
- Confirme que mainImage tem a estrutura correta

## Melhorias Futuras

1. Integração completa com CrewAI pipeline
2. Cache de imagens para evitar regeneração
3. Suporte a mais criptomoedas nos templates
4. Fallback automático quando DALL-E atinge limite