import fs from 'fs';
import path from 'path';
import { deployClient as client } from './client';

/**
 * Utilitário para migrar dados do sistema de arquivos para o Sanity
 * Este script pode ser executado manualmente para fazer a primeira migração
 */

// Migrar configuração do site
export async function migrateSiteConfig() {
  try {
    const siteConfigPath = path.join(process.cwd(), 'content/data/site.json');
    const siteData = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));

    // Verificar se já existe uma configuração do site
    const existingConfig = await client.fetch('*[_type == "siteConfig"][0]');
    
    if (existingConfig) {
      console.log('Configuração do site já existe no Sanity. Atualizando...');
      return client.patch(existingConfig._id)
        .set({
          title: siteData.titleSuffix,
          // Aqui você precisará fazer o upload das imagens para o Sanity
          // ou usar URLs externas
          // favicon: siteData.favicon,
          // defaultSocialImage: siteData.defaultSocialImage,
        })
        .commit();
    } else {
      console.log('Criando nova configuração do site no Sanity...');
      return client.create({
        _type: 'siteConfig',
        title: siteData.titleSuffix,
        // favicon: siteData.favicon,
        // defaultSocialImage: siteData.defaultSocialImage,
      });
    }
  } catch (error) {
    console.error('Erro ao migrar configuração do site:', error);
    throw error;
  }
}

// Migrar cabeçalho
export async function migrateHeader() {
  try {
    const headerPath = path.join(process.cwd(), 'content/data/header.json');
    const headerData = JSON.parse(fs.readFileSync(headerPath, 'utf8'));

    // Verificar se já existe um cabeçalho
    const existingHeader = await client.fetch('*[_type == "header"][0]');
    
    if (existingHeader) {
      console.log('Cabeçalho já existe no Sanity. Atualizando...');
      return client.patch(existingHeader._id)
        .set({
          title: headerData.title,
          navLinks: headerData.primaryLinks?.map(link => ({
            label: link.label,
            url: link.url
          })) || []
        })
        .commit();
    } else {
      console.log('Criando novo cabeçalho no Sanity...');
      return client.create({
        _type: 'header',
        title: headerData.title,
        navLinks: headerData.primaryLinks?.map(link => ({
          label: link.label,
          url: link.url
        })) || []
      });
    }
  } catch (error) {
    console.error('Erro ao migrar cabeçalho:', error);
    throw error;
  }
}

// Migrar rodapé
export async function migrateFooter() {
  try {
    const footerPath = path.join(process.cwd(), 'content/data/footer.json');
    const footerData = JSON.parse(fs.readFileSync(footerPath, 'utf8'));

    // Verificar se já existe um rodapé
    const existingFooter = await client.fetch('*[_type == "footer"][0]');
    
    if (existingFooter) {
      console.log('Rodapé já existe no Sanity. Atualizando...');
      return client.patch(existingFooter._id)
        .set({
          copyrightText: footerData.copyrightText,
          navLinks: footerData.navLinks?.map(link => ({
            label: link.label,
            url: link.url
          })) || []
        })
        .commit();
    } else {
      console.log('Criando novo rodapé no Sanity...');
      return client.create({
        _type: 'footer',
        copyrightText: footerData.copyrightText,
        navLinks: footerData.navLinks?.map(link => ({
          label: link.label,
          url: link.url
        })) || []
      });
    }
  } catch (error) {
    console.error('Erro ao migrar rodapé:', error);
    throw error;
  }
}

// Função principal para migrar todos os dados
export async function migrateAllData() {
  try {
    console.log('Iniciando migração de dados para o Sanity...');
    
    await migrateSiteConfig();
    await migrateHeader();
    await migrateFooter();
    
    console.log('Migração de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração de dados:', error);
    throw error;
  }
} 