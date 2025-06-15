# 🚀 NextJS Specialist Agent - Documentação Completa

## 📋 Visão Geral

O **NextJS Specialist Agent** é um agente especializado em arquitetura, otimização e melhores práticas do Next.js. Ele fornece análises detalhadas, recomendações e suporte para projetos Next.js, incluindo as versões mais recentes com App Router.

### 🎯 Capacidades Principais

- **Análise de Configuração Next.js**
- **Expertise em App Router e Pages Router**
- **Otimização de Performance**
- **Implementação SSR/SSG/ISR**
- **Design de API Routes**
- **Configuração de Middleware**
- **Otimização de Imagens**
- **Estratégias de Deploy**
- **Features do Next.js 13+**
- **React Server Components**

## 🛠️ Como Usar

### Execução Direta

```bash
# Análise geral do projeto
npx tsx /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents/nextjs-specialist-agent.ts

# Análise específica
npx tsx /home/strapi/thecryptofrontier/claude-flow-diego/claude-diego-flow/src/agents/nextjs-specialist-agent.ts "performance"
```

### Comandos Disponíveis

```bash
# Análise de performance
npx tsx [...]/nextjs-specialist-agent.ts "analyze performance"

# Análise de rotas
npx tsx [...]/nextjs-specialist-agent.ts "check routing"

# Análise de deploy
npx tsx [...]/nextjs-specialist-agent.ts "deployment"

# Análise de configuração
npx tsx [...]/nextjs-specialist-agent.ts "config"

# Análise de estratégias de renderização
npx tsx [...]/nextjs-specialist-agent.ts "rendering"
```

## 📊 Tipos de Análise

### 1. Análise de Performance 🚀

O agente verifica:
- ✅ Configurações de otimização (swcMinify, reactStrictMode)
- ✅ Uso do componente next/image
- ✅ Code splitting com dynamic imports
- ✅ Bundle analyzer disponível
- ✅ Configuração de cache

**Recomendações fornecidas:**
- Habilitação de SWC Minification
- Otimização de imagens
- Implementação de code splitting
- Configuração de caching
- Monitoramento de Core Web Vitals

### 2. Análise de Rotas 🗺️

Detecta e analisa:
- ✅ App Router (Next.js 13+)
- ✅ Pages Router tradicional
- ✅ API Routes em ambos os sistemas
- ✅ Layouts e estrutura de pastas
- ✅ Arquivos especiais (_app, _document)

### 3. Análise de Deploy 🚢

Verifica:
- ✅ Scripts de build e start
- ✅ Configuração de output (standalone, export)
- ✅ Variáveis de ambiente
- ✅ Setup do Docker
- ✅ Preparação para produção

**Checklist de deploy incluído:**
- Environment variables
- Otimizações de build
- Error tracking
- Analytics
- Security headers
- SEO (robots.txt, sitemap)
- Rate limiting
- Monitoramento

### 4. Análise de Configuração ⚙️

Examina `next.config.js`:
- ✅ Otimizações habilitadas
- ✅ Configuração de imagens
- ✅ Compiler options
- ✅ Security headers
- ✅ Modo de output

Se não houver configuração, fornece um exemplo otimizado.

### 5. Análise de Renderização 🎨

Identifica estratégias usadas:
- ✅ SSR (getServerSideProps)
- ✅ SSG (getStaticProps)
- ✅ ISR (revalidate)
- ✅ React Server Components

**Best practices para cada estratégia:**
- Quando usar cada método
- Otimizações específicas
- Configuração de cache
- Streaming e performance

## 🔧 Integração com MCP

O agente usa MCP Diego Tools para:
- Análise avançada de arquivos
- Geração de screenshots
- Integração com GitHub
- Persistência de análises

## 📁 Estrutura do Projeto Analisada

```
/home/strapi/thecryptofrontier/
├── src/
│   ├── app/          # App Router
│   ├── pages/        # Pages Router
│   ├── components/   # Componentes React
│   ├── styles/       # Estilos
│   ├── lib/          # Utilitários
│   └── hooks/        # Custom hooks
├── public/           # Assets estáticos
├── next.config.js    # Configuração
└── package.json      # Dependências
```

## 🚀 Features Avançadas

### Detecção Automática
- Versão do Next.js em uso
- Sistema de rotas (App/Pages)
- Otimizações habilitadas
- Pacotes relacionados instalados

### Recomendações Inteligentes
- Baseadas no estado atual do projeto
- Priorização por impacto
- Exemplos de código
- Links para documentação

### Análise de Bundle
- Tamanho do bundle
- Code splitting
- Dynamic imports
- Tree shaking

## 📋 Exemplo de Output

```markdown
# 🚀 Next.js Performance Analysis

## Configuration Analysis
✅ SWC minification enabled
✅ React Strict Mode enabled
✅ Image optimization configured

## Image Optimization
✅ Using next/image component (15 instances)
⚠️ Found 3 regular <img> tags. Consider migrating to next/image

## Bundle Optimization
✅ Using dynamic imports for code splitting (8 instances)
✅ Bundle analyzer available

## 📋 Recommendations
1. Enable SWC Minification: Add `swcMinify: true` to next.config.js
2. Optimize Images: Use next/image component for all images
...
```

## 🔗 Recursos Úteis

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Deployment](https://nextjs.org/docs/deployment)

### Guias de Otimização
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)
- [Script Optimization](https://nextjs.org/docs/basic-features/script)

### Performance
- [Measuring Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

## 🤝 Integração com Outros Agentes

O NextJS Specialist trabalha bem com:
- **Docker Specialist**: Para containerização de apps Next.js
- **Strapi Specialist**: Para integração com headless CMS
- **Guardian Orchestrator**: Para análises completas do projeto

## 🔒 Considerações de Segurança

O agente verifica:
- Security headers configurados
- Variáveis de ambiente protegidas
- Práticas seguras de API
- Configuração CORS apropriada

## 🐛 Troubleshooting

### Problemas Comuns

1. **MCP não conecta**
   - Continue sem MCP, funcionalidades básicas disponíveis

2. **Análise incompleta**
   - Verifique permissões de leitura
   - Confirme estrutura do projeto

3. **Performance lenta**
   - Use análises específicas ao invés de geral
   - Limite escopo da análise

## 📈 Roadmap

- [ ] Suporte para Turbopack
- [ ] Análise de testes
- [ ] Integração com Lighthouse
- [ ] Sugestões de migração App Router
- [ ] Análise de acessibilidade

---

**Última atualização**: 15/06/2025  
**Versão**: 1.0.0  
**Localização**: `/claude-flow-diego/claude-diego-flow/src/agents/nextjs-specialist-agent.ts`