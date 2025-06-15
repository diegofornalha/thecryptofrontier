# Integração DALL-E no Blog Crew

## Visão Geral

A integração do DALL-E 3 foi implementada para gerar automaticamente imagens profissionais para cada artigo do blog, seguindo uma identidade visual padronizada.

## Fluxo de Trabalho Atualizado

1. **RSS Monitor** → Busca artigos
2. **Translator** → Traduz para PT-BR
3. **Formatter** → Formata para Strapi
4. **Image Generator** → Gera imagem com DALL-E e faz upload *(NOVO)*
5. **Publisher** → Publica no Strapi CMS

## Componentes Implementados

### 1. Novo Agente: ImageGeneratorAgent
- **Arquivo**: `agents/image_generator_agent.py`
- **Função**: Gera imagens relevantes usando DALL-E 3
- **Características**:
  - Detecta criptomoedas automaticamente
  - Aplica identidade visual consistente
  - Gera alt text para SEO

### 2. Ferramentas de Imagem
- **Arquivo**: `tools/image_generation_tools.py`
- **Ferramentas**:
  - `generate_crypto_image`: Gera imagem com DALL-E
  - `upload_image_to_strapi`: Faz upload para Strapi
  - `generate_and_upload_image`: Combina geração e upload

### 3. Configurações
- **Arquivo**: `config/settings.yaml`
- **Novas configs**:
  ```yaml
  directories:
    posts_com_imagem: "posts_com_imagem"
    posts_imagens: "posts_imagens"
  
  image_generation:
    enabled: true
    model: "dall-e-3"
    size: "1792x1024"
    quality: "hd"
  ```

## Identidade Visual

### Padrão Visual Implementado
- **Fundo**: Preto (#000000) com grid azul sutil
- **Logo**: 3D volumétrico centralizado
- **Efeitos**: Ondas de energia cyan radiantes
- **Iluminação**: Rim light azul (#003366)
- **Resolução**: 1792x1024 (16:9)

### Criptomoedas Suportadas
Bitcoin, Ethereum, XRP, BNB, Dogecoin, Solana, Chainlink, Shiba Inu, Sui, USDT, Tron, Pepe, Kraken, Airdrop, MasterCard

## Uso

### Variáveis de Ambiente Necessárias
```bash
OPENAI_API_KEY=sua_chave_openai
STRAPI_PROJECT_ID=seu_projeto
strapi_API_TOKEN=seu_token
strapi_DATASET=production
```

### Executar o Pipeline
```bash
python main.py
# ou
python -m crewai run
```

## Estrutura de Dados

### Campo mainImage Adicionado
```json
{
  "mainImage": {
    "_type": "image",
    "asset": {
      "_type": "reference",
      "_ref": "image-asset-id"
    },
    "alt": "Logo 3D de Bitcoin",
    "caption": "Imagem gerada automaticamente - Logo 3D de Bitcoin",
    "attribution": "Gerado por DALL-E 3"
  }
}
```

## Próximos Passos

1. Testar o fluxo completo com artigos reais
2. Ajustar prompts se necessário
3. Monitorar uso da API OpenAI
4. Remover projeto dalle-image-generation após validação