/**
 * Exemplo de uso do Auto Commit Agent com chave SSH
 */

import { createAutoCommitAgent } from './auto-commit-agent';

// Criar instância do agente
const agent = createAutoCommitAgent('/caminho/do/seu/projeto');

// Exemplo de chave SSH (você deve usar sua chave real)
const sshKeyContent = `-----BEGIN OPENSSH PRIVATE KEY-----
[SUA CHAVE SSH PRIVADA AQUI]
-----END OPENSSH PRIVATE KEY-----`;

// Armazenar a chave SSH
async function setupSSHKey() {
  const success = await agent.storeSSHKey(sshKeyContent);
  
  if (success) {
    console.log('✅ Chave SSH configurada com sucesso!');
    console.log('📍 A chave foi armazenada em: .diego-tools/ssh-key');
    console.log('🔗 MCP DiegoTools pode acessar via: .diego-tools/credentials');
  } else {
    console.log('❌ Falha ao configurar chave SSH');
  }
}

// Remover chave SSH quando necessário
function removeSSHKey() {
  const removed = agent.removeSSHKey();
  if (removed) {
    console.log('✅ Chave SSH removida');
  }
}

// Uso via linha de comando
// O usuário pode simplesmente enviar a chave SSH como texto e você pode chamar:
// agent.storeSSHKey(chaveRecebidaDoUsuario)

/**
 * IMPORTANTE: Segurança
 * 
 * 1. A chave é armazenada com permissões 0600 (apenas leitura pelo proprietário)
 * 2. O diretório .diego-tools tem permissões 0700
 * 3. A chave é compartilhada via arquivo JSON em .diego-tools/credentials
 * 4. MCP DiegoTools pode ler este arquivo para usar a mesma chave
 * 
 * NUNCA commite o diretório .diego-tools no git!
 * Adicione ao .gitignore:
 * .diego-tools/
 */