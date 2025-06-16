/**
 * MCP Agents - Entry Point
 * Sistema de agentes TypeScript para processar tarefas do Claude CLI
 */

import { ResearcherAgent } from './agents/researcher';
import { WriterAgent } from './agents/writer';
import { EditorAgent } from './agents/editor';

// Mapa de agentes disponíveis
const agents = {
  researcher: ResearcherAgent,
  writer: WriterAgent,
  editor: EditorAgent
};

async function main() {
  // Pega o nome do agente dos argumentos
  const agentName = process.argv[2];
  
  if (!agentName || !agents[agentName]) {
    console.log('❌ Uso: npm run agent <nome-do-agente>');
    console.log('📋 Agentes disponíveis:', Object.keys(agents).join(', '));
    process.exit(1);
  }

  console.log(`\n🚀 Iniciando ${agentName} agent...\n`);

  try {
    // Cria e executa o agente
    const AgentClass = agents[agentName];
    const agent = new AgentClass();
    await agent.run();
    
    console.log('\n✨ Processo concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante execução:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { ResearcherAgent, WriterAgent, EditorAgent };