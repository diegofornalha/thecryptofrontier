const { exec } = require('child_process');

// Comando para testar o strapi-specialist
const testCommand = `docker exec strapi-specialist sh -c 'cd /app && npx ts-node -e "
import { StrapiSpecialistAgent } from \\"./src/agents/strapi-specialist-agent\\";

async function test() {
  try {
    const agent = new StrapiSpecialistAgent();
    
    // Criar mensagem no formato correto com tipo explícito
    const message = {
      role: \\"user\\" as const,
      content: \\"Como evitar erros de validação ao enviar dados para o Strapi? Me dê exemplos práticos de tratamento de erros com TypeScript.\\",
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
"' 2>&1`;

console.log('🧪 Testando conhecimento do strapi-specialist sobre validação...\n');

exec(testCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
  // Filtrar apenas erros reais (não warnings)
  const realErrors = stdout.split('\n').filter(line => 
    line.includes('error') && 
    !line.includes('npm warn') && 
    !line.includes('ts-node')
  );
  
  if (realErrors.length > 0 && !stdout.includes('RESPOSTA DO AGENTE')) {
    console.error('❌ Erro ao executar:', realErrors.join('\n'));
    return;
  }
  
  // Extrair apenas a resposta do agente
  const startMarker = '=== RESPOSTA DO AGENTE ===';
  const endMarker = '=== FIM DA RESPOSTA ===';
  const startIndex = stdout.indexOf(startMarker);
  const endIndex = stdout.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const response = stdout.substring(startIndex + startMarker.length, endIndex).trim();
    
    console.log('📝 Resposta do Agente:');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    
    console.log('\n📊 ANÁLISE DA RESPOSTA:');
    console.log('─'.repeat(60));
    
    const checkpoints = {
      '1. Validação antes de enviar': response.includes('validação') || response.includes('validar') || response.includes('Validação'),
      '2. Tratamento de erros': response.includes('erro') || response.includes('error') || response.includes('catch') || response.includes('try'),
      '3. Exemplos de código': response.includes('```') || response.includes('typescript') || response.includes('javascript'),
      '4. Campos obrigatórios': response.includes('obrigatório') || response.includes('required') || response.includes('campo'),
      '5. Tipos de dados': response.includes('tipo') || response.includes('type') || response.includes('string') || response.includes('number'),
      '6. Códigos HTTP específicos': response.includes('400') || response.includes('422') || response.includes('ValidationError'),
      '7. Menção ao Strapi': response.includes('Strapi') || response.includes('strapi') || response.includes('API')
    };
    
    let foundCount = 0;
    Object.entries(checkpoints).forEach(([check, found]) => {
      console.log(`${check}: ${found ? '✅' : '❌'}`);
      if (found) foundCount++;
    });
    
    console.log('─'.repeat(60));
    console.log(`\n📈 Resultado: ${foundCount}/7 critérios encontrados`);
    
    if (foundCount >= 5) {
      console.log('✅ Excelente! A resposta é específica e detalhada sobre Strapi.');
    } else if (foundCount >= 3) {
      console.log('⚠️  Resposta razoável, mas poderia ser mais específica.');
    } else {
      console.log('❌ Resposta genérica. O agente precisa aprender mais sobre Strapi.');
    }
    
    // Verificar tamanho da resposta
    console.log(`\n📏 Tamanho da resposta: ${response.length} caracteres`);
    if (response.length < 300) {
      console.log('⚠️  Resposta muito curta. Pode indicar falta de conhecimento específico.');
    } else if (response.length > 1500) {
      console.log('✅ Resposta detalhada e completa!');
    } else {
      console.log('✅ Tamanho adequado da resposta.');
    }
    
    // Verificar se há código TypeScript
    if (response.includes('interface') || response.includes('type') || response.includes(': string') || response.includes(': number')) {
      console.log('🎯 Detectado código TypeScript na resposta!');
    }
    
  } else {
    console.log('❌ Não foi possível extrair a resposta do agente.');
    console.log('Output completo:', stdout);
  }
});