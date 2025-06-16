#!/usr/bin/env node

/**
 * Script para configurar o Strapi completamente via CLI
 * Cria token, configura permissões e prepara o ambiente
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
require('dotenv').config();

const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
};

class StrapiSetup {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
    this.adminEmail = null;
    this.adminPassword = null;
    this.adminToken = null;
    this.apiToken = null;
  }

  async setup() {
    console.log(chalk.bold('\n🚀 Configuração do Strapi via CLI\n'));
    
    try {
      // 1. Obter credenciais do admin
      await this.getAdminCredentials();
      
      // 2. Fazer login como admin
      await this.adminLogin();
      
      // 3. Criar token de API
      await this.createApiToken();
      
      // 4. Configurar permissões públicas
      await this.configurePublicPermissions();
      
      // 5. Salvar configurações
      await this.saveConfiguration();
      
      // 6. Testar configuração
      await this.testConfiguration();
      
      log.success('\n✅ Configuração concluída com sucesso!\n');
      
    } catch (error) {
      log.error(`\nErro durante a configuração: ${error.message}\n`);
      process.exit(1);
    }
  }

  async getAdminCredentials() {
    log.info('Primeiro, precisamos das credenciais de administrador do Strapi.\n');
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email do administrador:',
        validate: (input) => input.includes('@') || 'Por favor, insira um email válido'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Senha do administrador:',
        mask: '*',
        validate: (input) => input.length > 0 || 'Senha é obrigatória'
      }
    ]);
    
    this.adminEmail = answers.email;
    this.adminPassword = answers.password;
  }

  async adminLogin() {
    log.info('Fazendo login como administrador...');
    
    try {
      const response = await axios.post(`${this.baseUrl}/admin/login`, {
        email: this.adminEmail,
        password: this.adminPassword
      });
      
      this.adminToken = response.data.data.token;
      log.success('Login realizado com sucesso!');
      
    } catch (error) {
      throw new Error('Falha no login. Verifique as credenciais.');
    }
  }

  async createApiToken() {
    log.info('Criando token de API...');
    
    const tokenName = `Frontend Token - ${new Date().toLocaleDateString('pt-BR')}`;
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/api-tokens`,
        {
          name: tokenName,
          description: 'Token para o frontend Next.js',
          type: 'full-access', // ou 'read-only' / 'custom'
          lifespan: null // Token sem expiração
        },
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`
          }
        }
      );
      
      this.apiToken = response.data.data.accessKey;
      log.success(`Token de API criado: ${tokenName}`);
      
    } catch (error) {
      // Se falhar, tenta listar tokens existentes
      log.warn('Não foi possível criar novo token. Listando tokens existentes...');
      await this.listExistingTokens();
    }
  }

  async listExistingTokens() {
    try {
      const response = await axios.get(`${this.baseUrl}/admin/api-tokens`, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });
      
      const tokens = response.data.data;
      
      if (tokens.length > 0) {
        log.info(`\nTokens existentes:`);
        tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.name} (${token.type})`);
        });
        
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'useExisting',
            message: 'Deseja usar um token existente?',
            choices: [
              { name: 'Criar novo token', value: 'new' },
              ...tokens.map(t => ({ name: t.name, value: t.id }))
            ]
          }
        ]);
        
        if (answer.useExisting !== 'new') {
          log.warn('⚠️  Tokens existentes não mostram a chave. Você precisará gerar um novo ou usar um que já tenha salvo.');
        }
      }
    } catch (error) {
      log.error('Erro ao listar tokens');
    }
  }

  async configurePublicPermissions() {
    log.info('Configurando permissões públicas...');
    
    try {
      // Buscar role público
      const rolesResponse = await axios.get(`${this.baseUrl}/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`
        }
      });
      
      const publicRole = rolesResponse.data.data.find(role => role.type === 'public');
      
      if (publicRole) {
        // Configurar permissões para Posts
        const permissions = {
          'api::post.post': {
            controllers: {
              post: {
                find: { enabled: true },
                findOne: { enabled: true }
              }
            }
          },
          'api::author.author': {
            controllers: {
              author: {
                find: { enabled: true },
                findOne: { enabled: true }
              }
            }
          },
          'api::category.category': {
            controllers: {
              category: {
                find: { enabled: true },
                findOne: { enabled: true }
              }
            }
          }
        };
        
        await axios.put(
          `${this.baseUrl}/admin/roles/${publicRole.id}`,
          {
            permissions
          },
          {
            headers: {
              'Authorization': `Bearer ${this.adminToken}`
            }
          }
        );
        
        log.success('Permissões públicas configuradas!');
      }
    } catch (error) {
      log.warn('Não foi possível configurar permissões automaticamente. Configure manualmente no painel admin.');
    }
  }

  async saveConfiguration() {
    log.info('Salvando configurações...');
    
    const envPath = path.resolve('.env.local');
    const envContent = `
# Configuração do Strapi - Gerado automaticamente
NEXT_PUBLIC_STRAPI_URL=${this.baseUrl}
STRAPI_API_TOKEN=${this.apiToken || 'CONFIGURE_MANUALMENTE'}
`;
    
    // Adiciona ao .env.local
    if (fs.existsSync(envPath)) {
      const currentContent = fs.readFileSync(envPath, 'utf-8');
      if (!currentContent.includes('STRAPI_API_TOKEN')) {
        fs.appendFileSync(envPath, envContent);
      } else {
        log.warn('.env.local já contém configurações do Strapi. Atualize manualmente se necessário.');
      }
    } else {
      fs.writeFileSync(envPath, envContent);
    }
    
    log.success('Configurações salvas em .env.local');
  }

  async testConfiguration() {
    log.info('\nTestando a configuração...\n');
    
    if (!this.apiToken) {
      log.warn('Token de API não foi criado automaticamente. Configure manualmente.');
      return;
    }
    
    try {
      // Testa buscar posts
      const response = await axios.get(`${this.baseUrl}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
      
      log.success(`✅ API funcionando! ${response.data.data.length} posts encontrados.`);
      
      // Oferece criar post de teste
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createTest',
          message: 'Deseja criar um post de teste?',
          default: true
        }
      ]);
      
      if (answer.createTest) {
        await this.createTestPost();
      }
      
    } catch (error) {
      log.error('Erro ao testar API. Verifique as configurações.');
    }
  }

  async createTestPost() {
    try {
      const postData = {
        data: {
          title: "Post de Teste - Configuração CLI",
          slug: "teste-cli-" + Date.now(),
          content: "Este post foi criado automaticamente durante a configuração via CLI. 🎉",
          excerpt: "Post de teste",
          publishedAt: new Date().toISOString()
        }
      };
      
      const response = await axios.post(
        `${this.baseUrl}/api/posts`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );
      
      log.success('Post de teste criado com sucesso!');
      log.info(`Veja em: https://thecryptofrontier.agentesintegrados.com/blog/${postData.data.slug}`);
      
    } catch (error) {
      log.error('Erro ao criar post de teste');
    }
  }
}

// Script para configuração simplificada (sem login admin)
async function quickSetup() {
  console.log(chalk.bold('\n🚀 Configuração Rápida do Strapi\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'URL do Strapi:',
      default: process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'
    },
    {
      type: 'password',
      name: 'token',
      message: 'Token da API (deixe em branco se não tiver):',
      mask: '*'
    }
  ]);
  
  // Salva configurações
  const envPath = path.resolve('.env.local');
  const envContent = `
# Configuração do Strapi
NEXT_PUBLIC_STRAPI_URL=${answers.url}
STRAPI_API_TOKEN=${answers.token}
`;
  
  if (fs.existsSync(envPath)) {
    // Lê o arquivo existente
    let currentContent = fs.readFileSync(envPath, 'utf-8');
    
    // Atualiza ou adiciona as variáveis
    if (currentContent.includes('NEXT_PUBLIC_STRAPI_URL')) {
      currentContent = currentContent.replace(
        /NEXT_PUBLIC_STRAPI_URL=.*/g,
        `NEXT_PUBLIC_STRAPI_URL=${answers.url}`
      );
    } else {
      currentContent += `\nNEXT_PUBLIC_STRAPI_URL=${answers.url}`;
    }
    
    if (currentContent.includes('STRAPI_API_TOKEN')) {
      currentContent = currentContent.replace(
        /STRAPI_API_TOKEN=.*/g,
        `STRAPI_API_TOKEN=${answers.token}`
      );
    } else {
      currentContent += `\nSTRAPI_API_TOKEN=${answers.token}`;
    }
    
    fs.writeFileSync(envPath, currentContent);
  } else {
    fs.writeFileSync(envPath, envContent);
  }
  
  log.success('\n✅ Configuração salva em .env.local\n');
  
  if (!answers.token) {
    log.info('📝 Próximos passos:');
    log.info('1. Acesse o painel admin do Strapi');
    log.info('2. Vá para Settings > API Tokens');
    log.info('3. Crie um novo token com permissões de leitura/escrita');
    log.info('4. Adicione o token ao arquivo .env.local');
  }
}

// Menu principal
async function main() {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Escolha o modo de configuração:',
      choices: [
        { name: 'Configuração Rápida (recomendado)', value: 'quick' },
        { name: 'Configuração Completa (requer credenciais admin)', value: 'full' },
        { name: 'Testar configuração existente', value: 'test' }
      ]
    }
  ]);
  
  switch (answer.mode) {
    case 'quick':
      await quickSetup();
      break;
    case 'full':
      const setup = new StrapiSetup();
      await setup.setup();
      break;
    case 'test':
      const testSetup = new StrapiSetup();
      await testSetup.testConfiguration();
      break;
  }
}

// Executa
if (require.main === module) {
  main().catch(error => {
    log.error(`Erro: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { StrapiSetup, quickSetup };