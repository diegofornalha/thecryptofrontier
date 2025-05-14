// Script para gerenciar a configuração do blog no Sanity
require('dotenv').config();
const { createClient } = require('@sanity/client');
const colors = require('./colors');

// Configuração direta do cliente Sanity
const configSanity = {
  projectId: 'brby2yrg',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: 'sk0MzzutKkZoELcQnRSwhz7hqSMXlwMuQCwna9Mp90nqUU1OLb0WdouiGhXa1xWdWcNPFlLoCkrxCuq8xNVeDzJPKQOtlh22xjLsNduo7WIR138cCAiZe40cwque00dbHAx0ylF0ntLM5GinO8GKX69aF5JZw7Q5Bpq1GPGRihGhbM0cNGAm'
};

// Criar cliente Sanity
const sanityClient = createClient(configSanity);

console.log(`${colors.magenta}${colors.bold} CONFIGURAÇÃO DO BLOG NO SANITY CMS ${colors.reset}`);
console.log(`${colors.blue}---------------------------------------------${colors.reset}`);

// Função para obter a configuração atual
async function obterConfiguracao() {
  try {
    console.log(`${colors.blue}[INFO] Buscando configuração no Sanity...${colors.reset}`);
    
    const config = await sanityClient.fetch(
      `*[_type == "blogConfig"][0]{
        _id,
        title,
        "defaultAuthorId": defaultAuthor._ref,
        "defaultAuthorName": defaultAuthor->name,
        "defaultAuthorRole": defaultAuthor->role,
        monitoringFrequency,
        "feeds": activeFeeds[]{
          name,
          url,
          active
        },
        "categories": defaultCategories[]->title
      }`
    );
    
    if (!config) {
      console.log(`${colors.yellow}[AVISO] Nenhuma configuração encontrada no Sanity.${colors.reset}`);
      await verificarOuCriarConfiguracao();
      return;
    }
    
    // Exibir configuração encontrada
    console.log(`\n${colors.cyan}${colors.bold}=== Configuração Atual ===${colors.reset}`);
    console.log(`${colors.blue}ID: ${colors.reset}${config._id}`);
    console.log(`${colors.blue}Título: ${colors.reset}${config.title}`);
    console.log(`${colors.blue}Autor Padrão: ${colors.reset}${config.defaultAuthorName || 'Não definido'}${config.defaultAuthorRole ? ` (${config.defaultAuthorRole})` : ''}`);
    console.log(`${colors.blue}ID do Autor: ${colors.reset}${config.defaultAuthorId || 'Não definido'}`);
    console.log(`${colors.blue}Frequência de Monitoramento: ${colors.reset}${config.monitoringFrequency || 60} minutos`);
    
    if (config.feeds && config.feeds.length > 0) {
      console.log(`\n${colors.cyan}${colors.bold}=== Feeds RSS Ativos ===${colors.reset}`);
      config.feeds.forEach((feed, index) => {
        console.log(`${colors.blue}${index + 1}. ${colors.reset}${feed.name} ${feed.active ? colors.green+'✓'+colors.reset : colors.red+'✗'+colors.reset}`);
        console.log(`   ${colors.blue}URL: ${colors.reset}${feed.url}`);
      });
    }
    
    if (config.categories && config.categories.length > 0) {
      console.log(`\n${colors.cyan}${colors.bold}=== Categorias Padrão ===${colors.reset}`);
      config.categories.forEach((category, index) => {
        console.log(`${colors.blue}${index + 1}. ${colors.reset}${category}`);
      });
    }
    
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao buscar configuração: ${erro.message}${colors.reset}`);
  }
}

// Função para verificar se existe uma configuração ou criar uma nova
async function verificarOuCriarConfiguracao() {
  try {
    // Verificar se já existe uma configuração
    const configExistente = await sanityClient.fetch(`*[_type == "blogConfig"][0]._id`);
    
    if (configExistente) {
      return configExistente;
    }
    
    console.log(`${colors.yellow}[AVISO] Nenhuma configuração encontrada. Criando configuração padrão...${colors.reset}`);
    
    // Buscar autores disponíveis
    const autores = await sanityClient.fetch(
      `*[_type == "author"]{_id, name}`
    );
    
    if (autores.length === 0) {
      console.error(`${colors.red}✗ Erro: Nenhum autor encontrado no Sanity. Primeiro crie pelo menos um autor.${colors.reset}`);
      return null;
    }
    
    // Por padrão, usar o primeiro autor
    const autorPadrao = autores[0];
    
    // Criar configuração padrão
    const novaConfig = await sanityClient.create({
      _type: 'blogConfig',
      title: 'Configuração Principal',
      defaultAuthor: {
        _type: 'reference',
        _ref: autorPadrao._id
      },
      monitoringFrequency: 60
    });
    
    console.log(`${colors.green}✓ Configuração padrão criada com sucesso!${colors.reset}`);
    console.log(`${colors.green}✓ Autor padrão definido como: ${autorPadrao.name}${colors.reset}`);
    
    return novaConfig._id;
  } catch (erro) {
    console.error(`${colors.red}✗ Erro ao criar configuração padrão: ${erro.message}${colors.reset}`);
    return null;
  }
}

// Verificar se o usuário solicitou criação de configuração padrão
if (process.argv.includes('--criar')) {
  verificarOuCriarConfiguracao().then(() => {
    obterConfiguracao();
  });
} else {
  obterConfiguracao();
}

// Instruções para usar no código
console.log(`\n${colors.cyan}${colors.bold}=== Verificando se as alterações foram aplicadas ===${colors.reset}`);
console.log(`Para verificar se as alterações foram aplicadas, execute:`);
console.log(`${colors.yellow}node publicar_posts_markdown.js --verify${colors.reset}`);

console.log(`\n${colors.cyan}${colors.bold}=== Como utilizar a configuração ===${colors.reset}`);
console.log(`1. Acesse o Studio Sanity em ${colors.green}https://thecryptofrontier.sanity.studio/${colors.reset}`);
console.log(`2. No menu à esquerda, clique em ${colors.yellow}"Configurações do Blog"${colors.reset}`);
console.log(`3. Edite a configuração principal ou crie uma nova caso não exista`);
console.log(`4. Para alterar o autor padrão, clique no campo ${colors.yellow}"Autor Padrão"${colors.reset} e selecione o autor desejado`);
console.log(`5. Para ocultar o autor nas postagens, ative a opção ${colors.yellow}"Ocultar Autor nas Postagens"${colors.reset}`);
console.log(`6. Para ocultar a data de publicação, ative a opção ${colors.yellow}"Ocultar Data nas Postagens"${colors.reset}`);
console.log(`7. Salve a configuração clicando no botão ${colors.green}"Publicar"${colors.reset} no canto superior direito`); 