# Blog Automação - The Crypto Frontier

Sistema de automação para monitoramento, tradução e publicação de artigos sobre criptomoedas para o blog The Crypto Frontier.

## Visão Geral

Este sistema automatiza todo o fluxo de trabalho para criação de conteúdo para um blog sobre criptomoedas, dividido em quatro etapas principais:

1. **Monitoramento**: Monitorar feeds RSS de sites especializados em criptomoedas
2. **Tradução**: Traduzir artigos relevantes de inglês para português usando Google Gemini
3. **Publicação**: Publicar os artigos traduzidos no Sanity CMS
4. **Indexação**: Indexar os artigos publicados no Algolia para permitir buscas

## Estrutura do Projeto

Este projeto segue a estrutura padrão do CrewAI:

```
blog_postagem_automatica/
├── .env                      # Arquivo de variáveis de ambiente (criar a partir do .env.example)
├── feeds.json                # Configuração dos feeds RSS a serem monitorados
├── pyproject.toml            # Configuração do projeto Python
├── posts_database.sqlite     # Banco de dados para controle de artigos processados
├── posts_traduzidos/         # Diretório onde os artigos traduzidos são salvos
├── posts_publicados/         # Diretório onde os artigos publicados são movidos
└── src/                      # Código-fonte principal
    └── blog_automacao/       # Pacote principal da aplicação
        ├── __init__.py       # Inicializador do pacote
        ├── main.py           # Script principal de execução
        ├── crew.py           # Definição das Crews (equipes de agentes)
        ├── tools/            # Ferramentas para os agentes
        │   ├── __init__.py
        │   ├── rss_tools.py  # Ferramentas para monitoramento de RSS
        │   └── sanity_tools.py # Ferramentas para publicação no Sanity CMS
        └── config/           # Arquivos de configuração
            ├── agents.yaml   # Definição dos agentes e seus papéis
            └── tasks.yaml    # Definição das tarefas dos agentes
```

## Requisitos

- Python 3.8+
- Node.js 18+
- Dependências Python: `pip install -r requirements.txt`
- Dependências Node.js: `npm install`
- Arquivo `.env` com credenciais do Sanity CMS e Algolia

## Configuração

1. Clone o repositório
2. Instale as dependências
3. Configure o arquivo `.env` com suas credenciais (ver `.env.example`)
4. Configure os feeds RSS em `feeds.json`

## Uso

### Método 1: Script de Fluxo Completo

Para simplificar a execução, use o script `executar_fluxo_completo.sh`:

```bash
# Executar o fluxo completo (uma vez)
./executar_fluxo_completo.sh

# Ou apenas o monitoramento
./executar_fluxo_completo.sh --monitor

# Monitoramento contínuo a cada 60 minutos
./executar_fluxo_completo.sh --monitor --loop 60

# Apenas tradução dos artigos pendentes
./executar_fluxo_completo.sh --translate

# Apenas publicação dos artigos traduzidos
./executar_fluxo_completo.sh --publish

# Apenas indexação no Algolia
./executar_fluxo_completo.sh --index

# Exibir ajuda
./executar_fluxo_completo.sh --help
```

### Método 2: Execução Manual

Alternativamente, você pode executar cada etapa manualmente:

```bash
# Monitoramento (um ciclo)
python main.py

# Monitoramento contínuo (a cada 60 minutos)
python main.py --loop 60

# Tradução de artigos
python main.py --traducao

# Publicação no Sanity
node publicar_posts_markdown.js

# Indexação no Algolia
node scripts/indexar-sanity-para-algolia.js
```

### Interface Web (Streamlit)

Também está disponível uma interface web para controle do sistema:

```bash
streamlit run app.py
```

## Estrutura de Diretórios

- `posts_para_traduzir/`: Artigos baixados que aguardam tradução
- `posts_traduzidos/`: Artigos traduzidos que aguardam publicação
- `posts_publicados/`: Artigos que já foram publicados no Sanity
- `scripts/`: Scripts auxiliares para publicação e indexação
- `src/`: Código-fonte principal do sistema
- `app.py`: Interface web Streamlit

## Correções e Melhorias Recentes

1. **Correção do formato Portable Text**: Os artigos agora são convertidos para o formato Portable Text correto para o Sanity, evitando o erro "Invalid property value" no Sanity Studio.

2. **Correção da referência de autor**: Agora é usada a referência correta para o autor Alexandre Bianchi.

3. **Melhoria na tradução de títulos**: O título é traduzido separadamente para garantir qualidade na tradução.

4. **Script de automação completa**: Novo script `executar_fluxo_completo.sh` para facilitar a execução de todo o fluxo.

5. **Tratamento de erros robusto**: Melhor tratamento de erros em todas as etapas do processo.

## Observações Importantes

1. NUNCA defina `PUBLISH_DIRECTLY = True` em `main.py`, pois quebraria o fluxo de trabalho separado.
2. Sempre verifique se os diretórios necessários existem.
3. Mantenha as credenciais no arquivo `.env` atualizadas.
4. Para republicar um artigo, mova-o de volta para a pasta `posts_traduzidos/`.

## Arquivos de Configuração Importantes

- `.env`: Credenciais do Sanity e Algolia
- `feeds.json`: Lista de feeds RSS para monitoramento
- `src/blog_automacao/config/settings.py`: Configurações gerais do sistema

## Solução de Problemas

Se você encontrar o erro "Invalid property value" no Sanity Studio:
- Verifique se o conteúdo está sendo convertido para o formato correto (array de blocos)
- Execute novamente o script de publicação para aplicar a correção

Para outros problemas, consulte os logs na interface web ou execute os comandos com a flag `--verbose`.

## Licença

MIT 

## Configuração do Sistema

O sistema agora permite configurações ajustáveis de duas formas:

### 1. Configuração Editável no Sanity Studio (Recomendado)

A partir da versão mais recente, as configurações principais podem ser editadas diretamente no Sanity Studio:

1. Acesse o Sanity Studio em [https://thecryptofrontier.sanity.studio](https://thecryptofrontier.sanity.studio)
2. Navegue até "Configurações do Blog" no menu lateral
3. Edite a configuração existente ou crie uma nova
4. Defina o autor padrão, frequência de monitoramento e outras opções

Para verificar se as configurações estão corretas, execute:
```bash
node utils/configuracao-sanity.js
# Ou para criar uma configuração padrão se não existir:
node utils/configuracao-sanity.js --criar

# Para verificar se o sistema está reconhecendo as configurações:
node publicar_posts_markdown.js --verify
```

### 2. Configuração Local (Fallback)

Caso o Sanity não esteja acessível, o sistema usa a configuração local em `utils/config.js`:

```bash
cd blog_postagem_automatica
node utils/mostrar-config.js
```

### Configuração do Autor Padrão

A partir da versão atual, o sistema permite configurar qual autor será usado por padrão para todas as publicações. Esta configuração pode ser feita de duas formas:

#### Opção 1: No Sanity Studio (Recomendado)

1. Acesse o Sanity Studio em [https://thecryptofrontier.sanity.studio](https://thecryptofrontier.sanity.studio)
2. Navegue até "Configurações do Blog" no menu lateral
3. Clique no campo "Autor Padrão" e selecione o autor desejado
4. Salve a configuração

#### Opção 2: No arquivo local de configuração

Como método alternativo, você pode editar o arquivo `utils/config.js`:

```javascript
// Configuração do autor padrão
autor: {
  id: 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c', // ID do Alexandre Bianchi
  nome: 'Alexandre Bianchi'
}
```

### Autores disponíveis no sistema

- **Alexandre Bianchi** (ID: ca38a3d5-cba1-47a0-aa29-4af17a15e17c)
- **The Crypto Frontier** (ID: 8pYdfL3aL47Vbm89ptixRC)

Se desejar adicionar novos autores, use o Studio do Sanity ou o script apropriado.

### Alterando o Autor Padrão

Existem duas formas de alterar o autor padrão:

#### 1. Usando o script automatizado (recomendado)

```bash
cd blog_postagem_automatica
node utils/alterar-autor.js <ID_DO_AUTOR> "<NOME_DO_AUTOR>"

# Exemplos:
node utils/alterar-autor.js ca38a3d5-cba1-47a0-aa29-4af17a15e17c "Alexandre Bianchi"
node utils/alterar-autor.js 8pYdfL3aL47Vbm89ptixRC "The Crypto Frontier"
```

#### 2. Editando manualmente o arquivo de configuração

Edite o arquivo `utils/config.js` modificando:
- `id`: O ID do autor no Sanity CMS
- `nome`: O nome do autor (usado para exibição e como fallback caso o ID não seja encontrado)

```javascript
// Configuração do autor padrão
autor: {
  id: 'ca38a3d5-cba1-47a0-aa29-4af17a15e17c', // ID do Alexandre Bianchi
  nome: 'Alexandre Bianchi'
}
``` 

## Deploy das Configurações

Para aplicar as configurações no ambiente de produção, existem duas opções:

### Opção 1: Deploy Completo (inclui Sanity Studio)

Este script faz o deploy do Sanity Studio e configura o autor padrão:

```bash
# No diretório raiz do projeto
./deploy-configuracao.sh
```

Este script realiza as seguintes operações:

1. **Deploy do Sanity Studio**: Garante que o novo schema esteja disponível no Studio online
2. **Verificação da configuração**: Verifica se existe uma configuração no Sanity e cria se necessário
3. **Verificação do autor padrão**: Confirma se o sistema está usando o autor configurado no Sanity

### Opção 2: Aplicação Rápida de Configurações (sem deploy do Studio)

Se apenas quiser aplicar as configurações sem fazer deploy do Sanity Studio:

```bash
./aplicar-configuracao.sh
```

Este script simplificado apenas:
1. Verifica se existe uma configuração no Sanity
2. Cria a configuração se necessário
3. Confirma se o sistema está usando o autor configurado

Depois de executar qualquer um dos scripts, você pode editar as configurações diretamente no Sanity Studio:
- Acesse o Studio em https://thecryptofrontier.sanity.studio
- Navegue até "Configurações do Blog" no menu lateral
- Faça suas alterações e salve

As alterações nas configurações são refletidas imediatamente no sistema de publicação. 