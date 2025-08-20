#!/usr/bin/env npx tsx
/**
 * Monitor de chamadas MCP em tempo real
 * Intercepta e registra todas as chamadas de ferramentas MCP
 */
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
// Configuração
const LOG_DIR = path.join(process.cwd(), 'mcp-monitor-logs');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = path.join(LOG_DIR, `mcp-calls-${TIMESTAMP}.log`);
// Criar diretório de logs
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
// Stream de log
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
function log(type, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        message,
        data
    };
    // Log no console com cores
    const color = type === 'CALL' ? '\x1b[36m' : // Cyan
        type === 'RESULT' ? '\x1b[32m' : // Green
            type === 'ERROR' ? '\x1b[31m' : // Red
                '\x1b[37m'; // White
    console.log(`${color}[${timestamp}] [${type}] ${message}\x1b[0m`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    // Log no arquivo
    logStream.write(JSON.stringify(logEntry) + '\n');
}
// Função para monitorar processo MCP
async function monitorMCPServer() {
    log('INFO', '=== Iniciando Monitor de Chamadas MCP ===');
    log('INFO', `Logs salvos em: ${LOG_FILE}`);
    // Iniciar servidor MCP com logging aumentado
    const mcpServer = spawn('node', [path.join(__dirname, 'src/index.js')], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
            ...process.env,
            LOG_LEVEL: 'DEBUG',
            LOG_CONSOLE: 'true',
            LOG_FILE: 'true',
            LOG_DIR: LOG_DIR
        }
    });
    // Interceptar stdin (requisições)
    mcpServer.stdin.on('data', (data) => {
        try {
            const messages = data.toString().trim().split('\n');
            for (const message of messages) {
                if (message) {
                    const request = JSON.parse(message);
                    if (request.method === 'tools/call') {
                        log('CALL', `Ferramenta chamada: ${request.params.name}`, {
                            tool: request.params.name,
                            args: request.params.arguments,
                            id: request.id
                        });
                    }
                }
            }
        }
        catch (e) {
            // Ignorar erros de parse
        }
    });
    // Interceptar stdout (respostas)
    let outputBuffer = '';
    mcpServer.stdout.on('data', (data) => {
        var _a;
        outputBuffer += data.toString();
        // Tentar processar linhas completas
        const lines = outputBuffer.split('\n');
        outputBuffer = lines.pop() || '';
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    if (response.result) {
                        log('RESULT', `Resposta recebida para ID: ${response.id}`, {
                            id: response.id,
                            hasContent: !!response.result.content,
                            contentLength: (_a = response.result.content) === null || _a === void 0 ? void 0 : _a.length
                        });
                    }
                }
                catch (e) {
                    // Log de saída não-JSON
                    if (line.includes('Tool') || line.includes('tool')) {
                        log('DEBUG', line);
                    }
                }
            }
        }
    });
    // Interceptar stderr (logs e erros)
    mcpServer.stderr.on('data', (data) => {
        const message = data.toString();
        // Filtrar mensagens relevantes
        if (message.includes('[DEBUG]') && message.includes('Tool')) {
            log('DEBUG', message.trim());
        }
        else if (message.includes('Executando ferramenta')) {
            const match = message.match(/Executando ferramenta ([\w_]+)/);
            if (match) {
                log('EXEC', `Executando: ${match[1]}`);
            }
        }
        else if (message.includes('ERROR') || message.includes('Error')) {
            log('ERROR', message.trim());
        }
    });
    // Handlers de eventos
    mcpServer.on('error', (error) => {
        log('ERROR', 'Erro no processo MCP', error);
    });
    mcpServer.on('close', (code) => {
        log('INFO', `Servidor MCP encerrado com código: ${code}`);
        logStream.end();
    });
    // Simular algumas chamadas de teste após 2 segundos
    setTimeout(() => {
        log('INFO', 'Iniciando chamadas de teste...');
        // Teste 1: Guardian Status
        const request1 = {
            jsonrpc: '2.0',
            id: 'test-1',
            method: 'tools/call',
            params: {
                name: 'mcp__diego-tools__guardian_status',
                arguments: {}
            }
        };
        mcpServer.stdin.write(JSON.stringify(request1) + '\n');
        // Teste 2: Listar Agentes
        setTimeout(() => {
            const request2 = {
                jsonrpc: '2.0',
                id: 'test-2',
                method: 'tools/call',
                params: {
                    name: 'mcp__diego-tools__agents_list',
                    arguments: {}
                }
            };
            mcpServer.stdin.write(JSON.stringify(request2) + '\n');
        }, 1000);
    }, 2000);
    // Manter processo rodando
    process.on('SIGINT', () => {
        log('INFO', 'Encerrando monitor...');
        mcpServer.kill();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        log('INFO', 'Encerrando monitor...');
        mcpServer.kill();
        process.exit(0);
    });
}
// Análise de logs existentes
async function analyzeLogs() {
    var _a;
    console.log('\n=== Análise de Logs Existentes ===');
    const logFiles = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));
    if (logFiles.length === 0) {
        console.log('Nenhum log encontrado.');
        return;
    }
    let totalCalls = 0;
    const toolCounts = new Map();
    for (const file of logFiles) {
        const content = fs.readFileSync(path.join(LOG_DIR, file), 'utf-8');
        const lines = content.trim().split('\n');
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                if (entry.type === 'CALL') {
                    totalCalls++;
                    const tool = ((_a = entry.data) === null || _a === void 0 ? void 0 : _a.tool) || 'unknown';
                    toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);
                }
            }
            catch (e) {
                // Ignorar linhas inválidas
            }
        }
    }
    console.log(`\nTotal de chamadas MCP: ${totalCalls}`);
    console.log('\nFerramentas mais chamadas:');
    const sortedTools = Array.from(toolCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    for (const [tool, count] of sortedTools) {
        console.log(`  ${tool}: ${count} chamadas`);
    }
}
// Menu principal
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--analyze')) {
        await analyzeLogs();
    }
    else {
        console.log('Iniciando monitor de chamadas MCP...');
        console.log('Use Ctrl+C para parar');
        console.log(`Logs serão salvos em: ${LOG_FILE}`);
        await monitorMCPServer();
    }
}
main().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
});
