# The Crypto Frontier - Frontend

Este é o frontend do site The Crypto Frontier, construído com Next.js 14 e TypeScript.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui
- **CMS**: Strapi v4
- **Busca**: Algolia
- **Testes**: Jest + React Testing Library
- **Storybook**: Para documentação de componentes

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Desenvolvimento com mais memória (recomendado)
npm run dev:fast

# Desenvolvimento com Turbopack
npm run dev:turbo
```

### Build e Produção
```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm run start
```

### Testes
```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Storybook
```bash
# Iniciar Storybook
npm run storybook

# Build do Storybook
npm run build-storybook
```

### Utilitários
```bash
# Indexar conteúdo para busca
npm run index-content

# Migrar conteúdo para Strapi
npm run migrate-to-strapi

# Gerar tipos do Strapi
npm run generate-types
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Rotas e páginas (App Router)
│   ├── api/               # API routes
│   ├── blog/              # Página de blog
│   ├── post/              # Páginas de posts individuais
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── atoms/            # Componentes atômicos
│   ├── blocks/           # Blocos de conteúdo
│   ├── sections/         # Seções da página
│   └── ui/               # Componentes UI (Shadcn)
├── lib/                   # Utilitários e configurações
├── hooks/                 # Custom React hooks
├── utils/                 # Funções utilitárias
├── types/                 # Definições TypeScript
└── css/                   # Estilos globais
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# Strapi
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=seu_token_aqui

# Algolia (opcional)
NEXT_PUBLIC_ALGOLIA_APP_ID=seu_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=sua_chave_de_busca
ALGOLIA_ADMIN_KEY=sua_chave_admin

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=seu_ga_id
NEXT_PUBLIC_GTM_ID=seu_gtm_id
```

## 🧪 Testes

O projeto utiliza Jest e React Testing Library para testes:

```bash
# Executar todos os testes
npm test

# Testes específicos
npm test Button.test.tsx

# Testes de acessibilidade
npm run test:a11y
```

## 📚 Documentação

- **Storybook**: Documentação interativa dos componentes
- **TypeScript**: Tipos gerados automaticamente do Strapi
- **Docs**: Documentação adicional em `/src/docs`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 🚀 Deploy

O projeto está configurado para deploy no Netlify. Veja `netlify.toml` para configurações específicas.

### Deploy Manual
```bash
# Build para produção
npm run build

# Verificar build localmente
npm run start
```

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do site principal.

---

**The Crypto Frontier** - Seu portal para o mundo das criptomoedas 🚀