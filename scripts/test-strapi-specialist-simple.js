const { exec } = require('child_process');

// Comando para testar o strapi-specialist
const testCommand = `docker exec strapi-specialist sh -c 'cd /app && npx ts-node -e "
import { StrapiSpecialistAgent } from \\"./src/agents/strapi-specialist-agent\\";

async function test() {
  try {
    const agent = new StrapiSpecialistAgent();
    
    // Criar mensagem no formato correto
    const message = {
      role: \\"user\\",
      content: \\"Como evitar erros de validação ao enviar dados para o Strapi? Me dê exemplos práticos de tratamento de erros.\\",
      metadata: { 
        source: \\"test\\",
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await agent.processMessage(message);
    
    console.log(\\"\\\\n=== RESPOSTA DO AGENTE ===\\");
    console.log(response.content);
    console.log(\\"\\\\n=== FIM DA RESPOSTA ===\\");
  } catch (error) {
    console.error(\\"Erro ao executar teste:\\", error);
  }
}

test();
"'`;

console.log('Executando teste do strapi-specialist...\n');

exec(testCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
  if (stderr && stderr.includes('warn')) {
    // Ignorar warnings do npm
  } else if (stderr) {
    console.error('Stderr:', stderr);
  }
  
  if (error && !stdout.includes('RESPOSTA DO AGENTE')) {
    console.error('Erro ao executar:', error.message);
    return;
  }
  
  console.log(stdout);
  
  // Extrair apenas a resposta do agente
  const startMarker = '=== RESPOSTA DO AGENTE ===';
  const endMarker = '=== FIM DA RESPOSTA ===';
  const startIndex = stdout.indexOf(startMarker);
  const endIndex = stdout.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const response = stdout.substring(startIndex + startMarker.length, endIndex).trim();
    
    console.log('\n=== ANÁLISE DA RESPOSTA ===');
    
    const checkpoints = {
      'validação antes de enviar': response.includes('validação') || response.includes('validar') || response.includes('Validação'),
      'tratamento de erros': response.includes('erro') || response.includes('error') || response.includes('catch') || response.includes('try'),
      'exemplos de código': response.includes('```') || response.includes('typescript') || response.includes('javascript'),
      'campos obrigatórios': response.includes('obrigatório') || response.includes('required') || response.includes('campo'),
      'tipos de dados': response.includes('tipo') || response.includes('type') || response.includes('string') || response.includes('number'),
      'mensagens específicas': response.includes('400') || response.includes('422') || response.includes('ValidationError'),
      'Strapi específico': response.includes('Strapi') || response.includes('strapi') || response.includes('API')
    };
    
    let foundCount = 0;
    Object.entries(checkpoints).forEach(([check, found]) => {
      console.log(`- ${check}: ${found ? '✓ ENCONTRADO' : '✗ NÃO ENCONTRADO'}`);
      if (found) foundCount++;
    });
    
    console.log(`\nResultado: ${foundCount}/7 critérios encontrados`);
    
    if (foundCount < 4) {
      console.log('\n⚠️  A resposta parece genérica ou incompleta.');
      console.log('O agente pode não ter aprendido adequadamente sobre validação no Strapi.');
    } else {
      console.log('\n✅ A resposta parece adequada e específica sobre Strapi!');
    }
    
    // Verificar tamanho da resposta
    if (response.length < 200) {
      console.log('\n⚠️  Resposta muito curta. O agente pode precisar de mais conhecimento.');
    }
  }
});