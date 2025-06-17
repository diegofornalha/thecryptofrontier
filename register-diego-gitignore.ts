/**
 * Script para registrar as regras de gitignore do Diego no Auto Commit Agent
 */

import { diegoCommand } from './claude-flow-diego-cli/claude-diego-flow/src/agents/auto-commit/diego-commands';

async function registerDiegoGitignoreRules() {
  console.log('🚀 Registrando regras de gitignore do Diego no Auto Commit Agent...\n');

  // Primeiro, adicionar uma instrução geral sobre as preferências de gitignore do Diego
  const generalInstruction = await diegoCommand(
    'instrucao Diego prefere ignorar os seguintes diretórios principais do projeto: agetes-python/, claude-flow-diego-cli/, frontend-nextjs/, infrastructure-docker/, mem0-persistent/, strapi-cms/. Estes são diretórios de subprojetos que devem ser gerenciados separadamente.'
  );
  console.log(generalInstruction);

  // Adicionar cada diretório como uma regra de ignore com uma razão apropriada
  const ignoreRules = [
    {
      pattern: 'agetes-python/',
      reason: 'subprojeto Python com agentes deve ser gerenciado separadamente'
    },
    {
      pattern: 'claude-flow-diego-cli/',
      reason: 'CLI do Claude Flow tem seu próprio repositório e versionamento'
    },
    {
      pattern: 'frontend-nextjs/',
      reason: 'aplicação Next.js frontend deve ter commits independentes'
    },
    {
      pattern: 'infrastructure-docker/',
      reason: 'configurações Docker e infraestrutura devem ser versionadas separadamente'
    },
    {
      pattern: 'mem0-persistent/',
      reason: 'dados persistentes do Mem0 não devem ser commitados'
    },
    {
      pattern: 'strapi-cms/',
      reason: 'CMS Strapi deve ter seu próprio controle de versão'
    }
  ];

  // Registrar cada regra de ignore
  for (const rule of ignoreRules) {
    const result = await diegoCommand(`ignorar ${rule.pattern} ${rule.reason}`);
    console.log(result);
  }

  // Adicionar preferência de commit específica para quando trabalhar com gitignore
  const gitignorePreference = await diegoCommand(
    'preferencia .gitignore "🚫 chore: atualiza regras de ignore para {action}"'
  );
  console.log(gitignorePreference);

  // Listar todas as instruções para confirmar
  console.log('\n📋 Listando todas as instruções registradas:\n');
  const allInstructions = await diegoCommand('listar');
  console.log(allInstructions);

  console.log('\n✅ Regras de gitignore do Diego registradas com sucesso no Auto Commit Agent!');
}

// Executar o registro
registerDiegoGitignoreRules().catch(console.error);