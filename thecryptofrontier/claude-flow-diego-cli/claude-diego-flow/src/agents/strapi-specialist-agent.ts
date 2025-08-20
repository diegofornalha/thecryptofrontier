#!/usr/bin/env npx tsx

import { MemoryEnhancedAgent } from '../core/memory-enhanced-agent';
import { Message, ToolCall } from '../types';
import { MCPClient } from '../mcp/mcp-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Strapi Specialist Agent
 * 
 * Especialista em Strapi CMS com conhecimento profundo sobre:
 * - Configuração e administração do Strapi
 * - Content-Types e estruturação de dados
 * - APIs REST e GraphQL
 * - Plugins e customizações
 * - Segurança e permissões (RBAC)
 * - Internacionalização (i18n)
 * - Deploy e otimização
 * 
 * Baseado na documentação oficial: https://docs.strapi.io
 */
export class StrapiSpecialistAgent extends MemoryEnhancedAgent {
    private mcpClient: MCPClient;
    private projectRoot: string;
    private strapiPath: string;
    private strapiDocsPath: string;
    private knowledgeBase: StrapiKnowledge;

    constructor() {
        super({
            id: 'strapi-specialist',
            name: 'Strapi Specialist',
            description: 'Especialista em Strapi CMS para desenvolvimento de APIs e gestão de conteúdo',
            capabilities: [
                'content-type-design',
                'api-development',
                'plugin-development',
                'rbac-configuration',
                'database-optimization',
                'deployment-setup',
                'performance-tuning',
                'security-hardening',
                'migration-assistance',
                'troubleshooting'
            ],
            memory: {
                userId: 'strapi-specialist',
                category: 'strapi-knowledge',
                autoSave: true,
                retentionDays: 180
            }
        });

        this.projectRoot = '/home/strapi/thecryptofrontier';
        this.strapiPath = path.join(this.projectRoot, 'strapi');
        this.strapiDocsPath = path.join(this.projectRoot, 'claude-flow-diego/claude-diego-flow/docs/specialists/strapi');
        this.mcpClient = new MCPClient({
            name: 'strapi-mcp',
            version: '1.0.0'
        });

        // Base de conhecimento do Strapi
        this.knowledgeBase = {
            coreConcepts: {
                contentTypes: {
                    definition: "Estruturas de dados customizáveis que definem o modelo de conteúdo",
                    types: ['collection', 'single'],
                    fields: ['text', 'number', 'boolean', 'date', 'media', 'relation', 'component', 'dynamiczone'],
                    bestPractices: [
                        'Use nomes descritivos e no singular para content-types',
                        'Aproveite componentes para estruturas reutilizáveis',
                        'Configure validações apropriadas nos campos',
                        'Use relações para conectar dados relacionados'
                    ]
                },
                api: {
                    types: ['REST', 'GraphQL'],
                    endpoints: {
                        rest: {
                            find: 'GET /api/:pluralName',
                            findOne: 'GET /api/:pluralName/:id',
                            create: 'POST /api/:pluralName',
                            update: 'PUT /api/:pluralName/:id',
                            delete: 'DELETE /api/:pluralName/:id'
                        }
                    },
                    features: ['filtering', 'sorting', 'pagination', 'population']
                },
                plugins: {
                    core: ['i18n', 'users-permissions', 'email', 'upload'],
                    community: ['comments', 'seo', 'sitemap', 'import-export'],
                    development: 'Crie plugins customizados em src/plugins/'
                },
                security: {
                    rbac: 'Role-Based Access Control para gerenciar permissões',
                    policies: 'Políticas customizadas para controle fino de acesso',
                    middleware: 'Middleware para processamento de requisições',
                    bestPractices: [
                        'Configure CORS apropriadamente',
                        'Use variáveis de ambiente para dados sensíveis',
                        'Implemente rate limiting',
                        'Habilite autenticação JWT'
                    ]
                }
            },
            commonTasks: {
                contentType: 'Criar e gerenciar modelos de dados',
                api: 'Desenvolver endpoints REST/GraphQL',
                auth: 'Configurar autenticação e autorização',
                deploy: 'Deploy em produção',
                optimize: 'Otimizar performance',
                migrate: 'Migrar dados entre ambientes'
            }
        };
    }

    async initialize(): Promise<void> {
        console.log('🚀 Strapi Specialist initializing...');
        console.log(`💾 Memory host: ${this.memoryHost}`);
        console.log(`🔖 Memory user: ${this.memoryUserId}`);
        
        try {
            // Conectar ao MCP se disponível
            await this.mcpClient.connect();
            console.log('✅ MCP connection established');
        } catch (error) {
            console.log('⚠️ MCP not available, running in standalone mode');
        }

        // Carregar configuração do projeto Strapi
        await this.loadStrapiConfig();
        
        // Aprender sobre o ambiente atual
        await this.learnAboutEnvironment();
        
        console.log('🚀 Strapi Specialist ready!');
    }

    async processMessage(message: Message): Promise<Message> {
        console.log(`\n🚀 Strapi Specialist processing: ${message.content}`);
        
        // Buscar memórias relevantes antes de processar
        const relevantMemories = await this.searchMemories(message.content, 5);
        if (relevantMemories.length > 0) {
            console.log(`📚 Encontradas ${relevantMemories.length} memórias relevantes`);
        }
        
        const analysis = await this.analyzeRequest(message.content);
        let response = '';

        switch (analysis.type) {
            case 'content-type':
                response = await this.handleContentType(analysis);
                break;
            case 'api':
                response = await this.handleAPI(analysis);
                break;
            case 'plugin':
                response = await this.handlePlugin(analysis);
                break;
            case 'security':
                response = await this.handleSecurity(analysis);
                break;
            case 'deployment':
                response = await this.handleDeployment(analysis);
                break;
            case 'troubleshooting':
                response = await this.troubleshootStrapi(analysis);
                break;
            case 'optimization':
                response = await this.optimizeStrapi(analysis);
                break;
            default:
                response = await this.provideGeneralGuidance(analysis);
        }

        // Salvar aprendizado na memória se autoSave estiver ativado
        if (this.autoSave && response) {
            const learningContent = `Pergunta: ${message.content}\nResposta: ${response.substring(0, 500)}...\nTipo: ${analysis.type}`;
            await this.saveMemory(
                learningContent,
                [analysis.type, 'strapi', 'conhecimento'],
                {
                    requestType: analysis.type,
                    keywords: analysis.keywords,
                    hasCode: response.includes('```'),
                    responseLength: response.length
                }
            );
        }

        return {
            role: 'assistant',
            content: response,
            metadata: {
                agent: this.config.id,
                timestamp: new Date().toISOString(),
                analysisType: analysis.type
            }
        };
    }

    private async analyzeRequest(request: string): Promise<StrapiAnalysis> {
        const lowerRequest = request.toLowerCase();
        
        let type: StrapiAnalysisType = 'general';
        const keywords: string[] = [];
        
        // Determinar tipo de análise
        if (lowerRequest.includes('content-type') || lowerRequest.includes('modelo') || 
            lowerRequest.includes('collection') || lowerRequest.includes('single')) {
            type = 'content-type';
            keywords.push('content-type-design');
        } else if (lowerRequest.includes('api') || lowerRequest.includes('endpoint') || 
                   lowerRequest.includes('rest') || lowerRequest.includes('graphql')) {
            type = 'api';
            keywords.push('api-development');
        } else if (lowerRequest.includes('plugin') || lowerRequest.includes('extensão')) {
            type = 'plugin';
            keywords.push('plugin-development');
        } else if (lowerRequest.includes('segurança') || lowerRequest.includes('security') ||
                   lowerRequest.includes('rbac') || lowerRequest.includes('permissão')) {
            type = 'security';
            keywords.push('security-configuration');
        } else if (lowerRequest.includes('deploy') || lowerRequest.includes('produção')) {
            type = 'deployment';
            keywords.push('deployment');
        } else if (lowerRequest.includes('erro') || lowerRequest.includes('problema')) {
            type = 'troubleshooting';
            keywords.push('debugging');
        } else if (lowerRequest.includes('otimizar') || lowerRequest.includes('performance')) {
            type = 'optimization';
            keywords.push('performance');
        }

        return {
            request,
            type,
            keywords,
            context: await this.gatherStrapiContext()
        };
    }

    private async handleContentType(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 📊 Content-Type no Strapi\n\n';
        
        // Verificar se existe configuração no projeto
        const hasExistingTypes = await this.checkExistingContentTypes();
        
        response += '## 🏗️ Estrutura de Content-Type\n\n';
        response += '```javascript\n';
        response += `// src/api/[nome-do-tipo]/content-types/[nome-do-tipo]/schema.json
{
  "kind": "collectionType", // ou "singleType"
  "collectionName": "items",
  "info": {
    "singularName": "item",
    "pluralName": "items",
    "displayName": "Item",
    "description": "Descrição do content-type"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "description": {
      "type": "text"
    },
    "price": {
      "type": "decimal",
      "min": 0
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category"
    },
    "images": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    }
  }
}
\`\`\`\n\n`;

        response += '## 🎯 Melhores Práticas\n\n';
        for (const practice of this.knowledgeBase.coreConcepts.contentTypes.bestPractices) {
            response += `- ${practice}\n`;
        }

        response += '\n## 🔧 Tipos de Campos Disponíveis\n';
        response += '- **Text**: string, text, richtext, email\n';
        response += '- **Number**: integer, biginteger, decimal, float\n';
        response += '- **Date**: date, time, datetime\n';
        response += '- **Boolean**: boolean\n';
        response += '- **Relations**: oneToOne, oneToMany, manyToOne, manyToMany\n';
        response += '- **Media**: Arquivos e imagens\n';
        response += '- **Component**: Estruturas reutilizáveis\n';
        response += '- **Dynamic Zone**: Área flexível com múltiplos componentes\n';

        if (hasExistingTypes) {
            response += '\n## 📁 Content-Types Existentes\n';
            response += await this.listExistingContentTypes();
        }

        return response;
    }

    private async handleAPI(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 🚀 APIs no Strapi\n\n';
        
        response += '## 📡 REST API\n\n';
        response += '### Endpoints Padrão\n';
        response += '```bash\n';
        for (const [action, endpoint] of Object.entries(this.knowledgeBase.coreConcepts.api.endpoints.rest)) {
            response += `# ${action}\n${endpoint}\n\n`;
        }
        response += '\`\`\`\n\n';

        response += '### Exemplos de Uso\n';
        response += '```javascript\n';
        response += `// Buscar todos os items
const response = await fetch('http://localhost:1337/api/items');
const data = await response.json();

// Buscar com filtros e população
const filtered = await fetch(
  'http://localhost:1337/api/items?' +
  'filters[title][$contains]=example&' +
  'populate=category,images'
);

// Criar novo item
const create = await fetch('http://localhost:1337/api/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    data: {
      title: 'Novo Item',
      description: 'Descrição'
    }
  })
});
\`\`\`\n\n`;

        response += '## 📊 GraphQL API\n\n';
        response += '### Instalação\n';
        response += '```bash\n';
        response += 'npm install @strapi/plugin-graphql\n';
        response += '\`\`\`\n\n';

        response += '### Queries de Exemplo\n';
        response += '```graphql\n';
        response += `# Buscar items
query {
  items {
    data {
      id
      attributes {
        title
        description
        category {
          data {
            attributes {
              name
            }
          }
        }
      }
    }
  }
}

# Mutation
mutation {
  createItem(data: {
    title: "Novo Item"
    description: "Descrição"
  }) {
    data {
      id
      attributes {
        title
      }
    }
  }
}
\`\`\`\n\n`;

        response += '## 🔐 Autenticação\n';
        response += '```javascript\n';
        response += `// Login
const auth = await fetch('http://localhost:1337/api/auth/local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'user@example.com',
    password: 'password'
  })
});
const { jwt } = await auth.json();

// Usar token nas requisições
headers: {
  'Authorization': \`Bearer \${jwt}\`
}
\`\`\`\n`;

        return response;
    }

    private async handlePlugin(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 🔌 Desenvolvimento de Plugins no Strapi\n\n';
        
        response += '## 🎯 Estrutura de um Plugin\n\n';
        response += '```bash\n';
        response += `src/plugins/meu-plugin/
├── admin/           # Código do painel admin
│   └── src/
│       ├── index.js
│       ├── components/
│       └── pages/
├── server/          # Código do servidor
│   ├── bootstrap.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── services/
├── package.json
└── strapi-admin.js
\`\`\`\n\n`;

        response += '## 🚀 Criar Novo Plugin\n';
        response += '```bash\n';
        response += 'npm run strapi generate plugin meu-plugin\n';
        response += '\`\`\`\n\n';

        response += '## 📝 Exemplo de Plugin\n';
        response += '```javascript\n';
        response += `// server/controllers/my-controller.js
module.exports = {
  async index(ctx) {
    const data = await strapi
      .plugin('meu-plugin')
      .service('myService')
      .getWelcomeMessage();
    
    ctx.send({ data });
  }
};

// server/services/my-service.js
module.exports = {
  getWelcomeMessage() {
    return 'Welcome from my plugin!';
  }
};

// server/routes/index.js
module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: 'myController.index',
    config: {
      policies: [],
      auth: false
    }
  }
];
\`\`\`\n\n`;

        response += '## 🎨 Interface Admin\n';
        response += '```javascript\n';
        response += `// admin/src/pages/HomePage/index.js
import React from 'react';
import { Box, Typography } from '@strapi/design-system';

const HomePage = () => {
  return (
    <Box padding={8}>
      <Typography variant="alpha">
        Meu Plugin
      </Typography>
    </Box>
  );
};

export default HomePage;
\`\`\`\n\n`;

        response += '## 🔧 Plugins Populares\n';
        response += '- **@strapi/plugin-i18n**: Internacionalização\n';
        response += '- **@strapi/plugin-graphql**: API GraphQL\n';
        response += '- **@strapi/plugin-documentation**: Documentação da API\n';
        response += '- **strapi-plugin-import-export-entries**: Import/Export de dados\n';
        response += '- **strapi-plugin-seo**: Otimizações SEO\n';

        return response;
    }

    private async handleSecurity(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 🔒 Segurança no Strapi\n\n';
        
        response += '## 🛡️ RBAC (Role-Based Access Control)\n\n';
        response += '### Configurar Roles\n';
        response += '```javascript\n';
        response += `// Criar role customizado
await strapi.admin.services.role.create({
  name: 'Editor',
  description: 'Pode editar conteúdo',
  permissions: [
    {
      action: 'plugin::content-manager.explorer.read',
      subject: 'api::article.article'
    },
    {
      action: 'plugin::content-manager.explorer.update',
      subject: 'api::article.article'
    }
  ]
});
\`\`\`\n\n`;

        response += '## 🔐 Políticas Customizadas\n';
        response += '```javascript\n';
        response += `// src/api/article/policies/is-owner.js
module.exports = async (ctx, config, { strapi }) => {
  const { user } = ctx.state;
  const { id } = ctx.params;
  
  const article = await strapi.entityService.findOne(
    'api::article.article',
    id,
    { populate: ['author'] }
  );
  
  if (!article) {
    return false;
  }
  
  return article.author.id === user.id;
};

// Aplicar na rota
{
  method: 'PUT',
  path: '/articles/:id',
  handler: 'article.update',
  config: {
    policies: ['is-owner']
  }
}
\`\`\`\n\n`;

        response += '## 🚪 Middleware de Segurança\n';
        response += '```javascript\n';
        response += `// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
\`\`\`\n\n`;

        response += '## ⚡ Rate Limiting\n';
        response += '```javascript\n';
        response += `// Instalar koa-ratelimit
npm install koa-ratelimit

// config/middlewares.js
const rateLimit = require('koa-ratelimit');

module.exports = [
  // ... outros middlewares
  {
    resolve: './src/middlewares/rateLimit',
    config: {
      interval: { min: 1 },
      max: 100
    }
  }
];
\`\`\`\n\n`;

        response += '## 🔑 Melhores Práticas de Segurança\n';
        for (const practice of this.knowledgeBase.coreConcepts.security.bestPractices) {
            response += `- ${practice}\n`;
        }

        return response;
    }

    private async handleDeployment(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 🚀 Deploy do Strapi\n\n';
        
        response += '## 🐳 Deploy com Docker\n';
        response += '```dockerfile\n';
        response += `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV production

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]
\`\`\`\n\n`;

        response += '## 📝 docker-compose.yml\n';
        response += '```yaml\n';
        response += `version: '3.8'

services:
  strapi:
    build: .
    ports:
      - "1337:1337"
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: strapi
      JWT_SECRET: \${JWT_SECRET}
      ADMIN_JWT_SECRET: \${ADMIN_JWT_SECRET}
      APP_KEYS: \${APP_KEYS}
      API_TOKEN_SALT: \${API_TOKEN_SALT}
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`\n\n`;

        response += '## ☁️ Deploy em Plataformas\n\n';
        response += '### Heroku\n';
        response += '```bash\n';
        response += `# Instalar CLI do Heroku
heroku create meu-strapi-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main
\`\`\`\n\n`;

        response += '### AWS/DigitalOcean\n';
        response += '- Use PM2 para gerenciamento de processo\n';
        response += '- Configure Nginx como proxy reverso\n';
        response += '- Use S3/Spaces para uploads\n\n';

        response += '## 🔧 Configurações de Produção\n';
        response += '```javascript\n';
        response += `// config/env/production/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

// config/env/production/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
\`\`\`\n`;

        return response;
    }

    private async troubleshootStrapi(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 🔧 Troubleshooting Strapi\n\n';
        
        response += '## 🐛 Problemas Comuns\n\n';
        
        response += '### 1. Erro de Conexão com Banco de Dados\n';
        response += '**Sintomas**: "Error: connect ECONNREFUSED"\n';
        response += '**Soluções**:\n';
        response += '- Verificar se o banco está rodando\n';
        response += '- Conferir credenciais no .env\n';
        response += '- Verificar porta e host\n\n';
        
        response += '### 2. Admin Panel em Branco\n';
        response += '**Soluções**:\n';
        response += '```bash\n';
        response += 'npm run build\n';
        response += 'rm -rf .cache build\n';
        response += 'npm run develop\n';
        response += '\`\`\`\n\n';
        
        response += '### 3. Erro de Permissão\n';
        response += '**Sintomas**: "403 Forbidden"\n';
        response += '**Verificar**:\n';
        response += '- Roles e permissões no admin\n';
        response += '- Token JWT válido\n';
        response += '- Políticas aplicadas nas rotas\n\n';
        
        response += '### 4. Upload de Arquivos Falhando\n';
        response += '**Soluções**:\n';
        response += '```javascript\n';
        response += `// config/plugins.js
module.exports = {
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // 250mb
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      }
    }
  }
};
\`\`\`\n\n`;

        response += '## 🔍 Debug Avançado\n';
        response += '```bash\n';
        response += '# Ativar logs detalhados\n';
        response += 'DEBUG=* npm run develop\n\n';
        response += '# Verificar configuração\n';
        response += 'npm run strapi configuration:dump\n\n';
        response += '# Limpar cache\n';
        response += 'rm -rf .cache .tmp\n';
        response += '```\n\n';

        response += '## 📊 Monitoramento\n';
        response += '- Use Sentry para tracking de erros\n';
        response += '- Configure webhooks para notificações\n';
        response += '- Implemente health checks\n';

        return response;
    }

    private async optimizeStrapi(analysis: StrapiAnalysis): Promise<string> {
        let response = '# ⚡ Otimização do Strapi\n\n';
        
        response += '## 🚀 Performance do Banco de Dados\n';
        response += '### Índices\n';
        response += '```javascript\n';
        response += `// src/index.js
module.exports = {
  async bootstrap() {
    // Criar índices customizados
    const knex = strapi.db.connection;
    
    await knex.schema.alterTable('articles', (table) => {
      table.index(['slug']);
      table.index(['published_at']);
      table.index(['created_at']);
    });
  }
};
\`\`\`\n\n`;

        response += '## 📦 Otimização de Queries\n';
        response += '```javascript\n';
        response += `// Usar populate seletivo
const articles = await strapi.entityService.findMany(
  'api::article.article',
  {
    populate: {
      author: {
        fields: ['name', 'email']
      },
      category: {
        fields: ['name', 'slug']
      }
    },
    fields: ['title', 'slug', 'excerpt']
  }
);

// Usar projeção
const lightArticles = await strapi.db
  .query('api::article.article')
  .findMany({
    select: ['id', 'title', 'slug'],
    limit: 100
  });
\`\`\`\n\n`;

        response += '## 💾 Cache\n';
        response += '### Redis Cache\n';
        response += '```javascript\n';
        response += `// Instalar redis
npm install redis ioredis

// src/middlewares/cache.js
const redis = require('redis');
const client = redis.createClient();

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const key = ctx.request.url;
    const cached = await client.get(key);
    
    if (cached) {
      ctx.body = JSON.parse(cached);
      return;
    }
    
    await next();
    
    if (ctx.status === 200) {
      await client.setex(key, 3600, JSON.stringify(ctx.body));
    }
  };
};
\`\`\`\n\n`;

        response += '## 🖼️ Otimização de Imagens\n';
        response += '```javascript\n';
        response += `// config/plugins.js
module.exports = {
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10 * 1024 * 1024, // 10MB
      },
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
        thumbnail: 156
      }
    }
  }
};
\`\`\`\n\n`;

        response += '## 🔥 Outras Otimizações\n';
        response += '- **Paginação**: Sempre use limit e offset\n';
        response += '- **Lazy Loading**: Carregue relações sob demanda\n';
        response += '- **Queue System**: Use Bull para tarefas pesadas\n';
        response += '- **CDN**: Sirva assets estáticos via CDN\n';
        response += '- **Compression**: Habilite gzip/brotli\n';

        return response;
    }

    private async provideGeneralGuidance(analysis: StrapiAnalysis): Promise<string> {
        let response = '# 📚 Guia Geral do Strapi\n\n';
        
        response += '## 🚀 O que é Strapi?\n';
        response += 'Strapi é um Headless CMS open-source que permite criar e gerenciar APIs rapidamente.\n\n';
        
        response += '## 🔑 Conceitos Principais\n\n';
        response += '### Content-Types\n';
        response += `- **Collection Types**: Múltiplas entradas (artigos, produtos)\n`;
        response += `- **Single Types**: Entrada única (homepage, configurações)\n\n`;
        
        response += '### Componentes\n';
        response += '- Estruturas reutilizáveis de campos\n';
        response += '- Podem ser usados em múltiplos content-types\n\n';
        
        response += '### Dynamic Zones\n';
        response += '- Áreas flexíveis que aceitam diferentes componentes\n';
        response += '- Ideal para layouts dinâmicos\n\n';
        
        response += '## 🛠️ Comandos Úteis\n';
        response += '```bash\n';
        response += '# Desenvolvimento\n';
        response += 'npm run develop\n\n';
        response += '# Build para produção\n';
        response += 'npm run build\n';
        response += 'npm start\n\n';
        response += '# Gerar content-type\n';
        response += 'npm run strapi generate\n\n';
        response += '# Console interativo\n';
        response += 'npm run strapi console\n';
        response += '\`\`\`\n\n';
        
        response += '## 📖 Recursos\n';
        response += '- [Documentação Oficial](https://docs.strapi.io)\n';
        response += '- [API Reference](https://docs.strapi.io/dev-docs/api/rest)\n';
        response += '- [Marketplace](https://market.strapi.io)\n';
        response += '- [Discord Community](https://discord.strapi.io)\n';

        return response;
    }

    private async learnAboutEnvironment(): Promise<void> {
        console.log('🧠 Aprendendo sobre o ambiente Strapi...');
        
        try {
            // Verificar containers Strapi rodando
            const { stdout: containers } = await execAsync('docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -i strapi || true');
            if (containers) {
                await this.saveMemory(
                    `Containers Strapi ativos:\n${containers}`,
                    ['environment', 'docker', 'strapi'],
                    { type: 'container-info' }
                );
            }
            
            // Verificar versão do Strapi se disponível
            const strapiPackagePath = path.join(this.strapiPath, 'package.json');
            if (await this.fileExists(strapiPackagePath)) {
                const packageJson = JSON.parse(await fs.readFile(strapiPackagePath, 'utf-8'));
                const strapiVersion = packageJson.dependencies?.['@strapi/strapi'] || 'unknown';
                await this.saveMemory(
                    `Projeto Strapi encontrado em ${this.strapiPath} - Versão: ${strapiVersion}`,
                    ['project', 'version', 'strapi'],
                    { version: strapiVersion, path: this.strapiPath }
                );
            }
            
            // Verificar content-types existentes
            const contentTypesPath = path.join(this.strapiPath, 'src/api');
            if (await this.fileExists(contentTypesPath)) {
                const apis = await fs.readdir(contentTypesPath);
                if (apis.length > 0) {
                    await this.saveMemory(
                        `Content-types encontrados: ${apis.join(', ')}`,
                        ['content-types', 'api', 'strapi'],
                        { apis, count: apis.length }
                    );
                }
            }
            
            console.log('✅ Aprendizado inicial concluído');
        } catch (error) {
            console.error('⚠️ Erro durante aprendizado inicial:', error);
        }
    }

    private async loadStrapiConfig(): Promise<void> {
        try {
            // Verificar se existe projeto Strapi
            const packageJsonPath = path.join(this.strapiPath, 'package.json');
            if (await this.fileExists(packageJsonPath)) {
                const content = await fs.readFile(packageJsonPath, 'utf-8');
                const pkg = JSON.parse(content);
                console.log(`📦 Strapi version: ${pkg.dependencies?.['@strapi/strapi'] || 'unknown'}`);
            }

            // Criar diretório de documentação
            await fs.mkdir(this.strapiDocsPath, { recursive: true });
            
            // Carregar conhecimento adicional se existir
            const knowledgePath = path.join(this.strapiDocsPath, 'knowledge-base.json');
            if (await this.fileExists(knowledgePath)) {
                const content = await fs.readFile(knowledgePath, 'utf-8');
                const additionalKnowledge = JSON.parse(content);
                Object.assign(this.knowledgeBase, additionalKnowledge);
                console.log('📚 Local knowledge loaded');
            }
        } catch (error) {
            console.log('⚠️ No Strapi configuration found in project');
        }
    }

    private async checkExistingContentTypes(): Promise<boolean> {
        try {
            const apiPath = path.join(this.strapiPath, 'src/api');
            await fs.access(apiPath);
            return true;
        } catch {
            return false;
        }
    }

    private async listExistingContentTypes(): Promise<string> {
        try {
            const apiPath = path.join(this.strapiPath, 'src/api');
            const dirs = await fs.readdir(apiPath);
            let list = '';
            for (const dir of dirs) {
                list += `- ${dir}\n`;
            }
            return list || '- Nenhum content-type encontrado\n';
        } catch {
            return '- Não foi possível listar content-types\n';
        }
    }

    private async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    private async gatherStrapiContext(): Promise<any> {
        return {
            projectRoot: this.projectRoot,
            strapiPath: this.strapiPath,
            hasStrapi: await this.fileExists(this.strapiPath),
            timestamp: new Date().toISOString()
        };
    }

    async shutdown(): Promise<void> {
        console.log('🚀 Strapi Specialist shutting down...');
        
        // Salvar conhecimento aprendido
        await this.saveKnowledgeBase();
        
        // Desconectar MCP
        if (this.mcpClient) {
            await this.mcpClient.disconnect();
        }
        
        console.log('🚀 Strapi Specialist shutdown complete');
    }

    private async saveKnowledgeBase(): Promise<void> {
        try {
            const knowledgePath = path.join(this.strapiDocsPath, 'knowledge-base.json');
            await fs.writeFile(
                knowledgePath, 
                JSON.stringify(this.knowledgeBase, null, 2),
                'utf-8'
            );
            console.log('💾 Knowledge base saved');
        } catch (error) {
            console.error('Failed to save knowledge base:', error);
        }
    }
}

// Tipos
interface StrapiAnalysis {
    request: string;
    type: StrapiAnalysisType;
    keywords: string[];
    context: any;
}

type StrapiAnalysisType = 
    | 'content-type'
    | 'api'
    | 'plugin'
    | 'security'
    | 'deployment'
    | 'troubleshooting'
    | 'optimization'
    | 'general';

interface StrapiKnowledge {
    coreConcepts: {
        contentTypes: any;
        api: any;
        plugins: any;
        security: any;
    };
    commonTasks: {
        [key: string]: string;
    };
}

// Executar se chamado diretamente
if (require.main === module) {
    const specialist = new StrapiSpecialistAgent();
    
    async function run() {
        await specialist.initialize();
        
        // Se foi passado um argumento, executar como CLI
        if (process.argv.length > 2) {
            const request = process.argv.slice(2).join(' ');
            
            const message: Message = {
                role: 'user',
                content: request,
                metadata: {
                    source: 'cli'
                }
            };
            
            const response = await specialist.processMessage(message);
            console.log('\n' + response.content);
            
            await specialist.shutdown();
        } else {
            // Caso contrário, iniciar servidor HTTP
            const http = require('http');
            const port = process.env.PORT || 3007;
            
            const server = http.createServer(async (req, res) => {
                // Health check
                if (req.url === '/health') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'healthy', 
                        agent: 'strapi-specialist',
                        memoryEnabled: true,
                        learningCount: specialist['learningCount'] || 0
                    }));
                    return;
                }
                
                // Process message endpoint
                if (req.url === '/process' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => body += chunk.toString());
                    req.on('end', async () => {
                        try {
                            const data = JSON.parse(body);
                            const message: Message = {
                                role: 'user',
                                content: data.content || data.message,
                                metadata: data.metadata || {}
                            };
                            
                            const response = await specialist.processMessage(message);
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(response));
                        } catch (error) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: error.message }));
                        }
                    });
                    return;
                }
                
                // Default response
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            });
            
            server.listen(port, () => {
                console.log(`🌐 Strapi Specialist HTTP server listening on port ${port}`);
                console.log(`💚 Health check: http://localhost:${port}/health`);
                console.log(`📨 Process endpoint: POST http://localhost:${port}/process`);
            });
            
            // Graceful shutdown
            process.on('SIGTERM', async () => {
                console.log('📛 SIGTERM received, shutting down gracefully...');
                server.close(() => {
                    specialist.shutdown().then(() => {
                        console.log('👋 Shutdown complete');
                        process.exit(0);
                    });
                });
            });
        }
    }
    
    run().catch(console.error);
}