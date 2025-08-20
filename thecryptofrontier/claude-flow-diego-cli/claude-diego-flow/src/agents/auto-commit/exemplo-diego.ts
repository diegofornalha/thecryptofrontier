/**
 * Exemplo de uso do Auto Commit Agent com memória Mem0
 * Instruções personalizadas do Diego
 */

import { createAutoCommitAgent } from '../auto-commit-agent';
import { diegoCommand } from './diego-commands';

async function exemploDiego() {
  console.log('🤖 Configurando Auto Commit Agent com instruções do Diego...\n');

  // Criar instância do agente
  const agent = createAutoCommitAgent('/home/strapi/thecryptofrontier');

  // 1. Adicionar instruções gerais do Diego
  console.log('📝 Adicionando instruções gerais...');
  await diegoCommand('instrucao sempre usar português nas mensagens de commit');
  await diegoCommand('instrucao incluir emojis relevantes do gitmoji');
  await diegoCommand('instrucao mencionar o número da issue quando disponível');
  await diegoCommand('instrucao ser específico sobre o que foi alterado');

  // 2. Definir preferências de commit por tipo de arquivo
  console.log('\n🎯 Configurando preferências de commit...');
  await diegoCommand('preferencia *.tsx "✨ feat: {action} componente React ({files} arquivos)"');
  await diegoCommand('preferencia *.ts "🔧 {action}: lógica TypeScript em {files} arquivo(s)"');
  await diegoCommand('preferencia *.css "💄 style: {action} estilos ({files} arquivo(s))"');
  await diegoCommand('preferencia *.md "📝 docs: {action} documentação"');
  await diegoCommand('preferencia package.json "📦 deps: {action} dependências"');

  // 3. Configurar regras de ignore
  console.log('\n🚫 Configurando arquivos a ignorar...');
  await diegoCommand('ignorar node_modules dependências não devem ser versionadas');
  await diegoCommand('ignorar .env arquivos de ambiente contêm segredos');
  await diegoCommand('ignorar *.log arquivos de log são temporários');
  await diegoCommand('ignorar .DS_Store arquivos do sistema macOS');
  await diegoCommand('ignorar *.tmp arquivos temporários');

  // 4. Definir horário de trabalho
  console.log('\n⏰ Configurando horário de commits...');
  await diegoCommand('horario 9-18 seg-sex 15'); // Commits a cada 15 min em horário comercial

  // 5. Dar feedback sobre commits anteriores
  console.log('\n💬 Registrando feedback de commits...');
  await diegoCommand('feedback bom "✨ feat: implementa autenticação OAuth"');
  await diegoCommand('feedback ruim "update files" "📝 docs: atualiza README com instruções de instalação"');
  await diegoCommand('feedback bom "🐛 fix: corrige erro de validação no formulário"');

  // 6. Listar todas as instruções
  console.log('\n📋 Instruções configuradas:');
  const lista = await diegoCommand('listar');
  console.log(lista);

  // 7. Armazenar chave SSH (se fornecida)
  const sshKey = process.env.SSH_PRIVATE_KEY;
  if (sshKey) {
    console.log('\n🔑 Configurando chave SSH...');
    await agent.storeSSHKey(sshKey);
  }

  console.log('\n✅ Auto Commit Agent configurado com sucesso!');
  console.log('🎯 O agente agora seguirá suas instruções personalizadas.');
}

// Comandos úteis para Diego usar diretamente
export const comandosDiego = {
  // Adicionar nova instrução
  instrucao: async (texto: string) => {
    return await diegoCommand(`instrucao ${texto}`);
  },

  // Definir preferência de commit
  preferencia: async (padrao: string, template: string) => {
    return await diegoCommand(`preferencia ${padrao} "${template}"`);
  },

  // Ignorar arquivos
  ignorar: async (padrao: string, razao: string) => {
    return await diegoCommand(`ignorar ${padrao} ${razao}`);
  },

  // Configurar horário
  horario: async (horas: string, dias: string, freq: number) => {
    return await diegoCommand(`horario ${horas} ${dias} ${freq}`);
  },

  // Dar feedback
  feedback: async (tipo: 'bom' | 'ruim', mensagem: string, sugestao?: string) => {
    return await diegoCommand(`feedback ${tipo} "${mensagem}" ${sugestao ? `"${sugestao}"` : ''}`);
  },

  // Listar instruções
  listar: async () => {
    return await diegoCommand('listar');
  },

  // Ver ajuda
  ajuda: async () => {
    return await diegoCommand('ajuda');
  }
};

// Executar exemplo se chamado diretamente
if (require.main === module) {
  exemploDiego().catch(console.error);
}

/**
 * INSTRUÇÕES DE USO PARA DIEGO:
 * 
 * 1. Para adicionar uma nova instrução:
 *    await comandosDiego.instrucao('sempre mencionar o contexto da mudança')
 * 
 * 2. Para definir como commitar arquivos React:
 *    await comandosDiego.preferencia('*.jsx', '⚛️ react: {action} componente')
 * 
 * 3. Para ignorar um tipo de arquivo:
 *    await comandosDiego.ignorar('*.bak', 'arquivos de backup são temporários')
 * 
 * 4. Para configurar horário de commits:
 *    await comandosDiego.horario('8-17', 'seg-sex', 30)
 * 
 * 5. Para dar feedback sobre um commit:
 *    await comandosDiego.feedback('bom', '✨ feat: novo sistema de login')
 *    await comandosDiego.feedback('ruim', 'fix stuff', '🐛 fix: corrige validação de email')
 * 
 * 6. Para ver todas as instruções:
 *    await comandosDiego.listar()
 * 
 * O Auto Commit Agent vai aprender com suas preferências e melhorar com o tempo!
 */