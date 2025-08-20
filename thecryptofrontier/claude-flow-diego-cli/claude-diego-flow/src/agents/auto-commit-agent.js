/**
 * Agente de Auto-Commit + Push
 * Monitora mudanças no diretório e faz commits + push automáticos
 */
import * as path from 'path';
import * as chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
/**
 * Agente de Auto-Commit com Push Automático
 */
export class AutoCommitAgent {
    constructor(watchPath = process.cwd()) {
        this.pendingChanges = new Set();
        this.watchPath = watchPath;
        this.initialize();
    }
    async initialize() {
        // Verificar se está em um repositório git
        try {
            await execAsync('git rev-parse --git-dir');
        }
        catch (_a) {
            console.error('❌ Erro: Este diretório não é um repositório git!');
            console.log('💡 Execute "git init" primeiro');
            return;
        }
        // Verificar se tem remote configurado
        try {
            const { stdout: remotes } = await execAsync('git remote');
            if (!remotes.trim()) {
                console.warn('⚠️  Aviso: Nenhum remote configurado');
                console.log('💡 Configure com: git remote add origin <url>');
            }
        }
        catch (error) {
            console.warn('⚠️  Não foi possível verificar remotes');
        }
        this.setupWatcher();
    }
    /**
     * Configura o observador de arquivos
     */
    setupWatcher() {
        // Ignora diretórios comuns que não devem ser monitorados
        const ignored = [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**',
            '**/*.log',
            '**/.DS_Store'
        ];
        this.watcher = chokidar.watch(this.watchPath, {
            ignored,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 1000,
                pollInterval: 100
            }
        });
        // Eventos de mudança
        this.watcher
            .on('add', (path) => this.handleFileChange('added', path))
            .on('change', (path) => this.handleFileChange('modified', path))
            .on('unlink', (path) => this.handleFileChange('deleted', path));
        console.log(`🔍 Monitorando mudanças em: ${this.watchPath}`);
        console.log(`🤖 Auto-commit + push ATIVADO!`);
        console.log(`⏱️  Commits automáticos após 3 segundos de inatividade`);
        console.log(`⏹️  Pressione Ctrl+C para parar\n`);
    }
    /**
     * Lida com mudanças de arquivos
     */
    handleFileChange(action, filePath) {
        this.pendingChanges.add(`${action}: ${filePath}`);
        // Debounce para agrupar mudanças próximas
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.processChanges();
        }, 3000); // Aguarda 3 segundos de inatividade
    }
    /**
     * Processa as mudanças acumuladas
     */
    async processChanges() {
        if (this.pendingChanges.size === 0)
            return;
        console.log(`\n📝 Processando ${this.pendingChanges.size} mudanças...`);
        try {
            // 1. Verificar status do git
            const { stdout: status } = await execAsync('git status --porcelain');
            if (!status.trim()) {
                console.log('✅ Nada para commitar');
                this.pendingChanges.clear();
                return;
            }
            // 2. Gerar mensagem de commit
            const changes = Array.from(this.pendingChanges);
            const message = this.generateCommitMessage(changes);
            console.log(`💬 Mensagem: ${message}`);
            console.log(`📋 Mudanças:`);
            changes.forEach(change => console.log(`  - ${change}`));
            // 3. Git add
            console.log(`\n🔄 Executando git add...`);
            await execAsync('git add .');
            // 4. Git commit
            console.log(`📝 Fazendo commit...`);
            await execAsync(`git commit -m "${message}"`);
            console.log(`✅ Commit realizado!`);
            // 5. Git push
            console.log(`🚀 Fazendo push...`);
            try {
                await execAsync('git push');
                console.log(`✅ Push realizado com sucesso!`);
            }
            catch (pushError) {
                if (pushError.message.includes('no upstream branch')) {
                    console.log(`⚠️  Criando branch upstream...`);
                    const { stdout: branch } = await execAsync('git branch --show-current');
                    await execAsync(`git push -u origin ${branch.trim()}`);
                    console.log(`✅ Push realizado com upstream!`);
                }
                else {
                    console.warn(`⚠️  Push falhou:`, pushError.message);
                }
            }
            this.pendingChanges.clear();
            console.log(`\n✨ Auto-commit + push concluído!\n`);
        }
        catch (error) {
            console.error('❌ Erro:', error.message);
            this.pendingChanges.clear();
        }
    }
    /**
     * Gera mensagem de commit inteligente baseada nas mudanças
     */
    generateCommitMessage(changes) {
        const fileTypes = new Set();
        const actions = new Set();
        changes.forEach(change => {
            const [action, filePath] = change.split(': ');
            actions.add(action);
            const ext = path.extname(filePath);
            if (ext)
                fileTypes.add(ext);
        });
        // Determinar tipo principal de mudança
        let actionVerb = 'Update';
        if (actions.has('added') && !actions.has('modified')) {
            actionVerb = 'Add';
        }
        else if (actions.has('deleted') && actions.size === 1) {
            actionVerb = 'Remove';
        }
        else if (actions.has('modified') && actions.size === 1) {
            actionVerb = 'Update';
        }
        else {
            actionVerb = 'Refactor';
        }
        // Determinar escopo baseado nos tipos de arquivo
        let scope = 'files';
        if (fileTypes.has('.ts') || fileTypes.has('.js')) {
            scope = 'code';
        }
        else if (fileTypes.has('.md')) {
            scope = 'docs';
        }
        else if (fileTypes.has('.json')) {
            scope = 'config';
        }
        else if (fileTypes.has('.css') || fileTypes.has('.scss')) {
            scope = 'styles';
        }
        // Gerar mensagem com timestamp
        const filesCount = changes.length;
        const timestamp = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const message = `[Auto] ${actionVerb} ${scope}: ${filesCount} file${filesCount > 1 ? 's' : ''} at ${timestamp}`;
        return message;
    }
    /**
     * Para o monitoramento
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            console.log('🛑 Monitoramento parado');
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}
/**
 * Factory function para criar instância do agente
 */
export function createAutoCommitAgent(watchPath) {
    return new AutoCommitAgent(watchPath);
}
/**
 * Função para iniciar o agente diretamente
 */
export async function startAutoCommitAgent(watchPath) {
    console.log('🚀 Iniciando Auto-Commit + Push Agent...\n');
    const agent = createAutoCommitAgent(watchPath);
    // Manter o processo rodando
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Parando auto-commit...');
        agent.stop();
        process.exit(0);
    });
    // Prevenir o processo de finalizar
    setInterval(() => { }, 1000);
}
