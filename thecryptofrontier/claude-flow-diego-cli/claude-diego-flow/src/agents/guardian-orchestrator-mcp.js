#!/usr/bin/env npx tsx
import { Agent } from '../core/agent';
import { MCPBridge } from '../mcp/mcp-bridge';
import { MCP_TOOLS } from '../mcp/mcp-integration';
import { DockerSpecialistAgent } from './docker-specialist-agent';
import { NextJSSpecialistAgent } from './nextjs-specialist-agent';
import { StrapiSpecialistAgent } from './strapi-specialist-agent';
import { ClaudeCodeSpecialistAgent } from './claude-code-specialist-agent';
// import { CleanupSpecialistAgent } from './cleanup-specialist-agent';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GuardianMemorySystem } from '../core/guardian-memory-system';
import { GuardianPDCASystem } from '../core/guardian-pdca-system';
import { GuardianAPIService } from '../services/guardian-api-service';
/**
 * Guardian Orchestrator com Integração MCP e PDCA
 *
 * Versão aprimorada do Guardian que usa:
 * - MCP Diego Tools para navegação, GitHub, Git e Mem0
 * - Metodologia PDCA para melhoria contínua
 * - Sistema de memória automática
 */
export class GuardianOrchestratorMCP extends Agent {
    constructor() {
        super({
            id: 'guardian-orchestrator-mcp',
            name: 'Guardian Orchestrator MCP',
            description: 'Guardian aprimorado com capacidades MCP Diego Tools e memória automática',
            capabilities: [
                'agent-coordination',
                'task-delegation',
                'result-aggregation',
                'workflow-management',
                'web-analysis',
                'github-integration',
                'memory-persistence',
                'visual-documentation',
                'cleanup-orchestration',
                'auto-memory',
                'context-continuity',
                'pdca-methodology',
                'continuous-improvement',
                'metrics-tracking'
            ]
        });
        this.execAsync = promisify(exec);
        this.projectRoot = process.env.PROJECT_ROOT || '/home/strapi/thecryptofrontier';
        this.specialists = new Map();
        this.mcpBridge = new MCPBridge();
        this.memoryUserId = 'guardian-orchestrator';
        this.pdcaSystem = new GuardianPDCASystem();
    }
    async initialize() {
        console.log('🛡️ Guardian Orchestrator MCP initializing...');
        // Conectar ao MCP Bridge
        try {
            await this.mcpBridge.connect();
            console.log('✅ MCP Bridge connected successfully');
            // Inicializar sistema de memória automática
            this.memory = new GuardianMemorySystem(this.mcpBridge, this.memoryUserId);
            console.log('🧠 Sistema de memória automática ativado');
            // Inicializar API service
            this.apiService = new GuardianAPIService(this.memory);
            await this.apiService.start();
            console.log('🌐 API REST disponível em http://localhost:3004');
            console.log('📋 Ver tarefas pendentes: curl http://localhost:3004/tasks/pending/simple');
            // Carregar análises anteriores da memória
            await this.loadPreviousAnalyses();
            // Resumir sessão anterior se houver
            const resume = await this.memory.resumeLastSession();
            if (resume.includes('Tarefas pendentes')) {
                console.log('\n' + resume);
            }
        }
        catch (error) {
            console.error('⚠️ MCP Bridge connection failed:', error);
            console.log('Continuing without MCP features...');
        }
        // Inicializar especialistas
        const dockerAgent = new DockerSpecialistAgent();
        const nextjsAgent = new NextJSSpecialistAgent();
        const strapiAgent = new StrapiSpecialistAgent();
        const claudeCodeAgent = new ClaudeCodeSpecialistAgent();
        // Registrar especialistas
        this.specialists.set('docker', dockerAgent);
        this.specialists.set('nextjs', nextjsAgent);
        this.specialists.set('strapi', strapiAgent);
        this.specialists.set('claude-code', claudeCodeAgent);
        // Cleanup Specialist agora roda em container
        // Registramos um proxy que chama o container
        this.specialists.set('cleanup', {
            id: 'cleanup-container-proxy',
            name: 'Cleanup Specialist (Container)',
            processMessage: async (message) => {
                return await this.runCleanupContainer(message);
            },
            initialize: async () => {
                console.log('✅ Cleanup specialist container proxy ready');
            },
            shutdown: async () => { }
        });
        // Inicializar todos os agentes
        for (const [name, agent] of this.specialists) {
            try {
                await agent.initialize();
                console.log(`✅ ${name} specialist initialized`);
            }
            catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
            }
        }
        console.log('🛡️ Guardian Orchestrator MCP ready!');
    }
    async processMessage(message) {
        console.log(`\n🛡️ Guardian Orchestrator MCP processing: ${message.content}`);
        // Verificar comandos especiais de memória
        if (await this.handleMemoryCommands(message)) {
            return message; // Resposta já foi enviada
        }
        // Verificar comandos PDCA
        if (await this.handlePDCACommands(message)) {
            return message; // Resposta já foi enviada
        }
        // Registrar início da tarefa na memória
        const taskId = `task-${Date.now()}`;
        await this.memory.rememberTaskStart({
            id: taskId,
            taskName: 'Process user request',
            context: {
                userRequest: message.content,
                specialists: []
            }
        });
        const analysis = await this.analyzeRequest(message.content);
        // Atualizar memória com especialistas identificados
        await this.memory.rememberTaskProgress(taskId, {
            currentStep: 'Specialists identified',
            specialists: analysis.specialists,
            progress: 20
        });
        // Executar análises MCP se disponível
        let mcpResults = {};
        if (this.mcpBridge && analysis.useMCP) {
            await this.memory.rememberTaskProgress(taskId, {
                currentStep: 'Executing MCP analysis',
                progress: 40
            });
            mcpResults = await this.performMCPAnalysis(analysis);
        }
        // Delegar para especialistas
        await this.memory.rememberTaskProgress(taskId, {
            currentStep: 'Delegating to specialists',
            progress: 60
        });
        const specialistResults = await this.delegateToSpecialists(analysis);
        // Agregar resultados
        await this.memory.rememberTaskProgress(taskId, {
            currentStep: 'Aggregating results',
            progress: 80
        });
        const response = await this.aggregateResults(specialistResults, mcpResults);
        // Salvar análise na memória (sistema antigo mantido)
        await this.saveAnalysisToMemory(analysis, specialistResults, mcpResults);
        // Integrar com PDCA se houver ciclo ativo
        await this.integrateWithPDCA(analysis, { ...specialistResults, ...mcpResults });
        // Marcar tarefa como completa
        await this.memory.rememberTaskComplete(taskId, {
            specialistResults: Object.keys(specialistResults),
            mcpUsed: analysis.useMCP
        });
        return {
            role: 'assistant',
            content: response,
            metadata: {
                agent: this.config.id,
                timestamp: new Date().toISOString(),
                specialists: Object.keys(specialistResults),
                mcpUsed: analysis.useMCP,
                taskId
            }
        };
    }
    async analyzeRequest(request) {
        if (!request || typeof request !== 'string') {
            console.error('Invalid request:', request);
            return {
                request: request || '',
                priority: 'low',
                specialists: ['docker', 'nextjs', 'strapi'],
                useMCP: false
            };
        }
        const lowerRequest = request.toLowerCase();
        const specialists = [];
        let useMCP = false;
        // Análise existente para especialistas
        if (lowerRequest.includes('docker') ||
            lowerRequest.includes('container') ||
            lowerRequest.includes('dockerfile') ||
            lowerRequest.includes('compose')) {
            specialists.push('docker');
        }
        if (lowerRequest.includes('next') ||
            lowerRequest.includes('nextjs') ||
            lowerRequest.includes('react') ||
            lowerRequest.includes('frontend')) {
            specialists.push('nextjs');
        }
        if (lowerRequest.includes('strapi') ||
            lowerRequest.includes('cms') ||
            lowerRequest.includes('api') ||
            lowerRequest.includes('backend')) {
            specialists.push('strapi');
        }
        // Claude Code Specialist
        if (lowerRequest.includes('claude code') ||
            lowerRequest.includes('produtividade') ||
            lowerRequest.includes('productivity') ||
            lowerRequest.includes('convenção') ||
            lowerRequest.includes('convention') ||
            lowerRequest.includes('ferramenta') ||
            lowerRequest.includes('tool usage') ||
            lowerRequest.includes('memory management') ||
            lowerRequest.includes('claude.md') ||
            lowerRequest.includes('slash command') ||
            lowerRequest.includes('mode') ||
            lowerRequest.includes('modo conciso') ||
            lowerRequest.includes('modo formal') ||
            lowerRequest.includes('modo explicativo')) {
            specialists.push('claude-code');
        }
        // Determinar se precisa usar MCP - EXPANDIDO
        // Visual/Web
        if (lowerRequest.includes('screenshot') ||
            lowerRequest.includes('visual') ||
            lowerRequest.includes('navegue') ||
            lowerRequest.includes('navigate') ||
            lowerRequest.includes('captur') ||
            lowerRequest.includes('página') ||
            lowerRequest.includes('site') ||
            lowerRequest.includes('web')) {
            useMCP = true;
            console.log('🔍 MCP ativado: Análise visual/web detectada');
        }
        // GitHub/Git
        if (lowerRequest.includes('github') ||
            lowerRequest.includes('issue') ||
            lowerRequest.includes('pr') ||
            lowerRequest.includes('pull request') ||
            lowerRequest.includes('repositório') ||
            lowerRequest.includes('código')) {
            useMCP = true;
            console.log('🔍 MCP ativado: Operações GitHub detectadas');
        }
        // Git operations
        if (lowerRequest.includes('commit') ||
            lowerRequest.includes('git') ||
            lowerRequest.includes('push') ||
            lowerRequest.includes('mudanças') ||
            lowerRequest.includes('alterações')) {
            useMCP = true;
            console.log('🔍 MCP ativado: Operações Git detectadas');
        }
        // Memory/History
        if (lowerRequest.includes('lembrar') ||
            lowerRequest.includes('memória') ||
            lowerRequest.includes('histórico') ||
            lowerRequest.includes('salvar') ||
            lowerRequest.includes('guardar')) {
            useMCP = true;
            console.log('🔍 MCP ativado: Operações de memória detectadas');
        }
        // Análise completa
        if (lowerRequest.includes('análise') ||
            lowerRequest.includes('completa') ||
            lowerRequest.includes('verificar') ||
            lowerRequest.includes('status') ||
            lowerRequest.includes('relatório')) {
            useMCP = true;
            console.log('🔍 MCP ativado: Análise completa solicitada');
        }
        // Sempre usar MCP se não especificado (para não perder oportunidades)
        if (!useMCP && specialists.length > 0) {
            useMCP = true;
            console.log('🔍 MCP ativado: Padrão para análise com especialistas');
        }
        // Adicionar cleanup specialist quando relevante
        if (lowerRequest.includes('clean') || lowerRequest.includes('limpe') ||
            lowerRequest.includes('organize') || lowerRequest.includes('duplicate') ||
            lowerRequest.includes('remove') || lowerRequest.includes('temp')) {
            specialists.push('cleanup');
            // Registrar decisão de usar cleanup
            if (this.memory) {
                await this.memory.rememberDecision('Uso do Cleanup Specialist', 'Ativar Cleanup Specialist', 'Palavras-chave de limpeza detectadas na solicitação', { keywords: ['clean', 'organize', 'remove'] });
            }
        }
        // Se nenhum especialista específico, fazer análise geral
        if (specialists.length === 0) {
            specialists.push('docker', 'nextjs', 'strapi');
            useMCP = true; // Análise completa usa MCP
        }
        return {
            request,
            specialists,
            priority: this.determinePriority(request),
            useMCP,
            mcpActions: this.determineMCPActions(request)
        };
    }
    determineMCPActions(request) {
        const actions = [];
        const lowerRequest = request.toLowerCase();
        if (lowerRequest.includes('screenshot') || lowerRequest.includes('visual')) {
            actions.push('capture-screenshots');
        }
        if (lowerRequest.includes('issue')) {
            actions.push('create-issue');
        }
        if (lowerRequest.includes('commit')) {
            actions.push('git-commit');
        }
        if (lowerRequest.includes('análise completa') || lowerRequest.includes('full analysis')) {
            actions.push('capture-screenshots', 'check-issues', 'save-memory');
        }
        return actions;
    }
    async performMCPAnalysis(analysis) {
        var _a, _b, _c, _d;
        console.log('🔧 Performing MCP analysis...');
        console.log(`📋 MCP Actions to perform: ${analysis.mcpActions.join(', ')}`);
        const results = {};
        // Verificar se o MCP está disponível
        if (!this.mcpBridge || !this.mcpBridge.process) {
            console.error('❌ MCP Bridge not available, skipping MCP analysis');
            return { error: 'MCP Bridge not connected' };
        }
        for (const action of analysis.mcpActions) {
            console.log(`🔄 Executing MCP action: ${action}`);
            try {
                switch (action) {
                    case 'capture-screenshots':
                        console.log('📸 Capturing screenshots...');
                        results.screenshots = await this.captureProjectScreenshots();
                        console.log(`✅ Screenshots captured: ${((_a = results.screenshots) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
                        break;
                    case 'check-issues':
                        console.log('🔍 Checking GitHub issues...');
                        results.githubIssues = await this.checkGitHubIssues();
                        console.log(`✅ Issues found: ${((_b = results.githubIssues) === null || _b === void 0 ? void 0 : _b.total) || 0}`);
                        break;
                    case 'create-issue':
                        console.log('📝 Creating GitHub issue...');
                        results.issueCreated = await this.createGitHubIssue(analysis);
                        console.log(`✅ Issue created: ${((_c = results.issueCreated) === null || _c === void 0 ? void 0 : _c.url) || 'failed'}`);
                        break;
                    case 'git-commit':
                        console.log('📊 Checking Git status...');
                        results.gitStatus = await this.checkGitStatus();
                        console.log(`✅ Git status: ${((_d = results.gitStatus) === null || _d === void 0 ? void 0 : _d.branch) || 'unknown'}`);
                        break;
                    case 'save-memory':
                        // Memória é salva após agregação de resultados
                        console.log('💾 Memory will be saved after analysis');
                        results.memoryNote = 'Analysis will be saved to memory';
                        break;
                }
            }
            catch (error) {
                console.error(`❌ Error performing MCP action ${action}:`, error);
                results[action] = { error: error.message, stack: error.stack };
            }
        }
        return results;
    }
    async captureProjectScreenshots() {
        console.log('📸 Capturing project screenshots...');
        const screenshots = [];
        // URLs para capturar
        const pages = [
            { url: 'http://localhost:3000', name: 'home', description: 'Homepage' },
            { url: 'http://localhost:3000/blog', name: 'blog', description: 'Blog page' },
            { url: 'http://localhost:1337/admin', name: 'strapi-admin', description: 'Strapi Admin' }
        ];
        // Criar diretório para screenshots
        const screenshotDir = process.env.NODE_ENV === 'production' ? '/app/reports/screenshots' : path.join(this.projectRoot, 'claude-flow-diego/reports/screenshots');
        await fs.mkdir(screenshotDir, { recursive: true });
        for (const page of pages) {
            try {
                // Navegar para a página
                await this.mcpBridge.navigate(page.url);
                // Aguardar carregamento
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Capturar screenshot
                const filename = `${page.name}-${Date.now()}.png`;
                const filepath = path.join(screenshotDir, filename);
                await this.mcpBridge.screenshot(filepath, true);
                screenshots.push({
                    page: page.name,
                    url: page.url,
                    description: page.description,
                    filename,
                    status: 'captured'
                });
                console.log(`✅ Screenshot captured: ${page.name}`);
            }
            catch (error) {
                screenshots.push({
                    page: page.name,
                    url: page.url,
                    error: error.message,
                    status: 'failed'
                });
                console.error(`❌ Failed to capture ${page.name}:`, error);
            }
        }
        return screenshots;
    }
    async checkGitHubIssues() {
        console.log('🔍 Checking GitHub issues...');
        try {
            const issues = await this.mcpBridge.callTool(MCP_TOOLS.GITHUB_LIST_ISSUES, {
                owner: process.env.GITHUB_OWNER || 'seu-usuario',
                repo: 'thecryptofrontier',
                state: 'open'
            });
            return {
                total: issues.length,
                issues: issues.slice(0, 5), // Primeiras 5 issues
                status: 'success'
            };
        }
        catch (error) {
            return {
                error: error.message,
                status: 'failed'
            };
        }
    }
    async createGitHubIssue(analysis) {
        console.log('📝 Creating GitHub issue...');
        const issueTitle = `Guardian Analysis Report - ${new Date().toLocaleDateString('pt-BR')}`;
        const issueBody = `
## 🛡️ Guardian Orchestrator Analysis

**Request**: ${analysis.request}
**Priority**: ${analysis.priority}
**Specialists**: ${analysis.specialists.join(', ')}

### 📊 Analysis Summary
This issue was automatically created by Guardian Orchestrator to track the analysis results.

### 🎯 Actions Required
- [ ] Review specialist reports
- [ ] Implement recommended changes
- [ ] Run follow-up analysis

---
*Issue created automatically by Guardian Orchestrator MCP*
        `;
        try {
            const issue = await this.mcpBridge.createGithubIssue(process.env.GITHUB_OWNER || 'seu-usuario', 'thecryptofrontier', issueTitle, issueBody);
            return {
                issueNumber: issue.number,
                url: issue.html_url,
                status: 'created'
            };
        }
        catch (error) {
            return {
                error: error.message,
                status: 'failed'
            };
        }
    }
    async checkGitStatus() {
        console.log('📊 Checking Git status...');
        try {
            const status = await this.mcpBridge.gitStatus(true);
            return {
                branch: status.branch,
                hasChanges: status.modified.length > 0 || status.untracked.length > 0,
                modified: status.modified.length,
                untracked: status.untracked.length,
                status: 'success'
            };
        }
        catch (error) {
            return {
                error: error.message,
                status: 'failed'
            };
        }
    }
    async loadPreviousAnalyses() {
        console.log('💾 Loading previous analyses from memory...');
        try {
            const memories = await this.mcpBridge.searchMemory(this.memoryUserId, 'guardian analysis', 5);
            if (memories && memories.length > 0) {
                console.log(`✅ Loaded ${memories.length} previous analyses`);
                // Processar memórias se necessário
            }
        }
        catch (error) {
            console.error('Failed to load memories:', error);
        }
    }
    async saveAnalysisToMemory(analysis, specialistResults, mcpResults) {
        console.log('💾 Saving analysis to memory...');
        try {
            const memoryContent = {
                timestamp: new Date().toISOString(),
                request: analysis.request,
                priority: analysis.priority,
                specialists: analysis.specialists,
                specialistResults: Object.keys(specialistResults).map(key => ({
                    specialist: key,
                    summary: specialistResults[key].substring(0, 200) + '...'
                })),
                mcpResults: mcpResults
            };
            await this.mcpBridge.addMemory(this.memoryUserId, JSON.stringify(memoryContent), {
                type: 'guardian-analysis',
                priority: analysis.priority,
                specialists: analysis.specialists
            });
            console.log('✅ Analysis saved to memory');
        }
        catch (error) {
            console.error('Failed to save to memory:', error);
        }
    }
    async aggregateResults(specialistResults, mcpResults) {
        let aggregated = '# 🛡️ Guardian Orchestrator MCP - Análise Completa\n\n';
        // Adicionar timestamp
        aggregated += `📅 **Data**: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n`;
        // Resumo com MCP
        aggregated += `## 📊 Resumo\n`;
        aggregated += `- Especialistas consultados: ${Object.keys(specialistResults).length}\n`;
        aggregated += `- Ferramentas MCP usadas: ${Object.keys(mcpResults).length > 0 ? 'Sim' : 'Não'}\n\n`;
        // Resultados MCP (se houver)
        if (Object.keys(mcpResults).length > 0) {
            aggregated += '## 🔧 Análise MCP\n\n';
            if (mcpResults.screenshots) {
                aggregated += '### 📸 Screenshots Capturados\n';
                for (const screenshot of mcpResults.screenshots) {
                    if (screenshot.status === 'captured') {
                        aggregated += `- ✅ ${screenshot.description}: ${screenshot.filename}\n`;
                    }
                    else {
                        aggregated += `- ❌ ${screenshot.description}: ${screenshot.error}\n`;
                    }
                }
                aggregated += '\n';
            }
            if (mcpResults.githubIssues) {
                aggregated += '### 📋 Issues do GitHub\n';
                aggregated += `- Total de issues abertas: ${mcpResults.githubIssues.total || 0}\n\n`;
            }
            if (mcpResults.gitStatus) {
                aggregated += '### 📊 Status do Git\n';
                aggregated += `- Branch: ${mcpResults.gitStatus.branch || 'unknown'}\n`;
                aggregated += `- Arquivos modificados: ${mcpResults.gitStatus.modified || 0}\n`;
                aggregated += `- Arquivos não rastreados: ${mcpResults.gitStatus.untracked || 0}\n\n`;
            }
            aggregated += '---\n\n';
        }
        // Resultados dos especialistas
        for (const [specialist, result] of Object.entries(specialistResults)) {
            aggregated += `## ${this.getSpecialistIcon(specialist)} ${this.getSpecialistTitle(specialist)}\n\n`;
            aggregated += result + '\n\n';
            aggregated += '---\n\n';
        }
        // Recomendações
        aggregated += await this.generateRecommendations(specialistResults, mcpResults);
        // Salvar relatório
        await this.saveReport(aggregated);
        return aggregated;
    }
    getSpecialistIcon(specialist) {
        const icons = {
            docker: '🐋',
            nextjs: '⚛️',
            strapi: '🚀',
            security: '🔒'
        };
        return icons[specialist] || '📋';
    }
    getSpecialistTitle(specialist) {
        const titles = {
            docker: 'Docker & Containerização',
            nextjs: 'Next.js & Frontend',
            strapi: 'Strapi CMS & Backend',
            security: 'Segurança & Auditoria'
        };
        return titles[specialist] || specialist;
    }
    async generateRecommendations(results, mcpResults) {
        var _a, _b, _c, _d;
        let recommendations = '## 🎯 Recomendações do Guardian MCP\n\n';
        // Recomendações baseadas em MCP
        if (mcpResults.screenshots) {
            const failedScreenshots = mcpResults.screenshots.filter(s => s.status === 'failed');
            if (failedScreenshots.length > 0) {
                recommendations += '### 🚨 Atenção - Serviços Inacessíveis\n';
                recommendations += 'Os seguintes serviços não puderam ser acessados:\n';
                failedScreenshots.forEach(s => {
                    recommendations += `- ${s.description} (${s.url})\n`;
                });
                recommendations += '\n';
            }
        }
        // Análise de issues GitHub
        if (mcpResults.githubIssues && mcpResults.githubIssues.total > 10) {
            recommendations += '### 📋 Gestão de Issues\n';
            recommendations += `- ⚠️ Existem ${mcpResults.githubIssues.total} issues abertas\n`;
            recommendations += '- Considere priorizar e fechar issues antigas\n\n';
        }
        // Recomendações dos especialistas (mantém lógica existente)
        const hasDockerIssues = ((_a = results.docker) === null || _a === void 0 ? void 0 : _a.includes('⚠️')) || ((_b = results.docker) === null || _b === void 0 ? void 0 : _b.includes('❌'));
        const hasSecurityIssues = ((_c = results.security) === null || _c === void 0 ? void 0 : _c.includes('🚨')) || ((_d = results.security) === null || _d === void 0 ? void 0 : _d.includes('❌'));
        if (hasSecurityIssues) {
            recommendations += '### 🔒 Prioridade Alta - Segurança\n';
            recommendations += '1. Resolver problemas de segurança identificados\n';
            recommendations += '2. Implementar scanning regular de vulnerabilidades\n';
            recommendations += '3. Atualizar dependências com patches de segurança\n\n';
        }
        if (hasDockerIssues) {
            recommendations += '### 🐋 Prioridade Média - Docker\n';
            recommendations += '1. Otimizar Dockerfiles seguindo boas práticas\n';
            recommendations += '2. Implementar multi-stage builds\n';
            recommendations += '3. Adicionar health checks em todos os serviços\n\n';
        }
        // Próximos passos com MCP
        recommendations += '### 📋 Próximos Passos\n';
        recommendations += '1. Revisar screenshots capturados para validação visual\n';
        recommendations += '2. Implementar as sugestões dos especialistas\n';
        recommendations += '3. Criar issues no GitHub para tarefas pendentes\n';
        recommendations += '4. Executar análise de follow-up em 1 semana\n';
        recommendations += '5. Consultar histórico de análises na memória\n\n';
        return recommendations;
    }
    async saveReport(content) {
        const reportsDir = path.join(this.projectRoot, 'claude-flow-diego/reports');
        // Criar diretório se não existir
        await fs.mkdir(reportsDir, { recursive: true });
        // Gerar nome do arquivo com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `guardian-mcp-report-${timestamp}.md`;
        const filepath = path.join(reportsDir, filename);
        // Salvar relatório
        await fs.writeFile(filepath, content, 'utf-8');
        console.log(`📝 Report saved to: ${path.relative(this.projectRoot, filepath)}`);
    }
    determinePriority(request) {
        const lowerRequest = request.toLowerCase();
        if (lowerRequest.includes('urgent') || lowerRequest.includes('critical')) {
            return 'critical';
        }
        if (lowerRequest.includes('important') || lowerRequest.includes('high')) {
            return 'high';
        }
        if (lowerRequest.includes('low') || lowerRequest.includes('minor')) {
            return 'low';
        }
        return 'medium';
    }
    async delegateToSpecialists(analysis) {
        const results = {};
        // Executar especialistas em paralelo quando possível
        const promises = analysis.specialists.map(async (specialistName) => {
            const specialist = this.specialists.get(specialistName);
            if (!specialist) {
                console.warn(`⚠️ Specialist ${specialistName} not found`);
                return { name: specialistName, error: 'Specialist not found' };
            }
            try {
                const message = {
                    role: 'user',
                    content: analysis.request,
                    metadata: {
                        source: 'guardian-mcp',
                        priority: analysis.priority
                    }
                };
                const response = await specialist.processMessage(message);
                results[specialistName] = response.content;
                return { name: specialistName, success: true };
            }
            catch (error) {
                console.error(`❌ Error with ${specialistName}:`, error);
                results[specialistName] = `Error: ${error.message}`;
                return { name: specialistName, error: error.message };
            }
        });
        await Promise.all(promises);
        return results;
    }
    async runCleanupContainer(message) {
        console.log('🐋 Running Cleanup Specialist in container...');
        try {
            // Extrair opções da mensagem
            const content = message.content.toLowerCase();
            const isDryRun = !content.includes('execute') && !content.includes('executar');
            const isAggressive = content.includes('aggressive') || content.includes('agressiv');
            // Construir comando docker-compose
            let command = `cd ${this.projectRoot} && docker-compose -f docker-compose.cleanup.yml --profile cleanup run --rm`;
            // Adicionar variáveis de ambiente
            if (!isDryRun) {
                command += ' -e DRY_RUN=false -e MOUNT_MODE=rw';
            }
            if (isAggressive) {
                command += ' -e AGGRESSIVE=true';
            }
            command += ' cleanup-specialist';
            // Executar container
            const { stdout, stderr } = await this.execAsync(command, {
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            if (stderr && !stderr.includes('WARNING')) {
                console.error('Container stderr:', stderr);
            }
            // Processar saída
            let result = stdout;
            try {
                // Tentar parsear como JSON se possível
                const jsonMatch = stdout.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const jsonData = JSON.parse(jsonMatch[0]);
                    result = this.formatCleanupResult(jsonData);
                }
            }
            catch (e) {
                // Se não for JSON, usar saída raw
            }
            return {
                role: 'assistant',
                content: result,
                metadata: {
                    agent: 'cleanup-specialist-container',
                    containerized: true,
                    dryRun: isDryRun
                }
            };
        }
        catch (error) {
            console.error('Error running cleanup container:', error);
            // Tentar construir a imagem se não existir
            if (error.message.includes('No such service') || error.message.includes('not found')) {
                console.log('🔨 Building cleanup specialist image...');
                try {
                    await this.execAsync(`cd ${this.projectRoot} && docker-compose -f docker-compose.cleanup.yml build cleanup-specialist`);
                    // Tentar novamente
                    return this.runCleanupContainer(message);
                }
                catch (buildError) {
                    return {
                        role: 'assistant',
                        content: `❌ Erro ao executar Cleanup Specialist em container: ${buildError.message}\n\nCertifique-se de que o Docker está rodando e execute:\n\`\`\`bash\ndocker-compose -f docker-compose.cleanup.yml build cleanup-specialist\n\`\`\``,
                        metadata: { error: true }
                    };
                }
            }
            return {
                role: 'assistant',
                content: `❌ Erro ao executar Cleanup Specialist: ${error.message}`,
                metadata: { error: true }
            };
        }
    }
    formatCleanupResult(data) {
        var _a, _b, _c, _d;
        let formatted = '# 🧹 Relatório de Análise de Limpeza\n\n';
        if (((_a = data.duplicateFiles) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            formatted += '## 📄 Arquivos Duplicados\n';
            data.duplicateFiles.forEach((dup) => {
                formatted += `- **${dup.files.length} cópias** (${(dup.size / 1024).toFixed(2)} KB cada)\n`;
                dup.files.forEach((file) => formatted += `  - ${file}\n`);
            });
            formatted += '\n';
        }
        if (((_b = data.unusedDependencies) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            formatted += '## 📦 Dependências Não Utilizadas\n';
            data.unusedDependencies.forEach((dep) => formatted += `- ${dep}\n`);
            formatted += '\n';
        }
        if (((_c = data.tempFiles) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            formatted += '## 🗑️ Arquivos Temporários\n';
            formatted += `Encontrados ${data.tempFiles.length} arquivos temporários\n\n`;
        }
        if (((_d = data.recommendations) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            formatted += '## 💡 Recomendações\n';
            data.recommendations.forEach((rec) => formatted += `- ${rec}\n`);
            formatted += '\n';
        }
        if (data.totalSavings) {
            const savingsMB = (data.totalSavings / 1024 / 1024).toFixed(2);
            formatted += `### 💾 Economia Potencial: ${savingsMB} MB\n`;
        }
        return formatted;
    }
    /**
     * Métodos PDCA para melhoria contínua
     */
    async handlePDCACommands(message) {
        const content = message.content.toLowerCase();
        // Iniciar ciclo PDCA
        if (content.includes('pdca start') || content.includes('iniciar pdca')) {
            const objectives = this.extractObjectives(message.content);
            const title = this.extractTitle(message.content) || 'Ciclo de Melhoria';
            const cycle = await this.pdcaSystem.startCycle(title, objectives);
            console.log(`\n🔄 Ciclo PDCA iniciado: ${cycle.title}`);
            console.log(`📋 ID: ${cycle.id}`);
            console.log(`🎯 Objetivos: ${objectives.length}`);
            console.log('\nUse "pdca status" para acompanhar o progresso.');
            return true;
        }
        // Status do ciclo
        if (content.includes('pdca status') || content.includes('status pdca')) {
            const cycle = this.pdcaSystem.getActiveCycle();
            if (!cycle) {
                console.log('❌ Nenhum ciclo PDCA ativo no momento.');
                return true;
            }
            console.log(this.formatPDCAStatus(cycle));
            return true;
        }
        // Executar ciclo
        if (content.includes('pdca run') || content.includes('executar pdca')) {
            const cycle = this.pdcaSystem.getActiveCycle();
            if (!cycle) {
                console.log('❌ Nenhum ciclo PDCA ativo. Use "pdca start" primeiro.');
                return true;
            }
            console.log('🚀 Executando ciclo PDCA...');
            await this.pdcaSystem.runCycle(cycle.id);
            console.log('✅ Ciclo PDCA concluído!');
            // Mostrar relatório
            console.log(this.pdcaSystem.generateEvolutionReport());
            return true;
        }
        // Histórico PDCA
        if (content.includes('pdca history') || content.includes('histórico pdca')) {
            const cycles = this.pdcaSystem.getAllCycles();
            if (cycles.length === 0) {
                console.log('📊 Nenhum ciclo PDCA registrado ainda.');
                return true;
            }
            console.log('# 📊 Histórico de Ciclos PDCA\n');
            for (const cycle of cycles) {
                console.log(`- **${cycle.title}** (${cycle.status})`);
                console.log(`  - ID: ${cycle.id}`);
                console.log(`  - Início: ${cycle.startDate.toLocaleString('pt-BR')}`);
                if (cycle.endDate) {
                    console.log(`  - Fim: ${cycle.endDate.toLocaleString('pt-BR')}`);
                }
                if (cycle.check) {
                    console.log(`  - Score: ${cycle.check.performance.overallScore.toFixed(2)}%`);
                }
                console.log('');
            }
            return true;
        }
        // Relatório de evolução
        if (content.includes('pdca report') || content.includes('relatório pdca')) {
            console.log(this.pdcaSystem.generateEvolutionReport());
            return true;
        }
        return false;
    }
    extractObjectives(content) {
        // Extrair objetivos do conteúdo
        const objectives = [];
        // Padrão 1: Lista numerada
        const numberedMatches = content.match(/\d+\.\s*(.+)/g);
        if (numberedMatches) {
            objectives.push(...numberedMatches.map(m => m.replace(/^\d+\.\s*/, '')));
        }
        // Padrão 2: Lista com traços
        const dashedMatches = content.match(/-\s*(.+)/g);
        if (dashedMatches && objectives.length === 0) {
            objectives.push(...dashedMatches.map(m => m.replace(/^-\s*/, '')));
        }
        // Padrão 3: Palavras-chave
        if (objectives.length === 0) {
            if (content.includes('organiz'))
                objectives.push('Melhorar organização do projeto');
            if (content.includes('performance'))
                objectives.push('Otimizar performance');
            if (content.includes('document'))
                objectives.push('Atualizar documentação');
            if (content.includes('clean') || content.includes('limp'))
                objectives.push('Limpar código e arquivos desnecessários');
        }
        // Default
        if (objectives.length === 0) {
            objectives.push('Melhorar qualidade geral do projeto');
        }
        return objectives;
    }
    extractTitle(content) {
        // Extrair título entre aspas
        const match = content.match(/["']([^"']+)["']/);
        return match ? match[1] : null;
    }
    formatPDCAStatus(cycle) {
        let status = `# 🔄 Status do Ciclo PDCA\n\n`;
        status += `**Título:** ${cycle.title}\n`;
        status += `**Status:** ${cycle.status}\n`;
        status += `**Início:** ${cycle.startDate.toLocaleString('pt-BR')}\n\n`;
        if (cycle.plan) {
            status += `## 📋 PLAN (Planejar)\n`;
            status += `- Objetivos: ${cycle.plan.objectives.length}\n`;
            status += `- Tarefas: ${cycle.plan.tasks.length}\n`;
            status += `- Métricas: ${cycle.plan.metrics.length}\n\n`;
        }
        if (cycle.execution) {
            status += `## 🚀 DO (Executar)\n`;
            status += `- Tarefas executadas: ${cycle.execution.tasks.length}\n`;
            const successTasks = cycle.execution.tasks.filter(t => t.status === 'success').length;
            status += `- Taxa de sucesso: ${(successTasks / cycle.execution.tasks.length * 100).toFixed(2)}%\n\n`;
        }
        if (cycle.check) {
            status += `## 🔍 CHECK (Verificar)\n`;
            status += `- Score geral: ${cycle.check.performance.overallScore.toFixed(2)}%\n`;
            status += `- Eficiência: ${cycle.check.performance.efficiency.toFixed(2)}%\n`;
            status += `- Eficácia: ${cycle.check.performance.effectiveness.toFixed(2)}%\n`;
            status += `- Qualidade: ${cycle.check.performance.quality.toFixed(2)}%\n`;
            status += `- Desvios: ${cycle.check.deviations.length}\n\n`;
        }
        if (cycle.actions) {
            status += `## 🎯 ACT (Agir)\n`;
            status += `- Ações planejadas: ${cycle.actions.length}\n`;
            const byType = cycle.actions.reduce((acc, action) => {
                acc[action.type] = (acc[action.type] || 0) + 1;
                return acc;
            }, {});
            for (const [type, count] of Object.entries(byType)) {
                status += `  - ${type}: ${count}\n`;
            }
        }
        return status;
    }
    /**
     * Integração PDCA com análise
     */
    async integrateWithPDCA(analysis, results) {
        var _a;
        const activeCycle = this.pdcaSystem.getActiveCycle();
        if (!activeCycle || activeCycle.status !== 'executing')
            return;
        // Coletar métricas atuais
        const metrics = [];
        // Score de organização (se cleanup foi usado)
        if (((_a = results.cleanup) === null || _a === void 0 ? void 0 : _a.organizationScore) !== undefined) {
            metrics.push({
                metricId: 'organization-score',
                timestamp: new Date(),
                value: results.cleanup.organizationScore
            });
        }
        // Métricas de performance (se foram coletadas)
        if (results.performance) {
            metrics.push({
                metricId: 'response-time',
                timestamp: new Date(),
                value: results.performance.responseTime
            });
        }
        // Adicionar métricas ao ciclo atual
        if (activeCycle.execution && metrics.length > 0) {
            activeCycle.execution.realTimeMetrics.push(...metrics);
        }
    }
    async handleMemoryCommands(message) {
        const content = message.content.toLowerCase();
        // Comandos de memória
        if (content.includes('o que eu estava fazendo') ||
            content.includes('what was i doing') ||
            content.includes('o que estava fazendo')) {
            const pendingTasks = await this.memory.whatWasIDoing();
            let response = '# 📋 Suas tarefas recentes:\n\n';
            if (pendingTasks.length === 0) {
                response += 'Não encontrei tarefas pendentes nas últimas 24 horas.\n';
            }
            else {
                pendingTasks.forEach(task => {
                    response += `- **${task.taskName}** (${task.status})\n`;
                    response += `  - Solicitado: ${task.context.userRequest}\n`;
                    response += `  - Progresso: ${task.context.progress || 0}%\n`;
                    if (task.context.currentStep) {
                        response += `  - Último passo: ${task.context.currentStep}\n`;
                    }
                    response += '\n';
                });
            }
            // Sugestões
            const suggestions = await this.memory.suggestNextSteps();
            if (suggestions.length > 0) {
                response += '## 💡 Sugestões:\n';
                suggestions.forEach(s => response += `- ${s}\n`);
            }
            console.log(response);
            return true;
        }
        if (content.includes('continue') ||
            content.includes('continuar') ||
            content.includes('retomar')) {
            const pendingTasks = await this.memory.whatWasIDoing();
            if (pendingTasks.length > 0) {
                const task = pendingTasks[0];
                console.log(`♻️ Retomando tarefa: ${task.taskName} (${task.context.progress || 0}% completo)`);
                // Reprocessar a tarefa original
                message.content = task.context.userRequest;
                return false; // Continuar processamento normal
            }
            else {
                console.log('Não há tarefas pendentes para retomar.');
                return true;
            }
        }
        if (content.includes('o que decidimos sobre') ||
            content.includes('what did we decide about')) {
            const topic = content.replace(/o que decidimos sobre|what did we decide about/g, '').trim();
            const decisions = await this.memory.whatDidIDecide(topic);
            let response = `# 🎯 Decisões sobre "${topic}":\n\n`;
            if (decisions.length === 0) {
                response += 'Não encontrei decisões registradas sobre este tópico.\n';
            }
            else {
                decisions.forEach(d => {
                    response += `- **${d.decision}**\n`;
                    response += `  - Motivo: ${d.reason}\n`;
                    response += `  - Data: ${d.timestamp.toLocaleString('pt-BR')}\n\n`;
                });
            }
            console.log(response);
            return true;
        }
        return false;
    }
    async shutdown() {
        console.log('🛡️ Guardian Orchestrator MCP shutting down...');
        // Salvar estado da memória
        if (this.memory) {
            await this.memory.shutdown();
        }
        // Desconectar MCP
        if (this.mcpBridge) {
            this.mcpBridge.disconnect();
            console.log('✅ MCP Bridge disconnected');
        }
        // Desligar todos os especialistas
        for (const [name, agent] of this.specialists) {
            try {
                if (agent.shutdown) {
                    await agent.shutdown();
                }
                console.log(`✅ ${name} specialist shutdown`);
            }
            catch (error) {
                console.error(`❌ Error shutting down ${name}:`, error);
            }
        }
        console.log('🛡️ Guardian Orchestrator MCP shutdown complete');
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    const guardian = new GuardianOrchestratorMCP();
    async function run() {
        await guardian.initialize();
        // Processar argumento ou fazer análise completa
        const request = process.argv.slice(2).join(' ') || 'faça uma análise completa do projeto com screenshots';
        const message = {
            role: 'user',
            content: request,
            metadata: {
                source: 'cli'
            }
        };
        const response = await guardian.processMessage(message);
        console.log('\n' + response.content);
        await guardian.shutdown();
    }
    run().catch(console.error);
}
