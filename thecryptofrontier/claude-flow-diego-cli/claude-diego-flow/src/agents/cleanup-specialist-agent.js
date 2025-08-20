#!/usr/bin/env npx tsx
import { BaseAgent } from '../core/base-agent-simple';
import { FileSystemService } from '../services/file-system-service';
import { GitService } from '../services/git-service';
import { logStart, logEnd, logInfo, logError } from '../utils/agent-logger';
import { analyzeImports } from '../utils/import-analyzer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
export class CleanupSpecialistAgent extends BaseAgent {
    constructor() {
        super({
            id: 'cleanup-specialist',
            name: 'Cleanup Specialist',
            type: 'specialist',
            description: 'Especialista em limpeza e organização de código com integração MCP',
            version: '1.0.0',
            capabilities: CleanupSpecialistAgent.capabilities
        });
        this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
        this.fileSystem = new FileSystemService();
        this.git = new GitService();
    }
    async executeTask(task) {
        const startTime = Date.now();
        logStart(this.config.name, task);
        try {
            let result;
            switch (task.type) {
                case 'analyze':
                    result = await this.analyzeProject(task.input);
                    break;
                case 'cleanup':
                    result = await this.performCleanup(task.input);
                    break;
                case 'organize':
                    result = await this.organizeFiles(task.input);
                    break;
                default:
                    result = await this.analyzeProject({ dryRun: true });
            }
            const taskResult = {
                success: true,
                data: result,
                executionTime: Date.now() - startTime,
                agentId: this.config.id
            };
            logEnd(this.config.name, task, taskResult);
            return taskResult;
        }
        catch (error) {
            logError(this.config.name, task, error);
            return {
                success: false,
                error: error.message,
                executionTime: Date.now() - startTime,
                agentId: this.config.id
            };
        }
    }
    async analyzeProject(options = {}) {
        logInfo(this.config.name, 'Starting project cleanup analysis...');
        const report = {
            duplicateFiles: [],
            unusedDependencies: [],
            deadCode: [],
            emptyDirectories: [],
            tempFiles: [],
            largeFiles: [],
            totalSavings: 0,
            recommendations: []
        };
        // 1. Detectar arquivos duplicados
        report.duplicateFiles = await this.findDuplicateFiles(options);
        // 2. Encontrar dependências não utilizadas
        report.unusedDependencies = await this.findUnusedDependencies();
        // 3. Detectar código morto
        report.deadCode = await this.findDeadCode();
        // 4. Encontrar diretórios vazios
        report.emptyDirectories = await this.findEmptyDirectories();
        // 5. Identificar arquivos temporários
        report.tempFiles = await this.findTempFiles();
        // 6. Detectar arquivos grandes
        report.largeFiles = await this.findLargeFiles();
        // 7. Analisar organização de arquivos YML/Docker
        const dockerAnalysis = await this.analyzeDockerFiles();
        if (dockerAnalysis.recommendations.length > 0) {
            report.recommendations.push(...dockerAnalysis.recommendations);
        }
        // Calcular economia potencial
        report.totalSavings = this.calculateSavings(report);
        // Gerar recomendações
        report.recommendations = this.generateRecommendations(report);
        return report;
    }
    async findDuplicateFiles(options) {
        const fileHashes = new Map();
        const duplicates = [];
        const ignorePatterns = [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**'
        ];
        if (!options.includeNodeModules) {
            ignorePatterns.push('**/node_modules/**');
        }
        const files = await this.fileSystem.glob('**/*', {
            ignore: ignorePatterns,
            nodir: true
        });
        for (const file of files) {
            try {
                const content = await fs.readFile(file);
                const hash = crypto.createHash('md5').update(content).digest('hex');
                const stats = await fs.stat(file);
                if (!fileHashes.has(hash)) {
                    fileHashes.set(hash, []);
                }
                fileHashes.get(hash).push(file);
                // Se encontramos duplicatas
                if (fileHashes.get(hash).length === 2) {
                    duplicates.push({
                        hash,
                        files: fileHashes.get(hash),
                        size: stats.size
                    });
                }
                else if (fileHashes.get(hash).length > 2) {
                    // Atualizar entrada existente
                    const existing = duplicates.find(d => d.hash === hash);
                    if (existing) {
                        existing.files = fileHashes.get(hash);
                    }
                }
            }
            catch (error) {
                // Ignorar arquivos que não podem ser lidos
            }
        }
        return duplicates.filter(d => d.files.length > 1);
    }
    async findUnusedDependencies() {
        const unusedDeps = [];
        try {
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
            const dependencies = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };
            // Analisar imports em todos os arquivos
            const sourceFiles = await this.fileSystem.glob('**/*.{js,jsx,ts,tsx}', {
                ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
            });
            const usedPackages = new Set();
            for (const file of sourceFiles) {
                const imports = await analyzeImports(file);
                imports.forEach(imp => {
                    const packageName = imp.split('/')[0];
                    if (packageName.startsWith('@')) {
                        usedPackages.add(imp.split('/').slice(0, 2).join('/'));
                    }
                    else {
                        usedPackages.add(packageName);
                    }
                });
            }
            // Verificar quais dependências não são usadas
            for (const dep of Object.keys(dependencies)) {
                if (!usedPackages.has(dep) && !this.isEssentialDependency(dep)) {
                    unusedDeps.push(dep);
                }
            }
        }
        catch (error) {
            logError(this.config.name, null, error);
        }
        return unusedDeps;
    }
    isEssentialDependency(dep) {
        const essentials = [
            'react', 'react-dom', 'next', 'typescript', '@types/node',
            'eslint', 'prettier', 'husky', 'lint-staged', 'jest',
            '@types/react', 'tailwindcss', 'postcss', 'autoprefixer'
        ];
        return essentials.includes(dep);
    }
    async findDeadCode() {
        const deadCode = [];
        // Encontrar funções e componentes não utilizados
        const sourceFiles = await this.fileSystem.glob('**/*.{js,jsx,ts,tsx}', {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*']
        });
        // Análise simplificada - em produção, usar AST parser
        for (const file of sourceFiles) {
            const content = await fs.readFile(file, 'utf-8');
            // Detectar exports não utilizados (simplificado)
            const exportMatches = content.match(/export\s+(const|function|class)\s+(\w+)/g);
            if (exportMatches) {
                for (const match of exportMatches) {
                    const name = match.split(/\s+/).pop();
                    if (name && !(await this.isSymbolUsed(name, file))) {
                        deadCode.push(`${file}: ${name}`);
                    }
                }
            }
        }
        return deadCode;
    }
    async isSymbolUsed(symbol, excludeFile) {
        const files = await this.fileSystem.glob('**/*.{js,jsx,ts,tsx}', {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
        });
        for (const file of files) {
            if (file === excludeFile)
                continue;
            const content = await fs.readFile(file, 'utf-8');
            if (content.includes(symbol)) {
                return true;
            }
        }
        return false;
    }
    async findEmptyDirectories() {
        const emptyDirs = [];
        const checkDirectory = async (dir) => {
            try {
                const entries = await fs.readdir(dir);
                if (entries.length === 0) {
                    emptyDirs.push(dir);
                    return;
                }
                // Verificar subdiretórios
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry);
                    const stats = await fs.stat(fullPath);
                    if (stats.isDirectory() && !entry.startsWith('.')) {
                        await checkDirectory(fullPath);
                    }
                }
            }
            catch (error) {
                // Ignorar erros de acesso
            }
        };
        await checkDirectory(this.projectRoot);
        return emptyDirs;
    }
    async findTempFiles() {
        const tempPatterns = [
            '**/*.tmp',
            '**/*.temp',
            '**/*.bak',
            '**/*.backup',
            '**/*.swp',
            '**/.DS_Store',
            '**/Thumbs.db',
            '**/*.log',
            '**/*~',
            '**/#*#'
        ];
        const tempFiles = [];
        for (const pattern of tempPatterns) {
            const files = await this.fileSystem.glob(pattern, {
                ignore: ['**/node_modules/**', '**/.git/**']
            });
            tempFiles.push(...files);
        }
        return tempFiles;
    }
    async findLargeFiles(threshold = 10 * 1024 * 1024) {
        const largeFiles = [];
        const files = await this.fileSystem.glob('**/*', {
            ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
            nodir: true
        });
        for (const file of files) {
            try {
                const stats = await fs.stat(file);
                if (stats.size > threshold) {
                    largeFiles.push({
                        path: file,
                        size: stats.size
                    });
                }
            }
            catch (error) {
                // Ignorar arquivos inacessíveis
            }
        }
        return largeFiles.sort((a, b) => b.size - a.size);
    }
    calculateSavings(report) {
        let savings = 0;
        // Economia com arquivos duplicados
        for (const dup of report.duplicateFiles) {
            savings += dup.size * (dup.files.length - 1);
        }
        // Economia com arquivos temporários
        for (const temp of report.tempFiles) {
            try {
                const stats = fs.statSync(temp);
                savings += stats.size;
            }
            catch (_a) { }
        }
        // Economia com arquivos grandes
        for (const large of report.largeFiles) {
            // Assumir que arquivos grandes podem ser otimizados em 50%
            savings += large.size * 0.5;
        }
        return savings;
    }
    generateRecommendations(report) {
        const recommendations = [];
        if (report.duplicateFiles.length > 0) {
            recommendations.push(`Remover ${report.duplicateFiles.length} grupos de arquivos duplicados`);
        }
        if (report.unusedDependencies.length > 0) {
            recommendations.push(`Remover ${report.unusedDependencies.length} dependências não utilizadas`);
        }
        if (report.deadCode.length > 0) {
            recommendations.push(`Remover ${report.deadCode.length} símbolos de código morto`);
        }
        if (report.emptyDirectories.length > 0) {
            recommendations.push(`Remover ${report.emptyDirectories.length} diretórios vazios`);
        }
        if (report.tempFiles.length > 0) {
            recommendations.push(`Limpar ${report.tempFiles.length} arquivos temporários`);
        }
        if (report.largeFiles.length > 0) {
            recommendations.push(`Otimizar ${report.largeFiles.length} arquivos grandes`);
        }
        const savingsMB = (report.totalSavings / 1024 / 1024).toFixed(2);
        recommendations.push(`Economia potencial total: ${savingsMB} MB`);
        return recommendations;
    }
    async performCleanup(options = {}) {
        const report = await this.analyzeProject(options);
        if (options.dryRun) {
            return {
                ...report,
                message: 'Dry run completed. No files were modified.'
            };
        }
        const results = {
            removed: [],
            failed: [],
            summary: ''
        };
        // 1. Remover arquivos temporários
        for (const temp of report.tempFiles) {
            try {
                await fs.unlink(temp);
                results.removed.push(temp);
            }
            catch (error) {
                results.failed.push(temp);
            }
        }
        // 2. Remover diretórios vazios
        for (const dir of report.emptyDirectories) {
            try {
                await fs.rmdir(dir);
                results.removed.push(dir);
            }
            catch (error) {
                results.failed.push(dir);
            }
        }
        // 3. Remover duplicatas (manter apenas uma cópia)
        if (options.aggressive) {
            for (const dup of report.duplicateFiles) {
                // Manter o primeiro arquivo, remover os outros
                for (let i = 1; i < dup.files.length; i++) {
                    try {
                        await fs.unlink(dup.files[i]);
                        results.removed.push(dup.files[i]);
                    }
                    catch (error) {
                        results.failed.push(dup.files[i]);
                    }
                }
            }
        }
        results.summary = `Removed ${results.removed.length} files/directories. Failed: ${results.failed.length}`;
        return results;
    }
    async organizeFiles(input) {
        // Implementar organização de arquivos baseada em convenções
        const movedFiles = [];
        // Exemplo: mover documentação para pasta docs
        const docFiles = await this.fileSystem.glob('*.md', {
            ignore: ['node_modules/**', 'README.md', 'CLAUDE.md']
        });
        for (const file of docFiles) {
            const newPath = path.join('docs', path.basename(file));
            movedFiles.push({ from: file, to: newPath });
        }
        return {
            movedFiles,
            message: `Identified ${movedFiles.length} files to reorganize`
        };
    }
    async analyzeDockerFiles() {
        const recommendations = [];
        try {
            // Listar arquivos Docker/YML na raiz
            const rootFiles = await fs.readdir(this.projectRoot);
            const dockerFiles = rootFiles.filter(f => f.startsWith('docker-compose') && f.endsWith('.yml') ||
                f.startsWith('Dockerfile'));
            // Mapear arquivos por serviço
            const serviceFiles = new Map();
            for (const file of dockerFiles) {
                // Extrair nome do serviço
                let service = 'main';
                if (file.includes('frontend')) {
                    service = 'frontend';
                }
                else if (file.includes('backend') || file.includes('strapi')) {
                    service = 'backend';
                }
                else if (file.includes('guardian')) {
                    service = 'guardian';
                }
                else if (file.includes('mem0')) {
                    service = 'mem0';
                }
                else if (file.includes('puppeteer')) {
                    service = 'puppeteer';
                }
                if (!serviceFiles.has(service)) {
                    serviceFiles.set(service, []);
                }
                serviceFiles.get(service).push(file);
            }
            // Analisar arquivos do frontend
            const frontendFiles = serviceFiles.get('frontend') || [];
            if (frontendFiles.length > 0) {
                // Consultar com NextJS specialist se necessário
                logInfo(this.config.name, `Frontend Docker files detected: ${frontendFiles.join(', ')}`);
                // Verificar se estão organizados corretamente
                const hasCompose = frontendFiles.some(f => f.includes('docker-compose'));
                const hasDockerfile = frontendFiles.some(f => f.startsWith('Dockerfile'));
                if (hasCompose && hasDockerfile) {
                    // Arquivos frontend estão OK
                    logInfo(this.config.name, 'Frontend Docker setup appears properly configured');
                }
            }
            // Verificar se há muitos arquivos YML na raiz
            const ymlCount = dockerFiles.filter(f => f.endsWith('.yml')).length;
            if (ymlCount > 5) {
                recommendations.push(`Considere organizar os ${ymlCount} arquivos docker-compose.yml em uma pasta /docker para melhor organização`);
            }
            // Verificar duplicações suspeitas
            for (const [service, files] of serviceFiles) {
                if (files.length > 2 && service !== 'frontend') {
                    recommendations.push(`Serviço '${service}' tem ${files.length} arquivos Docker. Verifique se há duplicação: ${files.join(', ')}`);
                }
            }
        }
        catch (error) {
            logError(this.config.name, null, error);
        }
        return { recommendations };
    }
}
CleanupSpecialistAgent.capabilities = [
    'duplicate-detection',
    'dead-code-analysis',
    'dependency-cleanup',
    'file-organization',
    'temp-file-removal',
    'import-optimization',
    'naming-convention-check',
    'large-file-detection'
];
// CLI execution
if (require.main === module) {
    const agent = new CleanupSpecialistAgent();
    const task = {
        id: `cleanup-${Date.now()}`,
        description: 'Analyze project for cleanup opportunities',
        type: 'analyze',
        priority: 1,
        input: {
            dryRun: true,
            aggressive: false
        }
    };
    agent.executeTask(task)
        .then(result => {
        var _a;
        console.log('\n📊 Cleanup Analysis Complete:');
        console.log(JSON.stringify(result.data, null, 2));
        if ((_a = result.data) === null || _a === void 0 ? void 0 : _a.recommendations) {
            console.log('\n💡 Recommendations:');
            result.data.recommendations.forEach((rec) => {
                console.log(`  - ${rec}`);
            });
        }
    })
        .catch(error => {
        console.error('❌ Error:', error);
    });
}
