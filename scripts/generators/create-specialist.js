#!/usr/bin/env npx tsx
/**
 * Script para criar novo agente especialista
 *
 * Este script automatiza a criação de novos agentes especializados,
 * copiando o template apropriado e integrando ao Guardian Orchestrator.
 *
 * Uso:
 *   npx tsx scripts/create-specialist.ts <nome-do-especialista> [--simple]
 *
 * Exemplos:
 *   npx tsx scripts/create-specialist.ts performance
 *   npx tsx scripts/create-specialist.ts database --simple
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};
// Configurações
const PROJECT_ROOT = process.env.PROJECT_ROOT || '/home/strapi/thecryptofrontier';
const AGENTS_DIR = path.join(PROJECT_ROOT, 'claude-flow-diego/claude-diego-flow/src/agents');
const TEMPLATE_FILE = path.join(AGENTS_DIR, 'template-agents.ts');
const GUARDIAN_FILE = path.join(AGENTS_DIR, 'guardian-orchestrator-mcp.ts');
const TESTS_DIR = path.join(PROJECT_ROOT, 'claude-flow-diego/claude-diego-flow/tests');
/**
 * Converte nome para diferentes formatos
 */
function formatName(name) {
    // Remove caracteres especiais e normaliza
    const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    // PascalCase para nome da classe
    const className = normalized
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'SpecialistAgent';
    // kebab-case para ID e arquivo
    const id = normalized + '-specialist';
    const fileName = id + '-agent.ts';
    // Nome legível
    const displayName = normalized
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') + ' Specialist';
    return {
        name: displayName,
        className,
        fileName,
        id,
        isSimple: false
    };
}
/**
 * Extrai template do arquivo
 */
async function extractTemplate(isSimple) {
    var _a, _b;
    const content = await fs.readFile(TEMPLATE_FILE, 'utf-8');
    if (isSimple) {
        // Extrair SimpleSpecialistTemplate
        const startMarker = 'export class SimpleSpecialistTemplate';
        const startIndex = content.indexOf(startMarker);
        if (startIndex === -1) {
            throw new Error('Template simples não encontrado');
        }
        // Encontrar o fechamento da classe
        let braceCount = 0;
        let inClass = false;
        let endIndex = startIndex;
        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                inClass = true;
            }
            else if (content[i] === '}') {
                braceCount--;
                if (inClass && braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        // Incluir imports necessários
        const imports = `import { Agent } from '../core/agent';\nimport { Message } from '../types';\n\n`;
        const classContent = content.substring(startIndex, endIndex);
        return imports + classContent;
    }
    else {
        // Extrair SpecialistTemplateAgent
        const match = content.match(/export class SpecialistTemplateAgent[\s\S]*?(?=\n}\n)/);
        if (!match) {
            throw new Error('Template completo não encontrado');
        }
        // Incluir imports e tipos necessários
        const imports = ((_a = content.match(/import[\s\S]*?(?=\n\/\*\*)/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
        const types = ((_b = content.match(/interface RequestAnalysis[\s\S]*?type Priority[^\n]*/)) === null || _b === void 0 ? void 0 : _b[0]) || '';
        return `${imports}\n\n${match[0]}\n}\n\n${types}`;
    }
}
/**
 * Personaliza template para o novo especialista
 */
function customizeTemplate(template, config) {
    let customized = template;
    // Substituir nome da classe
    if (config.isSimple) {
        customized = customized.replace('SimpleSpecialistTemplate', config.className);
        customized = customized.replace('simple-specialist', config.id);
        customized = customized.replace('Simple Specialist', config.name);
        customized = customized.replace('Template simples para especialistas sem MCP', `Agente especialista em ${config.name.toLowerCase()}`);
    }
    else {
        customized = customized.replace('SpecialistTemplateAgent', config.className);
        customized = customized.replace('specialist-template', config.id);
        customized = customized.replace('Specialist Template Agent', config.name);
        customized = customized.replace('Template de agente especialista com integração MCP completa', `Agente especialista em ${config.name.toLowerCase()} com integração MCP`);
    }
    // Adicionar comentário de header
    const header = `/**
 * ${config.name} Agent
 * 
 * Agente especializado em ${config.name.toLowerCase()}
 * Criado automaticamente em ${new Date().toLocaleDateString('pt-BR')}
 * 
 * TODO: Implementar lógica específica do domínio
 */

`;
    return header + customized;
}
/**
 * Cria arquivo do novo especialista
 */
async function createSpecialistFile(config, template) {
    const filePath = path.join(AGENTS_DIR, config.fileName);
    // Verificar se já existe
    try {
        await fs.access(filePath);
        throw new Error(`Arquivo ${config.fileName} já existe!`);
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
    // Criar arquivo
    await fs.writeFile(filePath, template, 'utf-8');
    console.log(`${colors.green}✅ Arquivo criado: ${config.fileName}${colors.reset}`);
}
/**
 * Adiciona import ao Guardian Orchestrator
 */
async function addImportToGuardian(config) {
    let content = await fs.readFile(GUARDIAN_FILE, 'utf-8');
    // Adicionar import após últimos imports de agentes
    const importLine = `import { ${config.className} } from './${config.fileName.replace('.ts', '')}';`;
    // Encontrar local para inserir (após último import de specialist)
    const lastImportMatch = content.match(/import \{ \w+SpecialistAgent \} from[^;]+;/g);
    if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) + '\n' + importLine + content.slice(insertPos);
    }
    await fs.writeFile(GUARDIAN_FILE, content, 'utf-8');
    console.log(`${colors.green}✅ Import adicionado ao Guardian${colors.reset}`);
}
/**
 * Adiciona especialista ao método initialize do Guardian
 */
async function addToGuardianInitialize(config) {
    let content = await fs.readFile(GUARDIAN_FILE, 'utf-8');
    // Criar instância do agente
    const varName = config.name.toLowerCase().replace(/\s+/g, '').replace('specialist', '') + 'Agent';
    const instantiation = `        const ${varName} = new ${config.className}();`;
    // Encontrar local para inserir (após última instanciação)
    const lastInstMatch = content.match(/const \w+Agent = new \w+SpecialistAgent\(\);/g);
    if (lastInstMatch) {
        const lastInst = lastInstMatch[lastInstMatch.length - 1];
        const insertPos = content.indexOf(lastInst) + lastInst.length;
        content = content.slice(0, insertPos) + '\n' + instantiation + content.slice(insertPos);
    }
    // Registrar especialista
    const registration = `        this.specialists.set('${varName.replace('Agent', '')}', ${varName});`;
    // Encontrar local para inserir (após último set)
    const lastSetMatch = content.match(/this\.specialists\.set\('[^']+', \w+\);/g);
    if (lastSetMatch) {
        const lastSet = lastSetMatch[lastSetMatch.length - 1];
        const insertPos = content.indexOf(lastSet) + lastSet.length;
        content = content.slice(0, insertPos) + '\n' + registration + content.slice(insertPos);
    }
    await fs.writeFile(GUARDIAN_FILE, content, 'utf-8');
    console.log(`${colors.green}✅ Especialista adicionado ao initialize()${colors.reset}`);
}
/**
 * Adiciona lógica de roteamento ao analyzeRequest
 */
async function addToAnalyzeRequest(config) {
    let content = await fs.readFile(GUARDIAN_FILE, 'utf-8');
    const specialistKey = config.name.toLowerCase().replace(/\s+/g, '').replace('specialist', '');
    // Criar condição de roteamento
    const routingCondition = `
        // ${config.name} routing
        if (lowerRequest.includes('${specialistKey}')) {
            specialists.push('${specialistKey}');
        }`;
    // Encontrar local para inserir (antes do comentário sobre cleanup)
    const insertMarker = '// Adicionar cleanup specialist quando relevante';
    const insertPos = content.indexOf(insertMarker);
    if (insertPos > -1) {
        content = content.slice(0, insertPos) + routingCondition + '\n        \n        ' + content.slice(insertPos);
        await fs.writeFile(GUARDIAN_FILE, content, 'utf-8');
        console.log(`${colors.green}✅ Roteamento adicionado ao analyzeRequest()${colors.reset}`);
    }
    else {
        console.log(`${colors.yellow}⚠️ Não foi possível adicionar roteamento automaticamente${colors.reset}`);
        console.log(`${colors.cyan}Por favor, adicione manualmente ao método analyzeRequest()${colors.reset}`);
    }
}
/**
 * Cria teste básico para o especialista
 */
async function createBasicTest(config) {
    const testContent = `/**
 * Testes para ${config.name}
 */

import { ${config.className} } from '../src/agents/${config.fileName.replace('.ts', '')}';
import { Message } from '../src/types';

describe('${config.name}', () => {
    let agent: ${config.className};
    
    beforeEach(async () => {
        agent = new ${config.className}();
        await agent.initialize();
    });
    
    afterEach(async () => {
        await agent.shutdown();
    });
    
    test('deve processar mensagem básica', async () => {
        const message: Message = {
            role: 'user',
            content: 'Teste de análise ${config.name.toLowerCase()}'
        };
        
        const response = await agent.processMessage(message);
        
        expect(response.role).toBe('assistant');
        expect(response.content).toBeTruthy();
        expect(response.metadata?.agent).toBe('${config.id}');
    });
    
    test('deve identificar tarefas corretamente', async () => {
        const message: Message = {
            role: 'user',
            content: 'Analisar e otimizar ${config.name.toLowerCase()}'
        };
        
        const response = await agent.processMessage(message);
        
        expect(response.metadata?.tasksExecuted).toBeGreaterThan(0);
    });
});
`;
    const testFile = path.join(TESTS_DIR, `${config.id}.test.ts`);
    // Criar diretório de testes se não existir
    await fs.mkdir(TESTS_DIR, { recursive: true });
    await fs.writeFile(testFile, testContent, 'utf-8');
    console.log(`${colors.green}✅ Teste criado: ${path.basename(testFile)}${colors.reset}`);
}
/**
 * Função principal
 */
async function main() {
    console.log(`${colors.cyan}🚀 Criador de Agentes Especialistas${colors.reset}\n`);
    // Processar argumentos
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log('Uso: npx tsx scripts/create-specialist.ts <nome> [--simple]');
        console.log('\nExemplos:');
        console.log('  npx tsx scripts/create-specialist.ts performance');
        console.log('  npx tsx scripts/create-specialist.ts database --simple');
        console.log('\nOpções:');
        console.log('  --simple    Criar especialista simples (sem MCP)');
        process.exit(0);
    }
    const name = args[0];
    const isSimple = args.includes('--simple');
    try {
        // Preparar configuração
        const config = formatName(name);
        config.isSimple = isSimple;
        console.log(`${colors.blue}📋 Configuração:${colors.reset}`);
        console.log(`  Nome: ${config.name}`);
        console.log(`  Classe: ${config.className}`);
        console.log(`  Arquivo: ${config.fileName}`);
        console.log(`  ID: ${config.id}`);
        console.log(`  Tipo: ${isSimple ? 'Simples' : 'Completo (com MCP)'}`);
        console.log();
        // Extrair template
        console.log(`${colors.yellow}📄 Extraindo template...${colors.reset}`);
        const template = await extractTemplate(isSimple);
        // Personalizar template
        console.log(`${colors.yellow}✏️ Personalizando template...${colors.reset}`);
        const customized = customizeTemplate(template, config);
        // Criar arquivo
        await createSpecialistFile(config, customized);
        // Integrar ao Guardian
        console.log(`${colors.yellow}🔗 Integrando ao Guardian...${colors.reset}`);
        await addImportToGuardian(config);
        await addToGuardianInitialize(config);
        await addToAnalyzeRequest(config);
        // Criar teste
        console.log(`${colors.yellow}🧪 Criando teste básico...${colors.reset}`);
        await createBasicTest(config);
        // Formatar código
        console.log(`${colors.yellow}💅 Formatando código...${colors.reset}`);
        try {
            await execAsync(`cd ${PROJECT_ROOT} && npm run format`);
            console.log(`${colors.green}✅ Código formatado${colors.reset}`);
        }
        catch (error) {
            console.log(`${colors.yellow}⚠️ Não foi possível formatar automaticamente${colors.reset}`);
        }
        // Resumo final
        console.log(`\n${colors.green}✨ Especialista criado com sucesso!${colors.reset}\n`);
        console.log(`${colors.cyan}Próximos passos:${colors.reset}`);
        console.log(`1. Edite ${colors.yellow}${config.fileName}${colors.reset} para implementar a lógica específica`);
        console.log(`2. Atualize os métodos perform* com as funcionalidades do domínio`);
        console.log(`3. Ajuste as condições de roteamento no Guardian se necessário`);
        console.log(`4. Execute os testes: ${colors.yellow}npm test ${config.id}${colors.reset}`);
        console.log(`5. Documente as capacidades do novo especialista`);
        // Exemplo de uso
        console.log(`\n${colors.cyan}Exemplo de uso:${colors.reset}`);
        console.log(`npx tsx src/agents/guardian-orchestrator-mcp.ts "analisar ${name}"`);
    }
    catch (error) {
        console.error(`\n${colors.red}❌ Erro: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}
// Executar
if (require.main === module) {
    main().catch(console.error);
}
export { formatName, extractTemplate, customizeTemplate };
