---
type: PostLayout
title: MCP na prática
date: '2025-04-20'
author: content/data/diegofornalha.json
excerpt: >-
  Facilisis dui. Nulla molestie risus in mi dapibus, eget porta lorem semper.
  Donec sed facilisis nibh.
featuredImage:
  type: ImageBlock
  url: https://images.ctfassets.net/dmu1essxro7q/7xLDNq2zEsCmAWJa76rt4X/3677df4fe1801a69be776b7754cd7793/Logo_after_quote_image.jpg
  altText: Thumbnail
  elementId: ''
  styles:
    self:
      padding:
        - pt-0
        - pl-0
        - pb-0
        - pr-0
bottomSections:
  - type: DividerSection
    title: Divider
    elementId: ''
    colors: bg-light-fg-dark
    styles:
      self:
        padding:
          - pt-3
          - pl-3
          - pb-3
          - pr-3
slug: mcp-na-pratica
isFeatured: false
isDraft: false
seo:
  type: Seo
  metaTitle: Transforme suas ideias em aplicativos de IA rapidamente. Experimente a Databutton.com.br – cadastre-se!
  metaDescription: Transforme suas ideias em aplicativos de IA rapidamente. Experimente a Databutton.com.br – cadastre-se!
  addTitleSuffix: false
  metaTags: []
colors: bg-light-fg-dark
styles:
  self:
    flexDirection: col
---
# Visão Geral do Meu Projeto: Playground

## Introdução

Olá! Eu sou Diego Fornalha, criador do [databutton.com.br](http://databutton.com.br). Criei o projeto "Playground" como meu ambiente de desenvolvimento e experimentação na plataforma Databutton. Ele é o meu espaço para testar ideias, integrar APIs e explorar as capacidades de desenvolvimento de aplicativos full-stack, especialmente com foco em IA, que a Databutton oferece.

## Tecnologias que Utilizo

*   **Frontend:** Construí a interface com React (v19.1.0) e TypeScript, aproveitando a biblioteca de componentes Shadcn UI e o Tailwind CSS para um estilo moderno.

*   **Backend:** Utilizo FastAPI (Python) para criar APIs robustas e eficientes.

*   **Comunicação:** A plataforma Databutton gera automaticamente um cliente TypeScript (`brain`), que uso para facilitar a comunicação segura e tipada entre o frontend e o backend.

*   **Infraestrutura:** Confio na Databutton para hospedar o app, gerenciar o armazenamento (`db.storage`), os segredos (`db.secrets`) e cuidar do deploy contínuo.

## Meus Princípios de Design

Para este projeto, busco uma interface de chat moderna e minimalista, seguindo estes princípios:

*   **Layout:** Priorizo layouts limpos, com separação clara entre os elementos.

*   **Formas:** Uso principalmente retângulos com bordas arredondadas para as bolhas de chat e botões, com divisores finos.

*   **Tipografia:** Escolhi uma fonte sem serifa moderna, que seja legível, com hierarquia clara e alto contraste.

*   **Cores:** Aplico gradientes sutis e cores de destaque consistentes, garantindo compatibilidade com os modos claro e escuro.

*   **Plataforma Preferida:** Meu foco inicial é a experiência no desktop.

*   **Tema Preferido:** Gosto mais do tema claro.

## Funcionalidades Atuais

No momento, meu backend expõe alguns endpoints essenciais:

*   `check_health`: Um endpoint básico para verificar se o servidor está respondendo.

*   Endpoints MCP (Model Context Protocol):

    *   `mcp_list_tools`: Para listar as ferramentas (meus endpoints) disponíveis para clientes MCP.

    *   `mcp_query`: Para permitir que clientes MCP executem consultas nas ferramentas disponíveis.

    *   `mcp_query_stream`: Uma versão de `mcp_query` que retorna os resultados em stream.

*(Pretendo expandir esta seção à medida que adiciono novas funcionalidades)*

## Desenvolvimento e Deploy

*   Desenvolvo este projeto usando o workspace interativo do Databutton.

*   A versão de produção pode ser acessada aqui: <https://agentesintegrados.databutton.app/playground>

## Status Atual

O projeto está ativo! Recentemente, trabalhei na atualização das dependências do backend/frontend e na documentação dos endpoints MCP padrão.

