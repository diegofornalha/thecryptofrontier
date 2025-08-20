#!/usr/bin/env node
/**
 * Auto-Commit Agent - Versão Docker com Mensagens Inteligentes
 * Monitora arquivos e faz commit + push com mensagens Conventional Commits
 * Configurável via variáveis de ambiente
 */
import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { AgentType } from '../core/agent-types';
import { logStart, logEnd } from './agent-logger';
const run = promisify(exec);
let timer;
// Configurações via ambiente
const COMMIT_INTERVAL = parseInt(process.env.COMMIT_INTERVAL || '3') * 1000;
const AUTO_PUSH = process.env.AUTO_PUSH !== 'false'; // true por padrão
const WATCH_PATH = process.env.WATCH_PATH || process.cwd();
const USE_SMART_COMMITS = process.env.USE_SMART_COMMITS !== 'false'; // true por padrão
console.log('🐳 Auto-Commit Agent (Docker Version)');
console.log(`📁 Monitorando: ${WATCH_PATH}`);
console.log(`⏱️  Intervalo: ${COMMIT_INTERVAL / 1000} segundos`);
console.log(`🚀 Auto-push: ${AUTO_PUSH}`);
console.log(`🧠 Commits inteligentes: ${USE_SMART_COMMITS}`);
console.log('');
/**
 * Analisa mudanças e determina o tipo de commit
 */
async function analyzeChanges() {
    const { stdout } = await run('git status --porcelain');
    const lines = stdout.trim().split('\n').filter(Boolean);
    const changes = lines.map(line => ({
        status: line.substring(0, 2).trim(),
        path: line.substring(3)
    }));
    // Análise por tipo de arquivo e mudança
    const hasNewFeatures = changes.some(c => c.status === 'A' &&
        (c.path.includes('/src/') || c.path.includes('/components/') || c.path.includes('/features/')));
    const hasTests = changes.some(c => c.path.includes('.test.') || c.path.includes('.spec.') || c.path.includes('__tests__'));
    const hasDocs = changes.some(c => c.path.endsWith('.md') || c.path.includes('/docs/'));
    const hasConfig = changes.some(c => c.path.includes('package.json') ||
        c.path.includes('tsconfig.json') ||
        c.path.includes('.json') ||
        c.path.includes('.yml') ||
        c.path.includes('.yaml') ||
        c.path.includes('Dockerfile') ||
        c.path.includes('docker-compose'));
    const hasStyles = changes.some(c => c.path.endsWith('.css') || c.path.endsWith('.scss') || c.path.endsWith('.less'));
    const hasFixes = changes.some(c => c.status === 'M' && (c.path.includes('/src/') || c.path.includes('.ts') || c.path.includes('.js')));
    // Determinar tipo e mensagem
    let type = 'chore';
    let message = '';
    if (hasNewFeatures) {
        type = 'feat';
        const newFiles = changes.filter(c => c.status === 'A').map(c => path.basename(c.path, path.extname(c.path)));
        message = `adicionar ${newFiles.slice(0, 3).join(', ')}${newFiles.length > 3 ? ' e mais' : ''}`;
    }
    else if (hasTests) {
        type = 'test';
        message = 'atualizar testes';
    }
    else if (hasDocs) {
        type = 'docs';
        const docFiles = changes.filter(c => c.path.endsWith('.md')).map(c => path.basename(c.path, '.md'));
        message = `atualizar ${docFiles.slice(0, 2).join(' e ')}${docFiles.length > 2 ? ' e outros' : ''}`;
    }
    else if (hasConfig) {
        type = 'build';
        message = 'atualizar configurações';
    }
    else if (hasStyles) {
        type = 'style';
        message = 'ajustar estilos';
    }
    else if (hasFixes) {
        type = 'fix';
        const modifiedFiles = changes.filter(c => c.status === 'M').map(c => path.basename(c.path, path.extname(c.path)));
        message = `corrigir ${modifiedFiles.slice(0, 2).join(' e ')}${modifiedFiles.length > 2 ? ' e outros' : ''}`;
    }
    else {
        // Análise genérica
        const actions = [];
        const added = changes.filter(c => c.status === 'A').length;
        const modified = changes.filter(c => c.status === 'M').length;
        const deleted = changes.filter(c => c.status === 'D').length;
        if (added > 0)
            actions.push(`${added} arquivo${added > 1 ? 's' : ''} adicionado${added > 1 ? 's' : ''}`);
        if (modified > 0)
            actions.push(`${modified} arquivo${modified > 1 ? 's' : ''} modificado${modified > 1 ? 's' : ''}`);
        if (deleted > 0)
            actions.push(`${deleted} arquivo${deleted > 1 ? 's' : ''} removido${deleted > 1 ? 's' : ''}`);
        message = actions.join(', ');
    }
    return { type, message };
}
// Inicia monitoramento
const watcher = chokidar.watch(WATCH_PATH, {
    ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.DS_Store'],
    persistent: true,
    ignoreInitial: true,
    cwd: WATCH_PATH
});
// Processa mudanças
async function commit() {
    const taskId = `commit-${Date.now()}`;
    try {
        // Mudar para o diretório monitorado
        process.chdir(WATCH_PATH);
        const { stdout } = await run('git status --porcelain');
        if (!stdout) {
            console.log('📋 Nenhuma mudança detectada');
            return;
        }
        console.log('🔄 Mudanças detectadas, fazendo commit...');
        // Registrar início do commit
        await logStart('Auto Commit Agent', AgentType.IMPLEMENTER, taskId, 'Commit automático de mudanças', {
            taskType: 'auto-commit',
            complexity: 'simple',
            watchPath: WATCH_PATH,
            useSmartCommits: USE_SMART_COMMITS
        });
        await run('git add .');
        // Gerar mensagem inteligente ou usar padrão
        let commitMessage;
        if (USE_SMART_COMMITS) {
            const { type, message } = await analyzeChanges();
            commitMessage = `${type}: ${message}`;
        }
        else {
            commitMessage = `Auto-commit: ${new Date().toLocaleString('pt-BR')}`;
        }
        await run(`git commit -m "${commitMessage}"`);
        console.log(`✅ Commit realizado: ${commitMessage}`);
        let pushSuccess = false;
        if (AUTO_PUSH) {
            try {
                await run('git push');
                console.log('⬆️  Push realizado com sucesso!');
                pushSuccess = true;
            }
            catch (pushError) {
                console.warn('⚠️  Erro no push, tentando com -u origin main...');
                try {
                    await run('git push -u origin main');
                    console.log('⬆️  Push realizado com -u origin main!');
                    pushSuccess = true;
                }
                catch (e) {
                    console.error('❌ Erro no push:', e.message);
                }
            }
        }
        // Registrar sucesso do commit
        await logEnd('Auto Commit Agent', taskId, 'completed', undefined, {
            commitMessage,
            filesChanged: stdout.trim().split('\n').length,
            pushed: pushSuccess
        });
    }
    catch (e) {
        console.error('❌ Erro:', e.message);
        // Registrar erro
        await logEnd('Auto Commit Agent', taskId, 'error', e.message);
    }
}
// Monitora mudanças
watcher.on('all', (event, path) => {
    console.log(`📝 ${event}: ${path}`);
    clearTimeout(timer);
    timer = setTimeout(commit, COMMIT_INTERVAL);
});
watcher.on('ready', () => {
    console.log('✅ Monitoramento iniciado!');
    console.log('🤖 Commits inteligentes no padrão Conventional Commits');
    console.log('');
});
// Para com Ctrl+C
process.on('SIGINT', () => {
    watcher.close();
    console.log('\n👋 Auto-commit parado!');
    process.exit(0);
});
// Erros não tratados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erro não tratado:', reason);
});
