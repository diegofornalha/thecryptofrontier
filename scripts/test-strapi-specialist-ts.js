const { exec } = require('child_process');

// Comando para testar o strapi-specialist usando ts-node
const testCommand = `docker exec strapi-specialist sh -c 'cd /app && npx ts-node -e "
import { StrapiSpecialistAgent } from \\"./src/agents/strapi-specialist-agent\\";

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

console.log('Executando teste do strapi-specialist...\n');

exec(testCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
  if (error && !stdout) {
    console.error('Erro ao executar:', error.message);
    return;
  }
  
  if (stderr && !stdout) {
    console.error('Stderr:', stderr);
  }
  
  console.log(stdout);
  
  // Análise da resposta
  console.log('\n=== ANÁLISE DA RESPOSTA ===');
  
  const checkpoints = {
    'validação antes de enviar': stdout.includes('validação') || stdout.includes('validar') || stdout.includes('Validação'),
    'tratamento de erros': stdout.includes('erro') || stdout.includes('error') || stdout.includes('catch'),
    'exemplos de código': stdout.includes('```') || stdout.includes('typescript') || stdout.includes('try'),
    'campos obrigatórios': stdout.includes('obrigatório') || stdout.includes('required') || stdout.includes('campo'),
    'tipos de dados': stdout.includes('tipo') || stdout.includes('type') || stdout.includes('string')
  };
  
  let foundCount = 0;
  Object.entries(checkpoints).forEach(([check, found]) => {
    console.log(`- ${check}: ${found ? '✓ ENCONTRADO' : '✗ NÃO ENCONTRADO'}`);
    if (found) foundCount++;
  });
  
  console.log(`\nResultado: ${foundCount}/5 critérios encontrados`);
  
  if (foundCount < 3) {
    console.log('\n⚠️  A resposta parece genérica ou incompleta.');
    console.log('O agente pode não ter aprendido adequadamente sobre validação no Strapi.');
  } else {
    console.log('\n✅ A resposta parece adequada e específica sobre Strapi!');
  }
});