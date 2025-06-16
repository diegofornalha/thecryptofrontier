const { exec } = require('child_process');

// Comando para testar o strapi-specialist
const testCommand = `docker exec strapi-specialist sh -c 'cd /app && node -e "
const { StrapiSpecialistAgent } = require(\\"./src/agents/strapi-specialist-agent\\");

async function test() {
  const agent = new StrapiSpecialistAgent();
  
  const response = await agent.processMessage({
    content: \\"Como evitar erros de validação ao enviar dados para o Strapi? Me dê exemplos práticos de tratamento de erros.\\",
    type: \\"query\\",
    metadata: { source: \\"test\\" }
  });
  
  console.log(\\"\\\\n=== RESPOSTA DO AGENTE ===\\");
  console.log(response.content);
  console.log(\\"\\\\n=== FIM DA RESPOSTA ===\\");
}

test().catch(console.error);
"'`;

exec(testCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Erro ao executar:', error);
    return;
  }
  
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  
  console.log(stdout);
  
  // Análise da resposta
  console.log('\n=== ANÁLISE DA RESPOSTA ===');
  
  const checkpoints = {
    'validação antes de enviar': stdout.includes('validação') || stdout.includes('validar'),
    'tratamento de erros': stdout.includes('erro') || stdout.includes('error'),
    'exemplos de código': stdout.includes('```') || stdout.includes('typescript') || stdout.includes('try'),
    'campos obrigatórios': stdout.includes('obrigatório') || stdout.includes('required'),
    'tipos de dados': stdout.includes('tipo') || stdout.includes('type')
  };
  
  Object.entries(checkpoints).forEach(([check, found]) => {
    console.log(`- ${check}: ${found ? '✓ ENCONTRADO' : '✗ NÃO ENCONTRADO'}`);
  });
});